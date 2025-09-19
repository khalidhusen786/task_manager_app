// ===== TASK SLICE =====
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskState, TaskFilters, TaskFormData, TaskStats, PaginationInfo } from '../../types';
import taskService from '../../services/taskService';

// Initial state
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  stats: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalTasks: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskFilters = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: TaskFormData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<TaskFormData> }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  }
);


export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  }
);

export const deleteManyTasks = createAsyncThunk(
  'tasks/deleteManyTasks',
  async (taskIds: string[], { rejectWithValue }) => {
    try {
      const response = await taskService.deleteManyTasks(taskIds);
      return { taskIds, deletedCount: response.data.deletedCount };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete tasks');
    }
  }
);


export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task stats');
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change (except for page changes)
      if (action.payload.page === undefined) {
        state.pagination.page = 1;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        const newTasks = (action.payload?.data ?? []) as Task[];
        const newPagination = (action.payload?.pagination ?? state.pagination) as PaginationInfo;
        
        // If this is a new page, append to existing tasks, otherwise replace
        if (newPagination.page > 1) {
          state.tasks = [...state.tasks, ...newTasks];
        } else {
          state.tasks = newTasks;
        }
        
        state.pagination = newPagination;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        if (payload?.status === 429) {
          const secs = payload?.retryAfterSeconds;
          state.error = secs ? `Too many requests. Try again in ${secs}s.` : 'Too many requests. Please try again shortly.';
        } else {
          state.error = (payload?.message as string) || (action.payload as string);
        }
      });

    // Fetch Single Task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload?.data as Task;
        state.error = null;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.tasks.unshift(action.payload.data as Task);
        }
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload?.data as Task;
        if (updated) {
          const index = state.tasks.findIndex(task => task._id === updated._id);
          if (index !== -1) {
            state.tasks[index] = updated;
          }
          if (state.currentTask?._id === updated._id) {
            state.currentTask = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Many Tasks
    builder
      .addCase(deleteManyTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteManyTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => !action.payload.taskIds.includes(task._id));
        if (state.currentTask && action.payload.taskIds.includes(state.currentTask._id)) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteManyTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    // Fetch Task Stats
    builder
      .addCase(fetchTaskStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload?.data as TaskStats;
        state.error = null;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setCurrentTask, 
  clearCurrentTask 
} = taskSlice.actions;

export default taskSlice.reducer;
