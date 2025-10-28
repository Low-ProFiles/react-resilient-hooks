import { CodeBlock } from '../../../../components/CodeBlock';

export default function UseOfflineCachePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useOfflineCache</h1>
      <p className="mb-4">A simple example of using `useOfflineCache`:</p>
      <CodeBlock
        code={`import { useOfflineCache } from '@resilient/utils';
import { MemoryCacheStore } from '@resilient/core';

const cache = new MemoryCacheStore();

const MyComponent = () => {
  const { data, error, loading } = useOfflineCache(
    'my-data-key',
    () => fetch('https://api.example.com/data').then(res => res.json()),
    cache
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`}
        language="tsx"
      />
    </div>
  );
}