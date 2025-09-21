// Unit tests for TaskService
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { TaskService } from '../../src/services/taskService';
import { Task, TaskStatus, TaskPriority } from '../../src/models/Task';
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
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const result = await taskService.createTask(userId, taskData);

      expect(result).toHaveProperty('_id');
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.priority).toBe(taskData.priority);
      expect(result.status).toBe(taskData.status);
      expect(result.userId.toString()).toBe(userId);
    });

    it('should create task for any valid ObjectId user', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const result = await taskService.createTask('507f1f77bcf86cd799439011', taskData);
      
      expect(result).toHaveProperty('_id');
      expect(result.title).toBe(taskData.title);
      expect(result.userId.toString()).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        {
          title: 'Task 1',
          description: 'Description 1',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Task 2',
          description: 'Description 2',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Task 3',
          description: 'Description 3',
        priority: TaskPriority.LOW,
        status: TaskStatus.COMPLETED,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const taskData of tasks) {
        await taskService.createTask(userId, taskData);
      }
    });

    it('should get all tasks for user', async () => {
      const result = await taskService.getTasks(userId, {}, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.tasks).toHaveLength(3);
      expect(result.totalTasks).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getTasks(userId, { status: TaskStatus.PENDING }, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe(TaskStatus.PENDING);
    });

    it('should filter tasks by priority', async () => {
      const result = await taskService.getTasks(userId, { priority: TaskPriority.HIGH }, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].priority).toBe(TaskPriority.HIGH);
    });

    it('should search tasks by title', async () => {
      const result = await taskService.getTasks(userId, { search: 'Task 1' }, { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task 1');
    });

    it('should sort tasks by due date', async () => {
      const result = await taskService.getTasks(userId, {}, { page: 1, limit: 10, sortBy: 'dueDate', sortOrder: 'asc' });

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
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = await taskService.createTask(userId, taskData);
      taskId = task._id.toString();
    });

    it('should get task by ID', async () => {
      const result = await taskService.getTaskById(taskId, userId);

      expect(result._id.toString()).toBe(taskId);
      expect(result.title).toBe('Test Task');
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(taskService.getTaskById(fakeId, userId)).rejects.toThrow(AppError);
    });

    it('should throw error for task belonging to different user', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      await expect(taskService.getTaskById(taskId, otherUser._id.toString()))
        .rejects.toThrow(AppError);
    });
  });

  describe('updateTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = await taskService.createTask(userId, taskData);
      taskId = task._id.toString();
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS
      };

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(result.title).toBe('Updated Task');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.description).toBe('Test Description'); // Should remain unchanged
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(taskService.updateTask(fakeId, userId, { title: 'Updated' }))
        .rejects.toThrow(AppError);
    });
  });

  describe('deleteTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = await taskService.createTask(userId, taskData);
      taskId = task._id.toString();
    });

    it('should delete task successfully', async () => {
      await expect(taskService.deleteTask(taskId, userId)).resolves.not.toThrow();

      // Verify task is deleted
      await expect(taskService.getTaskById(taskId, userId)).rejects.toThrow(AppError);
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
        { title: 'Task 1', priority: TaskPriority.HIGH, status: TaskStatus.PENDING },
        { title: 'Task 2', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
        { title: 'Task 3', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED },
        { title: 'Task 4', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED }
      ];

      for (const taskData of tasks) {
        await taskService.createTask(userId, taskData);
      }
    });

    it('should get task statistics', async () => {
      const result = await taskService.getTaskStats(userId);

      expect(result.total).toBe(4);
      expect(result.pending).toBe(1);
      expect(result.inProgress).toBe(1);
      expect(result.completed).toBe(2);
    });
  });
});
