import Redis, { RedisOptions } from 'ioredis';
import { Logger } from './Logger';

/**
 * Singleton pattern for Redis cache management
 * Provides a centralized caching layer for the application
 */
export class CacheManager {
  private static instance: CacheManager | null = null;
  private client: Redis;
  private logger = Logger.getInstance();
  private isConnected = false;

  private constructor(options?: RedisOptions) {
    const defaultOptions: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || 'ghitdesk_redis_password',
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn({ times, delay }, 'Retrying Redis connection');
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    };

    this.client = new Redis(options || defaultOptions);

    // Setup event listeners
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.info('Connected to Redis');
    });

    this.client.on('ready', () => {
      this.logger.info('Redis client ready');
    });

    this.client.on('error', (err: Error) => {
      this.isConnected = false;
      this.logger.error({ err }, 'Redis client error');
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.info('Redis client reconnecting');
    });
  }

  /**
   * Get the singleton instance of CacheManager
   * @param options Optional Redis configuration (only used on first instantiation)
   */
  public static getInstance(options?: RedisOptions): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  /**
   * Get the underlying Redis client
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      this.logger.debug({ key, ttl }, 'Cache set');
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to set cache');
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        this.logger.debug({ key }, 'Cache miss');
        return null;
      }
      this.logger.debug({ key }, 'Cache hit');
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to get cache');
      throw error;
    }
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug({ key }, 'Cache key deleted');
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to delete cache key');
      throw error;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  public async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      const deleted = await this.client.del(...keys);
      this.logger.debug({ pattern, deleted }, 'Cache keys deleted by pattern');
      return deleted;
    } catch (error) {
      this.logger.error({ error, pattern }, 'Failed to delete cache keys by pattern');
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to check key existence');
      throw error;
    }
  }

  /**
   * Set expiration time for a key (in seconds)
   */
  public async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
      this.logger.debug({ key, seconds }, 'Cache key expiration set');
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to set key expiration');
      throw error;
    }
  }

  /**
   * Get time to live for a key (in seconds)
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to get TTL');
      throw error;
    }
  }

  /**
   * Increment a numeric value
   */
  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to increment key');
      throw error;
    }
  }

  /**
   * Decrement a numeric value
   */
  public async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to decrement key');
      throw error;
    }
  }

  /**
   * Clear all keys in the current database
   * WARNING: Use with caution!
   */
  public async flushDb(): Promise<void> {
    try {
      await this.client.flushdb();
      this.logger.warn('Redis database flushed');
    } catch (error) {
      this.logger.error({ error }, 'Failed to flush database');
      throw error;
    }
  }

  /**
   * Test Redis connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      this.isConnected = true;
      this.logger.info('Redis connection test successful');
      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error({ error }, 'Redis connection test failed');
      return false;
    }
  }

  /**
   * Check if Redis is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Close Redis connection
   * Should only be called on application shutdown
   */
  public async close(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      this.logger.info('Redis connection closed successfully');
      CacheManager.instance = null;
    } catch (error) {
      this.logger.error({ error }, 'Error closing Redis connection');
      throw error;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    CacheManager.instance = null;
  }
}

// Export a convenience function to get the instance
export const getCache = () => CacheManager.getInstance();
