'use client';

import Link from 'next/link';
import { useI18n } from '../contexts/I18nProvider';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold">{t.home.title}</h1>
        <p className="text-xl text-gray-600 mt-6 max-w-2xl">
          {t.home.description}
        </p>
        <Link href="/hooks/useOnline">
          <span className="inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-md mt-8 text-lg hover:bg-blue-600 transition-colors">
            {t.home.button}
          </span>
        </Link>
      </div>
    </main>
  );
}
