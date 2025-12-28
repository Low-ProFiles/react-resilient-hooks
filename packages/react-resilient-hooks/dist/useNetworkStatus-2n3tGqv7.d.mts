import { b as ResilientState } from './types-BF29fKSQ.mjs';

/**
 * Network Information API type definitions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 */
/**
 * Effective connection type as reported by the Network Information API
 */
type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';
/**
 * Connection type as reported by the Network Information API
 */
type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
/**
 * NetworkInformation interface as defined by the Network Information API
 * @see https://wicg.github.io/netinfo/
 */
interface NetworkInformation extends EventTarget {
    /** The effective bandwidth estimate in megabits per second */
    readonly downlink: number;
    /** Maximum downlink speed of the underlying connection technology in Mbps */
    readonly downlinkMax?: number;
    /** The effective type of the connection */
    readonly effectiveType: EffectiveConnectionType;
    /** The estimated round-trip time of the current connection in milliseconds */
    readonly rtt: number;
    /** Whether the user has requested reduced data usage */
    readonly saveData: boolean;
    /** The type of connection a device is using to communicate with the network */
    readonly type?: ConnectionType;
    /** Event handler for connection changes */
    onchange: ((this: NetworkInformation, ev: Event) => void) | null;
}
/**
 * Get the NetworkInformation object from navigator if available
 * Supports vendor-prefixed versions for broader compatibility
 */
declare function getNetworkConnection(): NetworkInformation | undefined;
/**
 * Check if the Network Information API is supported
 */
declare function isNetworkInformationSupported(): boolean;

/**
 * Information about the current network connection.
 * Uses the Network Information API when available.
 */
type NetworkInfo = {
    /** Whether the browser is online */
    online: boolean;
    /** Effective connection type: 'slow-2g', '2g', '3g', or '4g' */
    effectiveType?: EffectiveConnectionType;
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
 * SSR-safe: returns sensible defaults during server-side rendering.
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

export { type ConnectionType as C, type EffectiveConnectionType as E, type NetworkInfo as N, type NetworkInformation as a, getNetworkConnection as g, isNetworkInformationSupported as i, useNetworkStatus as u };
