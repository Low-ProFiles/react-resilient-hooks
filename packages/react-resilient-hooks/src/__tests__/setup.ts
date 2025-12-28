// Import fake-indexeddb BEFORE anything else
import 'fake-indexeddb/auto';

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { NavigatorWithConnection, EffectiveConnectionType } from '../types/network';

// Mock Navigator.connection (Network Information API)
const mockConnection = {
  effectiveType: '4g' as EffectiveConnectionType,
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

// Note: IndexedDB is provided by fake-indexeddb/auto imported at the top

// Helper to update network status in tests
export function setNetworkStatus(options: {
  online?: boolean;
  effectiveType?: EffectiveConnectionType;
  downlink?: number;
}) {
  if (options.online !== undefined) {
    Object.defineProperty(navigator, 'onLine', {
      value: options.online,
      writable: true,
      configurable: true,
    });
  }

  const nav = navigator as NavigatorWithConnection;

  if (options.effectiveType !== undefined && nav.connection) {
    // Use Object.defineProperty for read-only properties in mock
    Object.defineProperty(nav.connection, 'effectiveType', {
      value: options.effectiveType,
      writable: true,
      configurable: true,
    });
  }
  if (options.downlink !== undefined && nav.connection) {
    Object.defineProperty(nav.connection, 'downlink', {
      value: options.downlink,
      writable: true,
      configurable: true,
    });
  }
}

// Helper to simulate online/offline events
export function triggerOnlineEvent() {
  window.dispatchEvent(new Event('online'));
}

export function triggerOfflineEvent() {
  window.dispatchEvent(new Event('offline'));
}
