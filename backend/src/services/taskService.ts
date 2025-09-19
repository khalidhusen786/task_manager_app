// src/services/taskService.ts
import { Task, ITask, TaskStatus, TaskPriority } from '../models/Task';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TasksResult {
  tasks: ITask[];
  totalTasks: number;
  totalPages: number;
  page: number;
  limit: number;
}

export class TaskService {
  async getTasks(userId: string, filters: TaskFilters, pagination: PaginationOptions): Promise<TasksResult> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

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
    const sort: any = {};
    sort[pagination.sortBy] = pagination.sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [tasks, totalTasks] = await Promise.all([
      Task.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Task.countDocuments(query)
    ]);

    return {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / pagination.limit),
      page: pagination.page,
      limit: pagination.limit
    };
  }

  async getTaskById(taskId: string, userId: string): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task({
      ...taskData,
      userId: new mongoose.Types.ObjectId(userId)
    });

    await task.save();
    return task;
  }

  async updateTask(taskId: string, userId: string, updates: Partial<ITask>): Promise<ITask> {
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: new mongoose.Types.ObjectId(userId)
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }
  }

  async getTaskStats(userId: string): Promise<any> {
    const stats = await Task.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.PENDING] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.IN_PROGRESS] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0]
            }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', TaskStatus.COMPLETED] }
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


  async deleteManyTasks(userId: string, taskIds: string[]): Promise<number> {
    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      userId: new mongoose.Types.ObjectId(userId),
    });
    return result.deletedCount || 0;
  }

}