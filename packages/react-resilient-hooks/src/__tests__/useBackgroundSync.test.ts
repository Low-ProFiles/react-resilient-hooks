import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackgroundSync, QueuedReq } from '../hooks/useBackgroundSync';
import { MemoryQueueStore } from '../stores/implementations';

describe('useBackgroundSync', () => {
  let mockQueueStore: MemoryQueueStore<QueuedReq>;
  let mockFetch: Mock;

  beforeEach(() => {
    mockQueueStore = new MemoryQueueStore();

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial idle status', () => {
    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore })
    );

    expect(result.current.status.status).toBe('idle');
  });

  it('should enqueue a request', async () => {
    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore })
    );

    let requestId: string;

    await act(async () => {
      requestId = await result.current.enqueue('/api/test', { method: 'POST' });
    });

    expect(requestId!).toBeDefined();
    expect(await mockQueueStore.size()).toBe(1);
  });

  it('should generate unique IDs for each request', async () => {
    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore })
    );

    let id1: string, id2: string;

    await act(async () => {
      id1 = await result.current.enqueue('/api/test1');
      id2 = await result.current.enqueue('/api/test2');
    });

    expect(id1!).not.toBe(id2!);
  });

  it('should flush queue and call onSuccess for successful requests', async () => {
    const onSuccess = vi.fn();
    mockFetch.mockResolvedValue({ ok: true });

    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore, onSuccess })
    );

    await act(async () => {
      await result.current.enqueue('/api/test', { method: 'POST' });
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.status.status).toBe('success');
    });
  });

  it('should call onError on 4xx errors (no retry)', async () => {
    const onError = vi.fn();
    // 400 errors don't trigger retry by default
    mockFetch.mockResolvedValue({ ok: false, status: 400 });

    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore, onError })
    );

    await act(async () => {
      await result.current.enqueue('/api/test');
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(result.current.status.status).toBe('error');
    });
  });

  it('should call onError when retry is disabled', async () => {
    const onError = vi.fn();
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() =>
      useBackgroundSync({
        queueStore: mockQueueStore,
        onError,
        retry: { maxRetries: 0 }
      })
    );

    await act(async () => {
      await result.current.enqueue('/api/test');
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(result.current.status.status).toBe('error');
    });
  });

  it('should handle network errors (no retry when disabled)', async () => {
    const onError = vi.fn();
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useBackgroundSync({
        queueStore: mockQueueStore,
        onError,
        retry: { maxRetries: 0 }
      })
    );

    await act(async () => {
      await result.current.enqueue('/api/test');
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(result.current.status.status).toBe('error');
    });
  });

  it('should set loading status during flush', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore })
    );

    await act(async () => {
      await result.current.enqueue('/api/test');
    });

    // Start flush but don't await
    act(() => {
      result.current.flush();
    });

    expect(result.current.status.status).toBe('loading');
  });

  it('should store metadata with request', async () => {
    const onSuccess = vi.fn();
    mockFetch.mockResolvedValue({ ok: true });

    const { result } = renderHook(() =>
      useBackgroundSync({ queueStore: mockQueueStore, onSuccess })
    );

    await act(async () => {
      await result.current.enqueue('/api/test', { method: 'POST' }, { userId: 123 });
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/test',
          meta: { userId: 123 },
        })
      );
    });
  });

  describe('retry policy', () => {
    it('should call onRetry when retrying', async () => {
      vi.useFakeTimers();

      const onRetry = vi.fn();
      const onSuccess = vi.fn();

      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() =>
        useBackgroundSync({
          queueStore: mockQueueStore,
          onRetry,
          onSuccess,
          retry: {
            maxRetries: 3,
            retryDelay: () => 100,
            shouldRetry: () => true
          }
        })
      );

      await act(async () => {
        await result.current.enqueue('/api/test');
      });

      // Start flush
      act(() => {
        result.current.flush();
      });

      // Fast-forward through the retry delay
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });

      // Continue flushing
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(onRetry).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should use custom shouldRetry function', async () => {
      const onError = vi.fn();
      const shouldRetry = vi.fn().mockReturnValue(false);

      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      const { result } = renderHook(() =>
        useBackgroundSync({
          queueStore: mockQueueStore,
          onError,
          retry: { shouldRetry }
        })
      );

      await act(async () => {
        await result.current.enqueue('/api/test');
      });

      await act(async () => {
        await result.current.flush();
      });

      await waitFor(() => {
        expect(shouldRetry).toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});
