/**
 * Configuration for retry behavior.
 */
export type RetryConfig = {
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
export const defaultRetryDelay = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
};

/**
 * Default retry condition: retry on 5xx errors and network errors
 */
export const defaultShouldRetry = (error: Error): boolean => {
  const message = error.message;
  if (message.startsWith('HTTP 5')) return true;
  if (message.includes('network') || message.includes('fetch')) return true;
  return false;
};

/**
 * Default retry configuration.
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: defaultRetryDelay,
  shouldRetry: defaultShouldRetry,
};

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
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const { maxRetries, retryDelay, shouldRetry } = { ...defaultRetryConfig, ...config };

  let lastError: Error | null = null;

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

/**
 * Delay execution for a specified number of milliseconds.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
