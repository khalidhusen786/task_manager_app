"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
// src/services/taskService.ts
const Task_1 = require("../models/Task");
const errors_1 = require("../utils/errors");
const mongoose_1 = __importDefault(require("mongoose"));
class TaskService {
    async getTasks(userId, filters, pagination) {
        const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        // Apply filters
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.priority) {
            query.priority = filters.priority;
        }
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }
        // Calculate pagination
        const skip = (pagination.page - 1) * pagination.limit;
        // Build sort object
        const sort = {};
        sort[pagination.sortBy] = pagination.sortOrder === 'desc' ? -1 : 1;
        // Execute queries
        const [tasks, totalTasks] = await Promise.all([
            Task_1.Task.find(query)
                .sort(sort)
                .skip(skip)
                .limit(pagination.limit)
                .lean(),
            Task_1.Task.countDocuments(query)
        ]);
        return {
            tasks,
            totalTasks,
            totalPages: Math.ceil(totalTasks / pagination.limit),
            page: pagination.page,
            limit: pagination.limit
        };
    }
    async getTaskById(taskId, userId) {
        const task = await Task_1.Task.findOne({
            _id: taskId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!task) {
            throw new errors_1.AppError('Task not found', 404);
        }
        return task;
    }
    async createTask(userId, taskData) {
        const task = new Task_1.Task({
            ...taskData,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        await task.save();
        return task;
    }
    async updateTask(taskId, userId, updates) {
        const task = await Task_1.Task.findOneAndUpdate({
            _id: taskId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        }, updates, { new: true, runValidators: true });
        if (!task) {
            throw new errors_1.AppError('Task not found', 404);
        }
        return task;
    }
    async deleteTask(taskId, userId) {
        const task = await Task_1.Task.findOneAndDelete({
            _id: taskId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!task) {
            throw new errors_1.AppError('Task not found', 404);
        }
    }
    async getTaskStats(userId) {
        const stats = await Task_1.Task.aggregate([
            {
                $match: { userId: new mongoose_1.default.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$status', Task_1.TaskStatus.PENDING] }, 1, 0]
                        }
                    },
                    inProgress: {
                        $sum: {
                            $cond: [{ $eq: ['$status', Task_1.TaskStatus.IN_PROGRESS] }, 1, 0]
                        }
                    },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ['$status', Task_1.TaskStatus.COMPLETED] }, 1, 0]
                        }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', Task_1.TaskStatus.COMPLETED] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        return stats[0] || {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            overdue: 0
        };
    }
    async updateTaskStatus(taskId, userId, status) {
        const task = await Task_1.Task.findOneAndUpdate({ _id: taskId, userId: new mongoose_1.default.Types.ObjectId(userId) }, { status }, { new: true, runValidators: true });
        if (!task) {
            throw new errors_1.AppError('Task not found', 404);
        }
        return task;
    }
    async updateTaskPriority(taskId, userId, priority) {
        const task = await Task_1.Task.findOneAndUpdate({ _id: taskId, userId: new mongoose_1.default.Types.ObjectId(userId) }, { priority }, { new: true, runValidators: true });
        if (!task) {
            throw new errors_1.AppError('Task not found', 404);
        }
        return task;
    }
    async deleteManyTasks(userId, taskIds) {
        const result = await Task_1.Task.deleteMany({
            _id: { $in: taskIds },
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        return result.deletedCount || 0;
    }
    async bulkUpdateTasks(userId, taskIds, updates) {
        const result = await Task_1.Task.updateMany({ _id: { $in: taskIds }, userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: updates });
        return result.modifiedCount || 0;
    }
}
exports.TaskService = TaskService;
