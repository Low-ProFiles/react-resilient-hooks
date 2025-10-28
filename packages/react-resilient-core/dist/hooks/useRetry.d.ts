import { ResilientState } from '../core/types';
export declare function useRetry<T>(fn: () => Promise<T>, retries?: number, retryDelay?: number, backoff?: 'fixed' | 'exponential'): ResilientState<T> & {
    retry: () => void;
};
