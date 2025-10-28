export type SensitiveFilterFn = (obj: any) => any;
export declare function redactSensitiveFields(obj: any, extraKeys?: string[], customKeywords?: string[]): any;
