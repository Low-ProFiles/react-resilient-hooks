export type PollingOptions = {
    baseInterval?: number;
    maxInterval?: number;
    jitter?: boolean;
};
export declare function useConnectionAwarePolling(callback: () => Promise<void> | void, opts?: PollingOptions): void;
