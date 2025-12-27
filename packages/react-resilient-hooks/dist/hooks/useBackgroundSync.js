'use strict';

var react = require('react');

// src/hooks/useBackgroundSync.ts

// src/core/idbUtils.ts
function openDB(dbName, version = 1, upgradeCb) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      try {
        upgradeCb?.(req.result);
      } catch {
      }
    };
  });
}
function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// src/stores/implementations.ts
var IndexedDBQueueStore = class {
  /**
   * Create a new IndexedDB queue store.
   *
   * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
   * @param storeName - Name of the object store (default: 'queue')
   */
  constructor(dbName = "resilient-queue", storeName = "queue") {
    this.dbPromise = null;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, 1, (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      });
    }
    return this.dbPromise;
  }
  async enqueue(item) {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.add(item));
  }
  async dequeue() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    if (cursor) {
      const value = cursor.value;
      await promisifyRequest(store.delete(cursor.key));
      return value;
    }
    return void 0;
  }
  async peek() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    return cursor ? cursor.value : void 0;
  }
  async isEmpty() {
    return await this.size() === 0;
  }
  async size() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    return promisifyRequest(store.count());
  }
  async clear() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.clear());
  }
};

// src/utils/registerServiceWorker.ts
async function requestBackgroundSync(tag = "rrh-background-sync") {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  if (!("sync" in reg)) return false;
  try {
    await reg.sync.register(tag);
    return true;
  } catch {
    return false;
  }
}

// src/hooks/useBackgroundSync.ts
var defaultRetryDelay = (attempt) => {
  return Math.min(1e3 * Math.pow(2, attempt), 3e4);
};
var defaultShouldRetry = (error) => {
  const message = error.message;
  if (message.startsWith("HTTP 5")) return true;
  if (message.includes("network") || message.includes("fetch")) return true;
  return false;
};
var defaultQueueStore = new IndexedDBQueueStore();
function useBackgroundSync(options = {}) {
  const {
    queueStore = defaultQueueStore,
    eventBus,
    onSuccess,
    onError,
    onRetry,
    retry = {}
  } = options;
  const {
    maxRetries = 3,
    retryDelay = defaultRetryDelay,
    shouldRetry = defaultShouldRetry
  } = retry;
  const [status, setStatus] = react.useState({ status: "idle" });
  const isFlushing = react.useRef(false);
  const updateStatus = react.useCallback((newStatus) => {
    setStatus(newStatus);
    eventBus?.publish(newStatus);
  }, [eventBus]);
  const enqueue = react.useCallback(async (url, options2, meta) => {
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url,
      options: options2,
      meta,
      retryCount: 0
    };
    await queueStore.enqueue(item);
    try {
      await requestBackgroundSync("rrh-background-sync");
    } catch {
    }
    return item.id;
  }, [queueStore]);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const flush = react.useCallback(async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;
    updateStatus({ status: "loading" });
    try {
      while (!await queueStore.isEmpty()) {
        const req = await queueStore.dequeue();
        if (!req) break;
        let success = false;
        let lastError = null;
        const currentRetryCount = req.retryCount ?? 0;
        try {
          const res = await fetch(req.url, req.options);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          success = true;
          onSuccess?.(req);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (currentRetryCount < maxRetries && shouldRetry(lastError, req)) {
            const delayMs = retryDelay(currentRetryCount);
            onRetry?.(req, currentRetryCount + 1, lastError);
            await delay(delayMs);
            await queueStore.enqueue({
              ...req,
              retryCount: currentRetryCount + 1
            });
          } else {
            onError?.(req, lastError);
            updateStatus({ status: "error", error: lastError });
            isFlushing.current = false;
            return;
          }
        }
        if (success) {
        }
      }
      updateStatus({ status: "success" });
    } finally {
      isFlushing.current = false;
    }
  }, [queueStore, updateStatus, onSuccess, onError, onRetry, maxRetries, retryDelay, shouldRetry]);
  react.useEffect(() => {
    const onOnline = () => {
      flush();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);
  return { status, enqueue, flush };
}

exports.useBackgroundSync = useBackgroundSync;
