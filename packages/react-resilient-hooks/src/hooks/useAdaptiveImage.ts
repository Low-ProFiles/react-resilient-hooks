import { useMemo } from "react"
import { useNetworkStatus } from "./useNetworkStatus"

export type AdaptiveImageSource = {
  high: string
  medium?: string
  low: string
}

export function useAdaptiveImage(src: AdaptiveImageSource) {
  const { data: networkStatus } = useNetworkStatus();
  const chosen = useMemo(() => {
    if (!networkStatus) return src.high;
    const { effectiveType, downlink } = networkStatus;
    if (!effectiveType && !downlink) return src.high
    const dl = typeof downlink === "number" ? downlink : 10
    if (effectiveType?.includes("2g") || dl < 0.5) return src.low
    if (effectiveType?.includes("3g") || dl < 1.5) return src.medium ?? src.low
    return src.high
  }, [src.high, src.medium, src.low, networkStatus])

  return chosen
}