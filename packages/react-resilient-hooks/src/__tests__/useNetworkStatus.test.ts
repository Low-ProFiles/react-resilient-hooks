import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    // Reset navigator.connection mock
    Object.defineProperty(navigator, 'connection', {
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return online status correctly', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.data?.online).toBe(true);
  });

  it('should return network info when available', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.data?.effectiveType).toBe('4g');
    expect(result.current.data?.downlink).toBe(10);
    expect(result.current.data?.rtt).toBe(50);
    expect(result.current.data?.saveData).toBe(false);
  });

  it('should update when going offline', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.data?.online).toBe(true);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.data?.online).toBe(false);
  });

  it('should update when going online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.data?.online).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.data?.online).toBe(true);
  });

  it('should handle missing connection API gracefully', () => {
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.data?.online).toBe(true);
    expect(result.current.data?.effectiveType).toBeUndefined();
  });
});
