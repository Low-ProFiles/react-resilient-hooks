'use client';

import { useNetworkStatus } from 'react-resilient-hooks';

function NetworkStatusDemo() {
  const { data: network } = useNetworkStatus();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${network?.online ? 'bg-green-500' : 'bg-red-500'}`} />
          <p className={`font-semibold ${network?.online ? 'text-green-600' : 'text-red-600'}`}>
            {network?.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connection</p>
        <p className="font-semibold">{network?.effectiveType?.toUpperCase() || 'Unknown'}</p>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Downlink</p>
        <p className="font-semibold">{network?.downlink ? `${network.downlink} Mbps` : 'N/A'}</p>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">RTT</p>
        <p className="font-semibold">{network?.rtt ? `${network.rtt}ms` : 'N/A'}</p>
      </div>
    </div>
  );
}

export default function UseNetworkStatusPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">useNetworkStatus</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Subscribe to real-time network status changes including connection type, speed, and online/offline state.
      </p>

      {/* Demo */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
        <div className="border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-900">
          <NetworkStatusDemo />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Try throttling your network in DevTools to see the values change in real-time.
          </p>
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Installation</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
          <code>npm install react-resilient-hooks</code>
        </pre>
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { useNetworkStatus } from 'react-resilient-hooks';

function MyComponent() {
  const { data: network } = useNetworkStatus();

  if (!network?.online) {
    return <div>You are offline</div>;
  }

  return (
    <div>
      <p>Connection: {network.effectiveType}</p>
      <p>Speed: {network.downlink} Mbps</p>
      <p>Latency: {network.rtt}ms</p>
    </div>
  );
}`}</code>
        </pre>
      </section>

      {/* API */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">API</h2>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Returns</h3>
          <div className="space-y-4">
            <div>
              <code className="text-green-600 dark:text-green-400">data</code>
              <span className="text-gray-500 ml-2">NetworkStatus | undefined</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current network status information.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">NetworkStatus Properties</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">online</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Whether the browser is currently online.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">effectiveType</code>
              <span className="text-gray-500 ml-2">&apos;slow-2g&apos; | &apos;2g&apos; | &apos;3g&apos; | &apos;4g&apos;</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Effective connection type based on measured network performance.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">downlink</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estimated downlink speed in Mbps.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">rtt</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estimated round-trip time in milliseconds.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">saveData</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Whether the user has enabled data saver mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Support */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Browser Support</h2>
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            The Network Information API is currently only supported in Chromium-based browsers (Chrome, Edge, Opera).
            In unsupported browsers, <code>effectiveType</code>, <code>downlink</code>, and <code>rtt</code> will be undefined,
            but <code>online</code> will still work correctly.
          </p>
        </div>
      </section>
    </div>
  );
}
