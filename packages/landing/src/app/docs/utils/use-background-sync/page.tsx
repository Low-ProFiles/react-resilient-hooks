import { CodeBlock } from '../../../../components/CodeBlock';

export default function UseBackgroundSyncPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useBackgroundSync</h1>
      <p className="mb-4">A simple example of using `useBackgroundSync`:</p>
      <CodeBlock
        code={`import { useBackgroundSync } from '@resilient/utils';
import { MemoryQueueStore } from '@resilient/core';

const queue = new MemoryQueueStore();

const MyComponent = () => {
  const { enqueue } = useBackgroundSync(queue);

  const handleClick = () => {
    enqueue('https://api.example.com/data', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello' }),
    });
  };

  return <button onClick={handleClick}>Sync in Background</button>;
}`}
        language="tsx"
      />
    </div>
  );
}