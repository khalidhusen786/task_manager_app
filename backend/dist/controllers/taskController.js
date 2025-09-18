"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const logger_1 = require("../utils/logger");
class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
        this.getTasks = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '10' } = req.query;
            const filters = {
                status: status,
                priority: priority,
                search: search
            };
            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy: sortBy,
                sortOrder: sortOrder
            };
            const result = await this.taskService.getTasks(userId, filters, pagination);
            res.json({
                success: true,
                data: result.tasks,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    totalTasks: result.totalTasks
                }
            });
        });
        this.getTask = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const task = await this.taskService.getTaskById(id, userId);
            res.json({
                success: true,
                data: task
            });
        });
        this.createTask = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const taskData = req.body;
            const task = await this.taskService.createTask(userId, taskData);
            logger_1.logger.info('Task created successfully', { taskId: task.id, userId });
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task
            });
        });
        this.updateTask = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const updates = req.body;
            const task = await this.taskService.updateTask(id, userId, updates);
            logger_1.logger.info('Task updated successfully', { taskId: id, userId });
            res.json({
                success: true,
                message: 'Task updated successfully',
                data: task
            });
        });
        this.deleteTask = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            await this.taskService.deleteTask(id, userId);
            logger_1.logger.info('Task deleted successfully', { taskId: id, userId });
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        });
        this.getTaskStats = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const stats = await this.taskService.getTaskStats(userId);
            res.json({
                success: true,
                data: stats
            });
        });
        this.updateTaskStatus = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { status } = req.body;
            const task = await this.taskService.updateTaskStatus(id, userId, status);
            logger_1.logger.info('Task status updated successfully', { taskId: id, userId, status });
            res.json({
                success: true,
                message: 'Task status updated successfully',
                data: task,
            });
        });
        this.updateTaskPriority = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { priority } = req.body;
            const task = await this.taskService.updateTaskPriority(id, userId, priority);
            logger_1.logger.info('Task priority updated successfully', { taskId: id, userId, priority });
            res.json({
                success: true,
                message: 'Task priority updated successfully',
                data: task,
            });
        });
        this.deleteManyTasks = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { taskIds } = req.body;
            const deletedCount = await this.taskService.deleteManyTasks(userId, taskIds);
            logger_1.logger.info('Tasks deleted successfully', { userId, count: deletedCount });
            res.json({ success: true, message: 'Tasks deleted successfully', deletedCount });
        });
        this.bulkUpdateTasks = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { taskIds, updates } = req.body;
            const modifiedCount = await this.taskService.bulkUpdateTasks(userId, taskIds, updates);
            logger_1.logger.info('Tasks updated successfully', { userId, count: modifiedCount });
            res.json({ success: true, message: 'Tasks updated successfully', modifiedCount });
        });
    }
}
exports.TaskController = TaskController;
