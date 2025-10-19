import { Pool, PoolClient, PoolConfig } from 'pg';
import { Logger } from './Logger';

/**
 * Singleton pattern for PostgreSQL connection pool
 * Ensures only one database connection pool exists throughout the application
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private pool: Pool;
  private logger = Logger.getInstance();
  private isConnected = false;

  private constructor(config?: PoolConfig) {
    const defaultConfig: PoolConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'ghitdesk',
      user: process.env.POSTGRES_USER || 'ghitdesk',
      password: process.env.POSTGRES_PASSWORD || 'ghitdesk_dev_password',
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config || defaultConfig);

    // Setup event listeners
    this.pool.on('connect', (client: PoolClient) => {
      this.isConnected = true;
      this.logger.info({ clientId: (client as any).processID }, 'New client connected to database pool');
    });

    this.pool.on('error', (err: Error) => {
      this.logger.error({ err }, 'Unexpected error on idle database client');
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      this.logger.info('Client removed from database pool');
    });
  }

  /**
   * Get the singleton instance of DatabaseConnection
   * @param config Optional pool configuration (only used on first instantiation)
   */
  public static getInstance(config?: PoolConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get the underlying Pool instance for direct queries
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute a query using the pool
   */
  public async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
      return result.rows;
    } catch (error) {
      this.logger.error({ error, text, params }, 'Query execution failed');
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      this.logger.debug('Client checked out from pool');
      return client;
    } catch (error) {
      this.logger.error({ error }, 'Failed to get client from pool');
      throw error;
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      this.isConnected = true;
      this.logger.info('Database connection test successful');
      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error({ error }, 'Database connection test failed');
      return false;
    }
  }

  /**
   * Check if database is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Close all connections in the pool
   * Should only be called on application shutdown
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      this.logger.info('Database pool closed successfully');
      DatabaseConnection.instance = null;
    } catch (error) {
      this.logger.error({ error }, 'Error closing database pool');
      throw error;
    }
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }
}

// Export a convenience function to get the instance
export const getDatabase = () => DatabaseConnection.getInstance();
