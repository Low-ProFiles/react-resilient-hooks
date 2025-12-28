import Link from 'next/link';

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Getting Started</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Get up and running with @resilient in just a few minutes.
      </p>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Installation</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
          <code>npm install react-resilient-hooks</code>
        </pre>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Or with yarn: <code className="text-blue-600">yarn add react-resilient-hooks</code>
        </p>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No configuration needed. Just import and use the hooks directly in your components:
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { useNetworkStatus, useAdaptiveImage } from 'react-resilient-hooks';

function MyComponent() {
  const { data: network } = useNetworkStatus();

  const imageUrl = useAdaptiveImage({
    low: '/images/hero-small.jpg',
    medium: '/images/hero-medium.jpg',
    high: '/images/hero-large.jpg',
  });

  return (
    <div>
      <p>Connection: {network?.effectiveType || 'Unknown'}</p>
      <img src={imageUrl} alt="Adaptive hero" />
    </div>
  );
}`}</code>
        </pre>
      </section>

      {/* Examples */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>

        {/* Adaptive Images */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">1. Adaptive Image Loading</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Serve different image qualities based on network speed:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
            <code>{`import { useAdaptiveImage } from 'react-resilient-hooks';

function ProductImage({ product }) {
  const src = useAdaptiveImage({
    low: product.thumbnail,    // 150px - for 2G
    medium: product.image,     // 300px - for 3G
    high: product.largeImage,  // 600px - for 4G/WiFi
  });

  return <img src={src} alt={product.name} />;
}`}</code>
          </pre>
        </div>

        {/* Smart Polling */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">2. Connection-Aware Polling</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Poll for updates less frequently on slow networks:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
            <code>{`import { useAdaptivePolling } from 'react-resilient-hooks';

function LivePrices() {
  const [prices, setPrices] = useState([]);

  const fetchPrices = async () => {
    const res = await fetch('/api/prices');
    setPrices(await res.json());
  };

  // Polls every 5s on 4G, 10s on 3G, 15s on 2G
  // Automatically pauses when offline
  useAdaptivePolling(fetchPrices, {
    baseInterval: 5000,
    pauseWhenOffline: true,
  });

  return <PriceList prices={prices} />;
}`}</code>
          </pre>
        </div>

        {/* Background Sync */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">3. Offline Form Submission</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Queue form submissions while offline, sync when back online:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
            <code>{`import { useBackgroundSync } from 'react-resilient-hooks';

function CommentForm() {
  const { enqueue, isFlushing, queueSize } = useBackgroundSync({
    onSuccess: (req) => toast.success('Comment posted!'),
    onError: (req, err) => toast.error('Failed to post comment'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await enqueue({
      id: crypto.randomUUID(),
      url: '/api/comments',
      options: {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="comment" />
      <button type="submit">
        Post {queueSize > 0 && \`(\${queueSize} pending)\`}
      </button>
    </form>
  );
}`}</code>
          </pre>
        </div>
      </section>

      {/* TypeScript */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">TypeScript Support</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          All hooks come with full TypeScript support out of the box:
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import type { NetworkStatus } from 'react-resilient-hooks';

// NetworkStatus type includes:
interface NetworkStatus {
  online: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}`}</code>
        </pre>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="grid gap-4">
          <Link
            href="/docs/hooks/use-adaptive-image"
            className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
              useAdaptiveImage
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn about network-aware image loading
            </p>
          </Link>
          <Link
            href="/docs/hooks/use-adaptive-polling"
            className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
              useAdaptivePolling
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set up smart polling for your application
            </p>
          </Link>
          <Link
            href="/docs/hooks/use-background-sync"
            className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              useBackgroundSync
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Implement offline-first data syncing
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
