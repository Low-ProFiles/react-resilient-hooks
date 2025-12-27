import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Navigator.connection (Network Information API)
const mockConnection = {
  effectiveType: '4g',
  downlink: 10,
  rtt: 50,
  saveData: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, 'connection', {
  value: mockConnection,
  writable: true,
  configurable: true,
});

// Mock online status
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true,
});

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

// Helper to update network status in tests
export function setNetworkStatus(options: {
  online?: boolean;
  effectiveType?: string;
  downlink?: number;
}) {
  if (options.online !== undefined) {
    Object.defineProperty(navigator, 'onLine', {
      value: options.online,
      writable: true,
      configurable: true,
    });
  }
  if (options.effectiveType !== undefined) {
    (navigator as any).connection.effectiveType = options.effectiveType;
  }
  if (options.downlink !== undefined) {
    (navigator as any).connection.downlink = options.downlink;
  }
}

// Helper to simulate online/offline events
export function triggerOnlineEvent() {
  window.dispatchEvent(new Event('online'));
}

export function triggerOfflineEvent() {
  window.dispatchEvent(new Event('offline'));
}
