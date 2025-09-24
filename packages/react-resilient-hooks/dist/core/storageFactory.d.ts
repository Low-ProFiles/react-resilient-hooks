import { StorageProvider } from './types';
export type StorageType = 'local' | 'encrypted-local' | 'indexeddb';
export declare function storageFactory(type?: StorageType, passphrase?: string): StorageProvider;
