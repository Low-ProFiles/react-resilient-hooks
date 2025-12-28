import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// src/hooks/useAdaptiveImage.ts
function useNetworkStatus() {
  const [state, setState] = useState({
    data: {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      effectiveType: navigator?.connection?.effectiveType,
      downlink: navigator?.connection?.downlink,
      rtt: navigator?.connection?.rtt,
      saveData: navigator?.connection?.saveData
    },
    error: null,
    loading: false
  });
  useEffect(() => {
    const update = () => {
      setState({
        data: {
          online: navigator.onLine,
          effectiveType: navigator?.connection?.effectiveType,
          downlink: navigator?.connection?.downlink,
          rtt: navigator?.connection?.rtt,
          saveData: navigator?.connection?.saveData
        },
        error: null,
        loading: false
      });
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = navigator?.connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);
  return state;
}

// src/hooks/useAdaptiveImage.ts
function selectImage(src, networkStatus, options) {
  const { ssrDefault = "high", thresholds = { low: 0.5, medium: 1.5 } } = options;
  if (!networkStatus) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }
  const { effectiveType, downlink } = networkStatus;
  if (!effectiveType && downlink === void 0) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }
  const dl = typeof downlink === "number" ? downlink : 10;
  if (effectiveType?.includes("2g") || dl < thresholds.low) {
    return { src: src.low, quality: "low" };
  }
  if (effectiveType?.includes("3g") || dl < thresholds.medium) {
    return { src: src.medium ?? src.low, quality: src.medium ? "medium" : "low" };
  }
  return { src: src.high, quality: "high" };
}
function useAdaptiveImage(src, options = {}) {
  const { data: networkStatus } = useNetworkStatus();
  const result = useMemo(
    () => selectImage(src, networkStatus, options),
    [src.high, src.medium, src.low, networkStatus, options.ssrDefault, options.thresholds?.low, options.thresholds?.medium]
  );
  return result;
}
function calculateInterval(effectiveType, baseInterval, maxInterval) {
  if (!effectiveType) return baseInterval;
  if (effectiveType.includes("4g")) return baseInterval;
  if (effectiveType.includes("3g")) return Math.min(baseInterval * 2, maxInterval);
  return Math.min(baseInterval * 3, maxInterval);
}
function useAdaptivePolling(callback, opts = {}) {
  const {
    baseInterval = 5e3,
    maxInterval = 6e4,
    jitter = true,
    pauseWhenOffline = true,
    enabled = true,
    onError
  } = opts;
  const { data: networkStatus } = useNetworkStatus();
  const savedCallback = useRef(callback);
  const [isPaused, setIsPaused] = useState(!enabled);
  const [state, setState] = useState({
    isPolling: false,
    isPaused: !enabled,
    currentInterval: baseInterval,
    errorCount: 0,
    lastError: null
  });
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  const tick = useCallback(async () => {
    try {
      await savedCallback.current();
      setState((prev) => ({
        ...prev,
        errorCount: 0,
        lastError: null
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        lastError: error
      }));
      onError?.(error);
    }
  }, [onError]);
  const pause = useCallback(() => {
    setIsPaused(true);
    setState((prev) => ({ ...prev, isPaused: true, isPolling: false }));
  }, []);
  const resume = useCallback(() => {
    setIsPaused(false);
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);
  const triggerNow = useCallback(async () => {
    await tick();
  }, [tick]);
  useEffect(() => {
    if (isPaused) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    if (pauseWhenOffline && !networkStatus?.online) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    const interval = calculateInterval(
      networkStatus?.effectiveType,
      baseInterval,
      maxInterval
    );
    const actualInterval = jitter ? interval + Math.floor(Math.random() * interval * 0.1) : interval;
    setState((prev) => ({
      ...prev,
      isPolling: true,
      currentInterval: actualInterval
    }));
    const id = setInterval(tick, actualInterval);
    return () => {
      clearInterval(id);
      setState((prev) => ({ ...prev, isPolling: false }));
    };
  }, [isPaused, networkStatus?.online, networkStatus?.effectiveType, baseInterval, maxInterval, jitter, pauseWhenOffline, tick]);
  return { state, pause, resume, triggerNow };
}

// src/stores/idbUtils.ts
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
var MemoryQueueStore = class {
  constructor() {
    this.queue = [];
  }
  async enqueue(item) {
    this.queue.push(item);
  }
  async dequeue() {
    return this.queue.shift();
  }
  async peek() {
    return this.queue[0];
  }
  async isEmpty() {
    return this.queue.length === 0;
  }
  async size() {
    return this.queue.length;
  }
  async clear() {
    this.queue = [];
  }
};
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
async function registerServiceWorker(swUrl = "/service-worker.js") {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register(swUrl);
      return reg;
    } catch {
      return null;
    }
  }
  return null;
}
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

// src/utils/retry.ts
var defaultRetryDelay = (attempt) => {
  return Math.min(1e3 * Math.pow(2, attempt), 3e4);
};
var defaultShouldRetry = (error) => {
  const message = error.message;
  if (message.startsWith("HTTP 5")) return true;
  if (message.includes("network") || message.includes("fetch")) return true;
  return false;
};
var defaultRetryConfig = {
  maxRetries: 3,
  retryDelay: defaultRetryDelay,
  shouldRetry: defaultShouldRetry
};
async function withRetry(fn, config = {}, onRetry) {
  const { maxRetries, retryDelay, shouldRetry } = { ...defaultRetryConfig, ...config };
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries && shouldRetry(lastError)) {
        onRetry?.(attempt + 1, lastError);
        await delay(retryDelay(attempt));
      } else {
        throw lastError;
      }
    }
  }
  throw lastError;
}
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// src/hooks/useBackgroundSync.ts
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
  const [status, setStatus] = useState({ status: "idle" });
  const isFlushing = useRef(false);
  const updateStatus = useCallback((newStatus) => {
    setStatus(newStatus);
    eventBus?.publish(newStatus);
  }, [eventBus]);
  const enqueue = useCallback(async (url, options2, meta) => {
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
  const flush = useCallback(async () => {
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
  useEffect(() => {
    const onOnline = () => {
      flush();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);
  return { status, enqueue, flush };
}

// src/utils/eventBus.ts
var EventBus = class {
  constructor() {
    this.listeners = [];
  }
  /**
   * Subscribe to events on this bus.
   *
   * @param listener - Function to call when an event is published
   * @returns Unsubscribe function to stop receiving events
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  /**
   * Publish an event to all subscribers.
   *
   * @param event - The event to broadcast
   */
  publish(event) {
    this.listeners.forEach((listener) => listener(event));
  }
};

export { EventBus, IndexedDBQueueStore, MemoryQueueStore, defaultRetryDelay, defaultShouldRetry, delay, registerServiceWorker, requestBackgroundSync, useAdaptiveImage, useAdaptivePolling, useBackgroundSync, useNetworkStatus, withRetry };
