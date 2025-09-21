import apiService from './api';
import type { User, LoginFormData, RegisterFormData, ApiResponse, RegisterApiPayload } from '../types';

// ✅ FIXED: Interface now matches your actual API response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterApiPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    
    // 🔍 Debug log
    console.log('🚀 Register API Response:', response);
    
    return response;
  }

  async login(data: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    
    // 🔍 Debug log
    console.log('🚀 Login API Response:', response);
    console.log('🚀 Response data structure:', {
      hasData: !!response.data,
      hasUser: !!response.data?.user,
      hasAccessToken: !!response.data?.accessToken,
      hasRefreshToken: !!response.data?.refreshToken,
    });
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    return apiService.post('/auth/logout');
  }

  async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
    // Get refresh token from cookie if available
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];
    
    // If no refresh token is available, throw an error to stop the loop
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return apiService.post('/auth/refresh-token', {
      refreshToken: refreshToken
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get('/auth/profile');
  }
}

export const authService = new AuthService();
export default authService;
