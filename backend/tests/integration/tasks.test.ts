// Integration tests for Task endpoints
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import app from '../../src/server';
import { User } from '../../src/models/User';
import { Task } from '../../src/models/Task';
import { setupTestDB, cleanupTestDB, clearCollections, TEST_TIMEOUT } from '../setup';

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

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toHaveProperty('id');
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

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        {
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Task 3',
          description: 'Description 3',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const taskData of tasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData);
      }
    });

    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination.totalTasks).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('high');
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/api/tasks?search=Task 1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].title).toBe('Task 1');
    });

    it('should sort tasks by due date', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=asc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.tasks[0].title).toBe('Task 3'); // Earliest due date
      expect(response.body.data.tasks[2].title).toBe('Task 1'); // Latest due date
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData);

      taskId = response.body.data.id;
    });

    it('should get task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(taskId);
      expect(response.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(401);

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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData);

      taskId = response.body.data.id;
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.description).toBe('Test Description'); // Should remain unchanged
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated' })
        .expect(401);

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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData);

      taskId = response.body.data.id;
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      // Create test tasks with different statuses and priorities
      const tasks = [
        { title: 'Task 1', priority: 'high', status: 'pending' },
        { title: 'Task 2', priority: 'medium', status: 'in_progress' },
        { title: 'Task 3', priority: 'low', status: 'completed' },
        { title: 'Task 4', priority: 'high', status: 'completed' }
      ];

      for (const taskData of tasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(taskData);
      }
    });

    it('should get task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.pending).toBe(1);
      expect(response.body.data.inProgress).toBe(1);
      expect(response.body.data.completed).toBe(2);
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
