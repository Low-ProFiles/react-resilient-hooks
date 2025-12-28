export { AdaptiveImageOptions, AdaptiveImageResult, AdaptiveImageSource, ImageQuality, QualityThresholds, useAdaptiveImage } from './hooks/useAdaptiveImage.js';
export { PollingControls, PollingOptions, PollingState, useAdaptivePolling } from './hooks/useAdaptivePolling.js';
export { BackgroundSyncOptions, BackgroundSyncResult, FailedRequest, FlushResult, QueueFullBehavior, QueuedReq, RetryPolicy, useBackgroundSync } from './hooks/useBackgroundSync.js';
export { C as ConnectionType, E as EffectiveConnectionType, N as NetworkInfo, a as NetworkInformation, g as getNetworkConnection, i as isNetworkInformationSupported, u as useNetworkStatus } from './useNetworkStatus-BHnNcF2d.js';
export { a as ResilientResult, b as ResilientState, R as ResilientStatus, S as StorageProvider } from './types-BF29fKSQ.js';
export { Q as QueueStore } from './types-DivwYhR1.js';
export { IndexedDBQueueStore, MemoryQueueStore } from './stores.js';
export { E as EventBus } from './eventBus-CJ2Eg9SB.js';
export { R as RETRYABLE_STATUS_CODES, e as RetryConfig, d as defaultRetryDelay, b as defaultShouldRetry, c as delay, a as registerServiceWorker, r as requestBackgroundSync, w as withRetry } from './index-BNnyKxUN.js';

/**
 * Error thrown when an IndexedDB operation fails
 */
declare class IndexedDBError extends Error {
    readonly cause?: (DOMException | Error | null) | undefined;
    readonly operation?: string | undefined;
    constructor(message: string, cause?: (DOMException | Error | null) | undefined, operation?: string | undefined);
}

export { IndexedDBError };
