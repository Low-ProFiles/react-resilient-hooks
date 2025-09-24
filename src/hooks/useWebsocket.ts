import { useState, useEffect, useRef } from 'react';

export function useWebsocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setSocket(ws);
      setError(null);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onerror = (event) => {
      setError(new Error('WebSocket error'));
    };

    ws.onclose = () => {
      if (!reconnectTimeout.current) {
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (socket) {
      socket.send(message);
    }
  };

  return { messages, error, sendMessage };
}
