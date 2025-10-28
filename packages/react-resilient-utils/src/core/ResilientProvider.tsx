import React, { createContext, useContext } from 'react';
import { StorageProvider, storageFactory, StorageType } from '@resilient/core';

interface ResilientContextValue {
  fetcher: typeof fetch;
  storageProvider: StorageProvider;
}

const ResilientContext = createContext<ResilientContextValue | undefined>(undefined);

export function useResilientContext() {
  const context = useContext(ResilientContext);
  if (!context) {
    throw new Error('useResilientContext must be used within a ResilientProvider');
  }
  return context;
}

interface ResilientProviderProps {
  children: React.ReactNode;
  fetcher?: typeof fetch;
  storageType?: StorageType;
  passphrase?: string;
}

export function ResilientProvider({ children, fetcher = fetch, storageType = 'local', passphrase }: ResilientProviderProps) {
  const storageProvider = storageFactory(storageType, passphrase);
  const value = { fetcher, storageProvider };

  return <ResilientContext.Provider value={value}>{children}</ResilientContext.Provider>;
}
