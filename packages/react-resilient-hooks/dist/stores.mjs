// src/stores/idbUtils.ts
var IndexedDBError = class extends Error {
  constructor(message, cause, operation) {
    super(message);
    this.cause = cause;
    this.operation = operation;
    this.name = "IndexedDBError";
  }
};
function openDB(dbName, version = 1, upgradeCb) {
  return new Promise((resolve, reject) => {
    let upgradeError = null;
    const req = indexedDB.open(dbName, version);
    req.onerror = () => {
      reject(new IndexedDBError(
        `Failed to open database "${dbName}"`,
        req.error,
        "open"
      ));
    };
    req.onsuccess = () => {
      if (upgradeError) {
        req.result.close();
        reject(upgradeError);
      } else {
        resolve(req.result);
      }
    };
    req.onupgradeneeded = (event) => {
      try {
        const db = req.result;
        const oldVersion = event.oldVersion;
        const transaction = req.transaction;
        upgradeCb?.(db, oldVersion, transaction);
      } catch (err) {
        upgradeError = err instanceof Error ? err : new Error(String(err));
      }
    };
    req.onblocked = () => {
      reject(new IndexedDBError(
        `Database "${dbName}" is blocked by another connection`,
        null,
        "open"
      ));
    };
  });
}
function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new IndexedDBError(
      "IndexedDB request failed",
      req.error,
      "request"
    ));
  });
}
function waitForTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new IndexedDBError(
      "Transaction failed",
      tx.error,
      "transaction"
    ));
    tx.onabort = () => reject(new IndexedDBError(
      "Transaction aborted",
      tx.error,
      "transaction"
    ));
  });
}
async function withTransaction(db, storeName, mode, callback) {
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const txPromise = waitForTransaction(tx);
  try {
    const result = await callback(store);
    await txPromise;
    return result;
  } catch (callbackError) {
    try {
      tx.abort();
    } catch {
    }
    try {
      await txPromise;
    } catch {
    }
    throw callbackError;
  }
}

// src/stores/implementations.ts
var MemoryQueueStore = class {
  constructor() {
    this.queue = [];
  }
  async enqueue(item) {
    this.queue.push(item);
  }
  async dequeue() {
    return this.queue.shift();
  }
  async peek() {
    return this.queue[0];
  }
  async isEmpty() {
    return this.queue.length === 0;
  }
  async size() {
    return this.queue.length;
  }
  async clear() {
    this.queue = [];
  }
};
var DB_VERSION = 2;
var IndexedDBQueueStore = class {
  /**
   * Create a new IndexedDB queue store.
   *
   * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
   * @param storeName - Name of the object store (default: 'queue')
   */
  constructor(dbName = "resilient-queue", storeName = "queue") {
    this.dbPromise = null;
    this.isClosed = false;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  async getDB() {
    if (this.isClosed) {
      this.dbPromise = null;
      this.isClosed = false;
    }
    if (!this.dbPromise) {
      this.dbPromise = this.openWithMigration();
      this.dbPromise.then((db) => {
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
  async openWithMigration() {
    let existingData = null;
    if (typeof indexedDB !== "undefined") {
      try {
        const checkDb = await new Promise((resolve) => {
          const req = indexedDB.open(this.dbName);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (checkDb) {
          const currentVersion = checkDb.version;
          if (currentVersion === 1 && checkDb.objectStoreNames.contains(this.storeName)) {
            existingData = await new Promise((resolve, reject) => {
              try {
                const tx = checkDb.transaction(this.storeName, "readonly");
                const store = tx.objectStore(this.storeName);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              } catch {
                resolve([]);
              }
            });
          }
          checkDb.close();
        }
      } catch {
      }
    }
    return openDB(this.dbName, DB_VERSION, (db, oldVersion) => {
      if (oldVersion === 0) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        store.createIndex("id", "id", { unique: true });
        return;
      }
      if (oldVersion === 1 && db.objectStoreNames.contains(this.storeName)) {
        db.deleteObjectStore(this.storeName);
        const newStore = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        newStore.createIndex("id", "id", { unique: true });
        if (existingData && existingData.length > 0) {
          for (const item of existingData) {
            const itemToStore = { ...item };
            delete itemToStore._seq;
            newStore.add(itemToStore);
          }
        }
      }
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: "_seq",
          autoIncrement: true
        });
        store.createIndex("id", "id", { unique: true });
      }
    });
  }
  async enqueue(item) {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, "readwrite", async (store) => {
      const itemToStore = { ...item };
      delete itemToStore._seq;
      await promisifyRequest(store.add(itemToStore));
    });
  }
  async dequeue() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readwrite", async (store) => {
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value;
        await promisifyRequest(store.delete(cursor.key));
        const { _seq: _, ...item } = value;
        return item;
      }
      return void 0;
    });
  }
  async peek() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readonly", async (store) => {
      const cursor = await promisifyRequest(store.openCursor());
      if (cursor) {
        const value = cursor.value;
        const { _seq: _, ...item } = value;
        return item;
      }
      return void 0;
    });
  }
  async isEmpty() {
    return await this.size() === 0;
  }
  async size() {
    const db = await this.getDB();
    return withTransaction(db, this.storeName, "readonly", async (store) => {
      return promisifyRequest(store.count());
    });
  }
  async clear() {
    const db = await this.getDB();
    await withTransaction(db, this.storeName, "readwrite", async (store) => {
      await promisifyRequest(store.clear());
    });
  }
  /**
   * Close the database connection.
   * The connection will be automatically reopened on next operation.
   */
  close() {
    if (this.dbPromise) {
      this.dbPromise.then((db) => db.close()).catch(() => {
      });
      this.dbPromise = null;
      this.isClosed = true;
    }
  }
};

export { IndexedDBQueueStore, MemoryQueueStore };
