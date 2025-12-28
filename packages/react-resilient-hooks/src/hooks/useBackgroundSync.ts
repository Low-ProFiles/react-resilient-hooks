import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { ResilientResult } from "../types/types"
import { QueueStore } from "../stores/types"
import { IndexedDBQueueStore } from "../stores/implementations"
import { EventBus } from "../utils/eventBus"
import { requestBackgroundSync } from "../utils/registerServiceWorker"
import {
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
  /** Timestamp when this request was enqueued */
  enqueuedAt?: number;
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
 * Details about a failed request
 */
export type FailedRequest = {
  /** The request that failed */
  req: QueuedReq;
  /** The error that caused the failure */
  error: Error;
  /** HTTP status code if available */
  statusCode?: number;
  /** Number of retry attempts made */
  attempts: number;
};

/**
 * Result of a flush operation
 */
export type FlushResult = {
  /** Number of successfully processed requests */
  succeeded: number;
  /** Number of failed requests (after all retries) */
  failed: number;
  /** Number of requests still pending (added during flush) */
  pending: number;
  /** Details of failed requests */
  errors: FailedRequest[];
};

/**
 * Behavior when queue is full
 */
export type QueueFullBehavior = 'drop-oldest' | 'reject';

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
  /** Number of concurrent requests during flush (default: 3) */
  concurrency?: number;
  /** Enable debug logging */
  debug?: boolean | ((message: string, data?: unknown) => void);
  /** Maximum number of items in the queue (default: unlimited) */
  maxQueueSize?: number;
  /** Behavior when queue is full (default: 'drop-oldest') */
  onQueueFull?: QueueFullBehavior;
}

/**
 * Return type for useBackgroundSync hook
 */
