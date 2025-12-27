'use client';

import { UseAdaptiveImageDemo } from '../../../../components/demos/UseAdaptiveImageDemo';

export default function UseAdaptiveImagePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">useAdaptiveImage</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Automatically select the optimal image quality based on network conditions.
      </p>

      {/* Demo */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
        <div className="border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-900">
          <UseAdaptiveImageDemo />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Installation</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
          <code>npm install react-resilient-hooks</code>
        </pre>
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`import { useAdaptiveImage } from 'react-resilient-hooks';

const imageSources = {
  low: 'https://example.com/image-150.jpg',
  medium: 'https://example.com/image-300.jpg',
  high: 'https://example.com/image-600.jpg',
};

function MyComponent() {
  const { src, quality } = useAdaptiveImage(imageSources);

  return (
    <div>
      <img src={src} alt="Adaptive image" />
      <p>Current quality: {quality}</p>
    </div>
  );
}`}</code>
        </pre>
      </section>

      {/* API */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">API</h2>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Parameters</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">sources</code>
              <span className="text-gray-500 ml-2">{'{ low: string, medium?: string, high: string }'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Object containing URLs for different image qualities.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">options?</code>
              <span className="text-gray-500 ml-2">AdaptiveImageOptions</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Optional configuration object.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Options</h3>
          <div className="space-y-4">
            <div>
              <code className="text-blue-600 dark:text-blue-400">ssrDefault?</code>
              <span className="text-gray-500 ml-2">&apos;low&apos; | &apos;medium&apos; | &apos;high&apos;</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Default quality to use during SSR. Defaults to &apos;high&apos;.
              </p>
            </div>
            <div>
              <code className="text-blue-600 dark:text-blue-400">thresholds?</code>
              <span className="text-gray-500 ml-2">{'{ low: number, medium: number }'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Custom downlink thresholds (Mbps). Defaults to {'{ low: 0.5, medium: 1.5 }'}.
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6">Returns</h3>
          <div className="space-y-4">
            <div>
              <code className="text-green-600 dark:text-green-400">src</code>
              <span className="text-gray-500 ml-2">string</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The URL of the selected image based on current network conditions.
              </p>
            </div>
            <div>
              <code className="text-green-600 dark:text-green-400">quality</code>
              <span className="text-gray-500 ml-2">&apos;low&apos; | &apos;medium&apos; | &apos;high&apos;</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The quality level that was selected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            The hook uses the Network Information API to detect the effective connection type:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
            <li><strong>4G / WiFi:</strong> Returns the high-quality image</li>
            <li><strong>3G:</strong> Returns the medium-quality image</li>
            <li><strong>2G / Slow 2G:</strong> Returns the low-quality image</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            This helps reduce data usage and improve load times for users on slower connections.
          </p>
        </div>
      </section>
    </div>
  );
}
