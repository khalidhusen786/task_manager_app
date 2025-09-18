"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const logger_1 = require("../utils/logger");
class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
        this.getTasks = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getTask = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.createTask = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTask = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteTask = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getTaskStats = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const stats = await this.taskService.getTaskStats(userId);
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTaskStatus = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTaskPriority = async (req, res, next) => {
            try {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteManyTasks = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const { taskIds } = req.body;
                const deletedCount = await this.taskService.deleteManyTasks(userId, taskIds);
                logger_1.logger.info('Tasks deleted successfully', { userId, count: deletedCount });
                res.json({ success: true, message: 'Tasks deleted successfully', deletedCount });
            }
            catch (error) {
                next(error);
            }
        };
        this.bulkUpdateTasks = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const { taskIds, updates } = req.body;
                const modifiedCount = await this.taskService.bulkUpdateTasks(userId, taskIds, updates);
                logger_1.logger.info('Tasks updated successfully', { userId, count: modifiedCount });
                res.json({ success: true, message: 'Tasks updated successfully', modifiedCount });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TaskController = TaskController;
