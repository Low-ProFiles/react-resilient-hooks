import { a as ResilientResult } from './types-BF29fKSQ.js';
import { Q as QueueStore } from './types-DivwYhR1.js';

type Listener<T> = (event: T) => void;
/**
 * Simple pub/sub event bus for broadcasting events to multiple listeners.
 * Used internally for status updates across hooks.
 *
 * @typeParam T - Type of events published on this bus
 *
 * @example
 * ```ts
 * const bus = new EventBus<{ status: string }>();
 *
 * const unsubscribe = bus.subscribe((event) => {
 *   console.log('Status:', event.status);
 * });
 *
 * bus.publish({ status: 'loading' });
 *
 * unsubscribe(); // Stop receiving events
 * ```
 */
declare class EventBus<T> {
    private listeners;
    /**
     * Subscribe to events on this bus.
     *
     * @param listener - Function to call when an event is published
     * @returns Unsubscribe function to stop receiving events
     */
    subscribe(listener: Listener<T>): () => void;
    /**
     * Publish an event to all subscribers.
     *
     * @param event - The event to broadcast
     */
    publish(event: T): void;
}

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
 * Retry policy configuration
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

export { type BackgroundSyncOptions as B, EventBus as E, type QueuedReq as Q, type RetryPolicy as R, useBackgroundSync as u };