export type BackgroundSyncResult = {
  /** Current sync status */
  status: ResilientResult;
  /** Add a request to the queue */
  enqueue: (url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>;
  /** Flush all queued requests */
  flush: () => Promise<FlushResult>;
  /** Cancel the current flush operation */
  abortFlush: () => void;
  /** Get current queue size */
  getQueueSize: () => Promise<number>;
  /** Clear all queued requests */
  clearQueue: () => Promise<void>;
};

/**
 * Create a new queue store instance.
 * Each hook instance gets its own store by default for isolation.
 */
function createQueueStore(): IndexedDBQueueStore<QueuedReq> {
  return new IndexedDBQueueStore<QueuedReq>();
}

/**
 * Hook for queueing failed requests and syncing them when the network is back online.
 * Supports retry policies with exponential backoff.
 *
 * @example
 * ```tsx
 * const { status, enqueue, flush } = useBackgroundSync({
 *   onSuccess: (req) => console.log('Synced:', req.url),
 *   onError: (req, err) => console.error('Failed:', req.url, err),
 *   retry: { maxRetries: 5 }
 * });
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     await fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
 *   } catch {
 *     await enqueue('/api/submit', { method: 'POST', body: JSON.stringify(data) });
 *   }
 * };
 * ```
 */
/** Debug logger helper */
function createLogger(debug: boolean | ((message: string, data?: unknown) => void) | undefined) {
  if (!debug) return () => {};
  if (typeof debug === 'function') return debug;
  return (message: string, data?: unknown) => {
    console.log(`[BackgroundSync] ${message}`, data !== undefined ? data : '');
  };
}

export function useBackgroundSync(options: BackgroundSyncOptions = {}): BackgroundSyncResult {
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
    onQueueFull = 'drop-oldest'
  } = options;

  const {
    maxRetries = 3,
    retryDelay = defaultRetryDelay,
    shouldRetry = defaultShouldRetry
  } = retry;

  // Memoize logger to avoid recreating on every render
  const log = useMemo(() => createLogger(debug), [debug]);

  // Create queue store once per hook instance if not provided
  const queueStoreRef = useRef<QueueStore<QueuedReq> | null>(null);
  if (!queueStoreRef.current) {
    queueStoreRef.current = providedQueueStore ?? createQueueStore();
  }
  const queueStore = queueStoreRef.current;

  const [status, setStatus] = useState<ResilientResult>({ status: "idle" });
  const flushLockRef = useRef<Promise<FlushResult> | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track mounted state and cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort any in-flight requests on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const updateStatus = useCallback((newStatus: ResilientResult) => {
    if (mountedRef.current) {
      setStatus(newStatus);
    }
    eventBus?.publish(newStatus);
  }, [eventBus]);

  const enqueue = useCallback(async (
    url: string,
    fetchOptions?: RequestInit,
    meta?: Record<string, unknown>
  ): Promise<string> => {
    // Check queue size limit
    if (maxQueueSize !== undefined) {
      const currentSize = await queueStore.size();
      if (currentSize >= maxQueueSize) {
        if (onQueueFull === 'reject') {
          log('Queue is full, rejecting new request', { url, currentSize, maxQueueSize });
          throw new Error(`Queue is full (max: ${maxQueueSize}). Request rejected.`);
        } else {
          // drop-oldest: remove oldest item to make room
          const dropped = await queueStore.dequeue();
          log('Queue is full, dropping oldest request', {
            droppedUrl: dropped?.url,
            currentSize,
            maxQueueSize
          });
        }
      }
    }

    const item: QueuedReq = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url,
      options: fetchOptions,
      meta,
      retryCount: 0,
      enqueuedAt: Date.now()
    };
    await queueStore.enqueue(item);
    log(`Enqueued request`, { id: item.id, url });

    // Try to register for background sync (non-blocking)
    requestBackgroundSync("rrh-background-sync").catch(() => {
      log('Background Sync API not supported, will flush on online event');
    });

    return item.id;
  }, [queueStore, log, maxQueueSize, onQueueFull]);

  // Store callbacks in refs to avoid recreating flush on every render
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

  /** Result of processing a single request */
  type ProcessResult =
    | { success: true }
    | { success: false; error: FailedRequest }
    | { success: false; aborted: true };

  /**
   * Process a single request with retry logic
   * Returns a result object instead of mutating shared state (thread-safe for parallel execution)
   */
  const processRequest = useCallback(async (
    req: QueuedReq,
    signal?: AbortSignal
  ): Promise<ProcessResult> => {
    let currentRetryCount = req.retryCount ?? 0;
    let lastError: Error | null = null;
    let lastStatusCode: number | undefined;

    while (currentRetryCount <= maxRetries) {
      // Check if aborted before making request
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
          throw new Error(`HTTP ${res.status}: ${res.statusText || 'Request failed'}`);
        }

        // Success
        onSuccessRef.current?.(req);
        return { success: true };

      } catch (err) {
        // Handle abort specially - don't retry, don't count as error
        if (err instanceof Error && err.name === 'AbortError') {
          return { success: false, aborted: true };
        }

        lastError = err instanceof Error ? err : new Error(String(err));

        // Extract status code from error message if not already set
        if (!lastStatusCode) {
          const match = lastError.message.match(/HTTP (\d+)/);
          if (match) lastStatusCode = parseInt(match[1], 10);
        }

        // Check if we should retry (but not if aborted)
        if (!signal?.aborted && currentRetryCount < maxRetries && shouldRetryRef.current(lastError, req)) {
          currentRetryCount++;
          const delayMs = retryDelayRef.current(currentRetryCount - 1);

          onRetryRef.current?.(req, currentRetryCount, lastError);

          await delay(delayMs);
          // Continue to next iteration
        } else {
          // No more retries
          break;
        }
      }
    }

    // Check if aborted after loop
    if (signal?.aborted) {
      return { success: false, aborted: true };
    }

    // Failed after all retries
    onErrorRef.current?.(req, lastError!);
    return {
      success: false,
      error: {
        req,
        error: lastError!,
        statusCode: lastStatusCode,
        attempts: currentRetryCount + 1
      }
    };

  }, [maxRetries]);

  const flush = useCallback(async (): Promise<FlushResult> => {
    // If already flushing, wait for that flush to complete
    if (flushLockRef.current) {
      log('Flush already in progress, waiting...');
      return flushLockRef.current;
    }

    const flushPromise = (async (): Promise<FlushResult> => {
      const result: FlushResult = { succeeded: 0, failed: 0, pending: 0, errors: [] };

      // Create abort controller for this flush
      const controller = new AbortController();
      abortControllerRef.current = controller;

      updateStatus({ status: "loading" });

      try {
        // Snapshot: get current queue size at flush start
        const initialSize = await queueStore.size();
        log(`Starting flush`, { queueSize: initialSize, concurrency });

        if (initialSize === 0) {
          log('Queue is empty, nothing to flush');
          updateStatus({ status: "success" });
          return result;
        }

        // Dequeue all items first to process in parallel
        const items: QueuedReq[] = [];
        for (let i = 0; i < initialSize; i++) {
          const req = await queueStore.dequeue();
          if (!req) break;
          items.push(req);
        }

        log(`Dequeued ${items.length} items for processing`);

        // Process items in parallel with concurrency limit
        // Collect all results first, then aggregate (avoids race conditions)
        type ProcessResultWithReq = { req: QueuedReq; result: Awaited<ReturnType<typeof processRequest>> };
        const allResults: ProcessResultWithReq[] = [];

        const processWithConcurrency = async () => {
          const pending = [...items];
          const executing: Map<Promise<void>, QueuedReq> = new Map();

          while (pending.length > 0 || executing.size > 0) {
            // Check if aborted
            if (controller.signal.aborted) {
              // Re-enqueue remaining pending items
              for (const req of pending) {
                await queueStore.enqueue(req);
              }
              break;
            }

            // Fill up to concurrency limit
            while (pending.length > 0 && executing.size < concurrency) {
              const req = pending.shift()!;
              log(`Processing request`, { id: req.id, url: req.url });

              const promise = processRequest(req, controller.signal).then((res) => {
                allResults.push({ req, result: res });
                executing.delete(promise);
              });
              executing.set(promise, req);
            }

            // Wait for at least one to complete if at concurrency limit
            if (executing.size >= concurrency || (pending.length === 0 && executing.size > 0)) {
              await Promise.race(executing.keys());
            }
          }
        };

        await processWithConcurrency();

        // Aggregate results after all processing is complete (no race conditions)
        // Re-enqueue aborted items so they can be retried later
        for (const { req, result: processResult } of allResults) {
          if (processResult.success) {
            result.succeeded++;
          } else if ('aborted' in processResult && processResult.aborted) {
            // Re-enqueue aborted items
            await queueStore.enqueue(req);
          } else if ('error' in processResult) {
            result.failed++;
            result.errors.push(processResult.error);
          }
        }

        // Check if new items were added during flush
        const remainingSize = await queueStore.size();
        result.pending = remainingSize;

        log(`Flush complete`, {
          succeeded: result.succeeded,
          failed: result.failed,
          pending: result.pending
        });

        // Set final status based on results
        if (result.failed > 0) {
          const failedUrls = result.errors.map(e => e.req.url).join(', ');
          updateStatus({
            status: "error",
            error: new Error(
              `${result.failed} request(s) failed: ${failedUrls}. ` +
              `Details: ${result.errors.map(e => `${e.req.url} (${e.error.message})`).join('; ')}`
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
      log('Aborting flush');
      abortControllerRef.current.abort();
    }
  }, [log]);

  const getQueueSize = useCallback(async (): Promise<number> => {
    return queueStore.size();
  }, [queueStore]);

  const clearQueue = useCallback(async (): Promise<void> => {
    await queueStore.clear();
  }, [queueStore]);

  // Auto-flush on online event
  useEffect(() => {
    // SSR check
    if (typeof window === 'undefined') {
      return;
    }

    const onOnline = () => {
      log('Network online, triggering flush');
      flush().catch(() => {
        // Flush errors are handled internally
      });
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush, log]);

  return { status, enqueue, flush, abortFlush, getQueueSize, clearQueue };
}
