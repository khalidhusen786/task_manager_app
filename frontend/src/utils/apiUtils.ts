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
    const { message, status } = error;
    
    // Handle specific status codes
    if (status === 401) {
      return 'Please log in to continue';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action';
    }
    
    if (status === 404) {
      return 'The requested resource was not found';
    }
    
    if (status === 409) {
      return 'This resource already exists';
    }
    
    if (status === 422) {
      return 'Please check your input and try again';
    }
    
    if (status === 429) {
      return 'Too many requests. Please try again later';
    }
    
    if (status >= 500) {
      return 'Server error. Please try again later';
    }
    
    // Handle specific error messages
    if (message.includes('email') && message.includes('already')) {
      return 'An account with this email already exists';
    }
    
    if (message.includes('password')) {
      return 'Invalid password. Please try again';
    }
    
    if (message.includes('token')) {
      return 'Session expired. Please log in again';
    }
    
    if (message.includes('validation')) {
      return 'Please check your input and try again';
    }
    
    // Return the original message if no specific handling
    return message || 'An unexpected error occurred';
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
