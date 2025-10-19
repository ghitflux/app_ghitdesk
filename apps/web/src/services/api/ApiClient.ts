import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * ApiClient Singleton
 * Manages HTTP requests with interceptors for auth and error handling
 */
export class ApiClient {
  private static instance: ApiClient | null = null;
  private client: AxiosInstance;
  private token: string | null = null;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time
        const startTime = (response.config as any).metadata?.startTime;
        if (startTime) {
          const duration = Date.now() - startTime;
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
          );
        }

        return response;
      },
      (error: AxiosError) => {
        // Handle errors
        if (error.response) {
          const status = error.response.status;
          const url = error.config?.url;

          console.error(`[API Error] ${status} ${url}`, error.response.data);

          // Handle specific status codes
          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              this.clearToken();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              break;

            case 403:
              // Forbidden
              console.error('Access forbidden');
              break;

            case 404:
              // Not found
              console.error('Resource not found');
              break;

            case 429:
              // Rate limit exceeded
              console.error('Rate limit exceeded');
              break;

            case 500:
            case 502:
            case 503:
            case 504:
              // Server errors
              console.error('Server error occurred');
              break;
          }
        } else if (error.request) {
          // Request was made but no response
          console.error('[API Error] No response received', error.message);
        } else {
          // Something else happened
          console.error('[API Error]', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  public setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  public clearToken(): void {
    this.token = null;
  }

  /**
   * Get authentication token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get Axios instance for advanced usage
   */
  public getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    ApiClient.instance = null;
  }
}

// Export convenience function
export const getApiClient = () => ApiClient.getInstance();
