import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginFormData, RegisterFormData, RegisterApiPayload } from '../../types';
import authService from '../../services/authService';
import { apiUtils } from '../../utils/apiUtils';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      console.log('🔄 Starting login process...');
      const response = await authService.login(credentials);
      
      console.log('🚀 AuthService login response:', response);
      
      if (!response.data) {
        console.error('❌ No data in login response');
        return rejectWithValue('Invalid response structure - no data');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      console.log('🚀 Extracted login data:', {
        hasUser: !!user,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        userEmail: user?.email,
        tokenPreview: accessToken?.substring(0, 20) + '...',
      });

      // Validate all required fields
      if (!user || !accessToken || !refreshToken) {
        console.error('❌ Missing required login fields:', { 
          user: !!user, 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken 
        });
        return rejectWithValue('Missing required authentication data');
      }

      console.log('✅ Login data validation passed, returning to Redux...');
      return { user, accessToken, refreshToken };
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('login', errorDetails));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterApiPayload, { rejectWithValue }) => {
    try {
      console.log('🔄 Starting registration process...');
      const response = await authService.register(userData);
      
      if (!response.data) {
        return rejectWithValue('Invalid response structure - no data');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      if (!user || !accessToken || !refreshToken) {
        return rejectWithValue('Missing required authentication data');
      }

      return { user, accessToken, refreshToken };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('register', errorDetails));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Starting logout process...');
      await authService.logout();
      console.log('✅ Logout successful');
      return true;
    } catch (error: any) {
      console.error('❌ Logout error (proceeding anyway):', error);
      // Even if logout fails on server, we still want to clear local state
      return true;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Starting token refresh...');
      const response = await authService.refreshToken();
      
      if (!response.data) {
        return rejectWithValue('Invalid refresh response structure');
      }

      const { accessToken, refreshToken } = response.data;
      
      if (!accessToken || !refreshToken) {
        return rejectWithValue('Missing tokens in refresh response');
      }

      console.log('✅ Token refresh successful');
      return { accessToken, refreshToken };
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('refreshToken', errorDetails));
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
      const errorDetails = apiUtils.extractErrorDetails(error);
      return rejectWithValue(apiUtils.getErrorMessage('getProfile', errorDetails));
    }
  }
);

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
      console.log('🧹 Clearing all auth state (Redux-persist will handle persistence)');
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    setAuthFromPersist: (state, action: PayloadAction<{
      user: User | null;
      accessToken: string | null;
      refreshToken: string | null;
      isAuthenticated: boolean;
    }>) => {
      console.log('🔄 Restoring auth from persist:', action.payload);
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('⏳ Login pending...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        console.log('✅ Login fulfilled - Redux state will be updated');
        console.log('✅ Payload received:', {
          hasUser: !!action.payload.user,
          hasAccessToken: !!action.payload.accessToken,
          hasRefreshToken: !!action.payload.refreshToken,
        });
        
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        
        console.log('✅ Redux auth state updated successfully');
        console.log('✅ State now contains:', {
          hasUser: !!state.user,
          hasAccessToken: !!state.accessToken,
          hasRefreshToken: !!state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        console.log('✅ Registration fulfilled');
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('✅ Logout fulfilled - clearing state');
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      });

    // Refresh token cases
    builder
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
        console.log('✅ Token refresh fulfilled');
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log('❌ Token refresh rejected - clearing tokens');
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get profile cases
    builder
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        const errorMessage = action.payload as string;
        if (errorMessage?.includes('token') || errorMessage?.includes('authenticated') || errorMessage?.includes('401')) {
          state.user = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { clearError, setUser, clearUser, setAuthFromPersist } = authSlice.actions;
export default authSlice.reducer;