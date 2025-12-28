type Listener<T> = (event: T) => void;
/**
 * Simple pub/sub event bus for broadcasting events to multiple listeners.
 * Used internally for status updates across hooks.
 *
 * Features:
 * - O(1) subscribe/unsubscribe using Set
 * - Automatic cleanup on unsubscribe
 * - Type-safe events
 *
 * @typeParam T - Type of events published on this bus
 *
 * @example
 * ```ts
 * const bus = new EventBus<{ status: string }>();
 *
 * const unsubscribe = bus.subscribe((event) => {
 *   console.log('Status:', event.status);
 * });
 *
 * bus.publish({ status: 'loading' });
 *
 * unsubscribe(); // Stop receiving events
 * ```
 */
declare class EventBus<T> {
    private listeners;
    /**
     * Subscribe to events on this bus.
     *
     * @param listener - Function to call when an event is published
     * @returns Unsubscribe function to stop receiving events
     */
    subscribe(listener: Listener<T>): () => void;
    /**
     * Publish an event to all subscribers.
     * Listeners are called synchronously in insertion order.
     *
     * @param event - The event to broadcast
     */
    publish(event: T): void;
    /**
     * Get the current number of subscribers.
     * Useful for debugging and testing.
     */
    get size(): number;
    /**
     * Remove all subscribers.
     * Useful for cleanup in tests or when the bus is no longer needed.
     */
    clear(): void;
}

export { EventBus as E };
