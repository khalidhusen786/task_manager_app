// ===== TASK SERVICE =====
import apiService from './api';
import type { Task, TaskFilters, TaskFormData, TaskStats, PaginationInfo, ApiResponse } from '../types';

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

export interface TaskStatsResponse {
  stats: TaskStats;
}

class TaskService {
  async getTasks(filters: TaskFilters = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return apiService.get(`/tasks?${params.toString()}`);
  }

  async getTask(id: string): Promise<ApiResponse<any>> {
    return apiService.get(`/tasks/${id}`);
  }

  async createTask(data: TaskFormData): Promise<ApiResponse<any>> {
    return apiService.post('/tasks', data);
  }

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<ApiResponse<any>> {
    return apiService.put(`/tasks/${id}`, data);
  }

  async deleteTask(id: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/tasks/${id}`);
  }

  async deleteManyTasks(taskIds: string[]): Promise<ApiResponse<any>> {
    return apiService.delete('/tasks', { data: { taskIds } });
  }

  async getTaskStats(): Promise<ApiResponse<any>> {
    return apiService.get('/tasks/stats');
  }
}

export const taskService = new TaskService();
export default taskService;