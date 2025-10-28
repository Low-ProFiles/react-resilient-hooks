import { useCallback, useRef, useState } from "react"

export function useQueue<T>() {
  const [queue, setQueue] = useState<T[]>([])
  const ref = useRef(queue)
  ref.current = queue

  const enqueue = useCallback((item: T) => {
    setQueue(prev => [...prev, item])
  }, [])

  const dequeue = useCallback(() => {
    let item: T | undefined
    setQueue(prev => {
      item = prev[0]
      return prev.slice(1)
    })
    return item
  }, [])

  const peek = useCallback(() => ref.current[0], [])

  return { queue, enqueue, dequeue, peek }
}
