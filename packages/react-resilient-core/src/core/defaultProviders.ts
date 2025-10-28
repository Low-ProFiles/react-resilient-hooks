import { LocalStorageProvider } from "./storageProvider"
export const defaultStorageProvider = new LocalStorageProvider()
export const defaultFetcher = fetch.bind(globalThis)
