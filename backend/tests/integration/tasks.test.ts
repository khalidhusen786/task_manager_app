

// Integration tests for Task endpoints
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import app from '../../src/server';
import { User } from '../../src/models/User';
import { Task } from '../../src/models/Task';
import { setupTestDB, cleanupTestDB, clearCollections, TEST_TIMEOUT } from '../setup';

// Helper function to retry requests with exponential backoff
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 10): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await requestFn();
      if (response.status !== 429) {
        return response;
      }
      // If we get 429, wait longer each time
      const delay = Math.min(Math.pow(2, i) * 500, 5000); // Cap at 5 seconds
      console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries exceeded');
};

describe('Tasks Integration Tests', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await cleanupTestDB();
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    await clearCollections();

    // Create a test user and get access token
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerResponse = await retryRequest(() =>
      request(app)
        .post('/api/auth/register')
        .send(userData)
    );

    expect(registerResponse.status).toBe(201);
    accessToken = registerResponse.body.data.accessToken;
    userId = registerResponse.body.data.user._id;
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData)
      );

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toHaveProperty(response.body.data.id ? 'id' : '_id');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe(taskData.status);
      expect(response.body.data.userId).toBe(userId);
    });

    it('should return 400 for missing required fields', async () => {
      const taskData = {
        description: 'Test Description'
        // Missing title
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData)
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending'
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .send(taskData)
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks sequentially with retry logic
      const tasks = [
        {
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Task 3',
          description: 'Description 3',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Create tasks with aggressive retry logic
      for (const taskData of tasks) {
        const response = await retryRequest(() =>
          request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(taskData)
        );
        expect(response.status).toBe(201);
      }

      // Wait for database persistence
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should get all tasks for authenticated user', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination.totalTasks).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks?status=pending')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks?priority=high')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('high');
    });

    it('should search tasks by title', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks?search=Task 1')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThanOrEqual(1);
      const matchingTask = response.body.data.tasks.find((task: any) => task.title.includes('Task 1'));
      expect(matchingTask).toBeDefined();
    });

    it('should sort tasks by due date', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks?sortBy=dueDate&sortOrder=asc')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      
      const tasks = response.body.data.tasks;
      for (let i = 0; i < tasks.length - 1; i++) {
        const currentDate = new Date(tasks[i].dueDate);
        const nextDate = new Date(tasks[i + 1].dueDate);
        expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
      }
    });

    it('should return 401 for missing authentication', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks')
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData)
      );

      expect(response.status).toBe(201);
      
      // Handle both id and _id properties
      taskId = response.body.data.id || response.body.data._id;
      
      if (!taskId) {
        throw new Error('Task ID not found in response');
      }
    });

    it('should get task by ID', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const responseId = response.body.data.id || response.body.data._id;
      expect(responseId).toBe(taskId);
      expect(response.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await retryRequest(() =>
        request(app)
          .get(`/api/tasks/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get(`/api/tasks/${taskId}`)
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData)
      );

      expect(response.status).toBe(201);
      
      taskId = response.body.data.id || response.body.data._id;
      
      if (!taskId) {
        throw new Error('Task ID not found in response');
      }
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const response = await retryRequest(() =>
        request(app)
          .put(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.description).toBe('Test Description');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await retryRequest(() =>
        request(app)
          .put(`/api/tasks/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: 'Updated' })
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await retryRequest(() =>
        request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: 'Updated' })
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await retryRequest(() =>
        request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData)
      );

      expect(response.status).toBe(201);
      
      taskId = response.body.data.id || response.body.data._id;
      
      if (!taskId) {
        throw new Error('Task ID not found in response');
      }
    });

    it('should delete task successfully', async () => {
      const response = await retryRequest(() =>
        request(app)
          .delete(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const getResponse = await retryRequest(() =>
        request(app)
          .get(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );
      
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await retryRequest(() =>
        request(app)
          .delete(`/api/tasks/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await retryRequest(() =>
        request(app)
          .delete(`/api/tasks/${taskId}`)
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      const tasks = [
        { title: 'Task 1', priority: 'high', status: 'pending' },
        { title: 'Task 2', priority: 'medium', status: 'in_progress' },
        { title: 'Task 3', priority: 'low', status: 'completed' },
        { title: 'Task 4', priority: 'high', status: 'completed' }
      ];

      // Create tasks with aggressive retry logic
      for (const taskData of tasks) {
        const response = await retryRequest(() =>
          request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(taskData)
        );
        expect(response.status).toBe(201);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should get task statistics', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks/stats')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.pending).toBe(1);
      expect(response.body.data.inProgress).toBe(1);
      expect(response.body.data.completed).toBe(2);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await retryRequest(() =>
        request(app)
          .get('/api/tasks/stats')
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});