declare const QUEUE_DB = "rrh_indexeddb_v1";
declare const QUEUE_STORE = "queue";
declare function openDB(dbName?: string, version?: number): Promise<IDBDatabase>;
declare function promisifyRequest<T>(req: IDBRequest<T>): Promise<T>;
declare function getQueue(): Promise<any[]>;
declare function removeItem(id: string): Promise<undefined>;
