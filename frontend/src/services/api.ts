
// ===== FIXED API SERVICE =====
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';
import type { ApiResponse } from '../types'; // Removed duplicate import

let isRedirecting = false;

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    let failedQueue: Array<{
      resolve: (value?: any) => void;
      reject: (error?: any) => void;
    }> = [];
    
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 2; // Reduced to fail faster

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      });
      failedQueue = [];
    };

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        consecutiveFailures = 0;
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If already redirecting, reject immediately
          if (isRedirecting) {
            return Promise.reject(new Error('Authentication failed - redirecting'));
          }

          // Don't intercept refresh token requests
          if (originalRequest.url?.includes('/auth/refresh-token')) {
            this.handleAuthFailure();
            return Promise.reject(error);
          }

          // Circuit breaker
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            console.log('Too many consecutive 401 errors');
            this.handleAuthFailure();
            return Promise.reject(new Error('Authentication failed'));
          }

          // Check for refresh token BEFORE attempting anything
          const refreshToken = this.getRefreshTokenFromCookie();
          if (!refreshToken) {
            console.log('No refresh token available');
            this.handleAuthFailure();
            return Promise.reject(new Error('No refresh token available'));
          }

          if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Use single refresh promise to avoid concurrent requests
            if (!this.refreshPromise) {
              console.log('Attempting to refresh token...');
              this.refreshPromise = this.api.post('/auth/refresh-token', {
                refreshToken: refreshToken
              });
            }

            await this.refreshPromise;
            console.log('Token refreshed successfully');
            
            consecutiveFailures = 0;
            processQueue(null);
            
            // Retry original request
            return this.api(originalRequest);

          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError);
            processQueue(refreshError, null);
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getRefreshTokenFromCookie(): string | null {
    try {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='));
      
      if (!cookie) return null;
      
      const token = cookie.split('=')[1];
      return token && token !== '' && token !== 'undefined' ? token : null;
    } catch (error) {
      console.error('Error reading refresh token from cookie:', error);
      return null;
    }
  }

  private handleAuthFailure() {
    if (isRedirecting) return;
    
    isRedirecting = true;
    console.log('Authentication failed, clearing cookies and redirecting...');
    
    // Clear auth cookies
    try {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
    
    // Use setTimeout to ensure redirect happens after current execution
    setTimeout(() => {
      window.location.replace('/login'); // Use replace instead of href
    }, 100);
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

