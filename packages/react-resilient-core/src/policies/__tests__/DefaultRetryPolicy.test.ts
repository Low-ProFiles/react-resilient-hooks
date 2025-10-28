import { DefaultRetryPolicy } from '../implementations';

describe('DefaultRetryPolicy', () => {
  it('should retry a specified number of times', () => {
    const policy = new DefaultRetryPolicy(3, 100);
    expect(policy.shouldRetry(new Error('test'))).toBe(true);
    expect(policy.shouldRetry(new Error('test'))).toBe(true);
    expect(policy.shouldRetry(new Error('test'))).toBe(true);
    expect(policy.shouldRetry(new Error('test'))).toBe(false);
  });

  it('should calculate exponential backoff delay', () => {
    const policy = new DefaultRetryPolicy(3, 100);
    expect(policy.getDelay(1)).toBe(200);
    expect(policy.getDelay(2)).toBe(400);
    expect(policy.getDelay(3)).toBe(800);
  });
});
