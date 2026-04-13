import { useEffect, useRef } from 'react';
import { ReconnectingWebSocket } from '../lib/ws';
import { useRealtimeStore } from '../stores/realtime.store';
import { useAuthStore } from '../stores/auth.store';

export function useWebSocket() {
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { setConnected, setLatestHeartRate } = useRealtimeStore();

  useEffect(() => {
    if (!accessToken) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/ws?token=${accessToken}`;

    const ws = new ReconnectingWebSocket(url);
    wsRef.current = ws;

    ws.on('connection', (data) => {
      setConnected(data.status === 'connected');
    });

    ws.on('heart_rate_update', (data) => {
      setLatestHeartRate({ bpm: data.bpm, recordedAt: data.recordedAt });
    });

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [accessToken, setConnected, setLatestHeartRate]);
}
