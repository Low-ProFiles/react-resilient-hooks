import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Introduction</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        @resilient is a focused set of React hooks for building applications that work gracefully on unreliable networks.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Why @resilient?</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            Modern web applications often assume a stable internet connection. But in the real world, users face:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
            <li>Slow or intermittent connections (2G, 3G)</li>
            <li>Sudden loss of connectivity</li>
            <li>High latency environments</li>
            <li>Data-conscious users who want to minimize usage</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            @resilient provides battle-tested patterns to handle these scenarios elegantly.
          </p>
        </div>
      </section>

      {/* Core Hooks */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Core Hooks</h2>
        <div className="grid gap-4">
          <Link href="/docs/hooks/use-adaptive-image" className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">useAdaptiveImage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically select image quality based on network conditions
            </p>
          </Link>
          <Link href="/docs/hooks/use-adaptive-polling" className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">useAdaptivePolling</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart polling that adapts to network speed and pauses when offline
            </p>
          </Link>
          <Link href="/docs/hooks/use-background-sync" className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">useBackgroundSync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Queue requests offline and sync when connectivity returns
            </p>
          </Link>
          <Link href="/docs/hooks/use-network-status" className="block p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-1">useNetworkStatus</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time network information (connection type, speed, online status)
            </p>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <h3 className="font-semibold mb-1">TypeScript First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full type safety with comprehensive type definitions
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <h3 className="font-semibold mb-1">Zero Dependencies</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Minimal bundle size, no external runtime dependencies
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <h3 className="font-semibold mb-1">SSR Safe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Works seamlessly with Next.js and other SSR frameworks
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <h3 className="font-semibold mb-1">IndexedDB Persistence</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Offline queue persists across page reloads
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next Steps</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Ready to get started? Follow our quick setup guide.
          </p>
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Getting Started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
