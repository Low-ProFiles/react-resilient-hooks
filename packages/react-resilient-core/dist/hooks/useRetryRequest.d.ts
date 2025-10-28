export declare function useRetryRequest<T = unknown>(input: RequestInfo, options?: RequestInit, retryOptions?: {
    retries?: number;
    retryDelay?: number;
    backoff?: 'fixed' | 'exponential';
}): import("..").ResilientState<T> & {
    retry: () => void;
};
