import { useState, useCallback } from 'react';
import { ResilientState, EventBus } from '@resilient/core';

export function useRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any, attempt: number) => boolean,
  getDelay: (attempt: number) => number,
  eventBus?: EventBus<ResilientState<T>>
): ResilientState<T> & { retry: () => void } {
  const [state, setState] = useState<ResilientState<T>>({ data: null, error: null, loading: false });

  const updateState = (newState: ResilientState<T>) => {
    setState(newState);
    eventBus?.publish(newState);
  };

  const run = useCallback(async () => {
    updateState({ data: null, error: null, loading: true });
    let attempt = 0;
    while (true) {
      try {
        const result = await fn();
        updateState({ data: result, error: null, loading: false });
        return;
      } catch (err) {
        attempt++;
        if (!shouldRetry(err, attempt)) {
          updateState({ data: null, error: err as Error, loading: false });
          return;
        } else {
          const delay = getDelay(attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }, [fn, shouldRetry, getDelay, eventBus]);

  return { ...state, retry: run };
}
