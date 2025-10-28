import { QueueStore, CacheStore } from './types';

export class MemoryQueueStore<T> implements QueueStore<T> {
  private queue: T[] = [];

  async enqueue(item: T): Promise<void> {
    this.queue.push(item);
  }

  async dequeue(): Promise<T | undefined> {
    return this.queue.shift();
  }

  async peek(): Promise<T | undefined> {
    return this.queue[0];
  }

  async isEmpty(): Promise<boolean> {
    return this.queue.length === 0;
  }

  async size(): Promise<number> {
    return this.queue.length;
  }
}

export class MemoryCacheStore<T> implements CacheStore<T> {
  private cache = new Map<string, T>();

  async get(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
