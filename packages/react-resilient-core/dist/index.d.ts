type ResilientStatus = "idle" | "loading" | "success" | "error";
interface ResilientResult<T = unknown> {
    status: ResilientStatus;
    data?: T;
    error?: Error;
    retry?: () => void;
}
interface StorageProvider {
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
interface ResilientState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

declare class LocalStorageProvider implements StorageProvider {
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
declare class EncryptedLocalStorageProvider implements StorageProvider {
    private key;
    private prefix;
    constructor(passphrase: string);
    static deriveKeyFromPassphrase(passphrase: string, salt?: BufferSource): Promise<{
        key: CryptoKey;
        salt: BufferSource;
    }>;
    static createFromPassphrase(passphrase: string): Promise<EncryptedLocalStorageProvider>;
    static createFromPassphraseWithStoredSalt(passphrase: string): Promise<EncryptedLocalStorageProvider>;
    private encryptObject;
    private decryptObject;
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

declare const defaultStorageProvider: LocalStorageProvider;
declare const defaultFetcher: any;

declare function openDB(dbName: string, version?: number, upgradeCb?: (db: IDBDatabase) => void): Promise<IDBDatabase>;
declare function promisifyRequest<T>(req: IDBRequest<T>): Promise<T>;

declare class IndexedDBProvider implements StorageProvider {
    private dbPromise;
    constructor();
    private getStore;
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

type SensitiveFilterFn = (obj: any) => any;
declare function redactSensitiveFields(obj: any, extraKeys?: string[], customKeywords?: string[]): any;

type StorageType = 'local' | 'encrypted-local' | 'indexeddb';
declare function storageFactory(type?: StorageType, passphrase?: string): StorageProvider;

type Listener<T> = (event: T) => void;
declare class EventBus<T> {
    private listeners;
    subscribe(listener: Listener<T>): () => void;
    publish(event: T): void;
}

declare enum LogLevel {
    None = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4
}
declare class Logger {
    private level;
    constructor(level?: LogLevel);
    setLevel(level: LogLevel): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
declare const logger: Logger;

interface RetryPolicy {
    shouldRetry(error: any): boolean;
    getDelay(attempt: number): number;
}
interface CachePolicy {
    isCacheable(request: any): boolean;
    getCacheKey(request: any): string;
}

declare class DefaultRetryPolicy implements RetryPolicy {
    private maxRetries;
    private delay;
    constructor(maxRetries?: number, delay?: number);
    shouldRetry(error: any): boolean;
    getDelay(attempt: number): number;
}
declare class DefaultCachePolicy implements CachePolicy {
    isCacheable(request: any): boolean;
    getCacheKey(request: any): string;
}

interface QueueStore<T> {
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
}
interface CacheStore<T> {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}

declare class MemoryQueueStore<T> implements QueueStore<T> {
    private queue;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
}
declare class MemoryCacheStore<T> implements CacheStore<T> {
    private cache;
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}

declare const SW_MESSAGE_VERSION = "v1";
interface SWMessage {
    version: string;
    type: string;
    payload?: any;
}
declare const createSWMessage: (type: string, payload?: any) => SWMessage;

export { type CachePolicy, type CacheStore, DefaultCachePolicy, DefaultRetryPolicy, EncryptedLocalStorageProvider, EventBus, IndexedDBProvider, LocalStorageProvider, LogLevel, Logger, MemoryCacheStore, MemoryQueueStore, type QueueStore, type ResilientResult, type ResilientState, type ResilientStatus, type RetryPolicy, type SWMessage, SW_MESSAGE_VERSION, type SensitiveFilterFn, type StorageProvider, type StorageType, createSWMessage, defaultFetcher, defaultStorageProvider, logger, openDB, promisifyRequest, redactSensitiveFields, storageFactory };
