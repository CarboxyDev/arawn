import type { RealtimeMetricsPoint } from '@repo/packages-types/stats';
import { useCallback, useEffect, useRef, useState } from 'react';

import { env } from '@/lib/env';

interface UseRealtimeMetricsOptions {
  enabled?: boolean;
  maxDataPoints?: number;
}

interface UseRealtimeMetricsResult {
  data: RealtimeMetricsPoint[];
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

export function useRealtimeMetrics(
  options: UseRealtimeMetricsOptions = {}
): UseRealtimeMetricsResult {
  const { enabled = true, maxDataPoints = 60 } = options;

  const [data, setData] = useState<RealtimeMetricsPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const connectRef = useRef<() => void>();

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${env.apiUrl}/admin/metrics/stream`;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    es.addEventListener('history', (event: MessageEvent) => {
      try {
        const history = JSON.parse(event.data) as RealtimeMetricsPoint[];
        setData(history.slice(-maxDataPoints));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    });

    es.addEventListener('metrics', (event: MessageEvent) => {
      try {
        const metrics = JSON.parse(event.data) as RealtimeMetricsPoint;
        setData((prev) => {
          const updated = [...prev, metrics];
          return updated.slice(-maxDataPoints);
        });
      } catch (e) {
        console.error('Failed to parse metrics:', e);
      }
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;

      const backoff = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        30000
      );
      reconnectAttempts.current++;

      setError(new Error('Connection lost. Reconnecting...'));

      reconnectTimeoutRef.current = setTimeout(() => {
        if (enabled) {
          connectRef.current?.();
        }
      }, backoff);
    };
  }, [enabled, maxDataPoints]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [enabled, connect]);

  return { data, isConnected, error, reconnect };
}
