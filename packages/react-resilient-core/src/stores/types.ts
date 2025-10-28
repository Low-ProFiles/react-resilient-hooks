export interface QueueStore<T> {
  enqueue(item: T): Promise<void>;
  dequeue(): Promise<T | undefined>;
  peek(): Promise<T | undefined>;
  isEmpty(): Promise<boolean>;
  size(): Promise<number>;
}

export interface CacheStore<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
