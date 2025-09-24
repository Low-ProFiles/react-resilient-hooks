/// <reference lib="webworker" />

const QUEUE_DB = "rrh_indexeddb_v1";
const QUEUE_STORE = "queue";

function openDB(dbName = QUEUE_DB, version = 1) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };
  });
}

function promisifyRequest<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getQueue() {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readonly");
  const store = tx.objectStore(QUEUE_STORE);
  const req = store.getAll();
  return promisifyRequest<any[]>(req);
}

async function removeItem(id: string) {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  const req = store.delete(id);
  return promisifyRequest(req);
}

self.addEventListener("install", (event: any) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("sync", (event: any) => {
  if (!event.tag.startsWith("rrh-background-sync")) return;
  event.waitUntil(
    (async () => {
      try {
        const queue = await getQueue();
        for (const item of queue) {
          try {
            const resp = await fetch(item.url, item.options);
            if (resp && resp.ok) {
              await removeItem(item.id);
            } else {
              break;
            }
          } catch (error) {
            break;
          }
        }
      } catch (error) {}
    })()
  );
});
