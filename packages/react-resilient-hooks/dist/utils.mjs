// src/utils/eventBus.ts
var EventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
  }
  /**
   * Subscribe to events on this bus.
   *
   * @param listener - Function to call when an event is published
   * @returns Unsubscribe function to stop receiving events
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  /**
   * Publish an event to all subscribers.
   * Listeners are called synchronously in insertion order.
   *
   * @param event - The event to broadcast
   */
  publish(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
      }
    });
  }
  /**
   * Get the current number of subscribers.
   * Useful for debugging and testing.
   */
  get size() {
    return this.listeners.size;
  }
  /**
   * Remove all subscribers.
   * Useful for cleanup in tests or when the bus is no longer needed.
   */
  clear() {
    this.listeners.clear();
  }
};

// src/utils/registerServiceWorker.ts
function hasSyncSupport(reg) {
  return "sync" in reg;
}
async function registerServiceWorker(swUrl = "/service-worker.js") {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register(swUrl);
    return reg;
  } catch {
    return null;
  }
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
var defaultRetryConfig = {
  maxRetries: 3,
  retryDelay: defaultRetryDelay,
  shouldRetry: defaultShouldRetry
};
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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

export { EventBus, defaultRetryDelay, defaultShouldRetry, delay, registerServiceWorker, requestBackgroundSync, withRetry };
