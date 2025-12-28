export { AdaptiveImageOptions, AdaptiveImageResult, AdaptiveImageSource, ImageQuality, QualityThresholds, useAdaptiveImage } from './hooks/useAdaptiveImage.mjs';
export { PollingControls, PollingOptions, PollingState, useAdaptivePolling } from './hooks/useAdaptivePolling.mjs';
export { BackgroundSyncOptions, BackgroundSyncResult, FailedRequest, FlushResult, QueueFullBehavior, QueuedReq, RetryPolicy, useBackgroundSync } from './hooks/useBackgroundSync.mjs';
export { C as ConnectionType, E as EffectiveConnectionType, N as NetworkInfo, a as NetworkInformation, g as getNetworkConnection, i as isNetworkInformationSupported, u as useNetworkStatus } from './useNetworkStatus-2n3tGqv7.mjs';
export { a as ResilientResult, b as ResilientState, R as ResilientStatus, S as StorageProvider } from './types-BF29fKSQ.mjs';
export { Q as QueueStore } from './types-DivwYhR1.mjs';
export { IndexedDBQueueStore, MemoryQueueStore } from './stores.mjs';
export { E as EventBus } from './eventBus-CJ2Eg9SB.mjs';
export { R as RETRYABLE_STATUS_CODES, e as RetryConfig, d as defaultRetryDelay, b as defaultShouldRetry, c as delay, a as registerServiceWorker, r as requestBackgroundSync, w as withRetry } from './index-DSayTrn5.mjs';

/**
 * Error thrown when an IndexedDB operation fails
 */
declare class IndexedDBError extends Error {
    readonly cause?: (DOMException | Error | null) | undefined;
    readonly operation?: string | undefined;
    constructor(message: string, cause?: (DOMException | Error | null) | undefined, operation?: string | undefined);
}

export { IndexedDBError };
