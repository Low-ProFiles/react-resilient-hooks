export const SW_MESSAGE_VERSION = 'v1';

export interface SWMessage {
  version: string;
  type: string;
  payload?: any;
}

export const createSWMessage = (type: string, payload?: any): SWMessage => ({
  version: SW_MESSAGE_VERSION,
  type,
  payload,
});
