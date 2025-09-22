// ===== API UTILITIES =====
import type { ApiResponse } from '../types';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  static extractErrorMessage(error: any): string {
    // Handle different error formats
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  }

  static extractErrorDetails(error: any): ApiError {
    const message = this.extractErrorMessage(error);
    const status = error?.response?.status;
    const code = error?.response?.data?.error?.type || error?.code;
    const details = error?.response?.data?.error?.details;

    return {
      message,
      status,
      code,
      details
    };
  }

  static getSuccessMessage(action: string, data?: any): string {
    const messages: Record<string, string> = {
      login: 'Welcome back!',
      register: 'Account created successfully!',
      logout: 'Logged out successfully',
      createTask: 'Task created successfully!',
      updateTask: 'Task updated successfully!',
      deleteTask: 'Task deleted successfully!',
      deleteTasks: 'Tasks deleted successfully!',
      fetchTasks: 'Tasks loaded successfully',
      fetchTask: 'Task loaded successfully',
      fetchStats: 'Statistics updated'
    };

    return messages[action] || 'Operation completed successfully!';
  }

  static getErrorMessage(action: string, error: ApiError): string {
    // Always prefer the backend-provided message verbatim
    if (error?.message) {
      return error.message;
    }
    // Fallback to a generic message only if backend message is unavailable
    return 'An unexpected error occurred';
  }

  static isSuccessResponse(response: ApiResponse): boolean {
    return response?.success === true && response?.data !== undefined;
  }

  static isErrorResponse(response: ApiResponse): boolean {
    return response?.success === false || response?.error !== undefined;
  }
}

export const apiUtils = {
  extractErrorMessage: ApiErrorHandler.extractErrorMessage,
  extractErrorDetails: ApiErrorHandler.extractErrorDetails,
  getSuccessMessage: ApiErrorHandler.getSuccessMessage,
  getErrorMessage: ApiErrorHandler.getErrorMessage,
  isSuccessResponse: ApiErrorHandler.isSuccessResponse,
  isErrorResponse: ApiErrorHandler.isErrorResponse,
};
