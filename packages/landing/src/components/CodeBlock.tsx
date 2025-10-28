'use client';

export const CodeBlock = ({ code }: { code: string[] }) => {
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm font-mono">
      <code>{code.join('\n')}</code>
    </pre>
  );
};
