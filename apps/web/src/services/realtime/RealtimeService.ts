import { WebSocketStrategy } from '../api/strategies/WebSocketStrategy';

export type RealtimeEventCallback<T = any> = (data: T) => void;

/**
 * Realtime Service Singleton
 * Manages WebSocket connections and real-time events
 */
export class RealtimeService {
  private static instance: RealtimeService | null = null;
  private wsStrategy: WebSocketStrategy;
  private initialized: boolean = false;

  private constructor() {
    this.wsStrategy = new WebSocketStrategy();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Initialize WebSocket connection
   */
  public init(url?: string): void {
    if (this.initialized) {
      console.warn('[RealtimeService] Already initialized');
      return;
    }

    this.wsStrategy.connect(url);
    this.initialized = true;

    console.log('[RealtimeService] Initialized');
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    this.wsStrategy.disconnect();
    this.initialized = false;
    console.log('[RealtimeService] Disconnected');
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.wsStrategy.isConnected();
  }

  /**
   * Join a room
   */
  public joinRoom(room: string): void {
    this.wsStrategy.joinRoom(room);
    console.log('[RealtimeService] Joined room:', room);
  }

  /**
   * Leave a room
   */
  public leaveRoom(room: string): void {
    this.wsStrategy.leaveRoom(room);
    console.log('[RealtimeService] Left room:', room);
  }

  /**
   * Subscribe to ticket created event
   */
  public onTicketCreated(callback: RealtimeEventCallback): () => void {
    console.log('[RealtimeService] Subscribed to ticket:created');
    return this.wsStrategy.onTicketCreated(callback);
  }

  /**
   * Subscribe to ticket updated event
   */
  public onTicketUpdated(callback: RealtimeEventCallback): () => void {
    console.log('[RealtimeService] Subscribed to ticket:updated');
    return this.wsStrategy.onTicketUpdated(callback);
  }

  /**
   * Subscribe to ticket deleted event
   */
  public onTicketDeleted(callback: RealtimeEventCallback<string>): () => void {
    console.log('[RealtimeService] Subscribed to ticket:deleted');
    return this.wsStrategy.onTicketDeleted(callback);
  }

  /**
   * Subscribe to SLA breach warning event
   */
  public onSLABreachWarning(callback: RealtimeEventCallback): () => void {
    console.log('[RealtimeService] Subscribed to sla:breach_warning');
    return this.wsStrategy.onSLABreachWarning(callback);
  }

  /**
   * Subscribe to SLA breached event
   */
  public onSLABreached(callback: RealtimeEventCallback): () => void {
    console.log('[RealtimeService] Subscribed to sla:breached');
    return this.wsStrategy.onSLABreached(callback);
  }

  /**
   * Subscribe to custom event
   */
  public on(event: string, callback: RealtimeEventCallback): () => void {
    console.log('[RealtimeService] Subscribed to:', event);
    return this.wsStrategy.on(event, callback);
  }

  /**
   * Unsubscribe from event
   */
  public off(event: string, callback?: RealtimeEventCallback): void {
    this.wsStrategy.off(event, callback);
    console.log('[RealtimeService] Unsubscribed from:', event);
  }

  /**
   * Emit custom event
   */
  public emit(event: string, data?: any): void {
    this.wsStrategy.emit(event, data);
  }

  /**
   * Get WebSocket strategy for advanced usage
   */
  public getStrategy(): WebSocketStrategy {
    return this.wsStrategy;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    RealtimeService.instance = null;
  }
}

// Export convenience function
export const getRealtimeService = () => RealtimeService.getInstance();
