"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Integration tests for Task endpoints
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const server_1 = __importDefault(require("../../src/server"));
const setup_1 = require("../setup");
(0, globals_1.describe)('Tasks Integration Tests', () => {
    let accessToken;
    let userId;
    (0, globals_1.beforeAll)(async () => {
        await (0, setup_1.setupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.beforeEach)(async () => {
        await (0, setup_1.clearCollections)();
        // Create a test user and get access token
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };
        const registerResponse = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/register')
            .send(userData);
        accessToken = registerResponse.body.data.accessToken;
        userId = registerResponse.body.data.user._id;
    });
    (0, globals_1.afterEach)(async () => {
        await (0, setup_1.clearCollections)();
    });
    (0, globals_1.describe)('POST /api/tasks', () => {
        (0, globals_1.it)('should create a task successfully', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: '2024-12-31T00:00:00.000Z'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData)
                .expect(201);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Task created successfully');
            (0, globals_1.expect)(response.body.data).toHaveProperty('_id');
            (0, globals_1.expect)(response.body.data.title).toBe(taskData.title);
            (0, globals_1.expect)(response.body.data.description).toBe(taskData.description);
            (0, globals_1.expect)(response.body.data.priority).toBe(taskData.priority);
            (0, globals_1.expect)(response.body.data.status).toBe(taskData.status);
            (0, globals_1.expect)(response.body.data.userId).toBe(userId);
        });
        (0, globals_1.it)('should return 400 for missing required fields', async () => {
            const taskData = {
                description: 'Test Description'
                // Missing title
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData)
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .send(taskData)
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('GET /api/tasks', () => {
        (0, globals_1.beforeEach)(async () => {
            // Create test tasks
            const tasks = [
                {
                    title: 'Task 1',
                    description: 'Description 1',
                    priority: 'high',
                    status: 'pending',
                    dueDate: '2024-12-31T00:00:00.000Z'
                },
                {
                    title: 'Task 2',
                    description: 'Description 2',
                    priority: 'medium',
                    status: 'in_progress',
                    dueDate: '2024-12-30T00:00:00.000Z'
                },
                {
                    title: 'Task 3',
                    description: 'Description 3',
                    priority: 'low',
                    status: 'completed',
                    dueDate: '2024-12-29T00:00:00.000Z'
                }
            ];
            for (const taskData of tasks) {
                await (0, supertest_1.default)(server_1.default)
                    .post('/api/tasks')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(taskData);
            }
        });
        (0, globals_1.it)('should get all tasks for authenticated user', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.tasks).toHaveLength(3);
            (0, globals_1.expect)(response.body.data.pagination.totalTasks).toBe(3);
        });
        (0, globals_1.it)('should filter tasks by status', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks?status=pending')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.tasks).toHaveLength(1);
            (0, globals_1.expect)(response.body.data.tasks[0].status).toBe('pending');
        });
        (0, globals_1.it)('should filter tasks by priority', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks?priority=high')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.tasks).toHaveLength(1);
            (0, globals_1.expect)(response.body.data.tasks[0].priority).toBe('high');
        });
        (0, globals_1.it)('should search tasks by title', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks?search=Task 1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.tasks).toHaveLength(1);
            (0, globals_1.expect)(response.body.data.tasks[0].title).toBe('Task 1');
        });
        (0, globals_1.it)('should sort tasks by due date', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks?sortBy=dueDate&sortOrder=asc')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.tasks).toHaveLength(3);
            (0, globals_1.expect)(response.body.data.tasks[0].title).toBe('Task 3'); // Earliest due date
            (0, globals_1.expect)(response.body.data.tasks[2].title).toBe('Task 1'); // Latest due date
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('GET /api/tasks/:id', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: '2024-12-31T00:00:00.000Z'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData);
            taskId = response.body.data._id;
        });
        (0, globals_1.it)('should get task by ID', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data._id).toBe(taskId);
            (0, globals_1.expect)(response.body.data.title).toBe('Test Task');
        });
        (0, globals_1.it)('should return 404 for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/tasks/${taskId}`)
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('PUT /api/tasks/:id', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: '2024-12-31T00:00:00.000Z'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData);
            taskId = response.body.data._id;
        });
        (0, globals_1.it)('should update task successfully', async () => {
            const updateData = {
                title: 'Updated Task',
                status: 'in_progress'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateData)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Task updated successfully');
            (0, globals_1.expect)(response.body.data.title).toBe('Updated Task');
            (0, globals_1.expect)(response.body.data.status).toBe('in_progress');
            (0, globals_1.expect)(response.body.data.description).toBe('Test Description'); // Should remain unchanged
        });
        (0, globals_1.it)('should return 404 for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Updated' })
                .expect(404);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/tasks/${taskId}`)
                .send({ title: 'Updated' })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('DELETE /api/tasks/:id', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: '2024-12-31T00:00:00.000Z'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData);
            taskId = response.body.data._id;
        });
        (0, globals_1.it)('should delete task successfully', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Task deleted successfully');
            // Verify task is deleted
            await (0, supertest_1.default)(server_1.default)
                .get(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
        (0, globals_1.it)('should return 404 for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await (0, supertest_1.default)(server_1.default)
                .delete(`/api/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete(`/api/tasks/${taskId}`)
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('GET /api/tasks/stats', () => {
        (0, globals_1.beforeEach)(async () => {
            // Create test tasks with different statuses and priorities
            const tasks = [
                { title: 'Task 1', priority: 'high', status: 'pending' },
                { title: 'Task 2', priority: 'medium', status: 'in_progress' },
                { title: 'Task 3', priority: 'low', status: 'completed' },
                { title: 'Task 4', priority: 'high', status: 'completed' }
            ];
            for (const taskData of tasks) {
                await (0, supertest_1.default)(server_1.default)
                    .post('/api/tasks')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(taskData);
            }
        });
        (0, globals_1.it)('should get task statistics', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks/stats')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.totalTasks).toBe(4);
            (0, globals_1.expect)(response.body.data.pendingTasks).toBe(1);
            (0, globals_1.expect)(response.body.data.inProgressTasks).toBe(1);
            (0, globals_1.expect)(response.body.data.completedTasks).toBe(2);
            (0, globals_1.expect)(response.body.data.highPriorityTasks).toBe(2);
            (0, globals_1.expect)(response.body.data.mediumPriorityTasks).toBe(1);
            (0, globals_1.expect)(response.body.data.lowPriorityTasks).toBe(1);
        });
        (0, globals_1.it)('should return 401 for missing authentication', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/tasks/stats')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
});
