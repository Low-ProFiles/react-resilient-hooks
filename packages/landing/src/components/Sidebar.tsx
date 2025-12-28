'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Introduction', href: '/docs' },
  { label: 'Getting Started', href: '/docs/getting-started' },
  {
    label: 'Hooks',
    children: [
      { label: 'useAdaptiveImage', href: '/docs/hooks/use-adaptive-image' },
      { label: 'useAdaptivePolling', href: '/docs/hooks/use-adaptive-polling' },
      { label: 'useBackgroundSync', href: '/docs/hooks/use-background-sync' },
      { label: 'useNetworkStatus', href: '/docs/hooks/use-network-status' },
    ],
  },
  {
    label: 'Core',
    children: [
      { label: 'Queue Stores', href: '/docs/core/stores' },
    ],
  },
];

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = item.href === pathname;

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="mt-4 first:mt-0">
      <span
        className="block px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {item.label}
      </span>
      {item.children && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <NavLink key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 h-full overflow-y-auto">
      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
};
