'use client';

import { useState, useRef } from 'react';
import { useBackgroundSync, useNetworkStatus } from 'react-resilient-hooks';

interface Message {
  id: string;
  content: string;
  status: 'queued' | 'syncing' | 'synced' | 'failed';
  timestamp: string;
}

export function UseBackgroundSyncDemo() {
  const { data: network } = useNetworkStatus();
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [syncedCount, setSyncedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { status, enqueue, flush } = useBackgroundSync({
    onSuccess: (req) => {
      setMessages(prev =>
        prev.map(msg => msg.id === req.id ? { ...msg, status: 'synced' } : msg)
      );
      setSyncedCount(c => c + 1);
    },
    onError: (req) => {
      setMessages(prev =>
        prev.map(msg => msg.id === req.id ? { ...msg, status: 'failed' } : msg)
      );
    },
  });

  const isSyncing = status.status === 'loading';
  const queueSize = messages.filter(m => m.status === 'queued' || m.status === 'syncing').length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageContent.trim()) return;

    const id = await enqueue(
      '/api/messages',
      { method: 'POST', body: JSON.stringify({ content: messageContent }) },
      { content: messageContent }
    );

    const newMessage: Message = {
      id,
      content: messageContent,
      status: 'queued',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessageContent('');
    inputRef.current?.focus();
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'queued':
        return <span className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'syncing':
        return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
      case 'synced':
        return <span className="w-2 h-2 rounded-full bg-green-500" />;
      case 'failed':
        return <span className="w-2 h-2 rounded-full bg-red-500" />;
    }
  };

  const getStatusLabel = (status: Message['status']) => {
    switch (status) {
      case 'queued': return 'Queued';
      case 'syncing': return 'Syncing...';
      case 'synced': return 'Synced';
      case 'failed': return 'Failed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${network?.online ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className={`font-semibold ${network?.online ? 'text-green-600' : 'text-red-600'}`}>
              {network?.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Queue</p>
          <p className={`font-semibold ${queueSize > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
            {queueSize} pending
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
          <div className="flex items-center justify-center gap-2">
            {isSyncing && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
            <p className={`font-semibold ${isSyncing ? 'text-blue-600' : 'text-gray-600'}`}>
              {isSyncing ? 'Syncing' : 'Idle'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Synced</p>
          <p className="font-semibold text-green-600">{syncedCount}</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type a message to queue..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-shadow"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          disabled={!messageContent.trim()}
        >
          Queue
        </button>
        <button
          type="button"
          onClick={flush}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          disabled={isSyncing || queueSize === 0}
        >
          Flush
        </button>
      </form>

      {/* Message List */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-6 min-h-[200px]">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Message Queue</h4>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No messages queued yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(msg.status)}
                  <span className="font-medium">{msg.content}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  <span className={`text-xs font-medium ${
                    msg.status === 'queued' ? 'text-yellow-600' :
                    msg.status === 'syncing' ? 'text-blue-600' :
                    msg.status === 'synced' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getStatusLabel(msg.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">How to test</h4>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Open DevTools → Network tab → Select &quot;Offline&quot;. Queue some messages, then go back online.
          Messages will automatically sync when the connection is restored.
        </p>
      </div>
    </div>
  );
}
