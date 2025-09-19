// ===== TASK FILTERS COMPONENT =====
import React, { useState, useEffect } from 'react';
import type { TaskFilters } from '../../types';
import { TASK_PRIORITY, TASK_STATUS } from '../../constants';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  onClearFilters?: () => void;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onClearFilters
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  // Sync local search with filters
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: (e.target.value || undefined) as any });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ priority: (e.target.value || undefined) as any });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sortBy: e.target.value });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onClearFilters?.();
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority || 
    (filters.sortBy && filters.sortBy !== 'createdAt');

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex flex-col space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or description"
                value={localSearch}
                onChange={handleSearchChange}
                className="input w-full"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={filters.status || ''}
              onChange={handleStatusChange}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value={TASK_STATUS.PENDING}>Pending</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.COMPLETED}>Completed</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={handlePriorityChange}
              className="input"
            >
              <option value="">All Priorities</option>
              <option value={TASK_PRIORITY.LOW}>Low</option>
              <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
              <option value={TASK_PRIORITY.HIGH}>High</option>
            </select>

            <select
              value={filters.sortBy || 'createdAt'}
              onChange={handleSortChange}
              className="input"
            >
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="title">Title</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setLocalSearch('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Status: {filters.status}
                  <button
                    onClick={() => onFilterChange({ status: undefined })}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.priority && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Priority: {filters.priority}
                  <button
                    onClick={() => onFilterChange({ priority: undefined })}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.sortBy && filters.sortBy !== 'createdAt' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Sort: {filters.sortBy}
                  <button
                    onClick={() => onFilterChange({ sortBy: 'createdAt' })}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersComponent;



