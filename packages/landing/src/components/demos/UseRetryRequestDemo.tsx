'use client';

import { useRetryRequest } from '@resilient/utils';
import { DefaultRetryPolicy } from '@resilient/core';

export function UseRetryRequestDemo() {
  const { data, error, loading, retry } = useRetryRequest<Record<string, unknown>>('https://httpbin.org/status/500', {}, new DefaultRetryPolicy(3, 100));

  return (
    <div>
      <button onClick={retry} disabled={loading}>
        {loading ? 'Loading...' : 'Trigger Failing Request'}
      </button>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && <p className="text-green-500">Data: {JSON.stringify(data)}</p>}
    </div>
  );
}
