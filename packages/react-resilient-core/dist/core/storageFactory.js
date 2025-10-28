import { LocalStorageProvider, EncryptedLocalStorageProvider } from './storageProvider';
import { IndexedDBProvider } from './indexedDBProvider';
export function storageFactory(type, passphrase) {
    if (type === void 0) { type = 'encrypted-local'; }
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
