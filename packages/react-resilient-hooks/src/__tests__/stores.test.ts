import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryQueueStore, IndexedDBQueueStore } from '../stores/implementations';

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

describe('IndexedDBQueueStore', () => {
  let store: IndexedDBQueueStore<TestItem>;
  let dbCounter = 0;

  beforeEach(() => {
    // Use unique database name for each test to avoid interference
    dbCounter++;
    store = new IndexedDBQueueStore<TestItem>(`test-db-${dbCounter}`, 'test-store');
  });

  afterEach(async () => {
    await store.clear();
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

    it('should persist items', async () => {
      await store.enqueue({ id: '1', data: 'test' });

      // Create a new store instance pointing to same DB
      const newStore = new IndexedDBQueueStore<TestItem>(`test-db-${dbCounter}`, 'test-store');
      expect(await newStore.size()).toBe(1);
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

    it('should remove items in order', async () => {
      await store.enqueue({ id: '1', data: 'a' });
      await store.enqueue({ id: '2', data: 'b' });
      await store.enqueue({ id: '3', data: 'c' });

      expect((await store.dequeue())?.id).toBe('1');
      expect((await store.dequeue())?.id).toBe('2');
      expect((await store.dequeue())?.id).toBe('3');
      expect(await store.dequeue()).toBeUndefined();
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

    it('should always return the same first item', async () => {
      await store.enqueue({ id: '1', data: 'first' });
      await store.enqueue({ id: '2', data: 'second' });

      expect((await store.peek())?.id).toBe('1');
      expect((await store.peek())?.id).toBe('1');
      expect((await store.peek())?.id).toBe('1');
      expect(await store.size()).toBe(2);
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

    it('should return true after all items are dequeued', async () => {
      await store.enqueue({ id: '1', data: 'test' });
      await store.dequeue();
      expect(await store.isEmpty()).toBe(true);
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

    it('should allow adding items after clear', async () => {
      await store.enqueue({ id: '1', data: 'a' });
      await store.clear();
      await store.enqueue({ id: '2', data: 'b' });

      expect(await store.size()).toBe(1);
      expect((await store.peek())?.id).toBe('2');
    });
  });

  describe('database initialization', () => {
    it('should use default database name', async () => {
      const defaultStore = new IndexedDBQueueStore<TestItem>();
      await defaultStore.enqueue({ id: '1', data: 'test' });
      expect(await defaultStore.size()).toBe(1);
      await defaultStore.clear();
    });

    it('should use custom database and store names', async () => {
      const customStore = new IndexedDBQueueStore<TestItem>('custom-db', 'custom-store');
      await customStore.enqueue({ id: '1', data: 'test' });
      expect(await customStore.size()).toBe(1);
      await customStore.clear();
    });

    it('should reuse database connection for multiple operations', async () => {
      // Multiple operations should use the same connection
      await store.enqueue({ id: '1', data: 'a' });
      await store.enqueue({ id: '2', data: 'b' });
      await store.dequeue();
      await store.peek();
      await store.size();
      await store.isEmpty();

      expect(await store.size()).toBe(1);
    });
  });
});
