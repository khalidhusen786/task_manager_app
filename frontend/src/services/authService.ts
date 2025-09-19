// ===== AUTH SERVICE =====
import apiService from './api';
import type { User, LoginFormData, RegisterFormData, ApiResponse } from '../types';

export interface AuthResponse {
  user: User;
}

export interface RefreshResponse {
  // Tokens are handled via cookies, no response body needed
}

class AuthService {
  async register(data: RegisterFormData): Promise<ApiResponse<AuthResponse>> {
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

  async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
    return apiService.post('/auth/refresh');
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get('/auth/profile');
  }
}

export const authService = new AuthService();
export default authService;
