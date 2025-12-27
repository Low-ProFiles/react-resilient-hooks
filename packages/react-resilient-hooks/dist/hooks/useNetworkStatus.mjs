import { useState, useEffect } from 'react';

// src/hooks/useNetworkStatus.ts
function useNetworkStatus() {
  const [state, setState] = useState({
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
  useEffect(() => {
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

export { useNetworkStatus };
