# React Resilient Hooks

A set of React hooks designed to handle unreliable network, offline caching, background sync, adaptive polling, and connection-aware tasks.

## Features

- `useNetworkStatus` : Track online/offline status
- `useOnline`: Get a boolean value indicating whether the user is online or offline.
- `useRetryRequest` : Automatic request retry with exponential backoff
- `useBackgroundSync` : Queue network requests for later execution with IndexedDB or LocalStorage, optionally integrated with Service Worker
- `useOfflineCache` : Cache API results offline with TTL and sensitive data redaction
- `useAdaptiveImage` : Load images adaptively based on network speed
- `useConnectionAwarePolling` : Poll data intelligently based on network quality
- `useQueue` : Simple FIFO/LIFO queue utility
- `useWebsocket`: Resilient WebSocket connection.

## Getting Started

To use this library, you need to wrap your application with the `ResilientProvider`.

```javascript
import { ResilientProvider } from 'react-resilient-hooks';

function App() {
  return (
    <ResilientProvider storageType="encrypted-local" passphrase="your-secret-passphrase">
      {/* Your application code here */}
    </ResilientProvider>
  );
}
```

## Development (Monorepo)

This project is a monorepo managed with npm workspaces. The packages are located in the `packages` directory.

-   `packages/hooks`: The main `react-resilient-hooks` library code.
-   `packages/landing`: The Next.js landing page for the project.

### Running the Landing Page

To run the landing page for local development:

1.  **Navigate to the project root directory.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev --workspace=react-resilient-hooks-landing
    ```
    This will start the landing page on `http://localhost:3000`.

## Installation

```bash
npm install react-resilient-hooks
```

## Usage Examples

### 1. useNetworkStatus
`useNetworkStatus` tracks the user's online/offline status.

```javascript
import { useNetworkStatus } from "react-resilient-hooks"

function StatusIndicator() {
  const { data: networkStatus } = useNetworkStatus()
  return <div>{networkStatus?.online ? "Online" : "Offline"}</div>
}
```

**Options**: none

### 2. useOnline
`useOnline` returns a boolean value indicating whether the user is online or offline.

```javascript
import { useOnline } from "react-resilient-hooks"

function StatusIndicator() {
  const isOnline = useOnline()
  return <div>{isOnline ? "Online" : "Offline"}</div>
}
```

**Options**: none

### 3. useRetryRequest
`useRetryRequest` automatically retries a failed fetch request with exponential backoff.

```javascript
import { useRetryRequest } from "react-resilient-hooks"

function DataComponent() {
  const { data, error, loading, retry } = useRetryRequest("/api/data", {}, { retries: 3 });

  if (loading) return <p>Loading...</p>;
  if (error) return <button onClick={retry}>Retry</button>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

**Options**:
- `retries` (number): max retry attempts, default `3`
- `retryDelay` (number): initial delay in ms, default `1000`
- `backoff` ("fixed" | "exponential"): backoff strategy, default `"exponential"`

### 4. useBackgroundSync
`useBackgroundSync` queues failed requests and syncs them when the network is back online. It can be integrated with a Service Worker for background synchronization.

```javascript
import { useBackgroundSync, registerServiceWorker } from "react-resilient-hooks"

// Register the service worker
await registerServiceWorker("/service-worker.js")

function Form() {
  const { enqueue, queue } = useBackgroundSync()

  const handleSubmit = async () => {
    try {
      await fetch("/api/submit", { method: "POST", body: JSON.stringify({ foo: "bar" }) })
    } catch {
      // Enqueue the request if it fails
      enqueue("/api/submit", { method: "POST", body: JSON.stringify({ foo: "bar" }) })
    }
  }

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      <p>Pending requests: {queue.length}</p>
    </div>
  )
}
```

**Options**:
- `redactKeys` (string[]): additional sensitive keys to redact from the request body, default `[]`
- `storeBody` (boolean): whether to store the request body in the queue, default `false`

### 5. useOfflineCache
`useOfflineCache` caches API responses and serves them when the user is offline.

```javascript
import { useOfflineCache } from "react-resilient-hooks"

