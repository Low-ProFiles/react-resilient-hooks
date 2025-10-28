export declare function useWebsocket(url: string): {
    messages: any[];
    error: Error;
    sendMessage: (message: any) => void;
};
