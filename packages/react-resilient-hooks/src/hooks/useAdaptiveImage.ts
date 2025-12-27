import { useMemo } from 'react';
import { useNetworkStatus, NetworkInfo } from './useNetworkStatus';

export type AdaptiveImageSource = {
  high: string;
  medium?: string;
  low: string;
};

export type ImageQuality = 'high' | 'medium' | 'low';

export type AdaptiveImageOptions = {
  /** Default quality to use during SSR or when network info unavailable */
  ssrDefault?: ImageQuality;
  /** Custom thresholds for downlink (Mbps) */
  thresholds?: {
    low: number;   // below this = low quality (default: 0.5)
    medium: number; // below this = medium quality (default: 1.5)
  };
};

export type AdaptiveImageResult = {
  /** The selected image URL */
  src: string;
  /** The quality level that was selected */
  quality: ImageQuality;
};

function selectImage(
  src: AdaptiveImageSource,
  networkStatus: NetworkInfo | null,
  options: AdaptiveImageOptions
): AdaptiveImageResult {
  const { ssrDefault = 'high', thresholds = { low: 0.5, medium: 1.5 } } = options;

  // SSR or no network info available
  if (!networkStatus) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }

  const { effectiveType, downlink } = networkStatus;

  // No network quality info available
  if (!effectiveType && downlink === undefined) {
    return { src: src[ssrDefault] ?? src.high, quality: ssrDefault };
  }

  const dl = typeof downlink === 'number' ? downlink : 10;

  // 2G or very slow connection
  if (effectiveType?.includes('2g') || dl < thresholds.low) {
    return { src: src.low, quality: 'low' };
  }

  // 3G or slow connection
  if (effectiveType?.includes('3g') || dl < thresholds.medium) {
    return { src: src.medium ?? src.low, quality: src.medium ? 'medium' : 'low' };
  }

  // 4G or fast connection
  return { src: src.high, quality: 'high' };
}

export function useAdaptiveImage(
  src: AdaptiveImageSource,
  options: AdaptiveImageOptions = {}
): AdaptiveImageResult {
  const { data: networkStatus } = useNetworkStatus();

  const result = useMemo(
    () => selectImage(src, networkStatus, options),
    [src.high, src.medium, src.low, networkStatus, options.ssrDefault, options.thresholds?.low, options.thresholds?.medium]
  );

  return result;
}
