import { useEffect, useState } from "react"
import { ResilientState } from "../core/types";

/**
 * Information about the current network connection.
 * Uses the Network Information API when available.
 */
export type NetworkInfo = {
  /** Whether the browser is online */
  online: boolean
  /** Effective connection type: 'slow-2g', '2g', '3g', or '4g' */
  effectiveType?: string
  /** Estimated downlink speed in Mbps */
  downlink?: number
  /** Estimated round-trip time in milliseconds */
  rtt?: number
  /** Whether the user has requested reduced data usage */
  saveData?: boolean
}

/**
 * Hook that provides real-time network status information.
 * Automatically updates when online/offline status or connection quality changes.
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
  const [state, setState] = useState<ResilientState<NetworkInfo>>({
    data: {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      effectiveType: (navigator as any)?.connection?.effectiveType,
      downlink: (navigator as any)?.connection?.downlink,
      rtt: (navigator as any)?.connection?.rtt,
      saveData: (navigator as any)?.connection?.saveData
    },
    error: null,
    loading: false
  });

  useEffect(() => {
    const update = () => {
      setState({
        data: {
          online: navigator.onLine,
          effectiveType: (navigator as any)?.connection?.effectiveType,
          downlink: (navigator as any)?.connection?.downlink,
          rtt: (navigator as any)?.connection?.rtt,
          saveData: (navigator as any)?.connection?.saveData
        },
        error: null,
        loading: false
      });
    }

    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    const conn = (navigator as any)?.connection
    conn?.addEventListener?.("change", update)

    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
      conn?.removeEventListener?.("change", update)
    }
  }, [])

  return state;
}