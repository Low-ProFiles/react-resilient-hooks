/**
 * Status of a resilient operation.
 */
export type ResilientStatus = "idle" | "loading" | "success" | "error"

/**
 * Result of a resilient operation with status tracking.
 * Used for operations that need to track loading, success, and error states.
 *
 * @typeParam T - Type of the data payload
 */
export interface ResilientResult<T = unknown> {
  /** Current status of the operation */
  status: ResilientStatus
  /** Data payload when status is 'success' */
  data?: T
  /** Error object when status is 'error' */
  error?: Error
  /** Optional retry function to re-attempt the operation */
  retry?: () => void
}

/**
 * Interface for storage providers used by resilient hooks.
 * Implement this interface to provide custom storage backends.
 */
export interface StorageProvider {
  /** Retrieve an item from storage */
  getItem<T = unknown>(key: string): Promise<T | null>
  /** Store an item in storage */
  setItem<T = unknown>(key: string, value: T): Promise<void>
  /** Remove an item from storage */
  removeItem(key: string): Promise<void>
}

/**
 * State object returned by resilient hooks.
 * Provides data, error, and loading state for React components.
 *
 * @typeParam T - Type of the data
 */
export interface ResilientState<T> {
  /** The data value, or null if not yet loaded or on error */
  data: T | null;
  /** Error object if an error occurred, otherwise null */
  error: Error | null;
  /** Whether the operation is currently in progress */
  loading: boolean;
}