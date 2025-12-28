/**
 * Configuration options for useAdaptivePolling hook.
 */
type PollingOptions = {
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
type PollingState = {
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
type PollingControls = {
    /** Current polling state */
    state: PollingState;
    /** Pause polling */
    pause: () => void;
    /** Resume polling */
    resume: () => void;
    /** Immediately trigger the callback */
    triggerNow: () => Promise<void>;
};
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
declare function useAdaptivePolling(callback: () => Promise<void> | void, opts?: PollingOptions): PollingControls;

export { type PollingControls, type PollingOptions, type PollingState, useAdaptivePolling };
