// ===== AUTH SERVICE =====
import apiService from './api';
import type { User, LoginFormData, RegisterFormData, ApiResponse, RegisterApiPayload } from '../types';

export interface AuthResponse {
  user: User;
}

export interface RefreshResponse {
  // Tokens are handled via cookies, no response body needed
}

class AuthService {
  async register(data: RegisterApiPayload): Promise<ApiResponse<AuthResponse>> {
    return apiService.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
  }

  async login(data: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    return apiService.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
  }

  async logout(): Promise<ApiResponse> {
    return apiService.post('/auth/logout');
  }

  // async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
  //   // Get refresh token from cookie if available
  //   const refreshToken = document.cookie
  //     .split('; ')
  //     .find(row => row.startsWith('refreshToken='))
  //     ?.split('=')[1];
    
  //   // If no refresh token is available, throw an error to stop the loop
  //   if (!refreshToken) {
  //     throw new Error('No refresh token available');
  //   }
    
  //   return apiService.post('/auth/refresh-token', {
  //     refreshToken: refreshToken
  //   });
  // }
    async refreshToken(): Promise<ApiResponse> {
    return apiService.post('/auth/refresh-token'); // no body
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get('/auth/profile');
  }
}

export const authService = new AuthService();
export default authService;
