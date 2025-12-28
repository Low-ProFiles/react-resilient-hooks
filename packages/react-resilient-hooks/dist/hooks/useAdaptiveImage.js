'use strict';

var react = require('react');

// src/hooks/useAdaptiveImage.ts

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
  const [state, setState] = react.useState(() => ({
    data: getCurrentNetworkInfo(),
    error: null,
    loading: false
  }));
  react.useEffect(() => {
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

// src/hooks/useAdaptiveImage.ts
var DEFAULT_THRESHOLDS = { low: 0.5, medium: 1.5 };
function selectImage(srcHigh, srcMedium, srcLow, networkStatus, ssrDefault, thresholdLow, thresholdMedium) {
  const srcMap = { high: srcHigh, medium: srcMedium, low: srcLow };
  if (!networkStatus) {
    return { src: srcMap[ssrDefault] ?? srcHigh, quality: ssrDefault };
  }
  const { effectiveType, downlink } = networkStatus;
  if (!effectiveType && downlink === void 0) {
    return { src: srcMap[ssrDefault] ?? srcHigh, quality: ssrDefault };
  }
  const dl = typeof downlink === "number" ? downlink : 10;
  if (effectiveType?.includes("2g") || dl < thresholdLow) {
    return { src: srcLow, quality: "low" };
  }
  if (effectiveType?.includes("3g") || dl < thresholdMedium) {
    return { src: srcMedium ?? srcLow, quality: srcMedium ? "medium" : "low" };
  }
  return { src: srcHigh, quality: "high" };
}
function useAdaptiveImage(src, options = {}) {
  const { data: networkStatus } = useNetworkStatus();
  const ssrDefault = options.ssrDefault ?? "high";
  const thresholdLow = options.thresholds?.low ?? DEFAULT_THRESHOLDS.low;
  const thresholdMedium = options.thresholds?.medium ?? DEFAULT_THRESHOLDS.medium;
  const result = react.useMemo(
    () => selectImage(
      src.high,
      src.medium,
      src.low,
      networkStatus,
      ssrDefault,
      thresholdLow,
      thresholdMedium
    ),
    [src.high, src.medium, src.low, networkStatus, ssrDefault, thresholdLow, thresholdMedium]
  );
  return result;
}

exports.useAdaptiveImage = useAdaptiveImage;
