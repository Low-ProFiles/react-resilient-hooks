import { useEffect, useRef } from "react"
import { useNetworkStatus } from "./useNetworkStatus"

export type PollingOptions = {
  baseInterval?: number
  maxInterval?: number
  jitter?: boolean
}

export function useConnectionAwarePolling(callback: () => Promise<void> | void, opts: PollingOptions = {}) {
  const { baseInterval = 5000, maxInterval = 60000, jitter = true } = opts
  const { data: networkStatus } = useNetworkStatus();
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    const getInterval = () => {
      if (!networkStatus) return baseInterval;
      const { effectiveType } = networkStatus;
      if (!effectiveType) return baseInterval
      if (effectiveType.includes("4g")) return baseInterval
      if (effectiveType.includes("3g")) return Math.min(baseInterval * 2, maxInterval)
      return Math.min(baseInterval * 3, maxInterval)
    }

    const base = getInterval()
    let interval = base
    const tick = async () => {
      try {
        await saved.current()
      } catch {}
    }

    const id = setInterval(tick, jitter ? interval + Math.floor(Math.random() * interval * 0.1) : interval)
    return () => clearInterval(id)
  }, [networkStatus, baseInterval, maxInterval, jitter])
}