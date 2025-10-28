import { codeToArray } from '../utils/codeUtils';

export const CodeBlock = ({ code }: { code: string }) => {
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm font-mono">
      <code>{codeToArray(code).join('\n')}</code>
    </pre>
  );
};