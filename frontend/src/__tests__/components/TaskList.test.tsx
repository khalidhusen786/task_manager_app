// Unit tests for TaskList component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskList from '../../components/task/TaskList';
import taskSlice from '../../store/slices/taskSlice';
import authSlice from '../../store/slices/authSlice';
import type { Task } from '../../types';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: taskSlice,
      auth: authSlice
    },
    preloadedState: {
      tasks: {
        tasks: [
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
            title: 'Test Task 2',
            description: 'Test Description 2',
            priority: 'medium',
            status: 'in_progress',
            dueDate: '2024-12-30T00:00:00.000Z',
            userId: '1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ] as Task[],
        currentTask: null,
        stats: null,
        filters: {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        },
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          totalTasks: 2
        },
        isLoading: false,
        error: null
      },
      auth: {
        user: {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com'
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      },
      ...initialState
    }
  });
};

// Mock props
const mockProps = {
  onEditTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onToggleTaskStatus: jest.fn(),
  onUpdateTaskPriority: jest.fn()
};

describe('TaskList', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  it('renders task list correctly', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays task priorities correctly', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('displays task statuses correctly', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('calls onEditTask when edit button is clicked', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockProps.onEditTask).toHaveBeenCalledWith(expect.objectContaining({
      _id: '1',
      title: 'Test Task 1'
    }));
  });

  it('calls onDeleteTask when delete button is clicked', async () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockProps.onDeleteTask).toHaveBeenCalledWith('1');
    });
  });

  it('calls onToggleTaskStatus when status is changed', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    const statusSelects = screen.getAllByRole('combobox');
    fireEvent.change(statusSelects[0], { target: { value: 'completed' } });

    expect(mockProps.onToggleTaskStatus).toHaveBeenCalledWith('1', 'completed');
  });

  it('calls onUpdateTaskPriority when priority is changed', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    const prioritySelects = screen.getAllByRole('combobox');
    fireEvent.change(prioritySelects[0], { target: { value: 'low' } });

    expect(mockProps.onUpdateTaskPriority).toHaveBeenCalledWith('1', 'low');
  });

  it('displays loading state correctly', () => {
    const loadingStore = createMockStore({
      tasks: {
        tasks: [],
        isLoading: true,
        error: null
      }
    });

    render(
      <Provider store={loadingStore}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorStore = createMockStore({
      tasks: {
        tasks: [],
        isLoading: false,
        error: 'Failed to fetch tasks'
      }
    });

    render(
      <Provider store={errorStore}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
  });

  it('displays empty state when no tasks', () => {
    const emptyStore = createMockStore({
      tasks: {
        tasks: [],
        isLoading: false,
        error: null
      }
    });

    render(
      <Provider store={emptyStore}>
        <TaskList {...mockProps} />
      </Provider>
    );

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('formats due dates correctly', () => {
    render(
      <Provider store={store}>
        <TaskList {...mockProps} />
      </Provider>
    );

    // Check if due dates are displayed (format may vary based on implementation)
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });
});
