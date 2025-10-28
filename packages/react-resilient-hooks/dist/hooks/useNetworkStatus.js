import { useEffect, useState } from "react";
export function useNetworkStatus() {
    var _a, _b;
    var _c = useState({
        data: {
            online: typeof navigator !== "undefined" ? navigator.onLine : true,
            effectiveType: (_a = navigator === null || navigator === void 0 ? void 0 : navigator.connection) === null || _a === void 0 ? void 0 : _a.effectiveType,
            downlink: (_b = navigator === null || navigator === void 0 ? void 0 : navigator.connection) === null || _b === void 0 ? void 0 : _b.downlink
        },
        error: null,
        loading: false
    }), state = _c[0], setState = _c[1];
    useEffect(function () {
        var _a;
        var update = function () {
            var _a, _b;
            setState({
                data: {
                    online: navigator.onLine,
                    effectiveType: (_a = navigator === null || navigator === void 0 ? void 0 : navigator.connection) === null || _a === void 0 ? void 0 : _a.effectiveType,
                    downlink: (_b = navigator === null || navigator === void 0 ? void 0 : navigator.connection) === null || _b === void 0 ? void 0 : _b.downlink
                },
                error: null,
                loading: false
            });
        };
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        var conn = navigator === null || navigator === void 0 ? void 0 : navigator.connection;
        (_a = conn === null || conn === void 0 ? void 0 : conn.addEventListener) === null || _a === void 0 ? void 0 : _a.call(conn, "change", update);
        return function () {
            var _a;
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
            (_a = conn === null || conn === void 0 ? void 0 : conn.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(conn, "change", update);
        };
    }, []);
    return state;
}
