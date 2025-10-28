'use client';

import { useWebsocket } from "@resilient/utils";

export function UseWebsocketDemo() {
  const { messages, error, sendMessage } = useWebsocket('wss://echo.websocket.org');

  return (
    <div>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        className="border p-2"
      />
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  );
}
