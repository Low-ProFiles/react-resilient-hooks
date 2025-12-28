'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 z-50">
        <Link href="/" className="font-bold text-lg">
          @resilient
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64">
          <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Link href="/" className="font-bold text-lg">
              @resilient
            </Link>
          </div>
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed left-0 top-16 bottom-0 w-64 z-50 transform transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="pt-20 lg:pt-8 px-4 lg:px-8 pb-12 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
