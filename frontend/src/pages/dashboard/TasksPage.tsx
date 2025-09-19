// ===== TASKS PAGE =====
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchTasks, fetchTaskStats, setFilters } from '../../store/slices/taskSlice';
import type { TaskFilters } from '../../types';
import TaskStats from '../../components/task/TaskStats';
import TaskFiltersComponent from '../../components/task/TaskFilters';
import TaskList from '../../components/task/TaskList';
import TaskModal from '../../components/task/TaskModal';
import { Plus } from 'lucide-react';

const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, stats, filters, pagination, isLoading, error } = useAppSelector((state) => state.tasks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch whenever filters change (single source of truth)
  useEffect(() => {
    dispatch(fetchTasks(filters));
    dispatch(fetchTaskStats());
  }, [dispatch, filters]);

  // Debounce search updates to avoid rapid API calls
  const searchDebounceRef = useRef<number | null>(null);

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    const hasSearch = Object.prototype.hasOwnProperty.call(newFilters, 'search');
    if (hasSearch) {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = window.setTimeout(() => {
        const updated = { ...filters, ...newFilters, page: 1 };
        dispatch(setFilters(updated));
      }, 400);
      return;
    }
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    dispatch(setFilters(updatedFilters));
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    dispatch(setFilters(updatedFilters));
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh tasks and stats
    dispatch(fetchTasks(filters));
    dispatch(fetchTaskStats());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your tasks efficiently
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Filters */}
      <TaskFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        onPageChange={handlePageChange}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
        onSaved={handleTaskCreated}
      />
    </div>
  );
};

export default TasksPage;


