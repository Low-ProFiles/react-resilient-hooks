import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdaptivePolling } from '../hooks/useAdaptivePolling';

describe('useAdaptivePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

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

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should start polling when enabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000 })
    );

    expect(result.current.state.isPolling).toBe(true);
    expect(result.current.state.isPaused).toBe(false);
  });

  it('should not start polling when enabled is false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, enabled: false })
    );

    expect(result.current.state.isPolling).toBe(false);
    expect(result.current.state.isPaused).toBe(true);
  });

  it('should call callback at specified interval', async () => {
    const callback = vi.fn();
    renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, jitter: false })
    );

    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should pause polling when pause is called', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, jitter: false })
    );

    act(() => {
      result.current.pause();
    });

    expect(result.current.state.isPaused).toBe(true);
    expect(result.current.state.isPolling).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should resume polling when resume is called', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, jitter: false, enabled: false })
    );

    expect(result.current.state.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });

    expect(result.current.state.isPaused).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should trigger callback immediately when triggerNow is called', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 10000, jitter: false })
    );

    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.triggerNow();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should track error count on callback failure', async () => {
    vi.useRealTimers(); // Use real timers for this test

    const error = new Error('Test error');
    const callback = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, jitter: false, onError, enabled: false })
    );

    await act(async () => {
      await result.current.triggerNow();
    });

    expect(result.current.state.errorCount).toBe(1);
    expect(result.current.state.lastError).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);

    vi.useFakeTimers(); // Restore fake timers
  });

  it('should reset error count on successful callback', async () => {
    vi.useRealTimers(); // Use real timers for this test

    const callback = vi.fn()
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useAdaptivePolling(callback, { baseInterval: 1000, jitter: false, enabled: false })
    );

    await act(async () => {
      await result.current.triggerNow();
    });

    expect(result.current.state.errorCount).toBe(1);

    await act(async () => {
      await result.current.triggerNow();
    });

    expect(result.current.state.errorCount).toBe(0);
    expect(result.current.state.lastError).toBe(null);

    vi.useFakeTimers(); // Restore fake timers
  });

  describe('adaptive interval calculation', () => {
    it('should use base interval for 4G', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, { baseInterval: 5000, jitter: false })
      );

      expect(result.current.state.currentInterval).toBe(5000);
    });

    it('should double interval for 3G', () => {
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

      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, { baseInterval: 5000, jitter: false })
      );

      expect(result.current.state.currentInterval).toBe(10000);
    });

    it('should triple interval for 2G', () => {
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

      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, { baseInterval: 5000, jitter: false })
      );

      expect(result.current.state.currentInterval).toBe(15000);
    });

    it('should respect maxInterval', () => {
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

      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, {
          baseInterval: 10000,
          maxInterval: 20000,
          jitter: false,
        })
      );

      // 2G would normally triple to 30000, but maxInterval caps it at 20000
      expect(result.current.state.currentInterval).toBe(20000);
    });
  });

  describe('pauseWhenOffline', () => {
    it('should pause when offline and pauseWhenOffline is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, { baseInterval: 1000, pauseWhenOffline: true })
      );

      expect(result.current.state.isPolling).toBe(false);
    });

    it('should continue polling when offline if pauseWhenOffline is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      const callback = vi.fn();
      const { result } = renderHook(() =>
        useAdaptivePolling(callback, { baseInterval: 1000, pauseWhenOffline: false })
      );

      expect(result.current.state.isPolling).toBe(true);
    });
  });
});
