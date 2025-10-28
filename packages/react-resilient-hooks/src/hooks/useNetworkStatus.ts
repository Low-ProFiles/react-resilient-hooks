import { useEffect, useState } from "react"
import { ResilientState } from "../core/types";

export type NetworkInfo = {
  online: boolean
  effectiveType?: string
  downlink?: number
}

export function useNetworkStatus(): ResilientState<NetworkInfo> {
  const [state, setState] = useState<ResilientState<NetworkInfo>>({
    data: {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      effectiveType: (navigator as any)?.connection?.effectiveType,
      downlink: (navigator as any)?.connection?.downlink
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
          downlink: (navigator as any)?.connection?.downlink
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