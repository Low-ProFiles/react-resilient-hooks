export default function StoresPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Queue Stores</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Pluggable storage backends for the background sync queue.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Queue stores provide the persistence layer for <code className="text-blue-600">useBackgroundSync</code>.
          You can choose between different implementations based on your needs.
        </p>
      </section>

      {/* IndexedDBQueueStore */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">IndexedDBQueueStore</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The default store. Persists data to IndexedDB, surviving page reloads and browser restarts.
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { IndexedDBQueueStore } from 'react-resilient-hooks';

const store = new IndexedDBQueueStore({
  dbName: 'my-app-queue',
  storeName: 'requests',
});`}</code>
        </pre>
        <div className="mt-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Best for:</strong> Production apps where data persistence is critical.
            Requests survive even if the user closes the browser.
          </p>
        </div>
      </section>

      {/* MemoryQueueStore */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">MemoryQueueStore</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          In-memory store for fast operations. Data is lost when the page is closed.
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { MemoryQueueStore } from 'react-resilient-hooks';

const store = new MemoryQueueStore();`}</code>
        </pre>
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Best for:</strong> Development, testing, or scenarios where persistence is not required.
          </p>
        </div>
      </section>

      {/* QueueStore Interface */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Custom Stores</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You can implement your own store by following the <code className="text-blue-600">QueueStore</code> interface:
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`interface QueueStore<T> {
  enqueue(item: T): Promise<void>;
  dequeue(): Promise<T | undefined>;
  peek(): Promise<T | undefined>;
  isEmpty(): Promise<boolean>;
  size(): Promise<number>;
}`}</code>
        </pre>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          This allows you to use any storage backend: localStorage, SQLite, a remote server, etc.
        </p>
      </section>

      {/* Usage with useBackgroundSync */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Usage with useBackgroundSync</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { useBackgroundSync } from 'react-resilient-hooks';
import { IndexedDBQueueStore } from 'react-resilient-hooks';

const customStore = new IndexedDBQueueStore({
  dbName: 'my-custom-db',
  storeName: 'sync-queue',
});

function MyComponent() {
  const { enqueue, flush } = useBackgroundSync({
    queueStore: customStore,
  });

  // ...
}`}</code>
        </pre>
      </section>
    </div>
  );
}