function UserProfile() {
  const { data, loading, error } = useOfflineCache(
    "user_profile",
    () => fetch("/api/user").then(r => r.json()),
    { ttlMs: 60000, redactKeys: ["token"] }
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data.</p>;

  return <h1>Welcome, {data.name}</h1>;
}
```

**Options**:
- `ttlMs` (number): cache time-to-live in ms, default `3600000` (1 hour)
- `shouldCache` ((value: T) => boolean): a function to conditionally cache the response
- `redactKeys` (string[]): extra sensitive fields to redact from the cached data

### 6. useAdaptiveImage
`useAdaptiveImage` loads different image resolutions based on the network speed.

```javascript
import { useAdaptiveImage } from "react-resilient-hooks"

function ProfilePicture() {
  const imageUrl = useAdaptiveImage({
    low: "/images/profile-low.jpg",
    medium: "/images/profile-medium.jpg",
    high: "/images/profile-high.jpg"
  });

  return <img src={imageUrl} alt="Profile" />;
}
```

**Options**:
- `low`, `medium`, `high`: URLs for each network quality. The hook automatically switches based on the effective network connection type.

### 7. useConnectionAwarePolling
`useConnectionAwarePolling` adjusts the polling interval based on the network conditions.

```javascript
import { useConnectionAwarePolling } from "react-resilient-hooks"
import { useState } from "react"

function Notifications() {
  const [count, setCount] = useState(0);

  useConnectionAwarePolling(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setCount(data.count);
  }, { baseInterval: 5000 });

  return <p>Notifications: {count}</p>;
}
```

**Options**:
- `baseInterval` (number): polling interval in ms, default `5000`
- `maxInterval` (number): maximum polling interval in ms, default `60000`
- `jitter` (boolean): whether to add a random jitter to the interval, default `true`

### 8. useQueue
`useQueue` provides a simple client-side queue.

```javascript
import { useQueue } from "react-resilient-hooks"

function TaskQueue() {
  const { queue, enqueue, dequeue, peek } = useQueue<string>()

  return (
    <div>
      <button onClick={() => enqueue("Task " + (queue.length + 1))}>Add Task</button>
      <button onClick={dequeue}>Process Next</button>
      <p>Next Task: {peek()}</p>
      <p>Queue: {queue.join(", ")}</p>
    </div>
  )
}
```

**Options**: none

### 9. useWebsocket
`useWebsocket` provides a resilient WebSocket connection.

```javascript
import { useWebsocket } from "react-resilient-hooks"

function Chat() {
  const { messages, error, sendMessage } = useWebsocket("wss://echo.websocket.org");

  return (
    <div>
      <ul>
        {messages.map((message, i) => <li key={i}>{message}</li>)}
      </ul>
      <input type="text" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }} />
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Security Notes

- Sensitive data such as passwords and tokens are redacted by default when persisted.
- Use `EncryptedLocalStorageProvider` for client-side encryption of `localStorage`.
- HTTPS and `HttpOnly` cookies are recommended for authentication tokens.
- Avoid storing sensitive data in plain `IndexedDB` or `LocalStorage`.

## Background Sync

- Works with browsers supporting the Service Worker Background Sync API.
- Enqueued requests are flushed automatically when network connectivity is restored.
- If background sync is not supported, the hook falls back to flushing when the browser is online.
- The queue is persisted in `IndexedDB` or `LocalStorage`.

## Performance

This library is designed to be lightweight and performant. The hooks are only active when they are used, and they are designed to minimize their impact on your application's performance.

Here are some benchmarks:

| Hook | Description | Performance Impact |
| --- | --- | --- |
| `useNetworkStatus` | Tracks the user's online/offline status | Low |
| `useOnline` | Returns a boolean value indicating whether the user is online or offline | Low |
| `useRetryRequest` | Automatically retries a failed fetch request | Medium |
| `useBackgroundSync` | Queues failed requests and syncs them when the network is back online | Medium |
| `useOfflineCache` | Caches API responses and serves them when the user is offline | Medium |
| `useAdaptiveImage` | Loads different image resolutions based on the network speed | Low |
| `useConnectionAwarePolling` | Adjusts the polling interval based on the network conditions | Low |
| `useQueue` | Provides a simple client-side queue | Low |
| `useWebsocket` | Provides a resilient WebSocket connection | Medium |

## Contribution

PRs, suggestions, and issues are welcome. Use TypeScript for new hooks and maintain SOLID principles.

## License

MIT