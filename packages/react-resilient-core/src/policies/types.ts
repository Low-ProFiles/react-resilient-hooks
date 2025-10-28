export interface RetryPolicy {
  shouldRetry(error: any): boolean;
  getDelay(attempt: number): number;
}

export interface CachePolicy {
  isCacheable(request: any): boolean;
  getCacheKey(request: any): string;
}
