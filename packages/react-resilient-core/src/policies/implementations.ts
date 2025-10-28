import { RetryPolicy, CachePolicy } from './types';

export class DefaultRetryPolicy implements RetryPolicy {
  constructor(private maxRetries = 3, private delay = 1000) {}

  shouldRetry(error: any): boolean {
    return this.maxRetries > 0;
  }

  getDelay(attempt: number): number {
    return this.delay * Math.pow(2, attempt);
  }
}

export class DefaultCachePolicy implements CachePolicy {
  isCacheable(request: any): boolean {
    return request.method === 'GET';
  }

  getCacheKey(request: any): string {
    return request.url;
  }
}
