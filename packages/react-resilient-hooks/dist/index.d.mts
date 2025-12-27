type AdaptiveImageSource = {
    high: string;
    medium?: string;
    low: string;
};
type ImageQuality = 'high' | 'medium' | 'low';
type AdaptiveImageOptions = {
    /** Default quality to use during SSR or when network info unavailable */
    ssrDefault?: ImageQuality;
    /** Custom thresholds for downlink (Mbps) */
    thresholds?: {
        low: number;
        medium: number;
    };
};
type AdaptiveImageResult = {
    /** The selected image URL */
    src: string;
    /** The quality level that was selected */
    quality: ImageQuality;
};
declare function useAdaptiveImage(src: AdaptiveImageSource, options?: AdaptiveImageOptions): AdaptiveImageResult;

type PollingOptions = {
    /** Base polling interval in ms (default: 5000) */
    baseInterval?: number;
    /** Maximum polling interval in ms (default: 60000) */
    maxInterval?: number;
    /** Add random jitter to prevent thundering herd (default: true) */
    jitter?: boolean;
    /** Pause polling when offline (default: true) */
    pauseWhenOffline?: boolean;
    /** Start polling immediately (default: true) */
    enabled?: boolean;
    /** Callback when polling encounters an error */
    onError?: (error: Error) => void;
};
type PollingState = {
    /** Whether polling is currently active */
    isPolling: boolean;
    /** Whether polling is manually paused */
    isPaused: boolean;
    /** Current interval being used (in ms) */
    currentInterval: number;
    /** Number of consecutive errors */
    errorCount: number;
    /** Last error encountered */
    lastError: Error | null;
};
type PollingControls = {
    /** Current polling state */
    state: PollingState;
    /** Pause polling */
    pause: () => void;
    /** Resume polling */
    resume: () => void;
    /** Immediately trigger the callback */
    triggerNow: () => Promise<void>;
};
declare function useAdaptivePolling(callback: () => Promise<void> | void, opts?: PollingOptions): PollingControls;

type ResilientStatus = "idle" | "loading" | "success" | "error";
interface ResilientResult<T = unknown> {
    status: ResilientStatus;
    data?: T;
    error?: Error;
    retry?: () => void;
}
interface StorageProvider {
    getItem<T = unknown>(key: string): Promise<T | null>;
    setItem<T = unknown>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}
interface ResilientState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

interface QueueStore<T> {
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
}

type Listener<T> = (event: T) => void;
declare class EventBus<T> {
    private listeners;
    subscribe(listener: Listener<T>): () => void;
    publish(event: T): void;
}

type QueuedReq = {
    id: string;
    url: string;
    options?: RequestInit;
    meta?: Record<string, unknown>;
};
type BackgroundSyncOptions = {
    queueStore?: QueueStore<QueuedReq>;
    eventBus?: EventBus<ResilientResult>;
    onSuccess?: (req: QueuedReq) => void;
    onError?: (req: QueuedReq, error: Error) => void;
};
declare function useBackgroundSync(options?: BackgroundSyncOptions): {
    status: ResilientResult<unknown>;
    enqueue: (url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>;
    flush: () => Promise<void>;
};

type NetworkInfo = {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
};
declare function useNetworkStatus(): ResilientState<NetworkInfo>;

declare class MemoryQueueStore<T> implements QueueStore<T> {
    private queue;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
}
declare class IndexedDBQueueStore<T extends {
    id: string;
}> implements QueueStore<T> {
    private dbName;
    private storeName;
    private dbPromise;
    constructor(dbName?: string, storeName?: string);
    private getDB;
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    peek(): Promise<T | undefined>;
    isEmpty(): Promise<boolean>;
    size(): Promise<number>;
}

declare function registerServiceWorker(swUrl?: string): Promise<ServiceWorkerRegistration | null>;
declare function requestBackgroundSync(tag?: string): Promise<boolean>;

export { type AdaptiveImageOptions, type AdaptiveImageResult, type AdaptiveImageSource, type BackgroundSyncOptions, EventBus, type ImageQuality, IndexedDBQueueStore, MemoryQueueStore, type NetworkInfo, type PollingControls, type PollingOptions, type PollingState, type QueueStore, type QueuedReq, type ResilientResult, type ResilientState, type ResilientStatus, type StorageProvider, registerServiceWorker, requestBackgroundSync, useAdaptiveImage, useAdaptivePolling, useBackgroundSync, useNetworkStatus };
