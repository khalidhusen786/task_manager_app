// Simple utility functions for task filtering
import type { Task, TaskFilters } from '../types';

/**
 * Filter tasks based on search term, status, and priority
 * This is used for client-side filtering to avoid excessive API calls
 */
export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  // Safety check: ensure tasks is an array
  if (!Array.isArray(tasks)) {
    return [];
  }
  
  let filtered = [...tasks];

  // Filter by search term (client-side only)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by status (client-side only)
  if (filters.status) {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  // Filter by priority (client-side only)
  if (filters.priority) {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }

  return filtered;
};

/**
 * Check if filters require server-side API call
 * Only non-search filters should trigger API calls
 */
export const shouldMakeApiCall = (filters: TaskFilters): boolean => {
  return !!(filters.status || filters.priority || filters.sortBy || filters.page);
};

/**
 * Get server-side filters (exclude search)
 */
export const getServerFilters = (filters: TaskFilters): Partial<TaskFilters> => {
  const { search, ...serverFilters } = filters;
  return serverFilters;
};
