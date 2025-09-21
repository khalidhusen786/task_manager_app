// ===== MINIMAL CHANGES TO YOUR EXISTING AUTH SLICE =====
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginFormData, RegisterFormData ,RegisterApiPayload} from '../../types';
import authService from '../../services/authService';

// Keep your existing initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Keep ALL your existing thunks exactly as they are
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterApiPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data?.user as User;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data?.user as User;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      await authService.refreshToken();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data as User;
    } catch (error: any) {
      console.log('getUserProfile failed:', error.message);
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

// Keep your existing reducers, just add one new action
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    // ADD THIS NEW ACTION - only change needed
    setAuthFromPersist: (state, action: PayloadAction<{ user: User | null; isAuthenticated: boolean }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    // Keep all your existing extraReducers exactly as they are
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Get Profile - ONLY CHANGE: Don't auto-clear on failure
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // ONLY change: Only clear user state for auth-related errors
        const errorMessage = action.payload as string;
        if (errorMessage?.includes('token') || errorMessage?.includes('authenticated') || errorMessage?.includes('401')) {
          state.user = null;
          state.isAuthenticated = false;
        }
        // For network errors, keep user state intact
      });
  },
});

// Export all your existing actions + the new one
export const { clearError, setUser, clearUser, setAuthFromPersist } = authSlice.actions;
export default authSlice.reducer;