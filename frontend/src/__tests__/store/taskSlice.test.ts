// Unit tests for task slice
import { configureStore } from '@reduxjs/toolkit';
import taskSlice, { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  setFilters,
  clearFilters 
} from '../../store/slices/taskSlice';
type Task = any;
type TaskFilters = any;

// Mock task service
jest.mock('../../services/taskService', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
}));

describe('Task Slice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tasks: (state: any, action: any) => (taskSlice as any)(state, action)
      }
    }) as any;
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().tasks;
      
      expect(state.tasks).toEqual([]);
      expect(state.currentTask).toBeNull();
      expect(state.stats).toBeNull();
      expect(state.filters).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        totalPages: 0,
        totalTasks: 0
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('should update filters correctly', () => {
      const newFilters: Partial<TaskFilters> = {
        search: 'test',
        status: 'pending',
        priority: 'high'
      };

      store.dispatch(setFilters(newFilters));
      const state = store.getState().tasks;

      expect(state.filters).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...newFilters
      });
    });

    it('should merge with existing filters', () => {
      // First set some filters
      store.dispatch(setFilters({ search: 'test' }));
      
      // Then update with new filters
      store.dispatch(setFilters({ status: 'pending' }));
      const state = store.getState().tasks;

      expect(state.filters).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'test',
        status: 'pending'
      });
    });
  });

  describe('clearFilters', () => {
    it('should reset filters to default values', () => {
      // First set some filters
      store.dispatch(setFilters({ 
        search: 'test', 
        status: 'pending',
        priority: 'high',
        page: 2,
        limit: 20
      }));

      // Then clear filters
      store.dispatch(clearFilters());
      const state = store.getState().tasks;

      expect(state.filters).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });
  });

  describe('fetchTasks', () => {
    it('should handle fetchTasks.pending', () => {
      store.dispatch(fetchTasks.pending('', {} as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchTasks.fulfilled', () => {
      const mockTasks: Task[] = [
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
        }
      ];

      const mockResponse = {
        data: {
          tasks: mockTasks,
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalTasks: 1
          }
        }
      };

      store.dispatch(fetchTasks.fulfilled(mockResponse as any, '', {}));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.tasks).toEqual(mockTasks);
      expect(state.pagination).toEqual(mockResponse.data.pagination);
      expect(state.error).toBeNull();
    });

    it('should handle fetchTasks.rejected', () => {
      const errorMessage = 'Failed to load tasks';
      store.dispatch(fetchTasks.rejected(new Error(errorMessage), '', {} as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle rate limit error', () => {
      const rateLimitError = {
        status: 429,
        retryAfterSeconds: 60
      } as any;

      store.dispatch(fetchTasks.rejected(new Error('Rate limited'), '', rateLimitError as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load tasks');
    });
  });

  describe('createTask', () => {
    it('should handle createTask.pending', () => {
      store.dispatch(createTask.pending('', {} as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createTask.fulfilled', () => {
      const mockTask: Task = {
        _id: '1',
        title: 'New Task',
        description: 'New Description',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const mockResponse = {
        data: { task: mockTask }
      } as any;

      store.dispatch(createTask.fulfilled(mockResponse as any, '', {} as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.tasks).toContain(mockTask);
      expect(state.error).toBeNull();
    });

    it('should handle createTask.rejected', () => {
      const errorMessage = 'Failed to create task';
      store.dispatch(createTask.rejected(new Error(errorMessage), '', {} as any));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      // Add a task to the state first
      const mockTask: Task = {
        _id: '1',
        title: 'Original Task',
        description: 'Original Description',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      store.dispatch({
        type: 'tasks/fetchTasks/fulfilled',
        payload: {
          data: {
            tasks: [mockTask],
            pagination: { page: 1, limit: 10, totalPages: 1, totalTasks: 1 }
          }
        }
      });
    });

    it('should handle updateTask.fulfilled', () => {
      const updatedTask: Task = {
        _id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const mockResponse = {
        data: updatedTask
      };

      store.dispatch(updateTask.fulfilled({ data: { task: updatedTask } } as any, '', { id: '1', data: {} }));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.tasks[0]).toEqual(updatedTask);
      expect(state.error).toBeNull();
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      // Add a task to the state first
      const mockTask: Task = {
        _id: '1',
        title: 'Task to Delete',
        description: 'Description',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      store.dispatch({
        type: 'tasks/fetchTasks/fulfilled',
        payload: {
          data: {
            tasks: [mockTask],
            pagination: { page: 1, limit: 10, totalPages: 1, totalTasks: 1 }
          }
        }
      });
    });

    it('should handle deleteTask.fulfilled', () => {
      store.dispatch(deleteTask.fulfilled('1', '', '1'));
      const state = store.getState().tasks;

      expect(state.isLoading).toBe(false);
      expect(state.tasks).toHaveLength(0);
      expect(state.error).toBeNull();
    });
  });
});
