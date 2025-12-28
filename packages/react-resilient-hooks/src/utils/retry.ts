/**
 * HTTP status codes that are safe to retry
 */
export const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

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
 * Parse HTTP status code from error message
 */
function parseStatusCode(message: string): number | null {
  // Match patterns like "HTTP 500", "HTTP 429", "status: 503"
  const match = message.match(/(?:HTTP|status[:\s])\s*(\d{3})/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if an error represents a network failure (not an HTTP error)
 */
function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('networkerror') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    error.name === 'TypeError' && message.includes('fetch')
  );
}

/**
 * Default retry condition:
 * - Retry on network errors (no response received)
 * - Retry on specific HTTP status codes (5xx, 429, 408)
 * - Do NOT retry on 4xx errors (except 408, 429) as they indicate client errors
 */
export const defaultShouldRetry = (error: Error): boolean => {
  // Always retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Check for HTTP status codes
  const statusCode = parseStatusCode(error.message);
  if (statusCode !== null) {
    return RETRYABLE_STATUS_CODES.has(statusCode);
  }

  // Unknown error type - don't retry by default
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
 * Delay execution for a specified number of milliseconds.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

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
