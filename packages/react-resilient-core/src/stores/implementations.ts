import { QueueStore } from './types';
import { openDB, promisifyRequest } from '../core/idbUtils';

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
}

export class IndexedDBQueueStore<T extends { id: string }> implements QueueStore<T> {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;

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
}

