import { StorageProvider } from './types';
import { LocalStorageProvider, EncryptedLocalStorageProvider } from './storageProvider';
import { IndexedDBProvider } from './indexedDBProvider';

export type StorageType = 'local' | 'encrypted-local' | 'indexeddb';

export function storageFactory(type: StorageType = 'encrypted-local', passphrase?: string): StorageProvider {
  switch (type) {
    case 'local':
      console.warn('Using local storage without encryption. This is not recommended for sensitive data.');
      return new LocalStorageProvider();
    case 'indexeddb':
      return new IndexedDBProvider();
    case 'encrypted-local':
    default:
      if (!passphrase) {
        throw new Error('Passphrase is required for encrypted-local storage');
      }
      return new EncryptedLocalStorageProvider(passphrase);
  }
}