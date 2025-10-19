import { SessionAuthStrategy, type SessionConfig, type AuthResult, type VerifyResult } from '@ghit/core';
import { BetterAuthService } from '../BetterAuthService';
import { Logger } from '@ghit/core';

/**
 * Session Authentication Strategy integrated with Better Auth
 * Uses Better Auth's built-in session management
 */
export class BetterAuthSessionStrategy extends SessionAuthStrategy {
  private betterAuth = BetterAuthService.getInstance();
  private logger = Logger.getInstance();

  constructor(config?: SessionConfig) {
    super(config);
  }

  /**
   * Authenticate using Better Auth session
   */
  async authenticate(credentials: Record<string, any>): Promise<AuthResult> {
    try {
      const { email, password } = credentials;

      // Use Better Auth to sign in
      const result = await this.betterAuth.signIn(email, password);

      if (!result || !result.user || !result.session) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          roles: (result.user as any).roles || [],
        },
        token: result.session.token,
        expiresAt: new Date(result.session.expiresAt),
      };
    } catch (error) {
      this.logger.error({ error }, 'Better Auth session authentication failed');
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Verify session using Better Auth
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      const result = await this.betterAuth.verifySession(token);

      if (!result || !result.user) {
        return { valid: false, error: 'Invalid session' };
      }

      return {
        valid: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          roles: (result.user as any).roles || [],
        },
      };
    } catch (error) {
      this.logger.error({ error }, 'Better Auth session verification failed');
      return { valid: false, error: 'Session verification failed' };
    }
  }

  /**
   * Revoke session using Better Auth
   */
  async revoke(token: string): Promise<boolean> {
    try {
      await this.betterAuth.signOut(token);
      return true;
    } catch (error) {
      this.logger.error({ error }, 'Failed to revoke session');
      return false;
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const result = await this.betterAuth.signUp(email, password, name);

      if (!result || !result.user || !result.session) {
        return { success: false, error: 'Failed to create user' };
      }

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          roles: (result.user as any).roles || [],
        },
        token: result.session.token,
        expiresAt: new Date(result.session.expiresAt),
      };
    } catch (error) {
      this.logger.error({ error }, 'Better Auth signup failed');
      return { success: false, error: 'Signup failed' };
    }
  }
}
