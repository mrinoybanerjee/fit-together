import { useEffect, useRef, useState, useCallback } from 'react';

const MAX_BACKOFF_MS = 30_000;

export function useWebSocket(onMessage) {
  const wsRef = useRef(null);
  const backoffRef = useRef(1000);
  const retryRef = useRef(null);
  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'

  const connect = useCallback(() => {
    const token = localStorage.getItem('fit_token');
    if (!token) return;

    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}://${host}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      backoffRef.current = 1000; // reset backoff on success
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => setStatus('disconnected');

    ws.onclose = () => {
      setStatus('disconnected');
      // Exponential backoff reconnect
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
      retryRef.current = setTimeout(connect, delay);
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return status;
}
