import { Q as QueueStore } from './types-DivwYhR1.js';

/**
 * In-memory queue store implementation.
 * Fast but not persistent - data is lost on page refresh.
 * Best for development and testing.
 *
 * @typeParam T - Type of items stored in the queue
 */
declare class MemoryQueueStore<T> implements QueueStore<T> {
    private queue;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
    clear(): Promise<void>;
}
/**
 * IndexedDB-backed queue store implementation.
 * Persistent storage that survives page refreshes and browser restarts.
 * Recommended for production use with useBackgroundSync.
 *
 * @typeParam T - Type of items stored (must have an 'id' property)
 *
 * @example
 * ```ts
 * const store = new IndexedDBQueueStore<QueuedReq>('my-app-queue', 'requests');
 *
 * await store.enqueue({ id: '1', url: '/api/sync', options: { method: 'POST' } });
 * const item = await store.dequeue();
 * ```
 */
declare class IndexedDBQueueStore<T extends {
    id: string;
}> implements QueueStore<T> {
    private dbName;
    private storeName;
    private dbPromise;
    /**
     * Create a new IndexedDB queue store.
     *
     * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
     * @param storeName - Name of the object store (default: 'queue')
     */
    constructor(dbName?: string, storeName?: string);
    private getDB;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
    clear(): Promise<void>;
}

export { IndexedDBQueueStore, MemoryQueueStore, QueueStore };
