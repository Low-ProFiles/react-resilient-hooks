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

export { EventBus, defaultRetryDelay, defaultShouldRetry, delay, registerServiceWorker, requestBackgroundSync, withRetry };
