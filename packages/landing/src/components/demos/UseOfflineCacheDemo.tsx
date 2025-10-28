'use client';

import { useOfflineCache } from '@resilient/utils';
import { MemoryCacheStore } from '@resilient/core';

const cacheStore = new MemoryCacheStore();

export function UseOfflineCacheDemo() {
  const { data, loading, error } = useOfflineCache(
    'user_profile',
    () => fetch('https://jsonplaceholder.typicode.com/users/1').then((res) => res.json()),
    cacheStore
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold">User Profile</h2>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
    </div>
  );
}
