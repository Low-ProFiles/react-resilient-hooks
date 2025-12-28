/**
 * Source URLs for different image quality levels.
 * Provide multiple resolutions to optimize loading based on network conditions.
 */
type AdaptiveImageSource = {
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
type ImageQuality = 'high' | 'medium' | 'low';
/**
 * Threshold configuration for network quality detection.
 */
type QualityThresholds = {
    /** Below this downlink (Mbps) = low quality (default: 0.5) */
    low: number;
    /** Below this downlink (Mbps) = medium quality (default: 1.5) */
    medium: number;
};
/**
 * Configuration options for useAdaptiveImage hook.
 */
type AdaptiveImageOptions = {
    /** Default quality to use during SSR or when network info unavailable */
    ssrDefault?: ImageQuality;
    /** Custom thresholds for downlink (Mbps) */
    thresholds?: QualityThresholds;
};
/**
 * Result returned by useAdaptiveImage hook.
 */
type AdaptiveImageResult = {
    /** The selected image URL based on current network conditions */
    src: string;
    /** The quality level that was selected ('high', 'medium', or 'low') */
    quality: ImageQuality;
};
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
declare function useAdaptiveImage(src: AdaptiveImageSource, options?: AdaptiveImageOptions): AdaptiveImageResult;

export { type AdaptiveImageOptions, type AdaptiveImageResult, type AdaptiveImageSource, type ImageQuality, type QualityThresholds, useAdaptiveImage };
