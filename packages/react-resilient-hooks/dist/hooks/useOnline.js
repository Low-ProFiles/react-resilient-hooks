import { useNetworkStatus } from "./useNetworkStatus";
export function useOnline() {
    var _a;
    var networkStatus = useNetworkStatus().data;
    return (_a = networkStatus === null || networkStatus === void 0 ? void 0 : networkStatus.online) !== null && _a !== void 0 ? _a : true;
}
