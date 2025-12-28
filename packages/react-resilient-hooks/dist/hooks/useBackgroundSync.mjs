import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

// src/hooks/useBackgroundSync.ts

// src/stores/idbUtils.ts
var IndexedDBError = class extends Error {
  constructor(message, cause, operation) {
    super(message);
    this.cause = cause;
    this.operation = operation;
    this.name = "IndexedDBError";
  }
};
function openDB(dbName, version = 1, upgradeCb) {
  return new Promise((resolve, reject) => {
    let upgradeError = null;
    const req = indexedDB.open(dbName, version);
    req.onerror = () => {
      reject(new IndexedDBError(
        `Failed to open database "${dbName}"`,
        req.error,
        "open"
      ));
    };
    req.onsuccess = () => {
      if (upgradeError) {
        req.result.close();
        reject(upgradeError);
      } else {
        resolve(req.result);
      }
    };
    req.onupgradeneeded = (event) => {
      try {
        const db = req.result;
        const oldVersion = event.oldVersion;
        const transaction = req.transaction;
        upgradeCb?.(db, oldVersion, transaction);
      } catch (err) {
        upgradeError = err instanceof Error ? err : new Error(String(err));
      }
    };
    req.onblocked = () => {
      reject(new IndexedDBError(
        `Database "${dbName}" is blocked by another connection`,
        null,
        "open"
      ));
    };
  });
}
function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new IndexedDBError(
      "IndexedDB request failed",
      req.error,
      "request"
    ));
  });
}
function waitForTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new IndexedDBError(
      "Transaction failed",
      tx.error,
      "transaction"
    ));
    tx.onabort = () => reject(new IndexedDBError(
      "Transaction aborted",
      tx.error,
      "transaction"
    ));
  });
}
async function withTransaction(db, storeName, mode, callback) {
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const txPromise = waitForTransaction(tx);
  try {
    const result = await callback(store);
    await txPromise;
    return result;
  } catch (callbackError) {
    try {
      tx.abort();
    } catch {
    }
    try {
      await txPromise;
    } catch {
    }
    throw callbackError;
  }
}

// src/stores/implementations.ts
var DB_VERSION = 2;
var IndexedDBQueueStore = class {
  /**
   * Create a new IndexedDB queue store.
   *
   * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
   * @param storeName - Name of the object store (default: 'queue')
   */
  constructor(dbName = "resilient-queue", storeName = "queue") {
    this.dbPromise = null;
    this.isClosed = false;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  async getDB() {
    if (this.isClosed) {
      this.dbPromise = null;
      this.isClosed = false;
    }
    if (!this.dbPromise) {
      this.dbPromise = this.openWithMigration();
      this.dbPromise.then((db) => {
        db.onclose = () => {
          this.isClosed = true;
          this.dbPromise = null;
        };
        db.onerror = () => {
          this.isClosed = true;
          this.dbPromise = null;
        };
      }).catch(() => {
        this.isClosed = true;
        this.dbPromise = null;
      });
    }
    return this.dbPromise;
  }
  /**
   * Open database with proper migration that preserves existing data
   */
  async openWithMigration() {
    let existingData = null;
    if (typeof indexedDB !== "undefined") {
      try {
        const checkDb = await new Promise((resolve) => {
          const req = indexedDB.open(this.dbName);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (checkDb) {
          const currentVersion = checkDb.version;
          if (currentVersion === 1 && checkDb.objectStoreNames.contains(this.storeName)) {
            existingData = await new Promise((resolve, reject) => {
              try {
                const tx = checkDb.transaction(this.storeName, "readonly");
                const store = tx.objectStore(this.storeName);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              } catch {
                resolve([]);
              }
            });
          }
          checkDb.close();
        }
      } catch {
      }
    }
    return openDB(this.dbName, DB_VERSION, (db, oldVersion) => {
      if (oldVersion === 0) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        store.createIndex("id", "id", { unique: true });
        return;
      }
      if (oldVersion === 1 && db.objectStoreNames.contains(this.storeName)) {
        db.deleteObjectStore(this.storeName);
        const newStore = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        newStore.createIndex("id", "id", { unique: true });
        if (existingData && existingData.length > 0) {
          for (const item of existingData) {
            const itemToStore = { ...item };
            delete itemToStore._seq;
            newStore.add(itemToStore);
          }
        }
      }
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        store.createIndex("id", "id", { unique: true });
      }
    });
  }
  async enqueue(item) {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, "readwrite", async (store) => {
      const itemToStore = { ...item };
      delete itemToStore._seq;
      await promisifyRequest(store.add(itemToStore));
    });
  }
  async dequeue() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readwrite", async (store) => {
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value;
        await promisifyRequest(store.delete(cursor.key));
        const { _seq: _, ...item } = value;
        return item;
      }
      return void 0;
    });
  }
  async peek() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readonly", async (store) => {
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value;
        const { _seq: _, ...item } = value;
        return item;
      }
      return void 0;
    });
  }
  async isEmpty() {
    return await this.size() === 0;
  }
  async size() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readonly", async (store) => {
      return promisifyRequest(store.count());
    });
  }
  async clear() {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, "readwrite", async (store) => {
      await promisifyRequest(store.clear());
    });
  }
  /**
   * Close the database connection.
   * The connection will be automatically reopened on next operation.
   */
  close() {
    if (this.dbPromise) {
      this.dbPromise.then((db) => db.close()).catch(() => {
      });
      this.dbPromise = null;
      this.isClosed = true;
    }
  }
};

