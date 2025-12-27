'use strict';

var react = require('react');

// src/hooks/useAdaptiveImage.ts
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

// src/hooks/useAdaptiveImage.ts
function selectImage(src, networkStatus, options) {
  const { ssrDefault = "high", thresholds = { low: 0.5, medium: 1.5 } } = options;
  if (!networkStatus) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }
  const { effectiveType, downlink } = networkStatus;
  if (!effectiveType && downlink === void 0) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }
  const dl = typeof downlink === "number" ? downlink : 10;
  if (effectiveType?.includes("2g") || dl < thresholds.low) {
    return { src: src.low, quality: "low" };
  }
  if (effectiveType?.includes("3g") || dl < thresholds.medium) {
    return { src: src.medium ?? src.low, quality: src.medium ? "medium" : "low" };
  }
  return { src: src.high, quality: "high" };
}
function useAdaptiveImage(src, options = {}) {
  const { data: networkStatus } = useNetworkStatus();
  const result = react.useMemo(
    () => selectImage(src, networkStatus, options),
    [src.high, src.medium, src.low, networkStatus, options.ssrDefault, options.thresholds?.low, options.thresholds?.medium]
  );
  return result;
}

exports.useAdaptiveImage = useAdaptiveImage;
