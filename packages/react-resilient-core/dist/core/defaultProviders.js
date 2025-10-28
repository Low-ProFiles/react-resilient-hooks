import { LocalStorageProvider } from "./storageProvider";
export var defaultStorageProvider = new LocalStorageProvider();
export var defaultFetcher = fetch.bind(globalThis);
