// src/controllers/taskController.ts
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { logger } from '../utils/logger';

export class TaskController {
  constructor(private taskService: TaskService) {}

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const {
        status,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10'
      } = req.query;

      const filters = {
        status: status as string,
        priority: priority as string,
        search: search as string
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
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
    } catch (error) {
      next(error);
    }
  };

  getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const taskData = req.body;
      
      const task = await this.taskService.createTask(userId, taskData);
      
      logger.info('Task created successfully', { taskId: task.id, userId });
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const updates = req.body;
      
      const task = await this.taskService.updateTask(id, userId, updates);
      
      logger.info('Task updated successfully', { taskId: id, userId });
      
      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      await this.taskService.deleteTask(id, userId);
      
      logger.info('Task deleted successfully', { taskId: id, userId });
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { status } = req.body;

      const task = await this.taskService.updateTaskStatus(id, userId, status);

      logger.info('Task status updated successfully', { taskId: id, userId, status });

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTaskPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { priority } = req.body;

      const task = await this.taskService.updateTaskPriority(id, userId, priority);

      logger.info('Task priority updated successfully', { taskId: id, userId, priority });

      res.json({
        success: true,
        message: 'Task priority updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteManyTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { taskIds } = req.body as { taskIds: string[] };
      const deletedCount = await this.taskService.deleteManyTasks(userId, taskIds);

      logger.info('Tasks deleted successfully', { userId, count: deletedCount });

      res.json({ success: true, message: 'Tasks deleted successfully', deletedCount });
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { taskIds, updates } = req.body as { taskIds: string[]; updates: any };
      const modifiedCount = await this.taskService.bulkUpdateTasks(userId, taskIds, updates);

      logger.info('Tasks updated successfully', { userId, count: modifiedCount });

      res.json({ success: true, message: 'Tasks updated successfully', modifiedCount });
    } catch (error) {
      next(error);
    }
  };
}