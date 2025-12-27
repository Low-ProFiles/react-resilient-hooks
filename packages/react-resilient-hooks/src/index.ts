// Main hooks
export { useAdaptiveImage } from './hooks/useAdaptiveImage';
export type { AdaptiveImageSource, AdaptiveImageOptions, AdaptiveImageResult, ImageQuality } from './hooks/useAdaptiveImage';

export { useAdaptivePolling } from './hooks/useAdaptivePolling';
export type { PollingOptions, PollingState, PollingControls } from './hooks/useAdaptivePolling';

export { useBackgroundSync } from './hooks/useBackgroundSync';
export type { QueuedReq, BackgroundSyncOptions, RetryPolicy } from './hooks/useBackgroundSync';

// Network status hook (used internally, but also exported for advanced usage)
export { useNetworkStatus } from './hooks/useNetworkStatus';
export type { NetworkInfo } from './hooks/useNetworkStatus';

// Core types
export type { ResilientStatus, ResilientResult, StorageProvider, ResilientState } from './core/types';

// Queue stores (for advanced usage with useBackgroundSync)
export type { QueueStore } from './stores/types';
export { MemoryQueueStore, IndexedDBQueueStore } from './stores/implementations';

// Event bus (for advanced usage)
export { EventBus } from './core/eventBus';

// Service worker utilities
export { requestBackgroundSync, registerServiceWorker } from './utils/registerServiceWorker';
