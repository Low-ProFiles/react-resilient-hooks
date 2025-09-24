import { ResilientResult } from "../core/types";
export type QueuedReq = {
    id: string;
    url: string;
    options?: RequestInit;
    meta?: Record<string, unknown>;
};
export declare function useBackgroundSync(opts?: {
    redactKeys?: string[];
    storeBody?: boolean;
}): {
    queue: QueuedReq[];
    status: ResilientResult<unknown>;
    enqueue: (url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>;
    dequeue: (id: string) => Promise<void>;
    flush: () => Promise<void>;
};
