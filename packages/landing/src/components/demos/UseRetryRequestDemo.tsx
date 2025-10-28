'use client';

import { useRetryRequest } from 'react-resilient-hooks';

export function UseRetryRequestDemo() {
  const { data, error, loading, retry } = useRetryRequest('https://httpbin.org/status/500', {}, { retries: 3 });

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
