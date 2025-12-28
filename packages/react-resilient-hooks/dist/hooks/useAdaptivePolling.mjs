import { useRef, useState, useEffect, useCallback } from 'react';

// src/hooks/useAdaptivePolling.ts

// src/types/network.ts
function getNetworkConnection() {
  if (typeof navigator === "undefined") {
    return void 0;
  }
  const nav = navigator;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

// src/hooks/useNetworkStatus.ts
function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}
function getCurrentNetworkInfo() {
  if (!isBrowser()) {
    return {
      online: true,
      effectiveType: void 0,
      downlink: void 0,
      rtt: void 0,
      saveData: void 0
    };
  }
  const connection = getNetworkConnection();
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData
  };
}
function useNetworkStatus() {
  const [state, setState] = useState(() => ({
    data: getCurrentNetworkInfo(),
    error: null,
    loading: false
  }));
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }
    const connection = getNetworkConnection();
    const update = () => {
      setState({
        data: getCurrentNetworkInfo(),
        error: null,
        loading: false
      });
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    connection?.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener("change", update);
    };
  }, []);
  return state;
}

// src/hooks/useAdaptivePolling.ts
function calculateInterval(effectiveType, baseInterval, maxInterval) {
  if (!effectiveType) return baseInterval;
  if (effectiveType === "4g") return baseInterval;
  if (effectiveType === "3g") return Math.min(baseInterval * 2, maxInterval);
  return Math.min(baseInterval * 3, maxInterval);
}
function addJitter(interval) {
  return interval + Math.floor(Math.random() * interval * 0.1);
}
function useAdaptivePolling(callback, opts = {}) {
  const {
    baseInterval = 5e3,
    maxInterval = 6e4,
    jitter = true,
    pauseWhenOffline = true,
    enabled = true,
    immediate = true,
    onError
  } = opts;
  const { data: networkStatus } = useNetworkStatus();
  const savedCallback = useRef(callback);
  const timeoutRef = useRef(null);
  const isExecutingRef = useRef(false);
  const mountedRef = useRef(true);
  const [isPaused, setIsPaused] = useState(!enabled);
  const [state, setState] = useState({
    isPolling: false,
    isPaused: !enabled,
    currentInterval: baseInterval,
    errorCount: 0,
    lastError: null
  });
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
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
        setState((prev) => ({
          ...prev,
          errorCount: 0,
          lastError: null
        }));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setState((prev) => ({
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
    setState((prev) => ({ ...prev, isPaused: true, isPolling: false }));
  }, []);
  const resume = useCallback(() => {
    setIsPaused(false);
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);
  const triggerNow = useCallback(async () => {
    await tick();
  }, [tick]);
  const intervalRef = useRef(baseInterval);
  const lastBaseIntervalRef = useRef(null);
  useEffect(() => {
    const interval = calculateInterval(
      networkStatus?.effectiveType,
      baseInterval,
      maxInterval
    );
    if (lastBaseIntervalRef.current !== interval) {
      lastBaseIntervalRef.current = interval;
      const actualInterval = jitter ? addJitter(interval) : interval;
      intervalRef.current = actualInterval;
      setState((prev) => ({
        ...prev,
        currentInterval: actualInterval
      }));
    }
  }, [networkStatus?.effectiveType, baseInterval, maxInterval, jitter]);
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isPaused) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    if (pauseWhenOffline && !networkStatus?.online) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }
    setState((prev) => ({ ...prev, isPolling: true }));
    const scheduleNext = () => {
      if (!mountedRef.current) return;
      timeoutRef.current = setTimeout(async () => {
        await tick();
        if (mountedRef.current) {
          scheduleNext();
        }
      }, intervalRef.current);
    };
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

export { useAdaptivePolling };
