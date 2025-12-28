import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdaptiveImage } from '../hooks/useAdaptiveImage';

const mockSources = {
  low: 'https://example.com/low.jpg',
  medium: 'https://example.com/medium.jpg',
  high: 'https://example.com/high.jpg',
};

describe('useAdaptiveImage', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  describe('with 4G connection', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should return high quality image', () => {
      const { result } = renderHook(() => useAdaptiveImage(mockSources));

      expect(result.current.src).toBe(mockSources.high);
      expect(result.current.quality).toBe('high');
    });
  });

  describe('with 3G connection', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '3g',
          downlink: 1.0,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should return medium quality image', () => {
      const { result } = renderHook(() => useAdaptiveImage(mockSources));

      expect(result.current.src).toBe(mockSources.medium);
      expect(result.current.quality).toBe('medium');
    });

    it('should fallback to low if medium is not provided', () => {
      const sourcesWithoutMedium = {
        low: mockSources.low,
        high: mockSources.high,
      };

      const { result } = renderHook(() => useAdaptiveImage(sourcesWithoutMedium));

      expect(result.current.src).toBe(mockSources.low);
      expect(result.current.quality).toBe('low');
    });
  });

  describe('with 2G connection', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.3,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should return low quality image', () => {
      const { result } = renderHook(() => useAdaptiveImage(mockSources));

      expect(result.current.src).toBe(mockSources.low);
      expect(result.current.quality).toBe('low');
    });
  });

  describe('with slow-2g connection', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: 'slow-2g',
          downlink: 0.1,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should return low quality image', () => {
      const { result } = renderHook(() => useAdaptiveImage(mockSources));

      expect(result.current.src).toBe(mockSources.low);
      expect(result.current.quality).toBe('low');
    });
  });

  describe('with custom thresholds', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 2.0,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should use custom thresholds', () => {
      const { result } = renderHook(() =>
        useAdaptiveImage(mockSources, {
          thresholds: { low: 1.0, medium: 5.0 },
        })
      );

      // downlink is 2.0, which is below medium threshold (5.0)
      expect(result.current.quality).toBe('medium');
    });
  });

  describe('SSR default', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it('should use ssrDefault when connection info is unavailable', () => {
      const { result } = renderHook(() =>
        useAdaptiveImage(mockSources, { ssrDefault: 'low' })
      );

      expect(result.current.src).toBe(mockSources.low);
      expect(result.current.quality).toBe('low');
    });

    it('should default to high quality when no ssrDefault is specified', () => {
      const { result } = renderHook(() => useAdaptiveImage(mockSources));

      expect(result.current.src).toBe(mockSources.high);
      expect(result.current.quality).toBe('high');
    });
  });
});
