import { QueueStore } from './types';
import { openDB, promisifyRequest, withTransaction } from './idbUtils';

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

/** Internal type for items stored in IndexedDB with ordering support */
type IndexedDBItem<T> = T & {
  /** Auto-incrementing sequence number for FIFO ordering */
  _seq?: number;
};

/** Current database version - increment when schema changes */
const DB_VERSION = 2;

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
export class IndexedDBQueueStore<T extends { id: string }> implements QueueStore<T> {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isClosed = false;

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
    if (this.isClosed) {
      // Reconnect if previously closed
      this.dbPromise = null;
      this.isClosed = false;
    }

    if (!this.dbPromise) {
      this.dbPromise = this.openWithMigration();

      // Handle unexpected connection closure
      this.dbPromise.then(db => {
        db.onclose = () => {
          this.isClosed = true;
          this.dbPromise = null;
        };
        db.onerror = () => {
          this.isClosed = true;
          this.dbPromise = null;
        };
      }).catch(() => {
        this.isClosed = true;
        this.dbPromise = null;
      });
    }
    return this.dbPromise;
  }

  /**
   * Open database with proper migration that preserves existing data
   */
  private async openWithMigration(): Promise<IDBDatabase> {
    // For v1 to v2 migration, we need to read data before the upgrade transaction
    // because we can't properly await cursor iteration inside onupgradeneeded
    let existingData: T[] | null = null;

    // Check if migration is needed by opening without version to read current data
    if (typeof indexedDB !== 'undefined') {
      try {
        const checkDb = await new Promise<IDBDatabase | null>((resolve) => {
          const req = indexedDB.open(this.dbName);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });

        if (checkDb) {
          const currentVersion = checkDb.version;
          // If upgrading from v1, read all existing data first
          if (currentVersion === 1 && checkDb.objectStoreNames.contains(this.storeName)) {
            existingData = await new Promise<T[]>((resolve, reject) => {
              try {
                const tx = checkDb.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result as T[]);
                req.onerror = () => reject(req.error);
              } catch {
                resolve([]);
              }
            });
          }
          checkDb.close();
        }
      } catch {
        // Ignore errors during pre-migration check
      }
    }

    return openDB(this.dbName, DB_VERSION, (db, oldVersion) => {
      // Fresh install - just create the store
      if (oldVersion === 0) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: '_seq',
          autoIncrement: true
        });
        store.createIndex('id', 'id', { unique: true });
        return;
      }

      // Migration from v1 to v2: recreate store with new schema
      if (oldVersion === 1 && db.objectStoreNames.contains(this.storeName)) {
        db.deleteObjectStore(this.storeName);
        const newStore = db.createObjectStore(this.storeName, {
          keyPath: '_seq',
          autoIncrement: true
        });
        newStore.createIndex('id', 'id', { unique: true });

        // Re-insert existing data (read before upgrade started)
        if (existingData && existingData.length > 0) {
          for (const item of existingData) {
            const itemToStore = { ...item } as IndexedDBItem<T>;
            delete itemToStore._seq;
            newStore.add(itemToStore);
          }
        }
      }

      // Ensure store exists (for any other version scenarios)
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: '_seq',
          autoIncrement: true
        });
        store.createIndex('id', 'id', { unique: true });
      }
    });
  }

  async enqueue(item: T): Promise<void> {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, 'readwrite', async (store) => {
      // Remove _seq if present to let auto-increment assign new value
      const itemToStore = { ...item } as IndexedDBItem<T>;
      delete itemToStore._seq;
      await promisifyRequest(store.add(itemToStore));
    });
  }

  async dequeue(): Promise<T | undefined> {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, 'readwrite', async (store) => {
      // openCursor with no arguments iterates in key order (auto-increment = FIFO)
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value as IndexedDBItem<T>;
        await promisifyRequest(store.delete(cursor.key));
        // Remove internal _seq property before returning
        const { _seq: _, ...item } = value;
        return item as T;
      }
      return undefined;
    });
  }

  async peek(): Promise<T | undefined> {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, 'readonly', async (store) => {
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value as IndexedDBItem<T>;
        const { _seq: _, ...item } = value;
        return item as T;
      }
      return undefined;
    });
  }

  async isEmpty(): Promise<boolean> {
    return (await this.size()) === 0;
  }

  async size(): Promise<number> {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, 'readonly', async (store) => {
      return promisifyRequest(store.count());
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, 'readwrite', async (store) => {
      await promisifyRequest(store.clear());
    });
  }

  /**
   * Close the database connection.
   * The connection will be automatically reopened on next operation.
   */
  close(): void {
    if (this.dbPromise) {
      this.dbPromise.then(db => db.close()).catch(() => {});
      this.dbPromise = null;
      this.isClosed = true;
    }
  }
}
