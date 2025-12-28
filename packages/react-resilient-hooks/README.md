# react-resilient-hooks

React hooks for building resilient applications that gracefully handle network instability, slow connections, and offline scenarios.

## Features

- **Network-Aware**: Automatically adapts to connection quality (2G/3G/4G)
- **Offline-First**: Queue operations when offline, sync when back online
- **TypeScript-First**: Full type safety with comprehensive types
- **SSR-Safe**: Works with Next.js and other SSR frameworks
- **Zero Dependencies**: Only peer dependency is React 18+

## Installation

```bash
npm install react-resilient-hooks
```

## Hooks

### useAdaptivePolling

Polling that adapts its interval based on network conditions. Automatically slows down on poor connections and pauses when offline.

```tsx
import { useAdaptivePolling } from 'react-resilient-hooks';

function Dashboard() {
  const [data, setData] = useState(null);

  const { state, pause, resume, triggerNow } = useAdaptivePolling(
    async () => {
      const response = await fetch('/api/stats');
      setData(await response.json());
    },
    {
      baseInterval: 5000,      // 5s on fast connections
      maxInterval: 60000,      // Cap at 60s on slow connections
      pauseWhenOffline: true,  // Stop polling when offline
      immediate: true,         // Execute immediately on mount
      jitter: true,            // Add randomness to prevent thundering herd
    }
  );

  return (
    <div>
      <p>Status: {state.isPolling ? 'Polling' : 'Paused'}</p>
      <p>Interval: {state.currentInterval}ms</p>
      <p>Errors: {state.errorCount}</p>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={triggerNow}>Refresh Now</button>
    </div>
  );
}
```

**Network Adaptation:**
| Connection | Interval Multiplier |
|------------|---------------------|
| 4G         | 1x (base)           |
| 3G         | 2x                  |
| 2G/slow-2g | 3x                  |

### useBackgroundSync

Queue failed requests and automatically retry them when the network is available.

```tsx
import { useBackgroundSync } from 'react-resilient-hooks';

function CommentForm() {
  const { status, enqueue, flush, getQueueSize } = useBackgroundSync({
    onSuccess: (req) => console.log('Synced:', req.url),
    onError: (req, error) => console.error('Failed:', req.url, error),
    onRetry: (req, attempt) => console.log(`Retry #${attempt}:`, req.url),
    retry: {
      maxRetries: 5,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
    concurrency: 3,              // Process up to 3 requests in parallel
    debug: true,                 // Enable console logging for debugging
    maxQueueSize: 100,           // Limit queue to 100 items
    onQueueFull: 'drop-oldest',  // Drop oldest when full (or 'reject')
  });

  const handleSubmit = async (comment: string) => {
    try {
      await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    } catch {
      // Queue for later if network fails
      await enqueue('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }, { type: 'comment' }); // Optional metadata
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit('Hello!'); }}>
      <button type="submit">Post Comment</button>
      <p>Sync Status: {status.status}</p>
      <button type="button" onClick={flush}>Sync Now</button>
    </form>
  );
}
```

**Flush Result:**
```ts
const result = await flush();
// {
//   succeeded: 5,
//   failed: 1,
//   pending: 2,
//   errors: [{ req, error, statusCode, attempts }]
// }
```

### useAdaptiveImage

Automatically select image quality based on network conditions.

```tsx
import { useAdaptiveImage } from 'react-resilient-hooks';

function HeroImage() {
  const { src, quality } = useAdaptiveImage({
    high: '/images/hero-2000w.jpg',
    medium: '/images/hero-1000w.jpg',
    low: '/images/hero-500w.jpg',
  }, {
    ssrDefault: 'medium',
    thresholds: { low: 0.5, medium: 1.5 }, // Mbps
  });

  return <img src={src} alt="Hero" data-quality={quality} />;
}
```

### useNetworkStatus

Real-time network status information.

```tsx
import { useNetworkStatus } from 'react-resilient-hooks';

