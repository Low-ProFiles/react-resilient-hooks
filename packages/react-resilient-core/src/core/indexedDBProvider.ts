import { StorageProvider } from "./types"
import { openDB, promisifyRequest } from "./idbUtils"

const DB_NAME = "rrh_indexeddb_v1"
const STORE_NAME = "kv"

export class IndexedDBProvider implements StorageProvider {
  private dbPromise: Promise<IDBDatabase>

  constructor() {
    this.dbPromise = openDB(DB_NAME, 1, db => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    })
  }

  private async getStore(mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    const db = await this.dbPromise
    const tx = db.transaction(STORE_NAME, mode)
    return tx.objectStore(STORE_NAME)
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const store = await this.getStore("readonly")
      const req = store.get(key)
      const raw = await promisifyRequest<any>(req)
      if (raw === undefined) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    const store = await this.getStore("readwrite")
    const raw = JSON.stringify(value)
    const req = store.put(raw, key)
    await promisifyRequest(req)
  }

  async removeItem(key: string): Promise<void> {
    const store = await this.getStore("readwrite")
    const req = store.delete(key)
    await promisifyRequest(req)
  }
}