// src/utils/registerServiceWorker.ts
function hasSyncSupport(reg) {
  return "sync" in reg;
}
async function requestBackgroundSync(tag = "rrh-background-sync") {
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  const reg = await navigator.serviceWorker.ready;
  if (!hasSyncSupport(reg)) {
    return false;
  }
  try {
    await reg.sync.register(tag);
    return true;
  } catch {
    return false;
  }
}

// src/utils/retry.ts
var RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
var defaultRetryDelay = (attempt) => {
  return Math.min(1e3 * Math.pow(2, attempt), 3e4);
};
function parseStatusCode(message) {
  const match = message.match(/(?:HTTP|status[:\s])\s*(\d{3})/i);
  return match ? parseInt(match[1], 10) : null;
}
function isNetworkError(error) {
  const message = error.message.toLowerCase();
  return message.includes("failed to fetch") || message.includes("network") || message.includes("networkerror") || message.includes("timeout") || message.includes("econnrefused") || message.includes("econnreset") || message.includes("enotfound") || error.name === "TypeError" && message.includes("fetch");
}
var defaultShouldRetry = (error) => {
  if (isNetworkError(error)) {
    return true;
  }
  const statusCode = parseStatusCode(error.message);
  if (statusCode !== null) {
    return RETRYABLE_STATUS_CODES.has(statusCode);
  }
  return false;
};
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// src/hooks/useBackgroundSync.ts
function createQueueStore() {
  return new IndexedDBQueueStore();
}
function createLogger(debug) {
  if (!debug) return () => {
  };
  if (typeof debug === "function") return debug;
  return (message, data) => {
    console.log(`[BackgroundSync] ${message}`, data !== void 0 ? data : "");
  };
}
function useBackgroundSync(options = {}) {
  const {
    queueStore: providedQueueStore,
    eventBus,
    onSuccess,
    onError,
    onRetry,
    retry = {},
    concurrency = 3,
    debug,
    maxQueueSize,
    onQueueFull = "drop-oldest"
  } = options;
  const {
    maxRetries = 3,
    retryDelay = defaultRetryDelay,
    shouldRetry = defaultShouldRetry
  } = retry;
  const log = useMemo(() => createLogger(debug), [debug]);
  const queueStoreRef = useRef(null);
  if (!queueStoreRef.current) {
    queueStoreRef.current = providedQueueStore ?? createQueueStore();
  }
  const queueStore = queueStoreRef.current;
  const [status, setStatus] = useState({ status: "idle" });
  const flushLockRef = useRef(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);
  const updateStatus = useCallback((newStatus) => {
    if (mountedRef.current) {
      setStatus(newStatus);
    }
    eventBus?.publish(newStatus);
  }, [eventBus]);
  const enqueue = useCallback(async (url, fetchOptions, meta) => {
    if (maxQueueSize !== void 0) {
      const currentSize = await queueStore.size();
      if (currentSize >= maxQueueSize) {
        if (onQueueFull === "reject") {
          log("Queue is full, rejecting new request", { url, currentSize, maxQueueSize });
          throw new Error(`Queue is full (max: ${maxQueueSize}). Request rejected.`);
        } else {
          const dropped = await queueStore.dequeue();
          log("Queue is full, dropping oldest request", {
            droppedUrl: dropped?.url,
            currentSize,
            maxQueueSize
          });
        }
      }
    }
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url,
      options: fetchOptions,
      meta,
      retryCount: 0,
      enqueuedAt: Date.now()
    };
    await queueStore.enqueue(item);
    log(`Enqueued request`, { id: item.id, url });
    requestBackgroundSync("rrh-background-sync").catch(() => {
      log("Background Sync API not supported, will flush on online event");
    });
    return item.id;
  }, [queueStore, log, maxQueueSize, onQueueFull]);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onRetryRef = useRef(onRetry);
  const shouldRetryRef = useRef(shouldRetry);
  const retryDelayRef = useRef(retryDelay);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onRetryRef.current = onRetry;
    shouldRetryRef.current = shouldRetry;
    retryDelayRef.current = retryDelay;
  }, [onSuccess, onError, onRetry, shouldRetry, retryDelay]);
  const processRequest = useCallback(async (req, signal) => {
    let currentRetryCount = req.retryCount ?? 0;
    let lastError = null;
    let lastStatusCode;
    while (currentRetryCount <= maxRetries) {
      if (signal?.aborted) {
        return { success: false, aborted: true };
      }
      try {
        const res = await fetch(req.url, {
          ...req.options,
          signal
        });
        if (!res.ok) {
          lastStatusCode = res.status;
          throw new Error(`HTTP ${res.status}: ${res.statusText || "Request failed"}`);
        }
        onSuccessRef.current?.(req);
        return { success: true };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { success: false, aborted: true };
        }
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!lastStatusCode) {
          const match = lastError.message.match(/HTTP (\d+)/);
          if (match) lastStatusCode = parseInt(match[1], 10);
        }
        if (!signal?.aborted && currentRetryCount < maxRetries && shouldRetryRef.current(lastError, req)) {
          currentRetryCount++;
          const delayMs = retryDelayRef.current(currentRetryCount - 1);
          onRetryRef.current?.(req, currentRetryCount, lastError);
          await delay(delayMs);
        } else {
          break;
        }
      }
    }
    if (signal?.aborted) {
      return { success: false, aborted: true };
    }
    onErrorRef.current?.(req, lastError);
    return {
      success: false,
      error: {
        req,
        error: lastError,
        statusCode: lastStatusCode,
        attempts: currentRetryCount + 1
      }
    };
  }, [maxRetries]);
  const flush = useCallback(async () => {
    if (flushLockRef.current) {
      log("Flush already in progress, waiting...");
      return flushLockRef.current;
    }
    const flushPromise = (async () => {
      const result = { succeeded: 0, failed: 0, pending: 0, errors: [] };
      const controller = new AbortController();
      abortControllerRef.current = controller;
      updateStatus({ status: "loading" });
      try {
        const initialSize = await queueStore.size();
        log(`Starting flush`, { queueSize: initialSize, concurrency });
        if (initialSize === 0) {
          log("Queue is empty, nothing to flush");
          updateStatus({ status: "success" });
          return result;
        }
        const items = [];
        for (let i = 0; i < initialSize; i++) {
          const req = await queueStore.dequeue();
          if (!req) break;
          items.push(req);
        }
        log(`Dequeued ${items.length} items for processing`);
        const allResults = [];
        const processWithConcurrency = async () => {
          const pending = [...items];
          const executing = /* @__PURE__ */ new Map();
          while (pending.length > 0 || executing.size > 0) {
            if (controller.signal.aborted) {
              for (const req of pending) {
                await queueStore.enqueue(req);
              }
              break;
            }
            while (pending.length > 0 && executing.size < concurrency) {
              const req = pending.shift();
              log(`Processing request`, { id: req.id, url: req.url });
              const promise = processRequest(req, controller.signal).then((res) => {
                allResults.push({ req, result: res });
                executing.delete(promise);
              });
              executing.set(promise, req);
            }
            if (executing.size >= concurrency || pending.length === 0 && executing.size > 0) {
              await Promise.race(executing.keys());
            }
          }
        };
        await processWithConcurrency();
        for (const { req, result: processResult } of allResults) {
          if (processResult.success) {
            result.succeeded++;
          } else if ("aborted" in processResult && processResult.aborted) {
            await queueStore.enqueue(req);
          } else if ("error" in processResult) {
            result.failed++;
            result.errors.push(processResult.error);
          }
        }
        const remainingSize = await queueStore.size();
        result.pending = remainingSize;
        log(`Flush complete`, {
          succeeded: result.succeeded,
          failed: result.failed,
          pending: result.pending
        });
        if (result.failed > 0) {
          const failedUrls = result.errors.map((e) => e.req.url).join(", ");
          updateStatus({
            status: "error",
            error: new Error(
              `${result.failed} request(s) failed: ${failedUrls}. Details: ${result.errors.map((e) => `${e.req.url} (${e.error.message})`).join("; ")}`
            )
          });
        } else {
          updateStatus({ status: "success" });
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        log(`Flush error`, { error: error.message });
        updateStatus({ status: "error", error });
        throw error;
      } finally {
        flushLockRef.current = null;
        abortControllerRef.current = null;
      }
    })();
    flushLockRef.current = flushPromise;
    return flushPromise;
  }, [queueStore, updateStatus, processRequest, concurrency, log]);
  const abortFlush = useCallback(() => {
    if (abortControllerRef.current) {
      log("Aborting flush");
      abortControllerRef.current.abort();
    }
  }, [log]);
  const getQueueSize = useCallback(async () => {
    return queueStore.size();
  }, [queueStore]);
  const clearQueue = useCallback(async () => {
    await queueStore.clear();
  }, [queueStore]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const onOnline = () => {
      log("Network online, triggering flush");
      flush().catch(() => {
      });
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush, log]);
  return { status, enqueue, flush, abortFlush, getQueueSize, clearQueue };
}

export { useBackgroundSync };
