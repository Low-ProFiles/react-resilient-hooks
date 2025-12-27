// src/core/idbUtils.ts
function openDB(dbName, version = 1, upgradeCb) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      try {
        upgradeCb?.(req.result);
      } catch {
      }
    };
  });
}
function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
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
var IndexedDBQueueStore = class {
  /**
   * Create a new IndexedDB queue store.
   *
   * @param dbName - Name of the IndexedDB database (default: 'resilient-queue')
   * @param storeName - Name of the object store (default: 'queue')
   */
  constructor(dbName = "resilient-queue", storeName = "queue") {
    this.dbPromise = null;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, 1, (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      });
    }
    return this.dbPromise;
  }
  async enqueue(item) {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.add(item));
  }
  async dequeue() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    if (cursor) {
      const value = cursor.value;
      await promisifyRequest(store.delete(cursor.key));
      return value;
    }
    return void 0;
  }
  async peek() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const cursor = await promisifyRequest(store.openCursor());
    return cursor ? cursor.value : void 0;
  }
  async isEmpty() {
    return await this.size() === 0;
  }
  async size() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    return promisifyRequest(store.count());
  }
  async clear() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await promisifyRequest(store.clear());
  }
};

export { IndexedDBQueueStore, MemoryQueueStore };
