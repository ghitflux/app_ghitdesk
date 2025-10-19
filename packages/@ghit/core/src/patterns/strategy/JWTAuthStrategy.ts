import { AuthStrategy, AuthResult, VerifyResult, AuthUser } from './AuthStrategy';
import { Logger } from '../singleton/Logger';
import { CacheManager } from '../singleton/CacheManager';

/**
 * JWT configuration interface
 */
export interface JWTConfig {
  secret: string;
  expiresIn?: string | number; // e.g., '7d', 3600
  algorithm?: 'HS256' | 'HS384' | 'HS512';
  issuer?: string;
  audience?: string;
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  roles?: string[];
  iat: number; // issued at
  exp: number; // expiration
  iss?: string; // issuer
  aud?: string; // audience
}

/**
 * JWT Authentication Strategy
 * Implements JWT-based authentication with token signing and verification
 */
export class JWTAuthStrategy extends AuthStrategy {
  readonly name = 'jwt';
  private config: Required<JWTConfig>;
  private logger = Logger.getInstance();
  private cache = CacheManager.getInstance();

  constructor(config: JWTConfig) {
    super();
    this.config = {
      secret: config.secret,
      expiresIn: config.expiresIn || '7d',
      algorithm: config.algorithm || 'HS256',
      issuer: config.issuer || 'ghitdesk',
      audience: config.audience || 'ghitdesk-api',
    };

    if (!this.config.secret || this.config.secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }
  }

  /**
   * Authenticate user and generate JWT token
   */
  async authenticate(credentials: Record<string, any>): Promise<AuthResult> {
    try {
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const { email, password, userId, name, roles } = credentials;

      // Basic validation
      if (!email || !userId || !name) {
        return { success: false, error: 'Missing required fields: email, userId, name' };
      }

      // In a real implementation, you would verify password against database here
      // For now, we'll assume credentials are pre-verified

      const user: AuthUser = {
        id: userId,
        email,
        name,
        roles: roles || [],
      };

      const token = await this.generateToken(user);
      const expiresAt = await this.getExpiration(token);

      this.logger.info({ userId, email }, 'User authenticated successfully with JWT');

      return {
        success: true,
        user,
        token,
        expiresAt: expiresAt || undefined,
      };
    } catch (error) {
      this.logger.error({ error }, 'JWT authentication failed');
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Verify JWT token and extract user data
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.cache.exists(`jwt:blacklist:${token}`);
      if (isBlacklisted) {
        return { valid: false, error: 'Token has been revoked' };
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        return { valid: false, error: 'Invalid token' };
      }

      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
      };

      return { valid: true, user };
    } catch (error) {
      this.logger.error({ error }, 'JWT verification failed');
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Revoke a JWT token by adding it to blacklist
   */
  async revoke(token: string): Promise<boolean> {
    try {
      const payload = await this.verifyToken(token);
      if (!payload) {
        return false;
      }

      // Calculate remaining TTL
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

      // Add to blacklist with TTL
      await this.cache.set(`jwt:blacklist:${token}`, true, ttlSeconds);

      this.logger.info({ userId: payload.sub }, 'JWT token revoked');
      return true;
    } catch (error) {
      this.logger.error({ error }, 'Failed to revoke JWT token');
      return false;
    }
  }

  /**
   * Refresh a JWT token
   */
  async refresh(token: string): Promise<AuthResult> {
    try {
      const verifyResult = await this.verify(token);
      if (!verifyResult.valid || !verifyResult.user) {
        return { success: false, error: 'Invalid token' };
      }

      // Revoke old token
      await this.revoke(token);

      // Generate new token
      const newToken = await this.generateToken(verifyResult.user);
      const expiresAt = await this.getExpiration(newToken);

      this.logger.info({ userId: verifyResult.user.id }, 'JWT token refreshed');

      return {
        success: true,
        user: verifyResult.user,
        token: newToken,
        expiresAt: expiresAt || undefined,
      };
    } catch (error) {
      this.logger.error({ error }, 'JWT token refresh failed');
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Get token expiration date
   */
  async getExpiration(token: string): Promise<Date | null> {
    try {
      const payload = await this.verifyToken(token);
      if (!payload) {
        return null;
      }
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a JWT token
   */
  private async generateToken(user: AuthUser): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiration(this.config.expiresIn);

    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      iat: now,
      exp: now + expiresIn,
      iss: this.config.issuer,
      aud: this.config.audience,
    };

    // In a real implementation, use a proper JWT library like 'jsonwebtoken'
    // This is a simplified version for demonstration
    const header = this.base64UrlEncode(JSON.stringify({ alg: this.config.algorithm, typ: 'JWT' }));
    const body = this.base64UrlEncode(JSON.stringify(payload));
    const signature = await this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify a JWT token
   */
  private async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [header, body, signature] = parts;
      const expectedSignature = await this.sign(`${header}.${body}`);

      if (signature !== expectedSignature) {
        return null;
      }

      const payload: JWTPayload = JSON.parse(this.base64UrlDecode(body));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sign a message with HMAC
   */
  private async sign(message: string): Promise<string> {
    // In a real implementation, use crypto.createHmac
    // This is a simplified version
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', this.config.secret);
    hmac.update(message);
    return this.base64UrlEncode(hmac.digest('base64'));
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  /**
   * Parse expiration string to seconds
   */
  private parseExpiration(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn;
    }

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // default 1 hour
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}
