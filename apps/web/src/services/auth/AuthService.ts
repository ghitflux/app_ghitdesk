import { ApiClient } from '../api/ApiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  image?: string;
  metadata?: Record<string, any>;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Authentication Service Singleton
 * Manages user authentication and session
 */
export class AuthService {
  private static instance: AuthService | null = null;
  private apiClient: ApiClient;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  private constructor() {
    this.apiClient = ApiClient.getInstance();
    this.loadFromStorage();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Load session from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const sessionData = localStorage.getItem('ghit-session');
      if (sessionData) {
        const session: Session = JSON.parse(sessionData);

        // Check if session is expired
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt > new Date()) {
          this.currentSession = session;
          this.currentUser = session.user;
          this.apiClient.setToken(session.token);
        } else {
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('[AuthService] Failed to load session from storage', error);
      this.clearStorage();
    }
  }

  /**
   * Save session to localStorage
   */
  private saveToStorage(session: Session): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('ghit-session', JSON.stringify(session));
    } catch (error) {
      console.error('[AuthService] Failed to save session to storage', error);
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('ghit-session');
    } catch (error) {
      console.error('[AuthService] Failed to clear storage', error);
    }
  }

  /**
   * Notify listeners about auth state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  /**
   * Sign up new user
   */
  async signUp(input: SignUpInput): Promise<Session> {
    try {
      const response = await this.apiClient.post<{ user: User; session: { token: string; expiresAt: string } }>(
        '/auth/signup',
        input
      );

      const session: Session = {
        user: response.user,
        token: response.session.token,
        expiresAt: response.session.expiresAt,
      };

      this.currentSession = session;
      this.currentUser = response.user;
      this.apiClient.setToken(session.token);
      this.saveToStorage(session);
      this.notifyListeners();

      console.log('[AuthService] User signed up successfully');

      return session;
    } catch (error) {
      console.error('[AuthService] Sign up failed', error);
      throw error;
    }
  }

  /**
   * Sign in user
   */
  async signIn(input: SignInInput): Promise<Session> {
    try {
      const response = await this.apiClient.post<{ user: User; session: { token: string; expiresAt: string } }>(
        '/auth/signin',
        input
      );

      const session: Session = {
        user: response.user,
        token: response.session.token,
        expiresAt: response.session.expiresAt,
      };

      this.currentSession = session;
      this.currentUser = response.user;
      this.apiClient.setToken(session.token);
      this.saveToStorage(session);
      this.notifyListeners();

      console.log('[AuthService] User signed in successfully');

      return session;
    } catch (error) {
      console.error('[AuthService] Sign in failed', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      if (this.currentSession) {
        await this.apiClient.post('/auth/signout', {
          token: this.currentSession.token,
        });
      }
    } catch (error) {
      console.error('[AuthService] Sign out request failed', error);
      // Continue with local sign out even if request fails
    } finally {
      this.currentUser = null;
      this.currentSession = null;
      this.apiClient.clearToken();
      this.clearStorage();
      this.notifyListeners();

      console.log('[AuthService] User signed out');
    }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<Session> {
    try {
      const response = await this.apiClient.get<{ user: User; session: { token: string; expiresAt: string } }>(
        '/auth/session'
      );

      const session: Session = {
        user: response.user,
        token: response.session.token,
        expiresAt: response.session.expiresAt,
      };

      this.currentSession = session;
      this.currentUser = response.user;
      this.apiClient.setToken(session.token);
      this.saveToStorage(session);
      this.notifyListeners();

      console.log('[AuthService] Session refreshed');

      return session;
    } catch (error) {
      console.error('[AuthService] Session refresh failed', error);
      throw error;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    AuthService.instance = null;
  }
}

// Export convenience function
export const getAuthService = () => AuthService.getInstance();
