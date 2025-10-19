import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { createServer } from 'http';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import singletons and services
import { DatabaseConnection, Logger } from '@ghit/core';
import { BetterAuthService } from './infrastructure/auth/BetterAuthService';
import { SocketService } from './infrastructure/realtime/SocketService';

// Import controllers
import { TicketController } from './domain/tickets/TicketController';
import { ticketService } from './domain/tickets/TicketService';

// Import middlewares
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';

/**
 * Fastify Server Singleton
 */
class FastifyServer {
  private static instance: FastifyServer | null = null;
  private app: ReturnType<typeof Fastify>;
  private httpServer: ReturnType<typeof createServer>;
  private logger = Logger.getInstance();
  private db = DatabaseConnection.getInstance();
  private betterAuth = BetterAuthService.getInstance();
  private socketService = SocketService.getInstance();

  private constructor() {
    this.logger.info('Initializing Fastify server');

    // Create Fastify instance
    this.app = Fastify({
      logger: false, // Use our custom logger
      requestIdLogLabel: 'requestId',
      disableRequestLogging: true,
      trustProxy: true,
    });

    // Create HTTP server
    this.httpServer = createServer(this.app.server);

    this.setupPlugins();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FastifyServer {
    if (!FastifyServer.instance) {
      FastifyServer.instance = new FastifyServer();
    }
    return FastifyServer.instance;
  }

  /**
   * Setup Fastify plugins
   */
  private async setupPlugins() {
    // CORS
    await this.app.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Security headers
    await this.app.register(helmet, {
      contentSecurityPolicy: false,
    });

    // Rate limiting
    await this.app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // Swagger/OpenAPI
    await this.app.register(swagger, {
      openapi: {
        info: {
          title: 'GhitDesk API',
          description: 'Help Desk API with Better Auth, SLA management and real-time features',
          version: '0.1.0',
        },
        servers: [
          {
            url: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Tickets', description: 'Ticket management' },
          { name: 'Tasks', description: 'Task management' },
          { name: 'Contacts', description: 'Contact management' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    // Swagger UI
    await this.app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
    });

    this.logger.info('Fastify plugins registered');
  }

  /**
   * Setup application routes
   */
  private async setupRoutes() {
    // Health check
    this.app.get('/health', {
      schema: {
        tags: ['System'],
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    }, async (request, reply) => {
      const dbConnected = this.db.getConnectionStatus();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime(),
      };
    });

    // Better Auth routes
    this.app.all('/api/auth/*', async (request, reply) => {
      const auth = this.betterAuth.getAuth();
      return auth.handler(request.raw, reply.raw);
    });

    // Ticket routes
    const ticketController = new TicketController(ticketService);
    await this.app.register(async (instance) => {
      await ticketController.registerRoutes(instance);
    }, { prefix: '/api' });

    this.logger.info('Routes registered');
  }

  /**
   * Setup error handlers
   */
  private setupErrorHandlers() {
    this.app.setErrorHandler(errorHandler);
    this.app.setNotFoundHandler(notFoundHandler);
    this.logger.info('Error handlers registered');
  }

  /**
   * Start the server
   */
  public async start() {
    try {
      const port = parseInt(process.env.API_PORT || '3001', 10);
      const host = process.env.API_HOST || '0.0.0.0';

      // Test database connection
      const dbConnected = await this.db.testConnection();
      if (!dbConnected) {
        throw new Error('Failed to connect to database');
      }

      // Initialize Socket.IO
      this.socketService.initialize(this.httpServer);
      this.logger.info('Socket.IO initialized');

      // Start server
      await this.app.listen({ port, host });

      this.logger.info(
        {
          port,
          host,
          environment: process.env.NODE_ENV || 'development',
        },
        'Server started successfully'
      );

      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 GhitDesk API Server                                  ║
║                                                           ║
║   Server:    http://${host}:${port}                   ║
║   Docs:      http://${host}:${port}/docs             ║
║   Health:    http://${host}:${port}/health           ║
║                                                           ║
║   Database:  ✓ Connected                                  ║
║   Socket.IO: ✓ Ready                                      ║
║   Auth:      ✓ Better Auth                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    } catch (error) {
      this.logger.fatal({ error }, 'Failed to start server');
      process.exit(1);
    }
  }

  /**
   * Stop the server
   */
  public async stop() {
    try {
      await this.socketService.close();
      await this.db.close();
      await this.app.close();

      this.logger.info('Server stopped gracefully');
    } catch (error) {
      this.logger.error({ error }, 'Error stopping server');
      throw error;
    }
  }

  /**
   * Get Fastify app instance
   */
  public getApp() {
    return this.app;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  const server = FastifyServer.getInstance();
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  const server = FastifyServer.getInstance();
  await server.stop();
  process.exit(0);
});

// Start server
const server = FastifyServer.getInstance();
server.start();

export default FastifyServer;
