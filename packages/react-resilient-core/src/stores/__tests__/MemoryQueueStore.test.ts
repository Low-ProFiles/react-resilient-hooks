import { MemoryQueueStore } from '../implementations';

describe('MemoryQueueStore', () => {
  let store: MemoryQueueStore<string>;

  beforeEach(() => {
    store = new MemoryQueueStore<string>();
  });

  it('should enqueue and dequeue items correctly', async () => {
    await store.enqueue('item1');
    await store.enqueue('item2');
    expect(await store.dequeue()).toBe('item1');
    expect(await store.dequeue()).toBe('item2');
    expect(await store.dequeue()).toBeUndefined();
  });

  it('should return correct size', async () => {
    expect(await store.size()).toBe(0);
    await store.enqueue('item1');
    expect(await store.size()).toBe(1);
    await store.enqueue('item2');
    expect(await store.size()).toBe(2);
    await store.dequeue();
    expect(await store.size()).toBe(1);
  });

  it('should correctly report if it is empty', async () => {
    expect(await store.isEmpty()).toBe(true);
    await store.enqueue('item1');
    expect(await store.isEmpty()).toBe(false);
    await store.dequeue();
    expect(await store.isEmpty()).toBe(true);
  });

  it('should peek at the next item without removing it', async () => {
    await store.enqueue('item1');
    await store.enqueue('item2');
    expect(await store.peek()).toBe('item1');
    expect(await store.size()).toBe(2);
  });
});
