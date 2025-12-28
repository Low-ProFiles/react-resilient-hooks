type Listener<T> = (event: T) => void;
/**
 * Simple pub/sub event bus for broadcasting events to multiple listeners.
 * Used internally for status updates across hooks.
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
     *
     * @param event - The event to broadcast
     */
    publish(event: T): void;
}

export { EventBus as E };
