/**
 * Error thrown when an IndexedDB operation fails
 */
export class IndexedDBError extends Error {
  constructor(
    message: string,
    public readonly cause?: DOMException | Error | null,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'IndexedDBError';
  }
}

/**
 * Open an IndexedDB database with optional upgrade callback.
 * The upgrade callback receives the database, old version, and upgrade transaction.
 */
export function openDB(
  dbName: string,
  version = 1,
  upgradeCb?: (db: IDBDatabase, oldVersion: number, transaction: IDBTransaction) => void
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let upgradeError: Error | null = null;

    const req = indexedDB.open(dbName, version);

    req.onerror = () => {
      reject(new IndexedDBError(
        `Failed to open database "${dbName}"`,
        req.error,
        'open'
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
        const transaction = req.transaction!;
        upgradeCb?.(db, oldVersion, transaction);
      } catch (err) {
        upgradeError = err instanceof Error ? err : new Error(String(err));
        // Don't reject here - let onsuccess handle it after transaction completes
      }
    };

    req.onblocked = () => {
      reject(new IndexedDBError(
        `Database "${dbName}" is blocked by another connection`,
        null,
        'open'
      ));
    };
  });
}

/**
 * Promisify an IDBRequest
 */
export function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new IndexedDBError(
      'IndexedDB request failed',
      req.error,
      'request'
    ));
  });
}

/**
 * Wait for a transaction to complete
 * This ensures data is actually persisted before returning
 */
export function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new IndexedDBError(
      'Transaction failed',
      tx.error,
      'transaction'
    ));
    tx.onabort = () => reject(new IndexedDBError(
      'Transaction aborted',
      tx.error,
      'transaction'
    ));
  });
}

/**
 * Execute a callback within a transaction and wait for completion.
 * Properly handles errors from both the callback and the transaction.
 */
export async function withTransaction<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);

  // Start listening for transaction completion immediately
  const txPromise = waitForTransaction(tx);

  try {
    // Execute callback
    const result = await callback(store);

    // Wait for transaction to complete (ensures data is persisted)
    await txPromise;

    return result;
  } catch (callbackError) {
    // If callback failed, try to abort transaction if still active
    try {
      tx.abort();
    } catch {
      // Transaction may already be finished, ignore abort error
    }

    // Wait for transaction to finish (will reject due to abort)
    try {
      await txPromise;
    } catch {
      // Expected - transaction was aborted
    }

    // Re-throw the original callback error
    throw callbackError;
  }
}
