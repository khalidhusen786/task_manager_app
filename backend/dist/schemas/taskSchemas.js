"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateSchema = exports.bulkIdsSchema = exports.taskFiltersSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
// Align enums with model values (TaskStatus.IN_PROGRESS = 'in_progress')
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Task title is required"),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["pending", "in_progress", "completed"]).optional(),
    priority: zod_1.z.enum(["low", "medium", "high"]).optional(),
    dueDate: zod_1.z.coerce.date().optional(),
});
exports.updateTaskSchema = exports.createTaskSchema.partial();
// Include optional query helpers used by controller (search, sorting, pagination)
exports.taskFiltersSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "in_progress", "completed"]).optional(),
    priority: zod_1.z.enum(["low", "medium", "high"]).optional(),
    search: zod_1.z.string().min(1).max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
});
exports.bulkIdsSchema = zod_1.z.object({
    taskIds: zod_1.z.array(zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'))
        .min(1, 'At least one task ID is required')
        .max(50, 'Cannot operate on more than 50 tasks at once')
});
exports.bulkUpdateSchema = zod_1.z.object({
    taskIds: exports.bulkIdsSchema.shape.taskIds,
    updates: exports.updateTaskSchema.pick({ status: true, priority: true })
});
