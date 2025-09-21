import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import apiService from '../services/api';

// Enhanced persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  version: 1,
  // Persist ALL auth state fields - remove whitelist to persist everything
  debug: process.env.NODE_ENV === 'development',
};

// Task slice persist config (optional - you might not want to persist tasks)
const taskPersistConfig = {
  key: 'tasks',
  storage,
  version: 1,
  // Only persist filters and pagination, not the actual tasks
  whitelist: ['filters', 'pagination'],
  debug: process.env.NODE_ENV === 'development',
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTaskReducer = persistReducer(taskPersistConfig, taskReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tasks: persistedTaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Connect API service to Redux store for token access
apiService.setStore(store);

export const persistor = persistStore(store, null, () => {
  console.log('🔄 Redux-persist rehydration complete');
  const state = store.getState();
  console.log('🔍 Rehydrated auth state:', {
    hasUser: !!state.auth.user,
    hasAccessToken: !!state.auth.accessToken,
    hasRefreshToken: !!state.auth.refreshToken,
    isAuthenticated: state.auth.isAuthenticated,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;