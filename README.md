# React Resilient Hooks

A lightweight set of React hooks designed for building resilient applications that handle unreliable networks gracefully.

## Features

- **useNetworkStatus** - Track online/offline status and connection quality
- **useAdaptiveImage** - Load images adaptively based on network speed
- **useAdaptivePolling** - Smart polling with pause/resume controls
- **useBackgroundSync** - Queue failed requests for later execution

## Installation

```bash
npm install react-resilient-hooks
```

## Usage Examples

### 1. useNetworkStatus

Track the user's network status including online/offline state and connection quality.

```tsx
import { useNetworkStatus } from 'react-resilient-hooks';

function NetworkIndicator() {
  const { data: network } = useNetworkStatus();

  return (
    <div>
      <p>Status: {network?.online ? 'Online' : 'Offline'}</p>
      <p>Connection: {network?.effectiveType}</p>
      <p>Speed: {network?.downlink} Mbps</p>
    </div>
  );
}
```

**Returns:**
- `data.online` (boolean): Whether the user is online
- `data.effectiveType` (string): Connection type ('4g', '3g', '2g', 'slow-2g')
- `data.downlink` (number): Estimated downlink speed in Mbps

---

### 2. useAdaptiveImage

Automatically select the optimal image quality based on network conditions.

```tsx
import { useAdaptiveImage } from 'react-resilient-hooks';

function ProfilePicture() {
  const { src, quality } = useAdaptiveImage({
    low: '/images/profile-150.jpg',
    medium: '/images/profile-300.jpg',
    high: '/images/profile-600.jpg',
  });

  return (
    <div>
      <img src={src} alt="Profile" />
      <p>Current quality: {quality}</p>
    </div>
  );
}
```

**Parameters:**
- `sources` - Object with `low`, `medium` (optional), and `high` image URLs

**Options:**
- `ssrDefault` ('low' | 'medium' | 'high'): Default quality during SSR (default: 'high')
- `thresholds` ({ low: number, medium: number }): Custom downlink thresholds in Mbps

**Returns:**
- `src` (string): The selected image URL
- `quality` ('low' | 'medium' | 'high'): The quality level selected

---

### 3. useAdaptivePolling

Smart polling that adapts interval based on network conditions with manual controls.

```tsx
import { useAdaptivePolling } from 'react-resilient-hooks';
import { useState } from 'react';

function Notifications() {
  const [count, setCount] = useState(0);

  const { state, pause, resume, triggerNow } = useAdaptivePolling(
    async () => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setCount(data.count);
    },
    { baseInterval: 5000 }
  );

  return (
    <div>
      <p>Notifications: {count}</p>
      <p>Status: {state.isPolling ? 'Polling' : 'Paused'}</p>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={triggerNow}>Fetch Now</button>
    </div>
  );
}
```

**Options:**
- `baseInterval` (number): Base polling interval in ms (default: 5000)
- `maxInterval` (number): Maximum polling interval in ms (default: 60000)
- `jitter` (boolean): Add random jitter to prevent thundering herd (default: true)
- `pauseWhenOffline` (boolean): Pause polling when offline (default: true)
- `enabled` (boolean): Start polling immediately (default: true)

**Returns:**
- `state.isPolling` (boolean): Whether polling is active
- `state.isPaused` (boolean): Whether polling is manually paused
- `state.currentInterval` (number): Current interval in ms
- `state.errorCount` (number): Consecutive error count
- `pause` (() => void): Pause polling
- `resume` (() => void): Resume polling
- `triggerNow` (() => Promise<void>): Immediately trigger the callback

---

### 4. useBackgroundSync

Queue failed requests and sync them when the network is back online.

```tsx
import { useBackgroundSync } from 'react-resilient-hooks';

function Form() {
  const { status, enqueue, flush } = useBackgroundSync({
    onSuccess: (req) => console.log('Synced:', req.id),
    onError: (req, error) => console.error('Failed:', req.id, error),
  });

  const handleSubmit = async () => {
    await enqueue(
      '/api/submit',
      { method: 'POST', body: JSON.stringify({ data: 'value' }) }
    );
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={flush}>Sync Now</button>
      <p>Status: {status.status}</p>
    </div>
  );
}
```

**Options:**
- `queueStore` (QueueStore): Custom queue store (default: IndexedDBQueueStore)
- `onSuccess` ((req) => void): Callback when a request succeeds
- `onError` ((req, error) => void): Callback when a request fails

**Returns:**
- `status` (ResilientResult): Current sync status ('idle', 'loading', 'success', 'error')
- `enqueue` ((url, options?, meta?) => Promise<string>): Add a request to the queue
- `flush` (() => Promise<void>): Manually trigger sync

---

## Advanced Usage

### Custom Queue Stores

```tsx
import { useBackgroundSync, MemoryQueueStore } from 'react-resilient-hooks';

// Use in-memory store instead of IndexedDB
const memoryStore = new MemoryQueueStore();

function MyComponent() {
  const { enqueue } = useBackgroundSync({ queueStore: memoryStore });
  // ...
}
```

### Service Worker Integration

```tsx
import { registerServiceWorker } from 'react-resilient-hooks';

// Register service worker for true background sync
await registerServiceWorker('/sw.js');
```

## Development

This is a monorepo managed with npm workspaces.

```bash
# Install dependencies
npm install

# Build the package
npm run build --workspace=react-resilient-hooks

# Run the landing page
npm run dev --workspace=react-resilient-hooks-landing
```

## License

MIT
