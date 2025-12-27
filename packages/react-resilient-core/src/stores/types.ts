export interface QueueStore<T> {
  enqueue(item: T): Promise<void>;
  dequeue(): Promise<T | undefined>;
  peek(): Promise<T | undefined>;
  isEmpty(): Promise<boolean>;
  size(): Promise<number>;
}
