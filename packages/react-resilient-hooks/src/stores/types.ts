/**
 * Interface for queue storage implementations.
 * Used by useBackgroundSync for persisting queued requests.
 *
 * @typeParam T - Type of items stored in the queue
 */
export interface QueueStore<T> {
  /** Add an item to the end of the queue */
  enqueue(item: T): Promise<void>;
  /** Remove and return the first item from the queue */
  dequeue(): Promise<T | undefined>;
  /** Return the first item without removing it */
  peek(): Promise<T | undefined>;
  /** Check if the queue is empty */
  isEmpty(): Promise<boolean>;
  /** Get the number of items in the queue */
  size(): Promise<number>;
  /** Remove all items from the queue */
  clear(): Promise<void>;
}
