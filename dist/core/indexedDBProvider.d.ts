import { StorageProvider } from "./types";
export declare class IndexedDBProvider implements StorageProvider {
    private dbPromise;
    constructor();
    private getStore;
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
