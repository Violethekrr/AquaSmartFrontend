import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error('WebSocket parse error', e);
      }
    };
    return () => {
      ws.current?.close();
    };
  }, [url]);

  return lastMessage;
};