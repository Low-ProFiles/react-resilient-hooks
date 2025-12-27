'use client';

import { UseConnectionAwarePollingDemo } from '../../../../components/demos/UseConnectionAwarePollingDemo';

export default function UseConnectionAwarePollingPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">useAdaptivePolling</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Smart polling that adapts its frequency based on network conditions and automatically pauses when offline.
      </p>

      {/* Demo */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
        <div className="border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-900">
          <UseConnectionAwarePollingDemo />
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
          <code>{`import { useAdaptivePolling } from 'react-resilient-hooks';

function MyComponent() {
  const fetchData = async () => {
    const response = await fetch('/api/data');
    return response.json();
  };

  const { isPolling, errorCount, pause, resume } = useAdaptivePolling(
    fetchData,
    {
      baseInterval: 5000,
      maxInterval: 30000,
      jitter: true,
      pauseWhenOffline: true,
    }
  );

  return (
    <div>
      <p>Status: {isPolling ? 'Polling' : 'Paused'}</p>
      <p>Errors: {errorCount}</p>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
    </div>
  );
}`}</code>
        </pre>
      </section>

      {/* API */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">API</h2>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Parameters</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">fetchFn</code>
              <span className="text-gray-500 ml-2">{'() => Promise<void>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The async function to call on each poll interval.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">options</code>
              <span className="text-gray-500 ml-2">PollingOptions</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configuration options for the polling behavior.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Options</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">baseInterval</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Base polling interval in milliseconds (used on 4G/WiFi).
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">maxInterval?</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Maximum interval cap in milliseconds. Defaults to baseInterval * 6.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">jitter?</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add random jitter to prevent thundering herd. Defaults to false.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">pauseWhenOffline?</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automatically pause polling when offline. Defaults to true.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Returns</h3>
          <div className="space-y-4">
            <div>
              <code className="text-green-600 dark:text-green-400">isPolling</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Whether polling is currently active.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">errorCount</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Number of consecutive errors that have occurred.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">pause</code>
              <span className="text-gray-500 ml-2">{'() => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Function to manually pause polling.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">resume</code>
              <span className="text-gray-500 ml-2">{'() => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Function to manually resume polling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            The hook dynamically adjusts polling intervals based on network conditions:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
            <li><strong>4G / WiFi:</strong> Uses the base interval (e.g., 5s)</li>
            <li><strong>3G:</strong> Doubles the interval (e.g., 10s)</li>
            <li><strong>2G:</strong> Triples the interval (e.g., 15s)</li>
            <li><strong>Offline:</strong> Pauses polling entirely</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            When jitter is enabled, a random delay of 0-20% is added to prevent multiple clients from polling at the exact same time (thundering herd problem).
          </p>
        </div>
      </section>
    </div>
  );
}
