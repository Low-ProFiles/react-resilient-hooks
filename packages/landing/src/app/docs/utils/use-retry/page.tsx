import { CodeBlock } from '../../../../components/CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';

export default function UseRetryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">useRetry</h1>
      <p className="mb-4">A simple example of using `useRetry` with animations and a11y features:</p>
      <CodeBlock
        code={`import { useRetry } from '@resilient/utils';
import { DefaultRetryPolicy } from '@resilient/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

const fetchWithRetry = () => {
  const { data, error, loading, retry } = useRetry(
    () => fetch('https://api.example.com/data').then(res => res.json()),
    (err, attempt) => attempt < 3, // retry up to 3 times
    (attempt) => 1000 * Math.pow(2, attempt) // exponential backoff
  );
  const errorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

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
            <button onClick={retry} ref={errorRef}>Retry</button>
          </motion.div>
        )}
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`} />
    </div>
  );
}