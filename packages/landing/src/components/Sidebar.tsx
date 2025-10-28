import Link from 'next/link';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <nav>
        <ul>
          <li>
            <Link href="/docs">Introduction</Link>
          </li>
          <li>
            <Link href="/docs/getting-started">Getting Started</Link>
          </li>
          <li>
            <span className="font-bold">Core</span>
            <ul>
              <li>
                <Link href="/docs/core/policies">Policies</Link>
              </li>
              <li>
                <Link href="/docs/core/stores">Stores</Link>
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold">Utils</span>
            <ul>
              <li>
                <Link href="/docs/utils/use-retry">useRetry</Link>
              </li>
              <li>
                <Link href="/docs/utils/use-offline-cache">useOfflineCache</Link>
              </li>
              <li>
                <Link href="/docs/utils/use-background-sync">useBackgroundSync</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
