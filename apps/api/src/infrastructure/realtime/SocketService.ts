import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { Logger } from '@ghit/core';

/**
 * Socket event types
 */
export enum SocketEvent {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',

  // Ticket events
  TICKET_CREATED = 'ticket:created',
  TICKET_UPDATED = 'ticket:updated',
  TICKET_DELETED = 'ticket:deleted',
  TICKET_ASSIGNED = 'ticket:assigned',
  TICKET_STATUS_CHANGED = 'ticket:status_changed',

  // Task events
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',

  // Message events
  MESSAGE_RECEIVED = 'message:received',

  // SLA events
  SLA_BREACH_WARNING = 'sla:breach_warning',
  SLA_BREACHED = 'sla:breached',
}

/**
 * Singleton pattern for Socket.IO service
 * Provides real-time communication capabilities
 */
export class SocketService {
  private static instance: SocketService | null = null;
  private io: SocketIOServer | null = null;
  private logger = Logger.getInstance();
  private connectedClients = new Map<string, Socket>();

  private constructor() {
    this.logger.info('Socket service instance created');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize Socket.IO with HTTP server
   */
  public initialize(httpServer: HTTPServer): SocketIOServer {
    if (this.io) {
      this.logger.warn('Socket.IO already initialized');
      return this.io;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();

    this.logger.info('Socket.IO initialized successfully');
    return this.io;
  }

  /**
   * Get Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Call initialize() first.');
    }
    return this.io;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new client connection
   */
  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    this.logger.info({ clientId, handshake: socket.handshake.address }, 'Client connected');

    // Join room handler
    socket.on(SocketEvent.JOIN_ROOM, (room: string) => {
      socket.join(room);
      this.logger.debug({ clientId, room }, 'Client joined room');
      socket.emit('room_joined', { room });
    });

    // Leave room handler
    socket.on(SocketEvent.LEAVE_ROOM, (room: string) => {
      socket.leave(room);
      this.logger.debug({ clientId, room }, 'Client left room');
      socket.emit('room_left', { room });
    });

    // Disconnect handler
    socket.on(SocketEvent.DISCONNECT, () => {
      this.handleDisconnect(clientId);
    });

    // Error handler
    socket.on('error', (error: Error) => {
      this.logger.error({ clientId, error }, 'Socket error');
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnect(clientId: string): void {
    this.connectedClients.delete(clientId);
    this.logger.info({ clientId }, 'Client disconnected');
  }

  /**
   * Emit event to all clients
   */
  public broadcast(event: SocketEvent | string, data: any): void {
    if (!this.io) {
      this.logger.warn('Socket.IO not initialized, cannot broadcast');
      return;
    }

    this.io.emit(event, data);
    this.logger.debug({ event, dataKeys: Object.keys(data) }, 'Broadcasted event to all clients');
  }

  /**
   * Emit event to specific room
   */
  public emitToRoom(room: string, event: SocketEvent | string, data: any): void {
    if (!this.io) {
      this.logger.warn('Socket.IO not initialized, cannot emit to room');
      return;
    }

    this.io.to(room).emit(event, data);
    this.logger.debug({ room, event, dataKeys: Object.keys(data) }, 'Emitted event to room');
  }

  /**
   * Emit event to specific client
   */
  public emitToClient(clientId: string, event: SocketEvent | string, data: any): void {
    const socket = this.connectedClients.get(clientId);

    if (!socket) {
      this.logger.warn({ clientId }, 'Client not found');
      return;
    }

    socket.emit(event, data);
    this.logger.debug({ clientId, event, dataKeys: Object.keys(data) }, 'Emitted event to client');
  }

  /**
   * Emit event to multiple rooms
   */
  public emitToRooms(rooms: string[], event: SocketEvent | string, data: any): void {
    rooms.forEach((room) => {
      this.emitToRoom(room, event, data);
    });
  }

  /**
   * Get number of connected clients
   */
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get all connected client IDs
   */
  public getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Check if client is connected
   */
  public isClientConnected(clientId: string): boolean {
    return this.connectedClients.has(clientId);
  }

  /**
   * Disconnect a specific client
   */
  public disconnectClient(clientId: string, reason?: string): void {
    const socket = this.connectedClients.get(clientId);

    if (!socket) {
      this.logger.warn({ clientId }, 'Cannot disconnect client: not found');
      return;
    }

    socket.disconnect(true);
    this.logger.info({ clientId, reason }, 'Client disconnected by server');
  }

  /**
   * Disconnect all clients
   */
  public disconnectAll(reason?: string): void {
    if (!this.io) return;

    this.io.disconnectSockets(true);
    this.connectedClients.clear();
    this.logger.info({ reason }, 'All clients disconnected');
  }

  /**
   * Close Socket.IO server
   */
  public async close(): Promise<void> {
    if (!this.io) return;

    return new Promise((resolve) => {
      this.io!.close(() => {
        this.connectedClients.clear();
        this.io = null;
        this.logger.info('Socket.IO server closed');
        resolve();
      });
    });
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    SocketService.instance = null;
  }
}

// Export convenience function
export const getSocketService = () => SocketService.getInstance();

// Export helper functions for common operations
export const emitTicketCreated = (ticket: any) => {
  const socketService = SocketService.getInstance();
  socketService.broadcast(SocketEvent.TICKET_CREATED, ticket);
};

export const emitTicketUpdated = (ticket: any) => {
  const socketService = SocketService.getInstance();
  socketService.broadcast(SocketEvent.TICKET_UPDATED, ticket);
  socketService.emitToRoom(`ticket:${ticket.id}`, SocketEvent.TICKET_UPDATED, ticket);
};

export const emitSLABreachWarning = (ticket: any) => {
  const socketService = SocketService.getInstance();
  socketService.broadcast(SocketEvent.SLA_BREACH_WARNING, ticket);
  if (ticket.assigneeId) {
    socketService.emitToRoom(`user:${ticket.assigneeId}`, SocketEvent.SLA_BREACH_WARNING, ticket);
  }
};
