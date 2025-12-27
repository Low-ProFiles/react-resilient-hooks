import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryQueueStore } from '../stores/implementations';

interface TestItem {
  id: string;
  data: string;
}

describe('MemoryQueueStore', () => {
  let store: MemoryQueueStore<TestItem>;

  beforeEach(() => {
    store = new MemoryQueueStore<TestItem>();
  });

  describe('enqueue', () => {
    it('should add item to queue', async () => {
      await store.enqueue({ id: '1', data: 'test' });
      expect(await store.size()).toBe(1);
    });

    it('should maintain FIFO order', async () => {
      await store.enqueue({ id: '1', data: 'first' });
      await store.enqueue({ id: '2', data: 'second' });
      await store.enqueue({ id: '3', data: 'third' });

      const first = await store.dequeue();
      expect(first?.data).toBe('first');

      const second = await store.dequeue();
      expect(second?.data).toBe('second');
    });
  });

  describe('dequeue', () => {
    it('should remove and return first item', async () => {
      await store.enqueue({ id: '1', data: 'test' });
      const item = await store.dequeue();

      expect(item?.id).toBe('1');
      expect(await store.size()).toBe(0);
    });

    it('should return undefined for empty queue', async () => {
      const item = await store.dequeue();
      expect(item).toBeUndefined();
    });
  });

  describe('peek', () => {
    it('should return first item without removing', async () => {
      await store.enqueue({ id: '1', data: 'test' });

      const peeked = await store.peek();
      expect(peeked?.id).toBe('1');
      expect(await store.size()).toBe(1);
    });

    it('should return undefined for empty queue', async () => {
      const peeked = await store.peek();
      expect(peeked).toBeUndefined();
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', async () => {
      expect(await store.isEmpty()).toBe(true);
    });

    it('should return false for non-empty queue', async () => {
      await store.enqueue({ id: '1', data: 'test' });
      expect(await store.isEmpty()).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty queue', async () => {
      expect(await store.size()).toBe(0);
    });

    it('should return correct count', async () => {
      await store.enqueue({ id: '1', data: 'a' });
      await store.enqueue({ id: '2', data: 'b' });
      await store.enqueue({ id: '3', data: 'c' });

      expect(await store.size()).toBe(3);
    });

    it('should update after dequeue', async () => {
      await store.enqueue({ id: '1', data: 'a' });
      await store.enqueue({ id: '2', data: 'b' });

      expect(await store.size()).toBe(2);

      await store.dequeue();
      expect(await store.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all items', async () => {
      await store.enqueue({ id: '1', data: 'a' });
      await store.enqueue({ id: '2', data: 'b' });

      await store.clear();

      expect(await store.isEmpty()).toBe(true);
      expect(await store.size()).toBe(0);
    });
  });
});
