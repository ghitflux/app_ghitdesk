import { io, Socket } from 'socket.io-client';

/**
 * WebSocket Communication Strategy
 * Implements real-time communication via Socket.IO
 */
export class WebSocketStrategy {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to WebSocket server
   */
  connect(url?: string): void {
    if (this.connected) {
      console.warn('[WebSocket] Already connected');
      return;
    }

    const socketUrl = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventHandlers();
    this.connected = true;

    console.log('[WebSocket] Connecting to:', socketUrl);
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log('[WebSocket] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && this.socket !== null && this.socket.connected;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn('[WebSocket] Not connected. Cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
    console.log('[WebSocket] Emitted:', event);
  }

  /**
   * Subscribe to event
   */
  on(event: string, callback: Function): () => void {
    if (!this.socket) {
      console.warn('[WebSocket] Not connected. Cannot subscribe to event:', event);
      return () => {};
    }

    // Store callback reference
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Register with socket
    this.socket.on(event, callback as any);

    console.log('[WebSocket] Subscribed to:', event);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      // Remove specific callback
      this.socket.off(event, callback as any);
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(event);
        }
      }
      console.log('[WebSocket] Unsubscribed from:', event);
    } else {
      // Remove all callbacks for event
      this.socket.off(event);
      this.listeners.delete(event);
      console.log('[WebSocket] Unsubscribed all from:', event);
    }
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    this.emit('join_room', room);
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.emit('leave_room', room);
  }

  /**
   * Subscribe to ticket events
   */
  onTicketCreated(callback: (ticket: any) => void): () => void {
    return this.on('ticket:created', callback);
  }

  onTicketUpdated(callback: (ticket: any) => void): () => void {
    return this.on('ticket:updated', callback);
  }

  onTicketDeleted(callback: (ticketId: string) => void): () => void {
    return this.on('ticket:deleted', callback);
  }

  /**
   * Subscribe to SLA events
   */
  onSLABreachWarning(callback: (ticket: any) => void): () => void {
    return this.on('sla:breach_warning', callback);
  }

  onSLABreached(callback: (ticket: any) => void): () => void {
    return this.on('sla:breached', callback);
  }

  /**
   * Get Socket instance for advanced usage
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const webSocketStrategy = new WebSocketStrategy();
