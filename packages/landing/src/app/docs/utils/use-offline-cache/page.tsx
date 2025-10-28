import { CodeBlock } from '../../../../components/CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';

export default function UseOfflineCachePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useOfflineCache</h1>
      <p className="mb-4">A simple example of using `useOfflineCache` with animations and a11y features:</p>
            <CodeBlock
              code={`import { useOfflineCache } from '@resilient/utils';
      import { MemoryCacheStore } from '@resilient/core';
      import { motion, AnimatePresence } from 'framer-motion';
      
      const cache = new MemoryCacheStore();
      
      const MyComponent = () => {
        const { data, error, loading } = useOfflineCache(
          'my-data-key',
          () => fetch('https://api.example.com/data').then(res => res.json()),
          cache
        );
      
        return (
          <div>
            <div aria-live="polite" role="status">
              {loading && <p>Loading...</p>}
              {error && <p>Error fetching data.</p>}
            </div>
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Loading...
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p>Error!</p>
                </motion.div>
              )}
              {data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </motion.div>)
              }
            </AnimatePresence>
          </div>
        );
      }`} />
    </div>
  );
}