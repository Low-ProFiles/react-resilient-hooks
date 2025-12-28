'use client';

import { useAdaptivePolling, useNetworkStatus } from 'react-resilient-hooks';
import { useState } from 'react';

export function UseAdaptivePollingDemo() {
  const { data: network } = useNetworkStatus();
  const [data, setData] = useState<number | null>(null);
  const [history, setHistory] = useState<{ value: number; time: string }[]>([]);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new'
      );
      const result = await response.text();
      const value = parseInt(result, 10);
      setData(value);
      setFetchCount(c => c + 1);
      setHistory(prev => [
        { value, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Polling fetch failed:', error);
    }
  };

  const { state: pollingState, pause, resume, triggerNow } = useAdaptivePolling(fetchData, {
    baseInterval: 5000,
    maxInterval: 30000,
    jitter: true,
    pauseWhenOffline: true,
  });

  const getIntervalLabel = () => {
    const type = network?.effectiveType;
    if (type?.includes('2g')) return { label: '15s (2G)', color: 'text-red-600' };
    if (type?.includes('3g')) return { label: '10s (3G)', color: 'text-yellow-600' };
    return { label: '5s (4G)', color: 'text-green-600' };
  };

  const intervalInfo = getIntervalLabel();

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex gap-3">
        <button
          onClick={pollingState.isPaused ? resume : pause}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            pollingState.isPaused
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {pollingState.isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={triggerNow}
          className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Fetch Now
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${pollingState.isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <p className="font-semibold">
              {pollingState.isPaused ? 'Paused' : pollingState.isPolling ? 'Active' : 'Stopped'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interval</p>
          <p className={`font-semibold ${intervalInfo.color}`}>{intervalInfo.label}</p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fetches</p>
          <p className="font-semibold">{fetchCount}</p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Errors</p>
          <p className={`font-semibold ${pollingState.errorCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {pollingState.errorCount}
          </p>
        </div>
      </div>

      {/* Current Value */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-2xl p-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Random Number</p>
        <p className="text-6xl font-bold text-purple-600 dark:text-purple-400">
          {data ?? '—'}
        </p>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Fetches</p>
          <div className="flex gap-2 flex-wrap">
            {history.map((item, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-semibold">{item.value}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">How it works</h4>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          The polling interval automatically adjusts based on your network speed.
          4G = 5s, 3G = 10s, 2G = 15s. Use the controls to pause, resume, or trigger immediately.
        </p>
      </div>
    </div>
  );
}
