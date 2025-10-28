export type ResilientStatus = "idle" | "loading" | "success" | "error";
export interface ResilientResult<T = unknown> {
    status: ResilientStatus;
    data?: T;
    error?: Error;
    retry?: () => void;
}
export interface StorageProvider {
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export interface ResilientState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}
