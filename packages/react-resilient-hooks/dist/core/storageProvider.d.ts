import { StorageProvider } from "./types";
export declare class LocalStorageProvider implements StorageProvider {
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export declare class EncryptedLocalStorageProvider implements StorageProvider {
    private key;
    private prefix;
    constructor(passphrase: string);
    static deriveKeyFromPassphrase(passphrase: string, salt?: BufferSource): Promise<{
        key: CryptoKey;
        salt: BufferSource;
    }>;
    static createFromPassphrase(passphrase: string): Promise<EncryptedLocalStorageProvider>;
    static createFromPassphraseWithStoredSalt(passphrase: string): Promise<EncryptedLocalStorageProvider>;
    private encryptObject;
    private decryptObject;
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
