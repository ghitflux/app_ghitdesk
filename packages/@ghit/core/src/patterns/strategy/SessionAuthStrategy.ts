import { AuthStrategy, AuthResult, VerifyResult, AuthUser } from './AuthStrategy';
import { Logger } from '../singleton/Logger';
import { CacheManager } from '../singleton/CacheManager';

/**
 * Session configuration interface
 */
export interface SessionConfig {
  ttl?: number; // Time to live in seconds (default: 24 hours)
  prefix?: string; // Redis key prefix
  rolling?: boolean; // Extend session on each access
}

/**
 * Session data interface
 */
interface SessionData {
  user: AuthUser;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

/**
 * Session-based Authentication Strategy
 * Implements session-based authentication using Redis for session storage
 */
export class SessionAuthStrategy extends AuthStrategy {
  readonly name = 'session';
  private config: Required<SessionConfig>;
  private logger = Logger.getInstance();
  private cache = CacheManager.getInstance();

  constructor(config?: SessionConfig) {
    super();
    this.config = {
      ttl: config?.ttl || 86400, // 24 hours default
      prefix: config?.prefix || 'session',
      rolling: config?.rolling ?? true,
    };
  }

  /**
   * Authenticate user and create session
   */
  async authenticate(credentials: Record<string, any>): Promise<AuthResult> {
    try {
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const { email, password, userId, name, roles, metadata } = credentials;

      // Basic validation
      if (!email || !userId || !name) {
        return { success: false, error: 'Missing required fields: email, userId, name' };
      }

      // In a real implementation, you would verify password against database here

      const user: AuthUser = {
        id: userId,
        email,
        name,
        roles: roles || [],
        metadata,
      };

      const sessionId = this.generateSessionId();
      const now = Date.now();
      const expiresAt = now + this.config.ttl * 1000;

      const sessionData: SessionData = {
        user,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt,
        metadata,
      };

      // Store session in Redis
      const key = this.getSessionKey(sessionId);
      await this.cache.set(key, sessionData, this.config.ttl);

      this.logger.info({ userId, email, sessionId }, 'User authenticated successfully with session');

      return {
        success: true,
        user,
        token: sessionId,
        expiresAt: new Date(expiresAt),
      };
    } catch (error) {
      this.logger.error({ error }, 'Session authentication failed');
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Verify session and extract user data
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      const key = this.getSessionKey(token);
      const sessionData = await this.cache.get<SessionData>(key);

      if (!sessionData) {
        return { valid: false, error: 'Session not found or expired' };
      }

      // Check if session has expired
      const now = Date.now();
      if (sessionData.expiresAt < now) {
        await this.cache.del(key);
        return { valid: false, error: 'Session expired' };
      }

      // Update last accessed time if rolling sessions are enabled
      if (this.config.rolling) {
        sessionData.lastAccessedAt = now;
        sessionData.expiresAt = now + this.config.ttl * 1000;
        await this.cache.set(key, sessionData, this.config.ttl);
      }

      return { valid: true, user: sessionData.user };
    } catch (error) {
      this.logger.error({ error, token }, 'Session verification failed');
      return { valid: false, error: 'Session verification failed' };
    }
  }

  /**
   * Revoke a session
   */
  async revoke(token: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(token);
      const sessionData = await this.cache.get<SessionData>(key);

      if (!sessionData) {
        return false;
      }

      await this.cache.del(key);

      this.logger.info({ userId: sessionData.user.id, sessionId: token }, 'Session revoked');
      return true;
    } catch (error) {
      this.logger.error({ error, token }, 'Failed to revoke session');
      return false;
    }
  }

  /**
   * Refresh a session (extend expiration)
   */
  async refresh(token: string): Promise<AuthResult> {
    try {
      const key = this.getSessionKey(token);
      const sessionData = await this.cache.get<SessionData>(key);

      if (!sessionData) {
        return { success: false, error: 'Session not found' };
      }

      const now = Date.now();
      const newExpiresAt = now + this.config.ttl * 1000;

      sessionData.lastAccessedAt = now;
      sessionData.expiresAt = newExpiresAt;

      await this.cache.set(key, sessionData, this.config.ttl);

      this.logger.info({ userId: sessionData.user.id, sessionId: token }, 'Session refreshed');

      return {
        success: true,
        user: sessionData.user,
        token,
        expiresAt: new Date(newExpiresAt),
      };
    } catch (error) {
      this.logger.error({ error, token }, 'Session refresh failed');
      return { success: false, error: 'Session refresh failed' };
    }
  }

  /**
   * Get session expiration date
   */
  async getExpiration(token: string): Promise<Date | null> {
    try {
      const key = this.getSessionKey(token);
      const sessionData = await this.cache.get<SessionData>(key);

      if (!sessionData) {
        return null;
      }

      return new Date(sessionData.expiresAt);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session data
   */
  async getSessionData(token: string): Promise<SessionData | null> {
    try {
      const key = this.getSessionKey(token);
      return await this.cache.get<SessionData>(key);
    } catch (error) {
      this.logger.error({ error, token }, 'Failed to get session data');
      return null;
    }
  }

  /**
   * Update session metadata
   */
  async updateMetadata(token: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      const key = this.getSessionKey(token);
      const sessionData = await this.cache.get<SessionData>(key);

      if (!sessionData) {
        return false;
      }

      sessionData.metadata = { ...sessionData.metadata, ...metadata };
      sessionData.lastAccessedAt = Date.now();

      await this.cache.set(key, sessionData, this.config.ttl);

      return true;
    } catch (error) {
      this.logger.error({ error, token }, 'Failed to update session metadata');
      return false;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllForUser(userId: string): Promise<number> {
    try {
      const pattern = `${this.config.prefix}:*`;
      const keys = await this.cache.getClient().keys(pattern);

      let revoked = 0;
      for (const key of keys) {
        const sessionData = await this.cache.get<SessionData>(key);
        if (sessionData && sessionData.user.id === userId) {
          await this.cache.del(key);
          revoked++;
        }
      }

      this.logger.info({ userId, revoked }, 'All sessions revoked for user');
      return revoked;
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to revoke all sessions for user');
      return 0;
    }
  }

  /**
   * Generate a session ID
   */
  private generateSessionId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get Redis key for session
   */
  private getSessionKey(sessionId: string): string {
    return `${this.config.prefix}:${sessionId}`;
  }
}
