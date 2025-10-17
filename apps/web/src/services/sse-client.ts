/**
 * SSE Client (Singleton)
 * Gerencia conexão EventSource para real-time
 */

type EventListener = (data: unknown) => void;

class SSEClient {
  private static instance: SSEClient;
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Set<EventListener>>();
  private isConnected = false;
  private url: string;

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(url?: string): SSEClient {
    if (!SSEClient.instance) {
      const sseUrl = url || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/bff'}/events/stream`;
      SSEClient.instance = new SSEClient(sseUrl);
    }
    return SSEClient.instance;
  }

  connect(): void {
    if (this.isConnected) return;

    console.log('📡 SSE: Connecting...');

    this.eventSource = new EventSource(this.url, {
      withCredentials: true,
    });

    this.eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event) {
          this.emit(data.event, data.data);
        }
      } catch (error) {
        console.error('SSE: Failed to parse message', error);
      }
    });

    this.eventSource.addEventListener('open', () => {
      console.log('✅ SSE: Connected');
      this.isConnected = true;
    });

    this.eventSource.addEventListener('error', () => {
      console.error('❌ SSE: Connection error');
      this.disconnect();
      // Reconectar após 5s
      setTimeout(() => this.connect(), 5000);
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    console.log('🔌 SSE: Disconnected');
  }

  on(event: string, listener: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Retornar função para unsubscribe
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  private emit(event: string, data: unknown): void {
    console.log(`📨 SSE Event: ${event}`, data);
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in SSE listener for ${event}:`, error);
      }
    });
  }

  getStatus(): boolean {
    return this.isConnected;
  }
}

export const sseClient = SSEClient.getInstance();
