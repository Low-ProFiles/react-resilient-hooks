'use client';

import { useAdaptiveImage, useNetworkStatus } from 'react-resilient-hooks';

const imageSources = {
  low: 'https://picsum.photos/150/150?blur=2',
  medium: 'https://picsum.photos/300/300',
  high: 'https://picsum.photos/600/600',
};

const qualityConfig = {
  low: { label: 'Low', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', size: '150px' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', size: '300px' },
  high: { label: 'High', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', size: '600px' },
};

export function UseAdaptiveImageDemo() {
  const { data: network } = useNetworkStatus();
  const { src: imageUrl, quality: selectedQuality } = useAdaptiveImage(imageSources);

  const quality = qualityConfig[selectedQuality];

  return (
    <div className="space-y-6">
      {/* Network Status Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
          <p className={`font-semibold ${network?.online ? 'text-green-600' : 'text-red-600'}`}>
            {network?.online ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connection</p>
          <p className="font-semibold">{network?.effectiveType?.toUpperCase() || 'Unknown'}</p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speed</p>
          <p className="font-semibold">{network?.downlink ? `${network.downlink} Mbps` : 'N/A'}</p>
        </div>
      </div>

      {/* Selected Quality Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${quality.bg}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        <span className={`font-medium ${quality.color}`}>
          Selected: {quality.label} Quality ({quality.size})
        </span>
      </div>

      {/* Image Preview */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Adaptive quality image"
              className="rounded-xl shadow-lg max-w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow text-xs font-medium">
              {quality.size}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to test</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Open DevTools → Network tab → Throttle to &quot;Slow 3G&quot; or &quot;Fast 3G&quot; and refresh.
          The hook will select a lower resolution image to save bandwidth.
        </p>
      </div>
    </div>
  );
}
