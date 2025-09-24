import { useState, useCallback } from 'react';
import { ResilientState } from '../core/types';

export function useRetry<T>(fn: () => Promise<T>, retries = 3, retryDelay = 1000, backoff: 'fixed' | 'exponential' = 'exponential'): ResilientState<T> & { retry: () => void } {
  const [state, setState] = useState<ResilientState<T>>({ data: null, error: null, loading: false });

  const run = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    let attempt = 0;
    while (attempt < retries) {
      try {
        const result = await fn();
        setState({ data: result, error: null, loading: false });
        return;
      } catch (err) {
        attempt++;
        if (attempt >= retries) {
          setState({ data: null, error: err as Error, loading: false });
        } else {
          const delay = backoff === 'exponential' ? retryDelay * Math.pow(2, attempt - 1) : retryDelay;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }, [fn, retries, retryDelay, backoff]);

  return { ...state, retry: run };
}
