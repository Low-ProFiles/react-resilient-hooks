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
          <code>npm install react-resilient-hooks react-resilient-hooks</code>
        </pre>
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { useBackgroundSync } from 'react-resilient-hooks';

function MyComponent() {
  const { enqueue, flush, isFlushing, queueSize } = useBackgroundSync({
    onSuccess: (req) => console.log('Synced:', req.id),
    onError: (req, error) => console.error('Failed:', req.id, error),
  });

  const handleSubmit = async (data) => {
    await enqueue({
      id: crypto.randomUUID(),
      url: '/api/submit',
      options: {
        method: 'POST',
        body: JSON.stringify(data),
      },
    });
  };

  return (
    <div>
      <p>Queue size: {queueSize}</p>
      <p>Syncing: {isFlushing ? 'Yes' : 'No'}</p>
      <button onClick={() => handleSubmit({ message: 'Hello' })}>
        Submit
      </button>
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
              <span className="text-gray-500 ml-2">{'QueueStore<QueuedRequest>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Custom queue store implementation. Defaults to IndexedDBQueueStore for persistence.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onSuccess?</code>
              <span className="text-gray-500 ml-2">{'(request: QueuedRequest) => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Callback fired when a request is successfully synced.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">onError?</code>
              <span className="text-gray-500 ml-2">{'(request: QueuedRequest, error: Error) => void'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Callback fired when a request fails to sync.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Returns</h3>
          <div className="space-y-4">
            <div>
              <code className="text-green-600 dark:text-green-400">enqueue</code>
              <span className="text-gray-500 ml-2">{'(request: QueuedRequest) => Promise<void>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add a request to the queue.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">flush</code>
              <span className="text-gray-500 ml-2">{'() => Promise<void>'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manually trigger sync of all queued requests.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">isFlushing</code>
              <span className="text-gray-500 ml-2">boolean</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Whether the queue is currently being flushed.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">queueSize</code>
              <span className="text-gray-500 ml-2">number</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current number of requests in the queue.
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
            <li><strong>IndexedDBQueueStore (default):</strong> Persists across page reloads and browser restarts</li>
            <li><strong>MemoryQueueStore:</strong> Fast but volatile - lost on page reload</li>
          </ul>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm mt-4">
            <code>{`import { MemoryQueueStore } from 'react-resilient-hooks';

const { enqueue } = useBackgroundSync({
  queueStore: new MemoryQueueStore(),
});`}</code>
          </pre>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="prose dark:prose-invert max-w-none">
          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>When you call <code>enqueue()</code>, the request is stored in the queue</li>
            <li>If online, the queue is immediately flushed</li>
            <li>If offline, requests wait in the queue</li>
            <li>When connectivity is restored, all queued requests are automatically synced</li>
            <li>Failed requests are re-queued for later retry</li>
          </ol>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            This ensures no data is lost even when the user goes offline unexpectedly.
          </p>
        </div>
      </section>
    </div>
  );
}
