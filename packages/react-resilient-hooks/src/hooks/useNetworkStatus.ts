import { useEffect, useState } from "react"
import { ResilientState } from "../types/types";
import {
  EffectiveConnectionType,
  getNetworkConnection
} from "../types/network";

/**
 * Information about the current network connection.
 * Uses the Network Information API when available.
 */
export type NetworkInfo = {
  /** Whether the browser is online */
  online: boolean
  /** Effective connection type: 'slow-2g', '2g', '3g', or '4g' */
  effectiveType?: EffectiveConnectionType
  /** Estimated downlink speed in Mbps */
  downlink?: number
  /** Estimated round-trip time in milliseconds */
  rtt?: number
  /** Whether the user has requested reduced data usage */
  saveData?: boolean
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 * Get current network info from the Network Information API
 * Returns SSR-safe defaults when not in browser
 */
function getCurrentNetworkInfo(): NetworkInfo {
  if (!isBrowser()) {
    // SSR defaults - assume online with good connection
    return {
      online: true,
      effectiveType: undefined,
      downlink: undefined,
      rtt: undefined,
      saveData: undefined
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

/**
 * Hook that provides real-time network status information.
 * Automatically updates when online/offline status or connection quality changes.
 * SSR-safe: returns sensible defaults during server-side rendering.
 *
 * @returns Current network state with data, error, and loading properties
 *
 * @example
 * ```tsx
 * const { data: network } = useNetworkStatus();
 *
 * if (!network?.online) {
 *   return <OfflineBanner />;
 * }
 *
 * if (network?.effectiveType === '2g') {
 *   return <LowBandwidthMode />;
 * }
 * ```
 */
export function useNetworkStatus(): ResilientState<NetworkInfo> {
  const [state, setState] = useState<ResilientState<NetworkInfo>>(() => ({
    data: getCurrentNetworkInfo(),
    error: null,
    loading: false
  }));

  useEffect(() => {
    // Skip if not in browser
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

    // Update immediately on mount to sync with actual browser state
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
