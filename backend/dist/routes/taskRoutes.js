"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ===== src/routes/taskRoutes.ts =====
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const taskService_1 = require("../services/taskService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const taskSchemas_1 = require("../schemas/taskSchemas");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
// Initialize service and controller
const taskService = new taskService_1.TaskService();
const taskController = new taskController_1.TaskController(taskService);
// Rate limiter for task creation
const taskCreationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 tasks per minute
    message: {
        success: false,
        message: 'Too many tasks created, please slow down.',
    },
});
// All task routes require authentication
router.use(authMiddleware_1.authenticateToken);
/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 */
router.get('/', (0, validationMiddleware_1.validate)({ query: taskSchemas_1.taskFiltersSchema }), taskController.getTasks);
/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for authenticated user
 * @access  Private
 */
router.get('/stats', taskController.getTaskStats);
/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get('/:id', (0, validationMiddleware_1.validate)({ params: validationMiddleware_1.commonSchemas.mongoId }), taskController.getTask);
/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', taskCreationLimiter, (0, validationMiddleware_1.validate)({ body: taskSchemas_1.createTaskSchema }), taskController.createTask);
/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task by ID
 * @access  Private
 */
router.put('/:id', (0, validationMiddleware_1.validate)({
    params: validationMiddleware_1.commonSchemas.mongoId,
    body: taskSchemas_1.updateTaskSchema
}), taskController.updateTask);
/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status only
 * @access  Private
 */
router.patch('/:id/status', (0, validationMiddleware_1.validate)({
    params: validationMiddleware_1.commonSchemas.mongoId,
    body: taskSchemas_1.updateTaskSchema.pick({ status: true })
}), taskController.updateTaskStatus);
/**
 * @route   PATCH /api/tasks/:id/priority
 * @desc    Update task priority only
 * @access  Private
 */
router.patch('/:id/priority', (0, validationMiddleware_1.validate)({
    params: validationMiddleware_1.commonSchemas.mongoId,
    body: taskSchemas_1.updateTaskSchema.pick({ priority: true })
}), taskController.updateTaskPriority);
/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task by ID
 * @access  Private
 */
router.delete('/:id', (0, validationMiddleware_1.validate)({ params: validationMiddleware_1.commonSchemas.mongoId }), taskController.deleteTask);
/**
 * @route   DELETE /api/tasks
 * @desc    Delete multiple tasks by IDs
 * @access  Private
 */
router.delete('/', (0, validationMiddleware_1.validate)({ body: taskSchemas_1.bulkIdsSchema }), taskController.deleteManyTasks);
/**
 * @route   PATCH /api/tasks/bulk-update
 * @desc    Bulk update tasks (status, priority, etc.)
 * @access  Private
 */
router.patch('/bulk-update', (0, validationMiddleware_1.validate)({ body: taskSchemas_1.bulkUpdateSchema }), taskController.bulkUpdateTasks);
exports.default = router;
