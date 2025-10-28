import { UseOnlineDemo } from '../../components/demos/UseOnlineDemo';
import { UseNetworkStatusDemo } from '../../components/demos/UseNetworkStatusDemo';
import { UseRetryRequestDemo } from '../../components/demos/UseRetryRequestDemo';
import { UseBackgroundSyncDemo } from '../../components/demos/UseBackgroundSyncDemo';
import { UseOfflineCacheDemo } from '../../components/demos/UseOfflineCacheDemo';
import { UseAdaptiveImageDemo } from '../../components/demos/UseAdaptiveImageDemo';
import { UseConnectionAwarePollingDemo } from '../../components/demos/UseConnectionAwarePollingDemo';
import { UseWebsocketDemo } from '../../components/demos/UseWebsocketDemo';

export const demoComponents: { [key: string]: React.ComponentType } = {
  useOnline: UseOnlineDemo,
  useNetworkStatus: UseNetworkStatusDemo,
  useRetryRequest: UseRetryRequestDemo,
  useBackgroundSync: UseBackgroundSyncDemo,
  useOfflineCache: UseOfflineCacheDemo,
  useAdaptiveImage: UseAdaptiveImageDemo,
  useConnectionAwarePolling: UseConnectionAwarePollingDemo,
  useWebsocket: UseWebsocketDemo,
};
