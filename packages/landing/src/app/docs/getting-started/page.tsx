import { CodeBlock } from '../../../components/CodeBlock';

export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Getting Started</h1>
      <p className="mb-4">Install the packages:</p>
      <CodeBlock code={`npm install @resilient/core @resilient/utils`} language="bash" />
      <p className="mt-4 mb-4">Wrap your application with the `ResilientProvider`:</p>
      <CodeBlock
        code={`import { ResilientProvider } from '@resilient/utils';

function MyApp({ Component, pageProps }) {
  return (
    <ResilientProvider>
      <Component {...pageProps} />
    </ResilientProvider>
  );
}`}
        language="tsx"
      />
    </div>
  );
}