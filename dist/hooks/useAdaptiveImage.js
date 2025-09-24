import { useMemo } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
export function useAdaptiveImage(src) {
    var networkStatus = useNetworkStatus().data;
    var chosen = useMemo(function () {
        var _a;
        if (!networkStatus)
            return src.high;
        var effectiveType = networkStatus.effectiveType, downlink = networkStatus.downlink;
        if (!effectiveType && !downlink)
            return src.high;
        var dl = typeof downlink === "number" ? downlink : 10;
        if ((effectiveType === null || effectiveType === void 0 ? void 0 : effectiveType.includes("2g")) || dl < 0.5)
            return src.low;
        if ((effectiveType === null || effectiveType === void 0 ? void 0 : effectiveType.includes("3g")) || dl < 1.5)
            return (_a = src.medium) !== null && _a !== void 0 ? _a : src.low;
        return src.high;
    }, [src.high, src.medium, src.low, networkStatus]);
    return chosen;
}
