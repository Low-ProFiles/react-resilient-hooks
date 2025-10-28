var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useCallback, useRef, useState } from "react";
export function useQueue() {
    var _a = useState([]), queue = _a[0], setQueue = _a[1];
    var ref = useRef(queue);
    ref.current = queue;
    var enqueue = useCallback(function (item) {
        setQueue(function (prev) { return __spreadArray(__spreadArray([], prev, true), [item], false); });
    }, []);
    var dequeue = useCallback(function () {
        var item;
        setQueue(function (prev) {
            item = prev[0];
            return prev.slice(1);
        });
        return item;
    }, []);
    var peek = useCallback(function () { return ref.current[0]; }, []);
    return { queue: queue, enqueue: enqueue, dequeue: dequeue, peek: peek };
}
