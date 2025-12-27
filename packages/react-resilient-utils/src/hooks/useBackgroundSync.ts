import { useEffect, useState, useCallback, useRef } from "react"
import { ResilientResult, QueueStore, IndexedDBQueueStore, EventBus } from "@resilient/core"
import { requestBackgroundSync } from "../utils/registerServiceWorker"

export type QueuedReq = { id: string; url: string; options?: RequestInit; meta?: Record<string, unknown> }

export type BackgroundSyncOptions = {
  queueStore?: QueueStore<QueuedReq>;
  eventBus?: EventBus<ResilientResult>;
  onSuccess?: (req: QueuedReq) => void;
  onError?: (req: QueuedReq, error: Error) => void;
}

const defaultQueueStore = new IndexedDBQueueStore<QueuedReq>();

export function useBackgroundSync(options: BackgroundSyncOptions = {}) {
  const {
    queueStore = defaultQueueStore,
    eventBus,
    onSuccess,
    onError
  } = options;

  const [status, setStatus] = useState<ResilientResult>({ status: "idle" });
  const isFlushing = useRef(false);

  const updateStatus = useCallback((newStatus: ResilientResult) => {
    setStatus(newStatus);
    eventBus?.publish(newStatus);
  }, [eventBus]);

  const enqueue = useCallback(async (url: string, options?: RequestInit, meta?: Record<string, unknown>) => {
    const item: QueuedReq = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url,
      options,
      meta
    };
    await queueStore.enqueue(item);
    try {
      await requestBackgroundSync("rrh-background-sync");
    } catch {
      // Background Sync API not supported, will flush on online event
    }
    return item.id;
  }, [queueStore]);

  const flush = useCallback(async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;

    updateStatus({ status: "loading" });

    try {
      while (!(await queueStore.isEmpty())) {
        const req = await queueStore.dequeue();
        if (!req) break;

        try {
          const res = await fetch(req.url, req.options);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          onSuccess?.(req);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          onError?.(req, error);
          await queueStore.enqueue(req);
          updateStatus({ status: "error", error });
          isFlushing.current = false;
          return;
        }
      }
      updateStatus({ status: "success" });
    } finally {
      isFlushing.current = false;
    }
  }, [queueStore, updateStatus, onSuccess, onError]);

  useEffect(() => {
    const onOnline = () => { flush(); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  return { status, enqueue, flush };
}
