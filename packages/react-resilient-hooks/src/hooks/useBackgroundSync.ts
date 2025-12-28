import { useEffect, useState, useCallback, useRef } from "react"
import { ResilientResult } from "../types/types"
import { QueueStore } from "../stores/types"
import { IndexedDBQueueStore } from "../stores/implementations"
import { EventBus } from "../utils/eventBus"
import { requestBackgroundSync } from "../utils/registerServiceWorker"
import {
  RetryConfig,
  defaultRetryDelay,
  defaultShouldRetry,
  delay
} from "../utils/retry"

/**
 * A queued request with metadata
 */
export type QueuedReq = {
  id: string;
  url: string;
  options?: RequestInit;
  meta?: Record<string, unknown>;
  /** Number of retry attempts made */
  retryCount?: number;
}

/**
 * Retry policy configuration for background sync
 */
export type RetryPolicy = {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Delay function for retry backoff (default: exponential backoff) */
  retryDelay?: (attempt: number) => number;
  /** Function to determine if a request should be retried */
  shouldRetry?: (error: Error, req: QueuedReq) => boolean;
}

/**
 * Options for useBackgroundSync hook
 */
export type BackgroundSyncOptions = {
  /** Custom queue store implementation */
  queueStore?: QueueStore<QueuedReq>;
  /** Event bus for publishing status updates */
  eventBus?: EventBus<ResilientResult>;
  /** Callback when a request succeeds */
  onSuccess?: (req: QueuedReq) => void;
  /** Callback when a request fails (after all retries) */
  onError?: (req: QueuedReq, error: Error) => void;
  /** Callback when a request is being retried */
  onRetry?: (req: QueuedReq, attempt: number, error: Error) => void;
  /** Retry policy configuration */
  retry?: RetryPolicy;
}

const defaultQueueStore = new IndexedDBQueueStore<QueuedReq>();

/**
 * Hook for queueing failed requests and syncing them when the network is back online.
 * Supports retry policies with exponential backoff.
 */
export function useBackgroundSync(options: BackgroundSyncOptions = {}) {
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

  const [status, setStatus] = useState<ResilientResult>({ status: "idle" });
  const isFlushing = useRef(false);

  const updateStatus = useCallback((newStatus: ResilientResult) => {
    setStatus(newStatus);
    eventBus?.publish(newStatus);
  }, [eventBus]);

  const enqueue = useCallback(async (url: string, options?: RequestInit, meta?: Record<string, unknown>) => {
    const item: QueuedReq = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url,
      options,
      meta,
      retryCount: 0
    };
    await queueStore.enqueue(item);
    try {
      await requestBackgroundSync("rrh-background-sync");
    } catch {
      // Background Sync API not supported, will flush on online event
    }
    return item.id;
  }, [queueStore]);


  const flush = useCallback(async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;

    updateStatus({ status: "loading" });

    try {
      while (!(await queueStore.isEmpty())) {
        const req = await queueStore.dequeue();
        if (!req) break;

        let success = false;
        let lastError: Error | null = null;

        // Attempt with retries
        const currentRetryCount = req.retryCount ?? 0;

        try {
          const res = await fetch(req.url, req.options);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          success = true;
          onSuccess?.(req);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          // Check if we should retry
          if (currentRetryCount < maxRetries && shouldRetry(lastError, req)) {
            const delayMs = retryDelay(currentRetryCount);
            onRetry?.(req, currentRetryCount + 1, lastError);

            // Wait before re-enqueueing
            await delay(delayMs);

            // Re-enqueue with incremented retry count
            await queueStore.enqueue({
              ...req,
              retryCount: currentRetryCount + 1
            });
          } else {
            // Max retries reached or should not retry
            onError?.(req, lastError);
            updateStatus({ status: "error", error: lastError });
            isFlushing.current = false;
            return;
          }
        }

        if (success) {
          // Continue to next item
        }
      }
      updateStatus({ status: "success" });
    } finally {
      isFlushing.current = false;
    }
  }, [queueStore, updateStatus, onSuccess, onError, onRetry, maxRetries, retryDelay, shouldRetry]);

  useEffect(() => {
    const onOnline = () => { flush(); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  return { status, enqueue, flush };
}
