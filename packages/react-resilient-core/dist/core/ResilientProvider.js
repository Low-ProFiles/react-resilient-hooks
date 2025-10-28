import React, { createContext, useContext } from 'react';
import { storageFactory } from './storageFactory';
var ResilientContext = createContext(undefined);
export function useResilientContext() {
    var context = useContext(ResilientContext);
    if (!context) {
        throw new Error('useResilientContext must be used within a ResilientProvider');
    }
    return context;
}
export function ResilientProvider(_a) {
    var children = _a.children, _b = _a.fetcher, fetcher = _b === void 0 ? fetch : _b, _c = _a.storageType, storageType = _c === void 0 ? 'local' : _c, passphrase = _a.passphrase;
    var storageProvider = storageFactory(storageType, passphrase);
    var value = { fetcher: fetcher, storageProvider: storageProvider };
    return React.createElement(ResilientContext.Provider, { value: value }, children);
}
