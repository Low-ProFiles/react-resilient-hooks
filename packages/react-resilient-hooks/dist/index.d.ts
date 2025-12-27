export { AdaptiveImageOptions, AdaptiveImageResult, AdaptiveImageSource, ImageQuality, useAdaptiveImage } from './hooks/useAdaptiveImage.js';
export { PollingControls, PollingOptions, PollingState, useAdaptivePolling } from './hooks/useAdaptivePolling.js';
export { B as BackgroundSyncOptions, E as EventBus, Q as QueuedReq, R as RetryPolicy, u as useBackgroundSync } from './useBackgroundSync-IYvDlUVv.js';
export { NetworkInfo, useNetworkStatus } from './hooks/useNetworkStatus.js';
export { a as ResilientResult, b as ResilientState, R as ResilientStatus, S as StorageProvider } from './types-BF29fKSQ.js';
export { Q as QueueStore } from './types-DivwYhR1.js';
export { IndexedDBQueueStore, MemoryQueueStore } from './stores.js';

declare function registerServiceWorker(swUrl?: string): Promise<ServiceWorkerRegistration | null>;
declare function requestBackgroundSync(tag?: string): Promise<boolean>;

export { registerServiceWorker, requestBackgroundSync };
