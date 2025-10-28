'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../contexts/I18nProvider';

export const Sidebar = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const hooks = Object.keys(t.hooks);

  return (
    <aside className="w-full md:w-64 p-4 border-r h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Hooks</h2>
      <nav>
        <ul>
          {hooks.map((hookKey) => {
            const href = `/hooks/${hookKey}`;
            const isActive = pathname === href;
            return (
              <li key={hookKey} className="mb-2">
                <Link href={href}>
                  <span
                    className={`block p-2 rounded-md text-sm ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {t.hooks[hookKey].title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