function NetworkIndicator() {
  const { data: network } = useNetworkStatus();

  if (!network?.online) {
    return <div className="offline-banner">You're offline</div>;
  }

  return (
    <div>
      <p>Connection: {network.effectiveType}</p>
      <p>Downlink: {network.downlink} Mbps</p>
      <p>RTT: {network.rtt}ms</p>
    </div>
  );
}
```

## Advanced Usage

### Custom Queue Store

Use a custom storage backend for the sync queue:

```tsx
import { useBackgroundSync, MemoryQueueStore } from 'react-resilient-hooks';

// In-memory store (for development/testing)
const memoryStore = new MemoryQueueStore();

// Or implement your own
class CustomStore implements QueueStore<QueuedReq> {
  async enqueue(item) { /* ... */ }
  async dequeue() { /* ... */ }
  async peek() { /* ... */ }
  async size() { /* ... */ }
  async isEmpty() { /* ... */ }
  async clear() { /* ... */ }
}

function App() {
  const sync = useBackgroundSync({ queueStore: memoryStore });
  // ...
}
```

### Retry Utilities

Use retry logic standalone:

```tsx
import { withRetry, defaultRetryDelay, RETRYABLE_STATUS_CODES } from 'react-resilient-hooks';

const data = await withRetry(
  () => fetch('/api/data').then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }),
  {
    maxRetries: 3,
    retryDelay: defaultRetryDelay, // Exponential backoff
    shouldRetry: (error) => {
      // Custom retry logic
      const status = parseInt(error.message.match(/\d+/)?.[0] || '0');
      return RETRYABLE_STATUS_CODES.has(status);
    },
  },
  (attempt, error) => console.log(`Retry ${attempt}:`, error.message)
);
```

### Event Bus

Subscribe to sync status updates:

```tsx
import { EventBus, useBackgroundSync } from 'react-resilient-hooks';

const syncBus = new EventBus<ResilientResult>();

// Subscribe anywhere in your app
syncBus.subscribe((status) => {
  if (status.status === 'error') {
    showNotification('Sync failed');
  }
});

// Pass to hook
const sync = useBackgroundSync({ eventBus: syncBus });
```

## API Reference

### Types

```ts
// Polling
type PollingOptions = {
  baseInterval?: number;      // Default: 5000
  maxInterval?: number;       // Default: 60000
  jitter?: boolean;           // Default: true
  pauseWhenOffline?: boolean; // Default: true
  enabled?: boolean;          // Default: true
  immediate?: boolean;        // Default: true
  onError?: (error: Error) => void;
};

type PollingState = {
  isPolling: boolean;
  isPaused: boolean;
  currentInterval: number;
  errorCount: number;
  lastError: Error | null;
};

// Background Sync
type BackgroundSyncOptions = {
  queueStore?: QueueStore<QueuedReq>; // Custom storage backend
  eventBus?: EventBus<ResilientResult>; // Status event publishing
  onSuccess?: (req: QueuedReq) => void;
  onError?: (req: QueuedReq, error: Error) => void;
  onRetry?: (req: QueuedReq, attempt: number, error: Error) => void;
  retry?: RetryPolicy;
  concurrency?: number;       // Default: 3 - parallel requests during flush
  debug?: boolean | ((msg: string, data?: unknown) => void);
  maxQueueSize?: number;      // Max queue items (default: unlimited)
  onQueueFull?: 'drop-oldest' | 'reject'; // Default: 'drop-oldest'
};

type BackgroundSyncResult = {
  status: ResilientResult;
  enqueue: (url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>;
  flush: () => Promise<FlushResult>;
  abortFlush: () => void;     // Cancel current flush operation
  getQueueSize: () => Promise<number>;
  clearQueue: () => Promise<void>;
};

type RetryPolicy = {
  maxRetries?: number;        // Default: 3
  retryDelay?: (attempt: number) => number;
  shouldRetry?: (error: Error, req: QueuedReq) => boolean;
};

type FlushResult = {
  succeeded: number;
  failed: number;
  pending: number;
  errors: FailedRequest[];
};

// Network
type NetworkInfo = {
  online: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;  // Mbps
  rtt?: number;       // ms
  saveData?: boolean;
};
```

## Browser Support

- Chrome 61+
- Firefox 57+
- Safari 14+
- Edge 79+

Network Information API is only available in Chromium browsers. Other browsers will use fallback behavior (always use base interval / high quality).

## License

MIT
