// Unit tests for filter utilities
import { filterTasks, shouldMakeApiCall, getServerFilters } from '../../utils/filterUtils';
type Task = any;
type TaskFilters = any;

describe('filterUtils', () => {
  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-12-31T00:00:00.000Z',
      userId: '1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Another Task',
      description: 'Another Description',
      priority: 'medium',
      status: 'in_progress',
      dueDate: '2024-12-30T00:00:00.000Z',
      userId: '1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '3',
      title: 'Low Priority Task',
      description: 'Low priority description',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-12-29T00:00:00.000Z',
      userId: '1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  describe('filterTasks', () => {
    it('should return all tasks when no filters applied', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockTasks);
    });

    it('should filter by search term in title', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'Test'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Task 1');
    });

    it('should filter by search term in description', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'Another'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Another Task');
    });

    it('should filter by status', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'pending'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('should filter by priority', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        priority: 'high'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });

    it('should combine multiple filters', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'Task',
        status: 'pending',
        priority: 'high'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Task 1');
      expect(result[0].status).toBe('pending');
      expect(result[0].priority).toBe('high');
    });

    it('should handle case-insensitive search', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'test'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Task 1');
    });

    it('should return empty array for non-matching search', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'NonExistent'
      };

      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('shouldMakeApiCall', () => {
    it('should return false for search-only filters', () => {
      const filters: TaskFilters = {
        search: 'test'
      } as any;

      expect(shouldMakeApiCall(filters)).toBe(false);
    });

    it('should return true for status filter', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'pending'
      };

      expect(shouldMakeApiCall(filters)).toBe(true);
    });

    it('should return true for priority filter', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        priority: 'high'
      };

      expect(shouldMakeApiCall(filters)).toBe(true);
    });

    it('should return true for sortBy filter', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'desc'
      };

      expect(shouldMakeApiCall(filters)).toBe(true);
    });

    it('should return true for page filter', () => {
      const filters: TaskFilters = {
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      expect(shouldMakeApiCall(filters)).toBe(true);
    });
  });

  describe('getServerFilters', () => {
    it('should exclude search from server filters', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'test',
        status: 'pending',
        priority: 'high'
      };

      const result = getServerFilters(filters);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'pending',
        priority: 'high'
      });
      expect(result).not.toHaveProperty('search');
    });

    it('should return all filters when no search', () => {
      const filters: TaskFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'pending'
      };

      const result = getServerFilters(filters);
      expect(result).toEqual(filters);
    });
  });
});
