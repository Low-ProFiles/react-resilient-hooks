import { useState, useCallback } from 'react';
import { ResilientState } from '@resilient/core';

export function useRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any, attempt: number) => boolean,
  getDelay: (attempt: number) => number
): ResilientState<T> & { retry: () => void } {
  const [state, setState] = useState<ResilientState<T>>({ data: null, error: null, loading: false });

  const run = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    let attempt = 0;
    while (true) {
      try {
        const result = await fn();
        setState({ data: result, error: null, loading: false });
        return;
      } catch (err) {
        attempt++;
        if (!shouldRetry(err, attempt)) {
          setState({ data: null, error: err as Error, loading: false });
          return;
        } else {
          const delay = getDelay(attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }, [fn, shouldRetry, getDelay]);

  return { ...state, retry: run };
}
