'use client';

import { useEffect, useState } from 'react';
import { sseClient } from '@/services/sse-client';

export function useSSE() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to SSE
    sseClient.connect();
    setIsConnected(sseClient.getStatus());

    // Cleanup on unmount
    return () => {
      // Don't disconnect, keep connection alive for other components
      // sseClient.disconnect();
    };
  }, []);

  return { isConnected };
}

export function useSSEEvent<T = unknown>(
  eventName: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const unsubscribe = sseClient.on(eventName, callback as (data: unknown) => void);

    return () => {
      unsubscribe();
    };
  }, [eventName, callback]);
}
