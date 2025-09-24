import React from 'react';
import { StorageProvider } from './types';
import { StorageType } from './storageFactory';
interface ResilientContextValue {
    fetcher: typeof fetch;
    storageProvider: StorageProvider;
}
export declare function useResilientContext(): ResilientContextValue;
interface ResilientProviderProps {
    children: React.ReactNode;
    fetcher?: typeof fetch;
    storageType?: StorageType;
    passphrase?: string;
}
export declare function ResilientProvider({ children, fetcher, storageType, passphrase }: ResilientProviderProps): React.JSX.Element;
export {};
