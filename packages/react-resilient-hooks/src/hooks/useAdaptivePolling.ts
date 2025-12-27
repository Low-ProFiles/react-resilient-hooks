import { useEffect, useRef, useState, useCallback } from "react"
import { useNetworkStatus } from "./useNetworkStatus"

/**
 * Configuration options for useAdaptivePolling hook.
 */
export type PollingOptions = {
  /** Base polling interval in ms (default: 5000) */
  baseInterval?: number;
  /** Maximum polling interval in ms (default: 60000) */
  maxInterval?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Pause polling when offline (default: true) */
  pauseWhenOffline?: boolean;
  /** Start polling immediately (default: true) */
  enabled?: boolean;
  /** Callback when polling encounters an error */
  onError?: (error: Error) => void;
};

/**
 * Current state of the polling operation.
 */
export type PollingState = {
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Whether polling is manually paused */
  isPaused: boolean;
  /** Current interval being used (in ms) */
  currentInterval: number;
  /** Number of consecutive errors */
  errorCount: number;
  /** Last error encountered */
  lastError: Error | null;
};

/**
 * Controls and state returned by useAdaptivePolling hook.
 */
export type PollingControls = {
  /** Current polling state */
  state: PollingState;
  /** Pause polling */
  pause: () => void;
  /** Resume polling */
  resume: () => void;
  /** Immediately trigger the callback */
  triggerNow: () => Promise<void>;
};

function calculateInterval(
  effectiveType: string | undefined,
  baseInterval: number,
  maxInterval: number
): number {
  if (!effectiveType) return baseInterval;
  if (effectiveType.includes("4g")) return baseInterval;
  if (effectiveType.includes("3g")) return Math.min(baseInterval * 2, maxInterval);
  return Math.min(baseInterval * 3, maxInterval);
}

/**
 * Hook for adaptive polling that adjusts interval based on network conditions.
 * Automatically slows down polling on slower connections and pauses when offline.
 *
 * @param callback - Function to call on each polling interval
 * @param opts - Configuration options for polling behavior
 * @returns Polling state and control functions (pause, resume, triggerNow)
 *
 * @example
 * ```tsx
 * const { state, pause, resume, triggerNow } = useAdaptivePolling(
 *   async () => {
 *     const data = await fetchLatestData();
 *     setData(data);
 *   },
 *   { baseInterval: 5000, pauseWhenOffline: true }
 * );
 *
 * return (
 *   <div>
 *     <span>Polling: {state.isPolling ? 'Active' : 'Paused'}</span>
 *     <button onClick={pause}>Pause</button>
 *     <button onClick={resume}>Resume</button>
 *     <button onClick={triggerNow}>Refresh Now</button>
 *   </div>
 * );
 * ```
 */
export function useAdaptivePolling(
  callback: () => Promise<void> | void,
  opts: PollingOptions = {}
): PollingControls {
  const {
    baseInterval = 5000,
    maxInterval = 60000,
    jitter = true,
    pauseWhenOffline = true,
    enabled = true,
    onError
  } = opts;

  const { data: networkStatus } = useNetworkStatus();
  const savedCallback = useRef(callback);
  const [isPaused, setIsPaused] = useState(!enabled);
  const [state, setState] = useState<PollingState>({
    isPolling: false,
    isPaused: !enabled,
    currentInterval: baseInterval,
    errorCount: 0,
    lastError: null
  });

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const tick = useCallback(async () => {
    try {
      await savedCallback.current();
      setState(prev => ({
        ...prev,
        errorCount: 0,
        lastError: null
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        lastError: error
      }));
      onError?.(error);
    }
  }, [onError]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setState(prev => ({ ...prev, isPaused: true, isPolling: false }));
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const triggerNow = useCallback(async () => {
    await tick();
  }, [tick]);

  useEffect(() => {
    // Don't poll if manually paused
    if (isPaused) {
      setState(prev => ({ ...prev, isPolling: false }));
      return;
    }

    // Pause when offline if configured
    if (pauseWhenOffline && !networkStatus?.online) {
      setState(prev => ({ ...prev, isPolling: false }));
      return;
    }

    const interval = calculateInterval(
      networkStatus?.effectiveType,
      baseInterval,
      maxInterval
    );

    const actualInterval = jitter
      ? interval + Math.floor(Math.random() * interval * 0.1)
      : interval;

    setState(prev => ({
      ...prev,
      isPolling: true,
      currentInterval: actualInterval
    }));

    const id = setInterval(tick, actualInterval);
    return () => {
      clearInterval(id);
      setState(prev => ({ ...prev, isPolling: false }));
    };
  }, [isPaused, networkStatus?.online, networkStatus?.effectiveType, baseInterval, maxInterval, jitter, pauseWhenOffline, tick]);

  return { state, pause, resume, triggerNow };
}