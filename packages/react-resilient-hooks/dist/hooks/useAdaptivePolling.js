'use strict';

var react = require('react');

// src/hooks/useAdaptivePolling.ts
function useNetworkStatus() {
  const [state, setState] = react.useState({
    data: {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      effectiveType: navigator?.connection?.effectiveType,
      downlink: navigator?.connection?.downlink,
      rtt: navigator?.connection?.rtt,
      saveData: navigator?.connection?.saveData
    },
    error: null,
    loading: false
  });
  react.useEffect(() => {
    const update = () => {
      setState({
        data: {
          online: navigator.onLine,
          effectiveType: navigator?.connection?.effectiveType,
          downlink: navigator?.connection?.downlink,
          rtt: navigator?.connection?.rtt,
          saveData: navigator?.connection?.saveData
        },
        error: null,
        loading: false
      });
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = navigator?.connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);
  return state;
}

// src/hooks/useAdaptivePolling.ts
function calculateInterval(effectiveType, baseInterval, maxInterval) {
  if (!effectiveType) return baseInterval;
  if (effectiveType.includes("4g")) return baseInterval;
  if (effectiveType.includes("3g")) return Math.min(baseInterval * 2, maxInterval);
  return Math.min(baseInterval * 3, maxInterval);
}
function useAdaptivePolling(callback, opts = {}) {
  const {
    baseInterval = 5e3,
    maxInterval = 6e4,
    jitter = true,
    pauseWhenOffline = true,
    enabled = true,
    onError
  } = opts;
  const { data: networkStatus } = useNetworkStatus();
  const savedCallback = react.useRef(callback);
  const [isPaused, setIsPaused] = react.useState(!enabled);
  const [state, setState] = react.useState({
    isPolling: false,
    isPaused: !enabled,
    currentInterval: baseInterval,
    errorCount: 0,
    lastError: null
  });
  react.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  const tick = react.useCallback(async () => {
    try {
      await savedCallback.current();
      setState((prev) => ({
        ...prev,
        errorCount: 0,
        lastError: null
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        lastError: error
      }));
      onError?.(error);
    }
  }, [onError]);
  const pause = react.useCallback(() => {
    setIsPaused(true);
    setState((prev) => ({ ...prev, isPaused: true, isPolling: false }));
  }, []);
  const resume = react.useCallback(() => {
    setIsPaused(false);
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);
  const triggerNow = react.useCallback(async () => {
    await tick();
  }, [tick]);
  react.useEffect(() => {
    if (isPaused) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    if (pauseWhenOffline && !networkStatus?.online) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    const interval = calculateInterval(
      networkStatus?.effectiveType,
      baseInterval,
      maxInterval
    );
    const actualInterval = jitter ? interval + Math.floor(Math.random() * interval * 0.1) : interval;
    setState((prev) => ({
      ...prev,
      isPolling: true,
      currentInterval: actualInterval
    }));
    const id = setInterval(tick, actualInterval);
    return () => {
      clearInterval(id);
      setState((prev) => ({ ...prev, isPolling: false }));
    };
  }, [isPaused, networkStatus?.online, networkStatus?.effectiveType, baseInterval, maxInterval, jitter, pauseWhenOffline, tick]);
  return { state, pause, resume, triggerNow };
}

exports.useAdaptivePolling = useAdaptivePolling;
