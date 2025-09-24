import { useNetworkStatus } from "./useNetworkStatus";

export function useOnline(): boolean {
  const { data: networkStatus } = useNetworkStatus();
  return networkStatus?.online ?? true;
}
