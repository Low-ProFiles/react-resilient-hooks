export declare function openDB(dbName: string, version?: number, upgradeCb?: (db: IDBDatabase) => void): Promise<IDBDatabase>;
export declare function promisifyRequest<T>(req: IDBRequest<T>): Promise<T>;
