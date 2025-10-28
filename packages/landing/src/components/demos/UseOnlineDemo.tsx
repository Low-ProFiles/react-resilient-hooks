'use client';

import { useOnline } from "@resilient/utils";

export function UseOnlineDemo() {
  const isOnline = useOnline();

  return (
    <div className="flex items-center space-x-4">
      <span className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <p>You are currently {isOnline ? 'online' : 'offline'}</p>
    </div>
  );
}
