import { ApiClient } from '../ApiClient';

/**
 * REST Communication Strategy
 * Implements RESTful API communication pattern
 */
export class RESTStrategy {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Fetch resource
   */
  async fetch<T>(resource: string, params?: Record<string, any>): Promise<T> {
    return this.apiClient.get<T>(resource, { params });
  }

  /**
   * Create resource
   */
  async create<T>(resource: string, data: any): Promise<T> {
    return this.apiClient.post<T>(resource, data);
  }

  /**
   * Update resource (full update)
   */
  async update<T>(resource: string, id: string, data: any): Promise<T> {
    return this.apiClient.put<T>(`${resource}/${id}`, data);
  }

  /**
   * Patch resource (partial update)
   */
  async patch<T>(resource: string, id: string, data: Partial<any>): Promise<T> {
    return this.apiClient.patch<T>(`${resource}/${id}`, data);
  }

  /**
   * Delete resource
   */
  async delete<T>(resource: string, id: string): Promise<T> {
    return this.apiClient.delete<T>(`${resource}/${id}`);
  }

  /**
   * Fetch list with pagination
   */
  async fetchList<T>(
    resource: string,
    options?: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      filters?: Record<string, any>;
    }
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const params: Record<string, any> = {};

    if (options?.page) params.offset = (options.page - 1) * (options?.limit || 20);
    if (options?.limit) params.limit = options.limit;
    if (options?.sort) params.orderBy = options.sort;
    if (options?.order) params.order = options.order;
    if (options?.filters) Object.assign(params, options.filters);

    const data = await this.apiClient.get<T[]>(resource, { params });

    // Since the API might not return pagination metadata, we create a basic structure
    return {
      data,
      total: data.length,
      page: options?.page || 1,
      limit: options?.limit || 20,
    };
  }

  /**
   * Custom request
   */
  async request<T>(method: string, url: string, data?: any, params?: Record<string, any>): Promise<T> {
    const config = { params, data };

    switch (method.toUpperCase()) {
      case 'GET':
        return this.apiClient.get<T>(url, config);
      case 'POST':
        return this.apiClient.post<T>(url, data);
      case 'PUT':
        return this.apiClient.put<T>(url, data);
      case 'PATCH':
        return this.apiClient.patch<T>(url, data);
      case 'DELETE':
        return this.apiClient.delete<T>(url, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}

// Export singleton instance
export const restStrategy = new RESTStrategy();
