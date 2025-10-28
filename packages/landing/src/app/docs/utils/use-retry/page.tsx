import { CodeBlock } from '../../../../components/CodeBlock';

export default function UseRetryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useRetry</h1>
      <p className="mb-4">A simple example of using `useRetry`:</p>
      <CodeBlock
        code={`import { useRetry } from '@resilient/utils';
import { DefaultRetryPolicy } from '@resilient/core';

const fetchWithRetry = () => {
  const { data, error, loading, retry } = useRetry(
    () => fetch('https://api.example.com/data').then(res => res.json()),
    (err, attempt) => attempt < 3, // retry up to 3 times
    (attempt) => 1000 * Math.pow(2, attempt) // exponential backoff
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <button onClick={retry}>Retry</button>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`}
        language="tsx"
      />
    </div>
  );
}