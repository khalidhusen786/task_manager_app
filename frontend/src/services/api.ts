import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (value?: any) => void; reject: (error?: any) => void }> = [];
  private store: any = null; // Redux store reference

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  // Method to set the Redux store reference
  setStore(store: any) {
    this.store = store;
    console.log('🔗 API Service connected to Redux store');
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    this.failedQueue = [];
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        // Get token ONLY from Redux store
        let token = null;
        
        if (this.store) {
          const state = this.store.getState();
          token = state.auth?.accessToken;
        }

        if (token && token !== 'null' && token !== null) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('🔒 Adding token to request:', config.url, token.substring(0, 20) + '...');
        } else {
          console.log('🔒 No token available for request:', config.url);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ API Response Success:', response.config.url, response.status);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        console.log('❌ API Error:', error.response?.status, originalRequest.url);

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            console.log('⏳ Already refreshing, queuing request...');
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => this.api(originalRequest));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Get refresh token ONLY from Redux store
            let refreshToken = null;
            
            if (this.store) {
              const state = this.store.getState();
              refreshToken = state.auth?.refreshToken;
            }

            if (!refreshToken || refreshToken === 'null') {
              throw new Error('No refresh token available in Redux store');
            }

            console.log('🔄 Attempting token refresh with Redux token...');
            const { data } = await this.api.post('/auth/refresh-token', { refreshToken });
            
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;

            // Update ONLY Redux store (redux-persist will handle persistence)
            if (this.store && this.store.dispatch) {
              console.log('🔄 Dispatching token refresh to Redux...');
              this.store.dispatch({
                type: 'auth/refreshToken/fulfilled',
                payload: {
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                }
              });
            }

            console.log('✅ Token refresh successful via Redux');
            this.processQueue(null, newAccessToken);
            return this.api(originalRequest);

          } catch (err) {
            console.log('❌ Token refresh failed:', err);
            this.processQueue(err, null);
            
            // Clear ONLY Redux store (redux-persist will handle clearing)
            if (this.store && this.store.dispatch) {
              console.log('🧹 Clearing auth state via Redux...');
              this.store.dispatch({ type: 'auth/clearUser' });
            }

            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
              window.location.replace('/login');
            }
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, config);
    console.log('📡 GET Response:', url, '✅');
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data, config);
    console.log('📡 POST Response:', url, '✅');
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data, config);
    console.log('📡 PUT Response:', url, '✅');
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, config);
    console.log('📡 DELETE Response:', url, '✅');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;