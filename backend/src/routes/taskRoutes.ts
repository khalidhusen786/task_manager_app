// ===== src/routes/taskRoutes.ts =====
import express from 'express';
import { TaskController } from '../controllers/taskController';
import { TaskService } from '../services/taskService';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validate, commonSchemas } from '../middlewares/validationMiddleware';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema, bulkIdsSchema, bulkUpdateSchema } from '../schemas/taskSchemas';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const router = express.Router();

// Initialize service and controller
const taskService = new TaskService();
const taskController = new TaskController(taskService);

// Rate limiter for task creation
const taskCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 tasks per minute
  message: {
    success: false,
    message: 'Too many tasks created, please slow down.',
  },
});

// All task routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 */
router.get('/', 
  validate({ query: taskFiltersSchema }), 
  taskController.getTasks
);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for authenticated user
 * @access  Private
 */
router.get('/stats', 
  taskController.getTaskStats
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get('/:id', 
  validate({ params: commonSchemas.mongoId }), 
  taskController.getTask
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', 
  taskCreationLimiter,
  validate({ body: createTaskSchema }), 
  taskController.createTask
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task by ID
 * @access  Private
 */
router.put('/:id', 
  validate({ 
    params: commonSchemas.mongoId,
    body: updateTaskSchema 
  }), 
  taskController.updateTask
);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status only
 * @access  Private
 */
router.patch('/:id/status', 
  validate({ 
    params: commonSchemas.mongoId,
    body: updateTaskSchema.pick({ status: true })
  }), 
  taskController.updateTaskStatus
);

/**
 * @route   PATCH /api/tasks/:id/priority
 * @desc    Update task priority only
 * @access  Private
 */
router.patch('/:id/priority', 
  validate({ 
    params: commonSchemas.mongoId,
    body: updateTaskSchema.pick({ priority: true })
  }), 
  taskController.updateTaskPriority
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task by ID
 * @access  Private
 */
router.delete('/:id', 
  validate({ params: commonSchemas.mongoId }), 
  taskController.deleteTask
);

/**
 * @route   DELETE /api/tasks
 * @desc    Delete multiple tasks by IDs
 * @access  Private
 */
router.delete('/', 
  validate({ body: bulkIdsSchema }), 
  taskController.deleteManyTasks
);

/**
 * @route   PATCH /api/tasks/bulk-update
 * @desc    Bulk update tasks (status, priority, etc.)
 * @access  Private
 */
router.patch('/bulk-update', 
  validate({ body: bulkUpdateSchema }), 
  taskController.bulkUpdateTasks
);

export default router;