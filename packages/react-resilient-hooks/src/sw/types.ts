export const SW_MESSAGE_VERSION = 'v1';

/**
 * Message format for service worker communication
 */
export interface SWMessage<T = unknown> {
  version: string;
  type: string;
  payload?: T;
}

/**
 * Create a service worker message with proper versioning
 */
export const createSWMessage = <T = unknown>(type: string, payload?: T): SWMessage<T> => ({
  version: SW_MESSAGE_VERSION,
  type,
  payload,
});
