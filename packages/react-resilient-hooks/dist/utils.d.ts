export { E as EventBus } from './eventBus-CWtqFtpt.js';

declare function registerServiceWorker(swUrl?: string): Promise<ServiceWorkerRegistration | null>;
declare function requestBackgroundSync(tag?: string): Promise<boolean>;

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
 * Default retry condition: retry on 5xx errors and network errors
 */
declare const defaultShouldRetry: (error: Error) => boolean;
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
/**
 * Delay execution for a specified number of milliseconds.
 */
declare const delay: (ms: number) => Promise<void>;

export { type RetryConfig, defaultRetryDelay, defaultShouldRetry, delay, registerServiceWorker, requestBackgroundSync, withRetry };
