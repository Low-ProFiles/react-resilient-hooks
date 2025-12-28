import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  defaultRetryDelay,
  defaultShouldRetry,
  delay,
  RETRYABLE_STATUS_CODES,
} from '../utils/retry';

describe('retry utilities', () => {
  describe('RETRYABLE_STATUS_CODES', () => {
    it('should include 408 (Request Timeout)', () => {
      expect(RETRYABLE_STATUS_CODES.has(408)).toBe(true);
    });

    it('should include 429 (Too Many Requests)', () => {
      expect(RETRYABLE_STATUS_CODES.has(429)).toBe(true);
    });

    it('should include 5xx server errors', () => {
      expect(RETRYABLE_STATUS_CODES.has(500)).toBe(true);
      expect(RETRYABLE_STATUS_CODES.has(502)).toBe(true);
      expect(RETRYABLE_STATUS_CODES.has(503)).toBe(true);
      expect(RETRYABLE_STATUS_CODES.has(504)).toBe(true);
    });

    it('should not include client errors (4xx except 408, 429)', () => {
      expect(RETRYABLE_STATUS_CODES.has(400)).toBe(false);
      expect(RETRYABLE_STATUS_CODES.has(401)).toBe(false);
      expect(RETRYABLE_STATUS_CODES.has(403)).toBe(false);
      expect(RETRYABLE_STATUS_CODES.has(404)).toBe(false);
    });
  });

  describe('defaultRetryDelay', () => {
    it('should return 1000ms for attempt 0', () => {
      expect(defaultRetryDelay(0)).toBe(1000);
    });

    it('should return 2000ms for attempt 1', () => {
      expect(defaultRetryDelay(1)).toBe(2000);
    });

    it('should return 4000ms for attempt 2', () => {
      expect(defaultRetryDelay(2)).toBe(4000);
    });

    it('should cap at 30000ms', () => {
      expect(defaultRetryDelay(10)).toBe(30000);
      expect(defaultRetryDelay(100)).toBe(30000);
    });

    it('should follow exponential backoff pattern', () => {
      expect(defaultRetryDelay(0)).toBe(1000); // 2^0 * 1000
      expect(defaultRetryDelay(1)).toBe(2000); // 2^1 * 1000
      expect(defaultRetryDelay(2)).toBe(4000); // 2^2 * 1000
      expect(defaultRetryDelay(3)).toBe(8000); // 2^3 * 1000
      expect(defaultRetryDelay(4)).toBe(16000); // 2^4 * 1000
    });
  });

  describe('defaultShouldRetry', () => {
    it('should return true for network errors', () => {
      expect(defaultShouldRetry(new Error('Failed to fetch'))).toBe(true);
      expect(defaultShouldRetry(new Error('Network error'))).toBe(true);
      expect(defaultShouldRetry(new Error('NetworkError when attempting to fetch'))).toBe(true);
      expect(defaultShouldRetry(new Error('Request timeout'))).toBe(true);
      expect(defaultShouldRetry(new Error('ECONNREFUSED'))).toBe(true);
      expect(defaultShouldRetry(new Error('ECONNRESET'))).toBe(true);
      expect(defaultShouldRetry(new Error('ENOTFOUND'))).toBe(true);
    });

    it('should return true for TypeError with fetch', () => {
      const error = new TypeError('fetch failed');
      expect(defaultShouldRetry(error)).toBe(true);
    });

    it('should return true for retryable HTTP status codes', () => {
      expect(defaultShouldRetry(new Error('HTTP 408'))).toBe(true);
      expect(defaultShouldRetry(new Error('HTTP 429'))).toBe(true);
      expect(defaultShouldRetry(new Error('HTTP 500'))).toBe(true);
      expect(defaultShouldRetry(new Error('HTTP 502'))).toBe(true);
      expect(defaultShouldRetry(new Error('HTTP 503'))).toBe(true);
      expect(defaultShouldRetry(new Error('HTTP 504'))).toBe(true);
    });

    it('should return true for status: format', () => {
      expect(defaultShouldRetry(new Error('status: 500'))).toBe(true);
      expect(defaultShouldRetry(new Error('status 429'))).toBe(true);
    });

    it('should return false for non-retryable HTTP status codes', () => {
      expect(defaultShouldRetry(new Error('HTTP 400'))).toBe(false);
      expect(defaultShouldRetry(new Error('HTTP 401'))).toBe(false);
      expect(defaultShouldRetry(new Error('HTTP 403'))).toBe(false);
      expect(defaultShouldRetry(new Error('HTTP 404'))).toBe(false);
    });

    it('should return false for unknown errors', () => {
      expect(defaultShouldRetry(new Error('Something went wrong'))).toBe(false);
      expect(defaultShouldRetry(new Error('Invalid data'))).toBe(false);
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay for specified milliseconds', async () => {
      const callback = vi.fn();

      delay(1000).then(callback);

      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(999);
      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(callback).toHaveBeenCalled();
    });

    it('should resolve immediately for 0ms', async () => {
      const callback = vi.fn();

      delay(0).then(callback);

      await vi.advanceTimersByTimeAsync(0);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(fn, {
        maxRetries: 3,
        retryDelay: () => 100,
      });

      // Advance timers to trigger retry
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      vi.useRealTimers(); // Use real timers for this specific test

      const error = new Error('Failed to fetch');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, {
          maxRetries: 2,
          retryDelay: () => 10, // Short delay for faster test
          shouldRetry: () => true,
        })
      ).rejects.toThrow('Failed to fetch');

      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries

      vi.useFakeTimers(); // Restore fake timers for other tests
    });

    it('should not retry if shouldRetry returns false', async () => {
      const error = new Error('Do not retry');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('Do not retry');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(
        fn,
        {
          maxRetries: 3,
          retryDelay: () => 100,
        },
        onRetry
      );

      await vi.advanceTimersByTimeAsync(100);
      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should use retryDelay for backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success');

      const delays: number[] = [];
      const retryDelay = vi.fn((attempt: number) => {
        const delay = (attempt + 1) * 1000;
        delays.push(delay);
        return delay;
      });

      const resultPromise = withRetry(fn, { maxRetries: 3, retryDelay });

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      // Second retry after 2000ms
      await vi.advanceTimersByTimeAsync(2000);

      await resultPromise;

      expect(retryDelay).toHaveBeenCalledWith(0);
      expect(retryDelay).toHaveBeenCalledWith(1);
      expect(delays).toEqual([1000, 2000]);
    });

    it('should convert non-Error throws to Error', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      await expect(
        withRetry(fn, { maxRetries: 0 })
      ).rejects.toThrow('string error');
    });

    it('should use default config when none provided', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(fn);

      // Default delay for attempt 0 is 1000ms
      await vi.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;
      expect(result).toBe('success');
    });

    it('should respect partial config override', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('HTTP 500'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(fn, {
        retryDelay: () => 50, // Override delay only
      });

      await vi.advanceTimersByTimeAsync(50);

      const result = await resultPromise;
      expect(result).toBe('success');
    });
  });
});
