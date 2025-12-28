'use strict';

var react = require('react');

// src/hooks/useNetworkStatus.ts

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

exports.useNetworkStatus = useNetworkStatus;
