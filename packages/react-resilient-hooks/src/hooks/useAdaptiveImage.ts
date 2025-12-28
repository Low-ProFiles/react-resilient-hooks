import { useMemo } from 'react';
import { useNetworkStatus, NetworkInfo } from './useNetworkStatus';

/**
 * Source URLs for different image quality levels.
 * Provide multiple resolutions to optimize loading based on network conditions.
 */
export type AdaptiveImageSource = {
  /** High quality image URL (used on fast connections) */
  high: string;
  /** Medium quality image URL (optional, falls back to low if not provided) */
  medium?: string;
  /** Low quality image URL (used on slow connections) */
  low: string;
};

/**
 * Quality level for image selection.
 */
export type ImageQuality = 'high' | 'medium' | 'low';

/**
 * Threshold configuration for network quality detection.
 */
export type QualityThresholds = {
  /** Below this downlink (Mbps) = low quality (default: 0.5) */
  low: number;
  /** Below this downlink (Mbps) = medium quality (default: 1.5) */
  medium: number;
};

/** Default thresholds for quality selection */
const DEFAULT_THRESHOLDS: QualityThresholds = { low: 0.5, medium: 1.5 };

/**
 * Configuration options for useAdaptiveImage hook.
 */
export type AdaptiveImageOptions = {
  /** Default quality to use during SSR or when network info unavailable */
  ssrDefault?: ImageQuality;
  /** Custom thresholds for downlink (Mbps) */
  thresholds?: QualityThresholds;
};

/**
 * Result returned by useAdaptiveImage hook.
 */
export type AdaptiveImageResult = {
  /** The selected image URL based on current network conditions */
  src: string;
  /** The quality level that was selected ('high', 'medium', or 'low') */
  quality: ImageQuality;
};

function selectImage(
  srcHigh: string,
  srcMedium: string | undefined,
  srcLow: string,
  networkStatus: NetworkInfo | null,
  ssrDefault: ImageQuality,
  thresholdLow: number,
  thresholdMedium: number
): AdaptiveImageResult {
  const srcMap = { high: srcHigh, medium: srcMedium, low: srcLow };

  // SSR or no network info available
  if (!networkStatus) {
    return { src: srcMap[ssrDefault] ?? srcHigh, quality: ssrDefault };
  }

  const { effectiveType, downlink } = networkStatus;

  // No network quality info available
  if (!effectiveType && downlink === undefined) {
    return { src: srcMap[ssrDefault] ?? srcHigh, quality: ssrDefault };
  }

  const dl = typeof downlink === 'number' ? downlink : 10;

  // 2G or very slow connection
  if (effectiveType?.includes('2g') || dl < thresholdLow) {
    return { src: srcLow, quality: 'low' };
  }

  // 3G or slow connection
  if (effectiveType?.includes('3g') || dl < thresholdMedium) {
    return { src: srcMedium ?? srcLow, quality: srcMedium ? 'medium' : 'low' };
  }

  // 4G or fast connection
  return { src: srcHigh, quality: 'high' };
}

/**
 * Hook that selects the appropriate image quality based on network conditions.
 * Automatically chooses between high, medium, and low quality images.
 *
 * @param src - Object containing URLs for different image quality levels
 * @param options - Configuration options for quality selection
 * @returns The selected image URL and quality level
 *
 * @example
 * ```tsx
 * const { src, quality } = useAdaptiveImage({
 *   high: '/images/hero-2x.jpg',
 *   medium: '/images/hero-1x.jpg',
 *   low: '/images/hero-thumb.jpg'
 * });
 *
 * return <img src={src} alt="Hero" data-quality={quality} />;
 * ```
 */
export function useAdaptiveImage(
  src: AdaptiveImageSource,
  options: AdaptiveImageOptions = {}
): AdaptiveImageResult {
  const { data: networkStatus } = useNetworkStatus();

  // Extract primitive values from options to use as stable dependencies
  const ssrDefault = options.ssrDefault ?? 'high';
  const thresholdLow = options.thresholds?.low ?? DEFAULT_THRESHOLDS.low;
  const thresholdMedium = options.thresholds?.medium ?? DEFAULT_THRESHOLDS.medium;

  const result = useMemo(
    () => selectImage(
      src.high,
      src.medium,
      src.low,
      networkStatus,
      ssrDefault,
      thresholdLow,
      thresholdMedium
    ),
    [src.high, src.medium, src.low, networkStatus, ssrDefault, thresholdLow, thresholdMedium]
  );

  return result;
}
