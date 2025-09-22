// ===== TASK SLICE =====
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskState, TaskFilters, TaskFormData, TaskStats, PaginationInfo } from '../../types';
import taskService from '../../services/taskService';
import { apiUtils } from '../../utils/apiUtils';

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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('fetchTasks', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('fetchTask', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('createTask', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('updateTask', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('deleteTask', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('deleteTasks', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('fetchStats', errorDetails));
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
        
        // Handle your backend response structure
        const responseData = action.payload?.data;
        const tasks = responseData?.tasks || [];
        const pagination = responseData?.pagination || state.pagination;
        
        if (pagination.page > 1) {
          state.tasks = [...state.tasks, ...tasks];
        } else {
          state.tasks = tasks;
        }
        
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Single Task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload?.data?.task as Task;
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
        
        // Handle your backend response structure
        const newTask = action.payload?.data?.task;
        if (newTask) {
          state.tasks.unshift(newTask);
        }
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    // Update Task
    builder
     .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload?.data?.task;
        if (updatedTask) {
          const index = state.tasks.findIndex(task => task._id === updatedTask._id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
          if (state.currentTask?._id === updatedTask._id) {
            state.currentTask = updatedTask;
          }
        }
        state.error = null;
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
   .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload?.data?.stats;
        state.error = null;
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
