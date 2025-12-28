import { useEffect, useRef, useState, useCallback } from "react"
import { useNetworkStatus } from "./useNetworkStatus"
import { EffectiveConnectionType } from "../types/network"

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
  /** Execute callback immediately on mount (default: true) */
  immediate?: boolean;
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
  effectiveType: EffectiveConnectionType | undefined,
  baseInterval: number,
  maxInterval: number
): number {
  if (!effectiveType) return baseInterval;
  if (effectiveType === "4g") return baseInterval;
  if (effectiveType === "3g") return Math.min(baseInterval * 2, maxInterval);
  // 2g or slow-2g
  return Math.min(baseInterval * 3, maxInterval);
}

function addJitter(interval: number): number {
  return interval + Math.floor(Math.random() * interval * 0.1);
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
    immediate = true,
    onError
  } = opts;

  const { data: networkStatus } = useNetworkStatus();
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExecutingRef = useRef(false);
  const mountedRef = useRef(true);

  const [isPaused, setIsPaused] = useState(!enabled);
  const [state, setState] = useState<PollingState>({
    isPolling: false,
    isPaused: !enabled,
    currentInterval: baseInterval,
    errorCount: 0,
    lastError: null
  });

  // Keep callback ref updated
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const tick = useCallback(async () => {
    if (isExecutingRef.current || !mountedRef.current) return;
    isExecutingRef.current = true;

    try {
      await savedCallback.current();
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          errorCount: 0,
          lastError: null
        }));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1,
          lastError: error
        }));
      }
      onError?.(error);
    } finally {
      isExecutingRef.current = false;
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

  // Store current interval in a ref so scheduleNext always uses latest value
  const intervalRef = useRef(baseInterval);
  // Track the base interval (before jitter) to avoid unnecessary recalculations
  const lastBaseIntervalRef = useRef<number | null>(null);

  // Update interval when network conditions change
  useEffect(() => {
    const interval = calculateInterval(
      networkStatus?.effectiveType,
      baseInterval,
      maxInterval
    );

    // Only recalculate jitter if the base interval actually changed
    if (lastBaseIntervalRef.current !== interval) {
      lastBaseIntervalRef.current = interval;
      const actualInterval = jitter ? addJitter(interval) : interval;
      intervalRef.current = actualInterval;

      setState(prev => ({
        ...prev,
        currentInterval: actualInterval
      }));
    }
  }, [networkStatus?.effectiveType, baseInterval, maxInterval, jitter]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't poll if manually paused
    if (isPaused) {
      setState(prev => ({ ...prev, isPolling: false }));
      return;
    }

    // Don't poll if SSR
    if (typeof window === 'undefined') {
      return;
    }

    // Pause when offline if configured
    if (pauseWhenOffline && !networkStatus?.online) {
      setState(prev => ({ ...prev, isPolling: false }));
      return;
    }

    setState(prev => ({ ...prev, isPolling: true }));

    // Schedule next tick using setTimeout (not setInterval)
    // Uses intervalRef.current to always get the latest interval value
    const scheduleNext = () => {
      if (!mountedRef.current) return;

      timeoutRef.current = setTimeout(async () => {
        await tick();
        if (mountedRef.current) {
          scheduleNext();
        }
      }, intervalRef.current);  // Uses ref to get latest interval
    };

    // Execute immediately if configured
    if (immediate) {
      tick().then(() => {
        if (mountedRef.current) {
          scheduleNext();
        }
      });
    } else {
      scheduleNext();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPaused, networkStatus?.online, pauseWhenOffline, tick, immediate]);

  return { state, pause, resume, triggerNow };
}
