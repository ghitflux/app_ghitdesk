/**
 * User authentication payload interface
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  metadata?: Record<string, any>;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  expiresAt?: Date;
}

/**
 * Token verification result interface
 */
export interface VerifyResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Strategy Pattern for authentication
 * Defines the interface for different authentication strategies
 */
export abstract class AuthStrategy {
  /**
   * Strategy name/identifier
   */
  abstract readonly name: string;

  /**
   * Authenticate a user with credentials
   * @param credentials User credentials (email, password, etc.)
   * @returns Authentication result with user data and token
   */
  abstract authenticate(credentials: Record<string, any>): Promise<AuthResult>;

  /**
   * Verify a token and extract user information
   * @param token Authentication token
   * @returns Verification result with user data
   */
  abstract verify(token: string): Promise<VerifyResult>;

  /**
   * Revoke/invalidate a token
   * @param token Token to revoke
   * @returns Success status
   */
  abstract revoke(token: string): Promise<boolean>;

  /**
   * Refresh an existing token
   * @param token Current token
   * @returns New authentication result
   */
  abstract refresh(token: string): Promise<AuthResult>;

  /**
   * Get token expiration time
   * @param token Authentication token
   * @returns Expiration date or null
   */
  abstract getExpiration(token: string): Promise<Date | null>;

  /**
   * Validate credentials format
   * @param credentials Credentials to validate
   * @returns Validation result
   */
  protected validateCredentials(credentials: Record<string, any>): { valid: boolean; error?: string } {
    if (!credentials || typeof credentials !== 'object') {
      return { valid: false, error: 'Invalid credentials format' };
    }
    return { valid: true };
  }
}

/**
 * Type guard to check if an object is an AuthStrategy
 */
export function isAuthStrategy(obj: any): obj is AuthStrategy {
  return (
    obj &&
    typeof obj.authenticate === 'function' &&
    typeof obj.verify === 'function' &&
    typeof obj.revoke === 'function' &&
    typeof obj.refresh === 'function'
  );
}
