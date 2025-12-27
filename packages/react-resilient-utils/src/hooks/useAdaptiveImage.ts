import { useMemo } from 'react';
import { useNetworkStatus, NetworkInfo } from './useNetworkStatus';

export type AdaptiveImageSource = {
  high: string;
  medium?: string;
  low: string;
};

export type AdaptiveImageOptions = {
  /** Default quality to use during SSR or when network info unavailable */
  ssrDefault?: 'high' | 'medium' | 'low';
  /** Custom thresholds for downlink (Mbps) */
  thresholds?: {
    low: number;   // below this = low quality (default: 0.5)
    medium: number; // below this = medium quality (default: 1.5)
  };
};

function selectImage(
  src: AdaptiveImageSource,
  networkStatus: NetworkInfo | null,
  options: AdaptiveImageOptions
): string {
  const { ssrDefault = 'high', thresholds = { low: 0.5, medium: 1.5 } } = options;

  // SSR or no network info available
  if (!networkStatus) {
    return src[ssrDefault] ?? src.high;
  }

  const { effectiveType, downlink } = networkStatus;

  // No network quality info available
  if (!effectiveType && downlink === undefined) {
    return src[ssrDefault] ?? src.high;
  }

  const dl = typeof downlink === 'number' ? downlink : 10;

  // 2G or very slow connection
  if (effectiveType?.includes('2g') || dl < thresholds.low) {
    return src.low;
  }

  // 3G or slow connection
  if (effectiveType?.includes('3g') || dl < thresholds.medium) {
    return src.medium ?? src.low;
  }

  // 4G or fast connection
  return src.high;
}

export function useAdaptiveImage(
  src: AdaptiveImageSource,
  options: AdaptiveImageOptions = {}
): string {
  const { data: networkStatus } = useNetworkStatus();

  const chosen = useMemo(
    () => selectImage(src, networkStatus, options),
    [src.high, src.medium, src.low, networkStatus, options.ssrDefault, options.thresholds?.low, options.thresholds?.medium]
  );

  return chosen;
}
