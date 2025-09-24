import { useRetry } from './useRetry';
import { useResilientContext } from '../core/ResilientProvider';

export function useRetryRequest<T = unknown>(
  input: RequestInfo,
  options: RequestInit = {},
  retryOptions?: {
    retries?: number;
    retryDelay?: number;
    backoff?: 'fixed' | 'exponential';
  }
) {
  const { fetcher } = useResilientContext();
  const fetchFn = async () => {
    const res = await fetcher(input, options);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    return (await res.json()) as T;
  };

  return useRetry(fetchFn, retryOptions?.retries, retryOptions?.retryDelay, retryOptions?.backoff);
}
