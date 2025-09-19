// Unit tests for TaskService
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { TaskService } from '../../src/services/taskService';
import { Task } from '../../src/models/Task';
import { User } from '../../src/models/User';
import { AppError } from '../../src/utils/errors';
import { setupTestDB, cleanupTestDB, clearCollections, TEST_TIMEOUT } from '../setup';

describe('TaskService', () => {
  let taskService: TaskService;
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await cleanupTestDB();
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    await clearCollections();
    taskService = new TaskService();
    
    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    userId = user._id.toString();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-12-31'),
        userId
      };

      const result = await taskService.createTask(taskData);

      expect(result).toHaveProperty('_id');
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.priority).toBe(taskData.priority);
      expect(result.status).toBe(taskData.status);
      expect(result.userId.toString()).toBe(userId);
    });

    it('should throw error for invalid user', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-12-31'),
        userId: '507f1f77bcf86cd799439011' // Invalid user ID
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(AppError);
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        {
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          status: 'pending',
          dueDate: new Date('2024-12-31'),
          userId
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date('2024-12-30'),
          userId
        },
        {
          title: 'Task 3',
          description: 'Description 3',
          priority: 'low',
          status: 'completed',
          dueDate: new Date('2024-12-29'),
          userId
        }
      ];

      for (const taskData of tasks) {
        await taskService.createTask(taskData);
      }
    });

    it('should get all tasks for user', async () => {
      const result = await taskService.getTasks(userId);

      expect(result.tasks).toHaveLength(3);
      expect(result.pagination.totalTasks).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getTasks(userId, { status: 'pending' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      const result = await taskService.getTasks(userId, { priority: 'high' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].priority).toBe('high');
    });

    it('should search tasks by title', async () => {
      const result = await taskService.getTasks(userId, { search: 'Task 1' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task 1');
    });

    it('should sort tasks by due date', async () => {
      const result = await taskService.getTasks(userId, { sortBy: 'dueDate', sortOrder: 'asc' });

      expect(result.tasks[0].title).toBe('Task 3'); // Earliest due date
      expect(result.tasks[2].title).toBe('Task 1'); // Latest due date
    });
  });

  describe('getTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-12-31'),
        userId
      };

      const task = await taskService.createTask(taskData);
      taskId = task._id.toString();
    });

    it('should get task by ID', async () => {
      const result = await taskService.getTask(taskId, userId);

      expect(result._id.toString()).toBe(taskId);
      expect(result.title).toBe('Test Task');
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(taskService.getTask(fakeId, userId)).rejects.toThrow(AppError);
    });

    it('should throw error for task belonging to different user', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      await expect(taskService.getTask(taskId, otherUser._id.toString()))
        .rejects.toThrow(AppError);
    });
  });

  describe('updateTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-12-31'),
        userId
      };

      const task = await taskService.createTask(taskData);
      taskId = task._id.toString();
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const result = await taskService.updateTask(taskId, updateData, userId);

      expect(result.title).toBe('Updated Task');
      expect(result.status).toBe('in_progress');
      expect(result.description).toBe('Test Description'); // Should remain unchanged
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(taskService.updateTask(fakeId, { title: 'Updated' }, userId))
        .rejects.toThrow(AppError);
    });
  });

  describe('deleteTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-12-31'),
        userId
      };

      const task = await taskService.createTask(taskData);
      taskId = task._id.toString();
    });

    it('should delete task successfully', async () => {
      await expect(taskService.deleteTask(taskId, userId)).resolves.not.toThrow();

      // Verify task is deleted
      await expect(taskService.getTask(taskId, userId)).rejects.toThrow(AppError);
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(taskService.deleteTask(fakeId, userId)).rejects.toThrow(AppError);
    });
  });

  describe('getTaskStats', () => {
    beforeEach(async () => {
      // Create test tasks with different statuses
      const tasks = [
        { title: 'Task 1', priority: 'high', status: 'pending', userId },
        { title: 'Task 2', priority: 'medium', status: 'in_progress', userId },
        { title: 'Task 3', priority: 'low', status: 'completed', userId },
        { title: 'Task 4', priority: 'high', status: 'completed', userId }
      ];

      for (const taskData of tasks) {
        await taskService.createTask(taskData);
      }
    });

    it('should get task statistics', async () => {
      const result = await taskService.getTaskStats(userId);

      expect(result.totalTasks).toBe(4);
      expect(result.pendingTasks).toBe(1);
      expect(result.inProgressTasks).toBe(1);
      expect(result.completedTasks).toBe(2);
      expect(result.highPriorityTasks).toBe(2);
      expect(result.mediumPriorityTasks).toBe(1);
      expect(result.lowPriorityTasks).toBe(1);
    });
  });
});
