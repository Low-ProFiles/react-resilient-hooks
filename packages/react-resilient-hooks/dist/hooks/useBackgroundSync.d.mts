import { a as ResilientResult } from '../types-BF29fKSQ.mjs';
import { Q as QueueStore } from '../types-DivwYhR1.mjs';
import { E as EventBus } from '../eventBus-CJ2Eg9SB.mjs';

/**
 * A queued request with metadata
 */
type QueuedReq = {
    id: string;
    url: string;
    options?: RequestInit;
    meta?: Record<string, unknown>;
    /** Number of retry attempts made */
    retryCount?: number;
    /** Timestamp when this request was enqueued */
    enqueuedAt?: number;
};
/**
 * Retry policy configuration for background sync
 */
type RetryPolicy = {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Delay function for retry backoff (default: exponential backoff) */
    retryDelay?: (attempt: number) => number;
    /** Function to determine if a request should be retried */
    shouldRetry?: (error: Error, req: QueuedReq) => boolean;
};
/**
 * Details about a failed request
 */
type FailedRequest = {
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
type FlushResult = {
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
type QueueFullBehavior = 'drop-oldest' | 'reject';
/**
 * Options for useBackgroundSync hook
 */
type BackgroundSyncOptions = {
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
};
/**
 * Return type for useBackgroundSync hook
 */
type BackgroundSyncResult = {
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
declare function useBackgroundSync(options?: BackgroundSyncOptions): BackgroundSyncResult;

export { type BackgroundSyncOptions, type BackgroundSyncResult, type FailedRequest, type FlushResult, type QueueFullBehavior, type QueuedReq, type RetryPolicy, useBackgroundSync };
