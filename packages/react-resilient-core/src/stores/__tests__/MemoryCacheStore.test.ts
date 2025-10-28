import { MemoryCacheStore } from '../implementations';

describe('MemoryCacheStore', () => {
  let store: MemoryCacheStore<string>;

  beforeEach(() => {
    store = new MemoryCacheStore<string>();
  });

  it('should set and get items correctly', async () => {
    await store.set('key1', 'value1');
    expect(await store.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', async () => {
    expect(await store.get('nonExistentKey')).toBeUndefined();
  });

  it('should delete items correctly', async () => {
    await store.set('key1', 'value1');
    await store.delete('key1');
    expect(await store.get('key1')).toBeUndefined();
  });

  it('should clear all items', async () => {
    await store.set('key1', 'value1');
    await store.set('key2', 'value2');
    await store.clear();
    expect(await store.get('key1')).toBeUndefined();
    expect(await store.get('key2')).toBeUndefined();
  });
});
