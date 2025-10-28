export declare function useQueue<T>(): {
    queue: T[];
    enqueue: (item: T) => void;
    dequeue: () => T;
    peek: () => T;
};
