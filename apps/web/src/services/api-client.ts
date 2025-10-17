/**
 * API Client (Singleton Pattern)
 * Gerencia requisições, retry, refresh token automático
 */

class APIClient {
  private static instance: APIClient;
  private baseURL: string;
  private refreshPromise: Promise<void> | null = null;

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient(
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/bff'
      );
    }
    return APIClient.instance;
  }

  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Incluir cookies
    });

    // Se 401, tentar refresh
    if (response.status === 401 && !path.includes('/auth/refresh')) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshToken();
      }

      try {
        await this.refreshPromise;
        // Retry request
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      } finally {
        this.refreshPromise = null;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private async refreshToken(): Promise<void> {
    await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
  }
}

export const apiClient = APIClient.getInstance();
