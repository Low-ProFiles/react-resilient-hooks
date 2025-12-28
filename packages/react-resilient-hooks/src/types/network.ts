/**
 * Network Information API type definitions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 */

/**
 * Effective connection type as reported by the Network Information API
 */
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

/**
 * Connection type as reported by the Network Information API
 */
export type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'none'
  | 'wifi'
  | 'wimax'
  | 'other'
  | 'unknown';

/**
 * NetworkInformation interface as defined by the Network Information API
 * @see https://wicg.github.io/netinfo/
 */
export interface NetworkInformation extends EventTarget {
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
 * Extended Navigator interface with Network Information API support
 */
export interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}

/**
 * Get the NetworkInformation object from navigator if available
 * Supports vendor-prefixed versions for broader compatibility
 */
export function getNetworkConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

/**
 * Check if the Network Information API is supported
 */
export function isNetworkInformationSupported(): boolean {
  return getNetworkConnection() !== undefined;
}
