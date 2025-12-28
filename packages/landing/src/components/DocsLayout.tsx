import { Sidebar } from './Sidebar';
import { ReactNode } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const DocsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
};
