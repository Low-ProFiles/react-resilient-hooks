var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useRef } from 'react';
export function useWebsocket(url) {
    var _a = useState(null), socket = _a[0], setSocket = _a[1];
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var reconnectTimeout = useRef(null);
    var connect = function () {
        var ws = new WebSocket(url);
        ws.onopen = function () {
            setSocket(ws);
            setError(null);
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };
        ws.onmessage = function (event) {
            setMessages(function (prevMessages) { return __spreadArray(__spreadArray([], prevMessages, true), [event.data], false); });
        };
        ws.onerror = function (event) {
            setError(new Error('WebSocket error'));
        };
        ws.onclose = function () {
            if (!reconnectTimeout.current) {
                reconnectTimeout.current = setTimeout(function () {
                    connect();
                }, 3000);
            }
        };
    };
    useEffect(function () {
        connect();
        return function () {
            if (socket) {
                socket.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [url]);
    var sendMessage = function (message) {
        if (socket) {
            socket.send(message);
        }
    };
    return { messages: messages, error: error, sendMessage: sendMessage };
}
