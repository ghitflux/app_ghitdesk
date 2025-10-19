import { JWTAuthStrategy, type JWTConfig, type AuthResult } from '@ghit/core';
import { BetterAuthService } from '../BetterAuthService';
import { Logger } from '@ghit/core';

/**
 * JWT Authentication Strategy integrated with Better Auth
 * Extends the core JWTAuthStrategy to work with Better Auth
 */
export class BetterAuthJWTStrategy extends JWTAuthStrategy {
  private betterAuth = BetterAuthService.getInstance();
  private logger = Logger.getInstance();

  constructor(config: JWTConfig) {
    super(config);
  }

  /**
   * Authenticate using Better Auth and return JWT
   */
  async authenticate(credentials: Record<string, any>): Promise<AuthResult> {
    try {
      const { email, password } = credentials;

      // Use Better Auth to sign in
      const result = await this.betterAuth.signIn(email, password);

      if (!result || !result.user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate JWT token using parent strategy
      const jwtResult = await super.authenticate({
        email: result.user.email,
        userId: result.user.id,
        name: result.user.name,
        roles: (result.user as any).roles || [],
      });

      return jwtResult;
    } catch (error) {
      this.logger.error({ error }, 'Better Auth JWT authentication failed');
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Sign up a new user and return JWT
   */
  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const result = await this.betterAuth.signUp(email, password, name);

      if (!result || !result.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // Generate JWT token
      const jwtResult = await super.authenticate({
        email: result.user.email,
        userId: result.user.id,
        name: result.user.name,
        roles: (result.user as any).roles || [],
      });

      return jwtResult;
    } catch (error) {
      this.logger.error({ error }, 'Better Auth signup failed');
      return { success: false, error: 'Signup failed' };
    }
  }
}
