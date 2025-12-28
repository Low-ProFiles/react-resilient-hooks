import { Q as QueueStore } from './types-DivwYhR1.mjs';

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
 * Guarantees FIFO ordering using auto-incrementing sequence numbers.
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
    private isClosed;
    /**
     * Create a new IndexedDB queue store.
     *
     * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
     * @param storeName - Name of the object store (default: 'queue')
     */
    constructor(dbName?: string, storeName?: string);
    private getDB;
    /**
     * Open database with proper migration that preserves existing data
     */
    private openWithMigration;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
    clear(): Promise<void>;
    /**
     * Close the database connection.
     * The connection will be automatically reopened on next operation.
     */
    close(): void;
}

export { IndexedDBQueueStore, MemoryQueueStore, QueueStore };
