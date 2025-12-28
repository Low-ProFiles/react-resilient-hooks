import { a as ResilientResult } from '../types-BF29fKSQ.mjs';
import { Q as QueueStore } from '../types-DivwYhR1.mjs';
import { E as EventBus } from '../eventBus-CWtqFtpt.mjs';

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
};
/**
 * Hook for queueing failed requests and syncing them when the network is back online.
 * Supports retry policies with exponential backoff.
 */
declare function useBackgroundSync(options?: BackgroundSyncOptions): {
    status: ResilientResult<unknown>;
    enqueue: (url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>;
    flush: () => Promise<void>;
};

export { type BackgroundSyncOptions, type QueuedReq, type RetryPolicy, useBackgroundSync };
