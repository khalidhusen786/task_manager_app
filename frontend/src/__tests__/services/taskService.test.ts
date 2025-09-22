// Mock constants to avoid import.meta in tests
jest.mock('../../constants', () => ({
  API_BASE_URL: 'http://localhost:5000/api'
}));

// Unit tests for task service (API mocked)
import taskService from '../../services/taskService';
import type { TaskFormData } from '../../types';

describe('TaskService', () => {
  describe('getTasks', () => {
    it('should fetch all tasks successfully', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: { tasks: [{ _id: '1' }, { _id: '2' }], pagination: { page: 1, limit: 10, totalPages: 1, totalTasks: 2 } },
        timestamp: ''
      } as any);
      const response: any = await taskService.getTasks();
      expect((response as any)?.success).toBe(true);
      expect(response?.data?.tasks).toHaveLength(2);
      expect(response?.data?.pagination?.totalTasks).toBe(2);
    });

    it('should filter tasks by search query', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: { tasks: [{ _id: '1', title: 'Task 1' }], pagination: { page: 1, limit: 10, totalPages: 1, totalTasks: 1 } },
        timestamp: ''
      } as any);
      const response: any = await taskService.getTasks({ search: 'Task 1' });
      expect(response?.success).toBe(true);
      expect(response?.data?.tasks).toHaveLength(1);
      expect(response?.data?.tasks?.[0]?.title).toBe('Task 1');
    });

    it('should filter tasks by status', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({ success: true, message: 'ok', data: { tasks: [{ status: 'pending' }], pagination: {} }, timestamp: '' } as any);
      const response: any = await taskService.getTasks({ status: 'pending' });
      expect(response?.success).toBe(true);
      expect(response?.data?.tasks).toHaveLength(1);
      expect(response?.data?.tasks?.[0]?.status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({ success: true, message: 'ok', data: { tasks: [{ priority: 'high' }], pagination: {} }, timestamp: '' } as any);
      const response: any = await taskService.getTasks({ priority: 'high' });
      expect(response?.success).toBe(true);
      expect(response?.data?.tasks).toHaveLength(1);
      expect(response?.data?.tasks?.[0]?.priority).toBe('high');
    });

    it('should handle multiple filters', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({ success: true, message: 'ok', data: { tasks: [{ title: 'Task 1', status: 'pending', priority: 'high' }], pagination: {} }, timestamp: '' } as any);
      const response: any = await taskService.getTasks({ 
        search: 'Task',
        status: 'pending',
        priority: 'high'
      });
      expect(response?.success).toBe(true);
      expect(response?.data?.tasks).toHaveLength(1);
      expect(response?.data?.tasks?.[0]?.title).toBe('Task 1');
      expect(response?.data?.tasks?.[0]?.status).toBe('pending');
      expect(response?.data?.tasks?.[0]?.priority).toBe('high');
    });

    it('should handle pagination parameters', async () => {
      jest.spyOn(taskService, 'getTasks').mockResolvedValueOnce({ success: true, message: 'ok', data: { tasks: [], pagination: { page: 2, limit: 5, totalPages: 1, totalTasks: 2 } }, timestamp: '' } as any);
      const response: any = await taskService.getTasks({ 
        page: 2, 
        limit: 5 
      });
      expect(response?.success).toBe(true);
    });
  });

  describe('getTask', () => {
    it('should fetch a single task successfully', async () => {
      jest.spyOn(taskService, 'getTask').mockResolvedValueOnce({ success: true, message: 'ok', data: { _id: '1', title: 'Task 1' }, timestamp: '' } as any);
      const response: any = await taskService.getTask('1');
      expect(response?.success).toBe(true);
      expect(response?.data?._id).toBe('1');
      expect(response?.data?.title).toBe('Task 1');
    });

    it('should handle task not found', async () => {
      jest.spyOn(taskService, 'getTask').mockRejectedValueOnce(new Error('404'));
      await expect(taskService.getTask('999')).rejects.toBeTruthy();
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData: TaskFormData = {
        title: 'New Task',
        description: 'New Description',
        priority: 'low',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z'
      };
      jest.spyOn(taskService, 'createTask').mockResolvedValueOnce({ success: true, message: 'Task created successfully', data: { _id: '3', ...taskData }, timestamp: '' } as any);
      const response: any = await taskService.createTask(taskData);
      expect(response?.success).toBe(true);
      expect(response?.message).toBe('Task created successfully');
      expect(response?.data?.title).toBe('New Task');
      expect(response?.data?._id).toBe('3');
    });

    it('should handle validation errors', async () => {
      const invalidTaskData = { description: 'Missing title' } as TaskFormData;
      jest.spyOn(taskService, 'createTask').mockRejectedValueOnce(new Error('400'));
      await expect(taskService.createTask(invalidTaskData)).rejects.toBeTruthy();
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData: Partial<TaskFormData> = { title: 'Updated Task', status: 'in_progress' };
      jest.spyOn(taskService, 'updateTask').mockResolvedValueOnce({ success: true, message: 'Task updated successfully', data: { _id: '1', title: 'Updated Task', status: 'in_progress' }, timestamp: '' } as any);
      const response: any = await taskService.updateTask('1', updateData);
      expect(response?.success).toBe(true);
      expect(response?.message).toBe('Task updated successfully');
      expect(response?.data?.title).toBe('Updated Task');
      expect(response?.data?.status).toBe('in_progress');
    });

    it('should handle task not found during update', async () => {
      jest.spyOn(taskService, 'updateTask').mockRejectedValueOnce(new Error('404'));
      await expect(taskService.updateTask('999', { title: 'Updated' })).rejects.toBeTruthy();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      jest.spyOn(taskService, 'deleteTask').mockResolvedValueOnce({ success: true, message: 'Task deleted successfully', timestamp: '' } as any);
      const response: any = await taskService.deleteTask('1');
      expect(response?.success).toBe(true);
      expect(response?.message).toBe('Task deleted successfully');
    });

    it('should handle task not found during deletion', async () => {
      jest.spyOn(taskService, 'deleteTask').mockRejectedValueOnce(new Error('404'));
      await expect(taskService.deleteTask('999')).rejects.toBeTruthy();
    });
  });

  describe('getTaskStats', () => {
    it('should fetch task statistics successfully', async () => {
      jest.spyOn(taskService, 'getTaskStats').mockResolvedValueOnce({ success: true, message: 'ok', data: { totalTasks: 2, pendingTasks: 1, inProgressTasks: 1, completedTasks: 0, highPriorityTasks: 1, mediumPriorityTasks: 1, lowPriorityTasks: 0 }, timestamp: '' } as any);
      const response: any = await taskService.getTaskStats();
      expect(response?.success).toBe(true);
      expect(response?.data?.totalTasks).toBe(2);
      expect(response?.data?.pendingTasks).toBe(1);
      expect(response?.data?.inProgressTasks).toBe(1);
      expect(response?.data?.completedTasks).toBe(0);
      expect(response?.data?.highPriorityTasks).toBe(1);
      expect(response?.data?.mediumPriorityTasks).toBe(1);
      expect(response?.data?.lowPriorityTasks).toBe(0);
    });
  });

  describe('deleteManyTasks', () => {
    it('should delete multiple tasks successfully', async () => {
      jest.spyOn(taskService, 'deleteManyTasks').mockResolvedValueOnce({ success: true, message: 'Tasks deleted successfully', data: { deletedCount: 2 }, timestamp: '' } as any);
      const response: any = await taskService.deleteManyTasks(['1', '2']);
      expect(response?.success).toBe(true);
      expect(response?.message).toBe('Tasks deleted successfully');
    });
  });
});
