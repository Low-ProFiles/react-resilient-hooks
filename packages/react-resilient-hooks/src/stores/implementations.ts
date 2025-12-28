import { QueueStore } from './types';
import { openDB, promisifyRequest } from './idbUtils';

/**
 * In-memory queue store implementation.
 * Fast but not persistent - data is lost on page refresh.
 * Best for development and testing.
 *
 * @typeParam T - Type of items stored in the queue
 */
export class MemoryQueueStore<T> implements QueueStore<T> {
  private queue: T[] = [];

  async enqueue(item: T): Promise<void> {
    this.queue.push(item);
  }

  async dequeue(): Promise<T | undefined> {
    return this.queue.shift();
  }

  async peek(): Promise<T | undefined> {
    return this.queue[0];
  }

  async isEmpty(): Promise<boolean> {
    return this.queue.length === 0;
  }

  async size(): Promise<number> {
    return this.queue.length;
  }

  async clear(): Promise<void> {
    this.queue = [];
  }
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
export class IndexedDBQueueStore<T extends { id: string }> implements QueueStore<T> {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Create a new IndexedDB queue store.
   *
   * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
   * @param storeName - Name of the object store (default: 'queue')
   */
  constructor(dbName = 'resilient-queue', storeName = 'queue') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, 1, (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      });
    }
    return this.dbPromise;
  }

  async enqueue(item: T): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.add(item));
  }

  async dequeue(): Promise<T | undefined> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    if (cursor) {
      const value = cursor.value as T;
      await promisifyRequest(store.delete(cursor.key));
      return value;
    }
    return undefined;
  }

  async peek(): Promise<T | undefined> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    return cursor ? (cursor.value as T) : undefined;
  }

  async isEmpty(): Promise<boolean> {
    return (await this.size()) === 0;
  }

  async size(): Promise<number> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    return promisifyRequest(store.count());
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.clear());
  }
}

