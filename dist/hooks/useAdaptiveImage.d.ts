export type AdaptiveImageSource = {
    high: string;
    medium?: string;
    low: string;
};
export declare function useAdaptiveImage(src: AdaptiveImageSource): string;
