import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../utils/eventBus';

interface TestEvent {
  type: string;
  payload: number;
}

describe('EventBus', () => {
  describe('subscribe', () => {
    it('should add a listener', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      bus.subscribe(listener);

      expect(bus.size).toBe(1);
    });

    it('should return an unsubscribe function', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      const unsubscribe = bus.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple listeners', () => {
      const bus = new EventBus<TestEvent>();

      bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());

      expect(bus.size).toBe(3);
    });

    it('should not add duplicate listeners (Set behavior)', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      bus.subscribe(listener);
      bus.subscribe(listener);

      expect(bus.size).toBe(1);
    });
  });

  describe('unsubscribe', () => {
    it('should remove the listener when unsubscribe is called', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      const unsubscribe = bus.subscribe(listener);
      unsubscribe();

      expect(bus.size).toBe(0);
    });

    it('should only remove the specific listener', () => {
      const bus = new EventBus<TestEvent>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = bus.subscribe(listener1);
      bus.subscribe(listener2);

      unsubscribe1();

      expect(bus.size).toBe(1);

      // Verify listener2 still receives events
      bus.publish({ type: 'test', payload: 1 });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should be safe to call unsubscribe multiple times', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      const unsubscribe = bus.subscribe(listener);
      unsubscribe();
      unsubscribe(); // Should not throw

      expect(bus.size).toBe(0);
    });
  });

  describe('publish', () => {
    it('should call all listeners with the event', () => {
      const bus = new EventBus<TestEvent>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      bus.subscribe(listener1);
      bus.subscribe(listener2);

      const event = { type: 'test', payload: 42 };
      bus.publish(event);

      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
    });

    it('should call listeners synchronously', () => {
      const bus = new EventBus<TestEvent>();
      const order: number[] = [];

      bus.subscribe(() => order.push(1));
      bus.subscribe(() => order.push(2));
      bus.subscribe(() => order.push(3));

      bus.publish({ type: 'test', payload: 0 });

      expect(order).toEqual([1, 2, 3]);
    });

    it('should continue calling other listeners if one throws', () => {
      const bus = new EventBus<TestEvent>();
      const listener1 = vi.fn();
      const throwingListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const listener2 = vi.fn();

      bus.subscribe(listener1);
      bus.subscribe(throwingListener);
      bus.subscribe(listener2);

      // Should not throw
      expect(() => bus.publish({ type: 'test', payload: 1 })).not.toThrow();

      expect(listener1).toHaveBeenCalled();
      expect(throwingListener).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should do nothing if no listeners', () => {
      const bus = new EventBus<TestEvent>();

      // Should not throw
      expect(() => bus.publish({ type: 'test', payload: 1 })).not.toThrow();
    });

    it('should not call unsubscribed listeners', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      const unsubscribe = bus.subscribe(listener);
      unsubscribe();

      bus.publish({ type: 'test', payload: 1 });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('size', () => {
    it('should return 0 for empty bus', () => {
      const bus = new EventBus<TestEvent>();
      expect(bus.size).toBe(0);
    });

    it('should return correct count', () => {
      const bus = new EventBus<TestEvent>();

      bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());

      expect(bus.size).toBe(2);
    });

    it('should update after unsubscribe', () => {
      const bus = new EventBus<TestEvent>();
      const unsubscribe = bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());

      expect(bus.size).toBe(2);

      unsubscribe();

      expect(bus.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all listeners', () => {
      const bus = new EventBus<TestEvent>();

      bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());
      bus.subscribe(vi.fn());

      bus.clear();

      expect(bus.size).toBe(0);
    });

    it('should prevent listeners from receiving events after clear', () => {
      const bus = new EventBus<TestEvent>();
      const listener = vi.fn();

      bus.subscribe(listener);
      bus.clear();
      bus.publish({ type: 'test', payload: 1 });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should work with string events', () => {
      const bus = new EventBus<string>();
      const listener = vi.fn();

      bus.subscribe(listener);
      bus.publish('hello');

      expect(listener).toHaveBeenCalledWith('hello');
    });

    it('should work with complex event types', () => {
      interface ComplexEvent {
        id: number;
        data: { nested: { value: string } };
        timestamp: Date;
      }

      const bus = new EventBus<ComplexEvent>();
      const listener = vi.fn();

      bus.subscribe(listener);

      const event: ComplexEvent = {
        id: 1,
        data: { nested: { value: 'test' } },
        timestamp: new Date(),
      };

      bus.publish(event);

      expect(listener).toHaveBeenCalledWith(event);
    });
  });
});
