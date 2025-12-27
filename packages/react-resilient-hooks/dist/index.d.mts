export { AdaptiveImageOptions, AdaptiveImageResult, AdaptiveImageSource, ImageQuality, useAdaptiveImage } from './hooks/useAdaptiveImage.mjs';
export { PollingControls, PollingOptions, PollingState, useAdaptivePolling } from './hooks/useAdaptivePolling.mjs';
export { B as BackgroundSyncOptions, E as EventBus, Q as QueuedReq, R as RetryPolicy, u as useBackgroundSync } from './useBackgroundSync-CmTwcl9y.mjs';
export { NetworkInfo, useNetworkStatus } from './hooks/useNetworkStatus.mjs';
export { a as ResilientResult, b as ResilientState, R as ResilientStatus, S as StorageProvider } from './types-BF29fKSQ.mjs';
export { Q as QueueStore } from './types-DivwYhR1.mjs';
export { IndexedDBQueueStore, MemoryQueueStore } from './stores.mjs';

declare function registerServiceWorker(swUrl?: string): Promise<ServiceWorkerRegistration | null>;
declare function requestBackgroundSync(tag?: string): Promise<boolean>;

export { registerServiceWorker, requestBackgroundSync };
