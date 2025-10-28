import { useRetry } from './useRetry';
import { useResilientContext } from '../core/ResilientProvider';
import { RetryPolicy, DefaultRetryPolicy } from '@resilient/core';

export function useRetryRequest<T = unknown>(
  input: RequestInfo,
  options: RequestInit = {},
  retryPolicy: RetryPolicy = new DefaultRetryPolicy()
) {
  const { fetcher } = useResilientContext();
  const fetchFn = async () => {
    const res = await fetcher(input, options);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    return (await res.json()) as T;
  };

  return useRetry(fetchFn, (error, attempt) => retryPolicy.shouldRetry(error), (attempt) => retryPolicy.getDelay(attempt));
}
