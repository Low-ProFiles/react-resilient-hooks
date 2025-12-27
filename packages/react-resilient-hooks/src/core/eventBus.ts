type Listener<T> = (event: T) => void;

export class EventBus<T> {
  private listeners: Listener<T>[] = [];

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public publish(event: T): void {
    this.listeners.forEach(listener => listener(event));
  }
}
