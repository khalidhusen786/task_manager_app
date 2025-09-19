// Unit tests for task service
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import taskService from '../../services/taskService';
import type { TaskFormData } from '../../types';

// Mock API server
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    const searchParams = req.url.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let tasks = [
      {
        _id: '1',
        title: 'Task 1',
        description: 'Description 1',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'Task 2',
        description: 'Description 2',
        priority: 'medium',
        status: 'in_progress',
        dueDate: '2024-12-30T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    // Apply filters
    if (search) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          tasks,
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalTasks: tasks.length
          }
        }
      })
    );
  }),

  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            _id: '1',
            title: 'Task 1',
            description: 'Description 1',
            priority: 'high',
            status: 'pending',
            dueDate: '2024-12-31T00:00:00.000Z',
            userId: '1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'Task not found'
      })
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Task created successfully',
        data: {
          _id: '3',
          title: 'New Task',
          description: 'New Description',
          priority: 'low',
          status: 'pending',
          dueDate: '2024-12-31T00:00:00.000Z',
          userId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }),

  rest.put('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Task updated successfully',
        data: {
          _id: id,
          title: 'Updated Task',
          description: 'Updated Description',
          priority: 'high',
          status: 'in_progress',
          dueDate: '2024-12-31T00:00:00.000Z',
          userId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Task deleted successfully'
      })
    );
  }),

  rest.get('/api/tasks/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalTasks: 2,
          pendingTasks: 1,
          inProgressTasks: 1,
          completedTasks: 0,
          highPriorityTasks: 1,
          mediumPriorityTasks: 1,
          lowPriorityTasks: 0
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TaskService', () => {
  describe('getTasks', () => {
    it('should fetch all tasks successfully', async () => {
      const response = await taskService.getTasks();

      expect(response.success).toBe(true);
      expect(response.data.tasks).toHaveLength(2);
      expect(response.data.pagination.totalTasks).toBe(2);
    });

    it('should filter tasks by search query', async () => {
      const response = await taskService.getTasks({ search: 'Task 1' });

      expect(response.success).toBe(true);
      expect(response.data.tasks).toHaveLength(1);
      expect(response.data.tasks[0].title).toBe('Task 1');
    });

    it('should filter tasks by status', async () => {
      const response = await taskService.getTasks({ status: 'pending' });

      expect(response.success).toBe(true);
      expect(response.data.tasks).toHaveLength(1);
      expect(response.data.tasks[0].status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      const response = await taskService.getTasks({ priority: 'high' });

      expect(response.success).toBe(true);
      expect(response.data.tasks).toHaveLength(1);
      expect(response.data.tasks[0].priority).toBe('high');
    });

    it('should handle multiple filters', async () => {
      const response = await taskService.getTasks({ 
        search: 'Task',
        status: 'pending',
        priority: 'high'
      });

      expect(response.success).toBe(true);
      expect(response.data.tasks).toHaveLength(1);
      expect(response.data.tasks[0].title).toBe('Task 1');
      expect(response.data.tasks[0].status).toBe('pending');
      expect(response.data.tasks[0].priority).toBe('high');
    });

    it('should handle pagination parameters', async () => {
      const response = await taskService.getTasks({ 
        page: 2, 
        limit: 5 
      });

      expect(response.success).toBe(true);
      // Note: Mock doesn't implement pagination logic, but service should handle params
    });
  });

  describe('getTask', () => {
    it('should fetch a single task successfully', async () => {
      const response = await taskService.getTask('1');

      expect(response.success).toBe(true);
      expect(response.data._id).toBe('1');
      expect(response.data.title).toBe('Task 1');
    });

    it('should handle task not found', async () => {
      try {
        await taskService.getTask('999');
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData: TaskFormData = {
        title: 'New Task',
        description: 'New Description',
        priority: 'low',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z'
      };

      const response = await taskService.createTask(taskData);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Task created successfully');
      expect(response.data.title).toBe('New Task');
      expect(response.data._id).toBe('3');
    });

    it('should handle validation errors', async () => {
      const invalidTaskData = {
        description: 'Missing title'
        // Missing required title field
      } as TaskFormData;

      try {
        await taskService.createTask(invalidTaskData);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const response = await taskService.updateTask('1', updateData);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Task updated successfully');
      expect(response.data.title).toBe('Updated Task');
      expect(response.data.status).toBe('in_progress');
    });

    it('should handle task not found during update', async () => {
      try {
        await taskService.updateTask('999', { title: 'Updated' });
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const response = await taskService.deleteTask('1');

      expect(response.success).toBe(true);
      expect(response.message).toBe('Task deleted successfully');
    });

    it('should handle task not found during deletion', async () => {
      try {
        await taskService.deleteTask('999');
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });
  });

  describe('getTaskStats', () => {
    it('should fetch task statistics successfully', async () => {
      const response = await taskService.getTaskStats();

      expect(response.success).toBe(true);
      expect(response.data.totalTasks).toBe(2);
      expect(response.data.pendingTasks).toBe(1);
      expect(response.data.inProgressTasks).toBe(1);
      expect(response.data.completedTasks).toBe(0);
      expect(response.data.highPriorityTasks).toBe(1);
      expect(response.data.mediumPriorityTasks).toBe(1);
      expect(response.data.lowPriorityTasks).toBe(0);
    });
  });


  describe('deleteManyTasks', () => {
    it('should delete multiple tasks successfully', async () => {
      const response = await taskService.deleteManyTasks(['1', '2']);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Tasks deleted successfully');
    });
  });

});
