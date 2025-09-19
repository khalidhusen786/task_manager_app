// ===== TASK LIST COMPONENT =====
import React, { useMemo } from 'react';
import type { Task, PaginationInfo, TaskFilters } from '../../types';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, formatDate, formatRelativeTime } from '../../utils';
import { filterTasks } from '../../utils/filterUtils';
import { MoreVertical, Edit, Trash2, CheckCircle, Circle, Clock, PlayCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { deleteTask, updateTask, fetchTasks, fetchTaskStats } from '../../store/slices/taskSlice';
import { ConfirmDialog } from '../ui';
import TaskModal from './TaskModal';
import { useToast } from '../ui/ToastProvider';

interface TaskListProps {
  tasks: Task[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  filters?: TaskFilters;
}


const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  pagination, 
  isLoading, 
  error, 
  onPageChange,
  filters = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
}) => {
  // Apply client-side filtering
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, filters);
  }, [tasks, filters]);
  if (error) {
    return (
      <div className="card">
        <div className="card-content text-center py-8">
          <div className="text-red-600 mb-2">Error loading tasks</div>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredTasks?.length === 0) {
    return (
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tasks.length === 0 ? 'No tasks found' : 'No tasks match your filters'}
          </h3>
          <p className="text-gray-500">
            {tasks.length === 0 ? 'Get started by creating your first task.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task List */}
      <div className="card border border-gray-200 rounded-lg shadow-sm">
        <div className="card-content p-0">
          <div className="divide-y divide-gray-200">
            {filteredTasks?.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <Pagination
          currentPage={pagination?.page}
          totalPages={pagination?.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

// Individual Task Item Component
const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState<null | { type: 'complete' | 'delete' | 'progress' }>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleMarkComplete = async () => {
    if (task.status === 'completed') return;
    setConfirmOpen({ type: 'complete' });
  };

  const handleDelete = async () => {
    setConfirmOpen({ type: 'delete' });
  };

  const handleMarkInProgress = () => {
    if (task.status === 'pending') {
      setConfirmOpen({ type: 'progress' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTaskBorderColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-4 border-green-500';
      case 'in_progress':
        return 'border-l-4 border-blue-500';
      case 'pending':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${getTaskBorderColor(task.status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {getStatusIcon(task.status)}
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-2">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>

              {/* Priority Badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  Due {formatRelativeTime(task.dueDate)}
                </span>
              )}

              {/* Created Date */}
              <span className="text-xs text-gray-400">
                Created {formatDate(task.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button onClick={() => setEditOpen(true)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Edit className="h-4 w-4 mr-3" />
                Edit Task
              </button>
              {task.status !== 'in_progress' && task.status !== 'completed' && (
                <button onClick={handleMarkInProgress} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <PlayCircle className="h-4 w-4 mr-3" />
                  Mark In Progress
                </button>
              )}
              <button onClick={handleMarkComplete} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <CheckCircle className="h-4 w-4 mr-3" />
                Mark Complete
              </button>
              <button onClick={handleDelete} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!confirmOpen}
        title={confirmOpen?.type === 'delete' ? 'Delete task?' : confirmOpen?.type === 'progress' ? 'Mark in progress?' : 'Mark as completed?'}
        description={confirmOpen?.type === 'delete' ? 'This action cannot be undone.' : 'You can change status later if needed.'}
        confirmText={confirmOpen?.type === 'delete' ? 'Delete' : confirmOpen?.type === 'progress' ? 'Set In Progress' : 'Complete'}
        destructive={confirmOpen?.type === 'delete'}
        onCancel={() => setConfirmOpen(null)}
        onConfirm={async () => {
          try {
            if (confirmOpen?.type === 'delete') {
              await dispatch(deleteTask(task._id)).unwrap();
              addToast({ type: 'success', message: 'Task deleted.' });
            } else if (confirmOpen?.type === 'complete') {
              await dispatch(updateTask({ id: task._id, data: { status: 'completed' } })).unwrap();
              addToast({ type: 'success', message: 'Task marked as completed.' });
            } else if (confirmOpen?.type === 'progress') {
              await dispatch(updateTask({ id: task._id, data: { status: 'in_progress' } })).unwrap();
              addToast({ type: 'success', message: 'Task marked in progress.' });
            }
            // Refresh list and stats so UI updates immediately
            await Promise.all([
              dispatch(fetchTasks({})).unwrap().catch(() => {}),
              dispatch(fetchTaskStats()).unwrap().catch(() => {}),
            ]);
          } catch (e: any) {
            addToast({ type: 'error', message: e?.message || 'Action failed.' });
          } finally {
            setConfirmOpen(null);
            setIsMenuOpen(false);
          }
        }}
      />
      <TaskModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        task={task}
        onSaved={async () => {
          await Promise.all([
            dispatch(fetchTasks({})).unwrap().catch(() => {}),
            dispatch(fetchTaskStats()).unwrap().catch(() => {}),
          ]);
        }}
      />
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TaskList;


