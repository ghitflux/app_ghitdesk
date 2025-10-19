import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../database/connection';
import * as schema from '../database/schema';
import { Logger } from '@ghit/core';

/**
 * Singleton pattern for Better Auth service
 * Provides centralized authentication management
 */
export class BetterAuthService {
  private static instance: BetterAuthService | null = null;
  private auth: ReturnType<typeof betterAuth>;
  private logger = Logger.getInstance();

  private constructor() {
    this.logger.info('Initializing Better Auth service');

    this.auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          user: schema.users,
          session: schema.sessions,
          verificationToken: schema.verificationTokens,
        },
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
      },
      session: {
        cookieName: 'ghit-session',
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60, // 5 minutes
        },
      },
      socialProviders: {
        // Add social providers as needed
        // github: { clientId: '...', clientSecret: '...' },
      },
      advanced: {
        generateId: () => crypto.randomUUID(),
        cookiePrefix: 'ghit',
      },
      secret: process.env.BETTER_AUTH_SECRET || 'your-super-secret-better-auth-key-change-in-production',
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    });

    this.logger.info('Better Auth service initialized successfully');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): BetterAuthService {
    if (!BetterAuthService.instance) {
      BetterAuthService.instance = new BetterAuthService();
    }
    return BetterAuthService.instance;
  }

  /**
   * Get the Better Auth instance
   */
  public getAuth() {
    return this.auth;
  }

  /**
   * Sign up a new user
   */
  public async signUp(email: string, password: string, name: string) {
    try {
      this.logger.info({ email, name }, 'Creating new user');

      const result = await this.auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (result) {
        this.logger.info({ email }, 'User created successfully');
      }

      return result;
    } catch (error) {
      this.logger.error({ error, email }, 'Failed to create user');
      throw error;
    }
  }

  /**
   * Sign in a user
   */
  public async signIn(email: string, password: string) {
    try {
      this.logger.info({ email }, 'User signing in');

      const result = await this.auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      if (result) {
        this.logger.info({ email }, 'User signed in successfully');
      }

      return result;
    } catch (error) {
      this.logger.error({ error, email }, 'Failed to sign in user');
      throw error;
    }
  }

  /**
   * Sign out a user
   */
  public async signOut(sessionToken: string) {
    try {
      this.logger.info('User signing out');

      const result = await this.auth.api.signOut({
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });

      this.logger.info('User signed out successfully');
      return result;
    } catch (error) {
      this.logger.error({ error }, 'Failed to sign out user');
      throw error;
    }
  }

  /**
   * Get session from token
   */
  public async getSession(sessionToken: string) {
    try {
      const result = await this.auth.api.getSession({
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });

      return result;
    } catch (error) {
      this.logger.error({ error }, 'Failed to get session');
      return null;
    }
  }

  /**
   * Verify session and get user
   */
  public async verifySession(sessionToken: string) {
    try {
      const session = await this.getSession(sessionToken);

      if (!session || !session.user) {
        return null;
      }

      return {
        user: session.user,
        session: session.session,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to verify session');
      return null;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    BetterAuthService.instance = null;
  }
}

// Export convenience function
export const getBetterAuth = () => BetterAuthService.getInstance();
