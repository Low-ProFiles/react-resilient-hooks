'use client';

import Link from 'next/link';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useNetworkStatus } from 'react-resilient-hooks';
import { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nProvider';

function NetworkStatusBadge() {
  const { data: network } = useNetworkStatus();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          network?.online ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'
        }`}
      />
      <span className="text-gray-600 dark:text-gray-300">
        {network?.online ? (
          <>
            {network.effectiveType?.toUpperCase() || 'Online'}
            {network.downlink && ` · ${network.downlink} Mbps`}
          </>
        ) : (
          'Offline'
        )}
      </span>
    </div>
  );
}

function AdaptiveImagePreview({ qualityLabel }: { qualityLabel: string }) {
  const { data: network } = useNetworkStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const getQuality = () => {
    if (!mounted || !network) return { label: 'High', color: 'bg-green-500', size: '600px' };
    const type = network.effectiveType;
    if (type?.includes('2g')) return { label: 'Low', color: 'bg-red-500', size: '150px' };
    if (type?.includes('3g')) return { label: 'Medium', color: 'bg-yellow-500', size: '300px' };
    return { label: 'High', color: 'bg-green-500', size: '600px' };
  };

  const quality = getQuality();

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950 rounded-2xl p-6 h-full">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${quality.color}`} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {quality.label} {qualityLabel}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center h-full pt-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {quality.size}
        </div>
      </div>
    </div>
  );
}

function PollingPreview({ intervalLabel }: { intervalLabel: string }) {
  const [count, setCount] = useState(0);
  const [interval, setIntervalMs] = useState(5000);
  const { data: network } = useNetworkStatus();

  useEffect(() => {
    const type = network?.effectiveType;
    if (type?.includes('2g')) setIntervalMs(15000);
    else if (type?.includes('3g')) setIntervalMs(10000);
    else setIntervalMs(5000);
  }, [network]);

  useEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl p-6 h-full">
      <div className="absolute top-4 right-4">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {intervalLabel} {interval / 1000}s
        </span>
      </div>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-5xl md:text-6xl font-bold text-purple-600 dark:text-purple-400">
          {count}
        </div>
      </div>
    </div>
  );
}

function BackgroundSyncPreview({
  queueLabel,
  syncedLabel,
  addLabel,
  syncingLabel,
  queuingLabel
}: {
  queueLabel: string;
  syncedLabel: string;
  addLabel: string;
  syncingLabel: string;
  queuingLabel: string;
}) {
  const [queue, setQueue] = useState<string[]>([]);
  const [synced, setSynced] = useState<string[]>([]);
  const { data: network } = useNetworkStatus();

  const addToQueue = () => {
    const item = `#${queue.length + synced.length + 1}`;
    setQueue(q => [...q, item]);
  };

  useEffect(() => {
    if (network?.online && queue.length > 0) {
      const timer = setTimeout(() => {
        setSynced(s => [...s, queue[0]]);
        setQueue(q => q.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [network?.online, queue]);

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-2xl p-6 h-full">
      <div className="absolute top-4 right-4">
        <span className={`text-xs font-medium ${network?.online ? 'text-green-600' : 'text-red-600'}`}>
          {network?.online ? syncingLabel : queuingLabel}
        </span>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{queueLabel} ({queue.length})</p>
            <div className="space-y-1 max-h-20 overflow-hidden">
              {queue.slice(0, 3).map((item, i) => (
                <div key={i} className="text-xs bg-amber-200 dark:bg-amber-800 rounded px-2 py-1 truncate">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{syncedLabel} ({synced.length})</p>
            <div className="space-y-1 max-h-20 overflow-hidden">
              {synced.slice(-3).map((item, i) => (
                <div key={i} className="text-xs bg-green-200 dark:bg-green-800 rounded px-2 py-1 truncate">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={addToQueue}
          className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  learnMore,
  children
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  learnMore: string;
  children: React.ReactNode;
}) {
  return (
    <div className="feature-card bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="h-48 px-4 pb-4">
        {children}
      </div>
      <div className="px-6 pb-6">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {learnMore}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, locale } = useI18n();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold gradient-text">Resilient</span>
            <NetworkStatusBadge />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs/getting-started"
              className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ko' ? '문서' : 'Docs'}
            </Link>
            <a
              href="https://github.com/Low-ProFiles/react-resilient-hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            v1.0 - {locale === 'ko' ? '핵심에 집중 & 경량' : 'Focused & Lightweight'}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            {t.home.title}{' '}
            <span className="gradient-text">{t.home.subtitle}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.home.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              {t.home.getStarted}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://www.npmjs.com/package/react-resilient-hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
            >
              <code className="text-sm">npm i react-resilient-hooks</code>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              title={t.features.useAdaptiveImage.title}
              description={t.features.useAdaptiveImage.description}
              icon="🖼️"
              href="/docs/hooks/use-adaptive-image"
              learnMore={locale === 'ko' ? '자세히 보기' : 'Learn more'}
            >
              <AdaptiveImagePreview qualityLabel={locale === 'ko' ? '품질' : 'Quality'} />
            </FeatureCard>

            <FeatureCard
              title={t.features.useConnectionAwarePolling.title}
              description={t.features.useConnectionAwarePolling.description}
              icon="🔄"
              href="/docs/hooks/use-connection-aware-polling"
              learnMore={locale === 'ko' ? '자세히 보기' : 'Learn more'}
            >
              <PollingPreview intervalLabel={locale === 'ko' ? '주기:' : 'Every'} />
            </FeatureCard>

            <FeatureCard
              title={t.features.useBackgroundSync.title}
              description={t.features.useBackgroundSync.description}
              icon="📤"
              href="/docs/hooks/use-background-sync"
              learnMore={locale === 'ko' ? '자세히 보기' : 'Learn more'}
            >
              <BackgroundSyncPreview
                queueLabel={locale === 'ko' ? '대기열' : 'Queue'}
                syncedLabel={locale === 'ko' ? '완료' : 'Synced'}
                addLabel={locale === 'ko' ? '요청 추가' : 'Add Request'}
                syncingLabel={locale === 'ko' ? '동기화 중' : 'Syncing'}
                queuingLabel={locale === 'ko' ? '큐잉 중' : 'Queuing'}
              />
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            {t.why.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.why.items.focused.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.why.items.focused.description}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📝</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.why.items.typescript.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.why.items.typescript.description}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🪶</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.why.items.lightweight.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.why.items.lightweight.description}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💾</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.why.items.offline.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.why.items.offline.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t.cta.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t.cta.description}
          </p>
          <div className="bg-gray-900 dark:bg-black rounded-xl p-4 font-mono text-sm text-left overflow-x-auto mb-6">
            <code className="text-green-400">npm install</code>
            <code className="text-white"> react-resilient-hooks react-resilient-hooks</code>
          </div>
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            {t.cta.button}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-gray-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>{locale === 'ko' ? 'MIT 라이선스 · 불안정한 네트워크를 위해 제작됨' : 'MIT License · Built for unreliable networks'}</p>
          <div className="flex gap-6">
            <Link href="/docs/getting-started" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {locale === 'ko' ? '문서' : 'Docs'}
            </Link>
            <a
              href="https://github.com/Low-ProFiles/react-resilient-hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
