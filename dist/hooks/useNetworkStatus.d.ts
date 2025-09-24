import { ResilientState } from "../core/types";
export type NetworkInfo = {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
};
export declare function useNetworkStatus(): ResilientState<NetworkInfo>;
