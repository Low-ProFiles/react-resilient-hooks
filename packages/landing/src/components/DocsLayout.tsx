import { Sidebar } from './Sidebar';
import { ReactNode } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ResilientProvider } from 'react-resilient-hooks';

export const DocsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <ResilientProvider storageType="encrypted-local" passphrase="your-secret-passphrase">
          {children}
        </ResilientProvider>
      </main>
    </div>
  );
};
