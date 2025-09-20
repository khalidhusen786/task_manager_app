"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Unit tests for TaskService
const globals_1 = require("@jest/globals");
const taskService_1 = require("../../src/services/taskService");
const User_1 = require("../../src/models/User");
const errors_1 = require("../../src/utils/errors");
const setup_1 = require("../setup");
(0, globals_1.describe)('TaskService', () => {
    let taskService;
    let userId;
    (0, globals_1.beforeAll)(async () => {
        await (0, setup_1.setupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.beforeEach)(async () => {
        await (0, setup_1.clearCollections)();
        taskService = new taskService_1.TaskService();
        // Create a test user
        const user = new User_1.User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        await user.save();
        userId = user._id.toString();
    });
    (0, globals_1.afterEach)(async () => {
        await (0, setup_1.clearCollections)();
    });
    (0, globals_1.describe)('createTask', () => {
        (0, globals_1.it)('should create a task successfully', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: new Date('2024-12-31'),
                userId
            };
            const result = await taskService.createTask(taskData);
            (0, globals_1.expect)(result).toHaveProperty('_id');
            (0, globals_1.expect)(result.title).toBe(taskData.title);
            (0, globals_1.expect)(result.description).toBe(taskData.description);
            (0, globals_1.expect)(result.priority).toBe(taskData.priority);
            (0, globals_1.expect)(result.status).toBe(taskData.status);
            (0, globals_1.expect)(result.userId.toString()).toBe(userId);
        });
        (0, globals_1.it)('should throw error for invalid user', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'pending',
                dueDate: new Date('2024-12-31'),
                userId: '507f1f77bcf86cd799439011' // Invalid user ID
            };
            await (0, globals_1.expect)(taskService.createTask(taskData)).rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('getTasks', () => {
        (0, globals_1.beforeEach)(async () => {
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
        (0, globals_1.it)('should get all tasks for user', async () => {
            const result = await taskService.getTasks(userId);
            (0, globals_1.expect)(result.tasks).toHaveLength(3);
            (0, globals_1.expect)(result.pagination.totalTasks).toBe(3);
        });
        (0, globals_1.it)('should filter tasks by status', async () => {
            const result = await taskService.getTasks(userId, { status: 'pending' });
            (0, globals_1.expect)(result.tasks).toHaveLength(1);
            (0, globals_1.expect)(result.tasks[0].status).toBe('pending');
        });
        (0, globals_1.it)('should filter tasks by priority', async () => {
            const result = await taskService.getTasks(userId, { priority: 'high' });
            (0, globals_1.expect)(result.tasks).toHaveLength(1);
            (0, globals_1.expect)(result.tasks[0].priority).toBe('high');
        });
        (0, globals_1.it)('should search tasks by title', async () => {
            const result = await taskService.getTasks(userId, { search: 'Task 1' });
            (0, globals_1.expect)(result.tasks).toHaveLength(1);
            (0, globals_1.expect)(result.tasks[0].title).toBe('Task 1');
        });
        (0, globals_1.it)('should sort tasks by due date', async () => {
            const result = await taskService.getTasks(userId, { sortBy: 'dueDate', sortOrder: 'asc' });
            (0, globals_1.expect)(result.tasks[0].title).toBe('Task 3'); // Earliest due date
            (0, globals_1.expect)(result.tasks[2].title).toBe('Task 1'); // Latest due date
        });
    });
    (0, globals_1.describe)('getTask', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
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
        (0, globals_1.it)('should get task by ID', async () => {
            const result = await taskService.getTask(taskId, userId);
            (0, globals_1.expect)(result._id.toString()).toBe(taskId);
            (0, globals_1.expect)(result.title).toBe('Test Task');
        });
        (0, globals_1.it)('should throw error for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await (0, globals_1.expect)(taskService.getTask(fakeId, userId)).rejects.toThrow(errors_1.AppError);
        });
        (0, globals_1.it)('should throw error for task belonging to different user', async () => {
            const otherUser = new User_1.User({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });
            await otherUser.save();
            await (0, globals_1.expect)(taskService.getTask(taskId, otherUser._id.toString()))
                .rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('updateTask', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
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
        (0, globals_1.it)('should update task successfully', async () => {
            const updateData = {
                title: 'Updated Task',
                status: 'in_progress'
            };
            const result = await taskService.updateTask(taskId, updateData, userId);
            (0, globals_1.expect)(result.title).toBe('Updated Task');
            (0, globals_1.expect)(result.status).toBe('in_progress');
            (0, globals_1.expect)(result.description).toBe('Test Description'); // Should remain unchanged
        });
        (0, globals_1.it)('should throw error for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await (0, globals_1.expect)(taskService.updateTask(fakeId, { title: 'Updated' }, userId))
                .rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('deleteTask', () => {
        let taskId;
        (0, globals_1.beforeEach)(async () => {
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
        (0, globals_1.it)('should delete task successfully', async () => {
            await (0, globals_1.expect)(taskService.deleteTask(taskId, userId)).resolves.not.toThrow();
            // Verify task is deleted
            await (0, globals_1.expect)(taskService.getTask(taskId, userId)).rejects.toThrow(errors_1.AppError);
        });
        (0, globals_1.it)('should throw error for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await (0, globals_1.expect)(taskService.deleteTask(fakeId, userId)).rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('getTaskStats', () => {
        (0, globals_1.beforeEach)(async () => {
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
        (0, globals_1.it)('should get task statistics', async () => {
            const result = await taskService.getTaskStats(userId);
            (0, globals_1.expect)(result.totalTasks).toBe(4);
            (0, globals_1.expect)(result.pendingTasks).toBe(1);
            (0, globals_1.expect)(result.inProgressTasks).toBe(1);
            (0, globals_1.expect)(result.completedTasks).toBe(2);
            (0, globals_1.expect)(result.highPriorityTasks).toBe(2);
            (0, globals_1.expect)(result.mediumPriorityTasks).toBe(1);
            (0, globals_1.expect)(result.lowPriorityTasks).toBe(1);
        });
    });
});
