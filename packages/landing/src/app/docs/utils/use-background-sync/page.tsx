import { CodeBlock } from '../../../../components/CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';

export default function UseBackgroundSyncPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useBackgroundSync</h1>
      <p className="mb-4">A simple example of using `useBackgroundSync` with animations:</p>
      <CodeBlock
        code={`import { useBackgroundSync } from '@resilient/utils';
import { MemoryQueueStore } from '@resilient/core';
import { motion, AnimatePresence } from 'framer-motion';

const queue = new MemoryQueueStore();

const MyComponent = () => {
  const { enqueue, status } = useBackgroundSync(queue);

  const handleClick = () => {
    enqueue('https://api.example.com/data', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello' }),
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Sync in Background</button>
      <AnimatePresence>
        {status.loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Syncing...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`}
        language="tsx"
      />
    </div>
  );
}
