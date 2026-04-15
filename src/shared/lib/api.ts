/**
 * API Client Configuration
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const REQUEST_TIMEOUT_MS = 30_000;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  fields?: Record<string, string>; // Zod field-level validation errors
  details?: Record<string, unknown>;
  status?: number;
  headers?: Record<string, string>;
}

function extractError(data: any, httpStatus: number, statusText: string): string {
  // Backend may return either `error` or `message` depending on the code path
  return data?.error || data?.message || `Request failed (${httpStatus}: ${statusText})`;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      let data: any = null;
      try { data = await response.json(); } catch { /* empty body */ }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return {
          success: false,
          error: extractError(data, response.status, response.statusText),
          fields: data?.fields,
          details: data?.details,
          code: data?.code,
          status: response.status,
          headers,
        };
      }

      return { ...(data || { success: true }), headers } as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as any)?.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error. Check your connection.',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000); // longer timeout for uploads

    const config: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: controller.signal,
      // No Content-Type header — browser sets it with boundary
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      let data: any = null;
      try { data = await response.json(); } catch { /* empty body */ }

      if (!response.ok) {
        if (response.status === 401) window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return {
          success: false,
          error: extractError(data, response.status, response.statusText),
          fields: data?.fields,
          details: data?.details,
          status: response.status,
        };
      }

      return (data || { success: true }) as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as any)?.name === 'AbortError') {
        return { success: false, error: 'Upload timed out. Please try again.' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed.',
      };
    }
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
