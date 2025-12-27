import { b as ResilientState } from '../types-BF29fKSQ.js';

/**
 * Information about the current network connection.
 * Uses the Network Information API when available.
 */
type NetworkInfo = {
    /** Whether the browser is online */
    online: boolean;
    /** Effective connection type: 'slow-2g', '2g', '3g', or '4g' */
    effectiveType?: string;
    /** Estimated downlink speed in Mbps */
    downlink?: number;
    /** Estimated round-trip time in milliseconds */
    rtt?: number;
    /** Whether the user has requested reduced data usage */
    saveData?: boolean;
};
/**
 * Hook that provides real-time network status information.
 * Automatically updates when online/offline status or connection quality changes.
 *
 * @returns Current network state with data, error, and loading properties
 *
 * @example
 * ```tsx
 * const { data: network } = useNetworkStatus();
 *
 * if (!network?.online) {
 *   return <OfflineBanner />;
 * }
 *
 * if (network?.effectiveType === '2g') {
 *   return <LowBandwidthMode />;
 * }
 * ```
 */
declare function useNetworkStatus(): ResilientState<NetworkInfo>;

export { type NetworkInfo, useNetworkStatus };
