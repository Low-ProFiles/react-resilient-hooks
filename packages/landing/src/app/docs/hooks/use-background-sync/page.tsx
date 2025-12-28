'use client';

import { UseBackgroundSyncDemo } from '../../../../components/demos/UseBackgroundSyncDemo';

export default function UseBackgroundSyncPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">useBackgroundSync</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Queue requests while offline and automatically sync them when connectivity is restored.
      </p>

      {/* Demo */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
        <div className="border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-900">
          <UseBackgroundSyncDemo />
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
          <code>{`import { useBackgroundSync } from 'react-resilient-hooks';

function MyComponent() {
  const { status, enqueue, flush, abortFlush, getQueueSize } = useBackgroundSync({
    onSuccess: (req) => console.log('Synced:', req.id),
    onError: (req, error) => console.error('Failed:', req.id, error),
    onRetry: (req, attempt) => console.log(\`Retry #\${attempt}\`, req.url),
    retry: {
      maxRetries: 5,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
    concurrency: 3,
    maxQueueSize: 100,
    onQueueFull: 'drop-oldest',
  });

  const handleSubmit = async (data) => {
    try {
      await fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      // Queue for later if network fails
      await enqueue('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  };

  const isSyncing = status.status === 'loading';

  return (
    <div>
      <p>Status: {status.status}</p>
      <button onClick={() => handleSubmit({ message: 'Hello' })}>Submit</button>
      <button onClick={flush} disabled={isSyncing}>Flush</button>
      {isSyncing && <button onClick={abortFlush}>Abort</button>}
    </div>
  );
}`}</code>
        </pre>
      </section>

      {/* API */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">API</h2>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Options</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">queueStore?</code>
              <span className="text-gray-500 ml-2">{'QueueStore<QueuedReq>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Custom queue store implementation. Defaults to IndexedDBQueueStore for persistence.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onSuccess?</code>
              <span className="text-gray-500 ml-2">{'(req: QueuedReq) => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Callback fired when a request is successfully synced.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onError?</code>
              <span className="text-gray-500 ml-2">{'(req: QueuedReq, error: Error) => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Callback fired when a request fails after all retries.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onRetry?</code>
              <span className="text-gray-500 ml-2">{'(req: QueuedReq, attempt: number, error: Error) => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Callback fired when a request is being retried.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">retry?</code>
              <span className="text-gray-500 ml-2">{'RetryPolicy'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Retry configuration: maxRetries (default: 3), retryDelay, shouldRetry.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">concurrency?</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Number of concurrent requests during flush (default: 3).
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">maxQueueSize?</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Maximum number of items in queue (default: unlimited).
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onQueueFull?</code>
              <span className="text-gray-500 ml-2">{`'drop-oldest' | 'reject'`}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Behavior when queue is full (default: drop-oldest).
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">debug?</code>
              <span className="text-gray-500 ml-2">{'boolean | ((msg: string, data?: unknown) => void)'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Enable debug logging or provide custom logger.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Returns</h3>
          <div className="space-y-4">
            <div>
              <code className="text-green-600 dark:text-green-400">status</code>
              <span className="text-gray-500 ml-2">ResilientResult</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current sync status: idle, loading, success, or error.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">enqueue</code>
              <span className="text-gray-500 ml-2">
                {'(url: string, options?: RequestInit, meta?: Record<string, unknown>) => Promise<string>'}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add a request to the queue. Returns the request ID.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">flush</code>
              <span className="text-gray-500 ml-2">{'() => Promise<FlushResult>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manually trigger sync. Returns succeeded/failed/pending counts.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">abortFlush</code>
              <span className="text-gray-500 ml-2">{'() => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cancel the current flush operation.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">getQueueSize</code>
              <span className="text-gray-500 ml-2">{'() => Promise<number>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get current number of requests in the queue.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">clearQueue</code>
              <span className="text-gray-500 ml-2">{'() => Promise<void>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Clear all queued requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Queue Store */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Queue Stores</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            The hook supports different storage backends for the request queue:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
            <li>
              <strong>IndexedDBQueueStore (default):</strong> Persists across page reloads and
              browser restarts
            </li>
            <li>
              <strong>MemoryQueueStore:</strong> Fast but volatile - lost on page reload
            </li>
          </ul>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm mt-4">
            <code>{`import { MemoryQueueStore } from 'react-resilient-hooks';

const { enqueue } = useBackgroundSync({
  queueStore: new MemoryQueueStore(),
});`}</code>
          </pre>
        </div>
      </section>

      {/* Flush Result */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Flush Result</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`const result = await flush();
// {
//   succeeded: 5,   // Successfully synced
//   failed: 1,      // Failed after all retries
//   pending: 2,     // Still in queue (added during flush)
//   errors: [{ req, error, statusCode, attempts }]
// }`}</code>
        </pre>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="prose dark:prose-invert max-w-none">
          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>
              When you call <code>enqueue()</code>, the request is stored in IndexedDB
            </li>
            <li>When connectivity is restored, queued requests are automatically flushed</li>
            <li>Requests are processed in parallel (configurable concurrency)</li>
            <li>Failed requests are retried with exponential backoff</li>
            <li>After max retries, failed requests are reported in the flush result</li>
            <li>You can abort a flush in progress with <code>abortFlush()</code></li>
          </ol>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            This ensures no data is lost even when the user goes offline unexpectedly.
          </p>
        </div>
      </section>
    </div>
  );
}
