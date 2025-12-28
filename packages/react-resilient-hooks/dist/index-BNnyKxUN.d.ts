import './eventBus-CJ2Eg9SB.js';

/**
 * Register a service worker at the given URL
 * @param swUrl - Path to the service worker file (default: "/service-worker.js")
 * @returns The service worker registration or null if registration fails
 */
declare function registerServiceWorker(swUrl?: string): Promise<ServiceWorkerRegistration | null>;
/**
 * Request a background sync with the given tag
 * @param tag - The sync tag name (default: "rrh-background-sync")
 * @returns True if sync was successfully registered, false otherwise
 */
declare function requestBackgroundSync(tag?: string): Promise<boolean>;

/**
 * HTTP status codes that are safe to retry
 */
declare const RETRYABLE_STATUS_CODES: Set<number>;
/**
 * Configuration for retry behavior.
 */
type RetryConfig = {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries: number;
    /** Delay function for retry backoff */
    retryDelay: (attempt: number) => number;
    /** Function to determine if an error should trigger a retry */
    shouldRetry: (error: Error) => boolean;
};
/**
 * Default exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
 */
declare const defaultRetryDelay: (attempt: number) => number;
/**
 * Default retry condition:
 * - Retry on network errors (no response received)
 * - Retry on specific HTTP status codes (5xx, 429, 408)
 * - Do NOT retry on 4xx errors (except 408, 429) as they indicate client errors
 */
declare const defaultShouldRetry: (error: Error) => boolean;
/**
 * Delay execution for a specified number of milliseconds.
 */
declare const delay: (ms: number) => Promise<void>;
/**
 * Execute a function with retry logic.
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @param onRetry - Optional callback when a retry occurs
 * @returns The result of the function
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, retryDelay: defaultRetryDelay, shouldRetry: defaultShouldRetry },
 *   (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
 * );
 * ```
 */
declare function withRetry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>, onRetry?: (attempt: number, error: Error) => void): Promise<T>;

export { RETRYABLE_STATUS_CODES as R, registerServiceWorker as a, defaultShouldRetry as b, delay as c, defaultRetryDelay as d, type RetryConfig as e, requestBackgroundSync as r, withRetry as w };
