// Main hooks
export { useAdaptiveImage } from './hooks/useAdaptiveImage';
export type {
  AdaptiveImageSource,
  AdaptiveImageOptions,
  AdaptiveImageResult,
  ImageQuality,
  QualityThresholds
} from './hooks/useAdaptiveImage';

export { useAdaptivePolling } from './hooks/useAdaptivePolling';
export type { PollingOptions, PollingState, PollingControls } from './hooks/useAdaptivePolling';

export { useBackgroundSync } from './hooks/useBackgroundSync';
export type {
  QueuedReq,
  BackgroundSyncOptions,
  BackgroundSyncResult,
  RetryPolicy,
  FlushResult,
  FailedRequest,
  QueueFullBehavior
} from './hooks/useBackgroundSync';

// Network status hook (used internally, but also exported for advanced usage)
export { useNetworkStatus } from './hooks/useNetworkStatus';
export type { NetworkInfo } from './hooks/useNetworkStatus';

// Core types
export type { ResilientStatus, ResilientResult, StorageProvider, ResilientState } from './types/types';
export type { EffectiveConnectionType, ConnectionType, NetworkInformation } from './types/network';
export { getNetworkConnection, isNetworkInformationSupported } from './types/network';

// Queue stores (for advanced usage with useBackgroundSync)
export type { QueueStore } from './stores/types';
export { MemoryQueueStore, IndexedDBQueueStore } from './stores/implementations';

// IndexedDB utilities
export { IndexedDBError } from './stores/idbUtils';

// Utilities
export { EventBus } from './utils/eventBus';
export { requestBackgroundSync, registerServiceWorker } from './utils/registerServiceWorker';
export {
  withRetry,
  defaultRetryDelay,
  defaultShouldRetry,
  delay,
  RETRYABLE_STATUS_CODES
} from './utils/retry';
export type { RetryConfig } from './utils/retry';
