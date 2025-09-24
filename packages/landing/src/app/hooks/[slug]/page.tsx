'use client';

import { useParams } from 'next/navigation';
import { useI18n } from '../../../contexts/I18nProvider';
import { DocsLayout } from '../../../components/DocsLayout';
import { CodeBlock } from '../../../components/CodeBlock';

import { UseOnlineDemo } from '../../../components/demos/UseOnlineDemo';
import { UseNetworkStatusDemo } from '../../../components/demos/UseNetworkStatusDemo';
import { UseRetryRequestDemo } from '../../../components/demos/UseRetryRequestDemo';
import { UseBackgroundSyncDemo } from '../../../components/demos/UseBackgroundSyncDemo';
import { UseOfflineCacheDemo } from '../../../components/demos/UseOfflineCacheDemo';
import { UseAdaptiveImageDemo } from '../../../components/demos/UseAdaptiveImageDemo';
import { UseConnectionAwarePollingDemo } from '../../../components/demos/UseConnectionAwarePollingDemo';
import { UseWebsocketDemo } from '../../../components/demos/UseWebsocketDemo';

const demoComponents: { [key: string]: React.ComponentType } = {
  useOnline: UseOnlineDemo,
  useNetworkStatus: UseNetworkStatusDemo,
  useRetryRequest: UseRetryRequestDemo,
  useBackgroundSync: UseBackgroundSyncDemo,
  useOfflineCache: UseOfflineCacheDemo,
  useAdaptiveImage: UseAdaptiveImageDemo,
  useConnectionAwarePolling: UseConnectionAwarePollingDemo,
  useWebsocket: UseWebsocketDemo,
};

export default function HookPage() {
  const params = useParams();
  const { t } = useI18n();
  const slug = params.slug as string;

  const hookData = t.hooks[slug];

  if (!hookData) {
    return <div>Hook not found</div>;
  }

  const DemoComponent = demoComponents[slug];

  return (
    <DocsLayout>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-4">{hookData.title}</h1>
        
        <h2 className="text-2xl font-semibold mt-8 mb-2">Description</h2>
        <div>
          {hookData.description.map((line: string, index: number) => (
            <p key={index} className="mb-2">
              {line}
            </p>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Example</h2>
        <CodeBlock code={hookData.example} />

        <h2 className="text-2xl font-semibold mt-8 mb-2">Live Demo</h2>
        <div className="p-6 border rounded-lg mt-4">
          {DemoComponent && <DemoComponent />}
        </div>
      </div>
    </DocsLayout>
  );
}
