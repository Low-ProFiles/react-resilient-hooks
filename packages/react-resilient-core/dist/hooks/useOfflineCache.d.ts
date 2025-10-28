import { ResilientState } from "../core/types";
export declare function useOfflineCache<T = unknown>(key: string, fetcherFn: () => Promise<T>, opts?: {
    ttlMs?: number;
    shouldCache?: (value: T) => boolean;
    redactKeys?: string[];
}): ResilientState<T>;
