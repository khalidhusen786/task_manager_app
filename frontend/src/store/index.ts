import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';

// Custom transform to handle serialization properly
const authTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState: any) => {
    console.log('💾 Persisting auth state:', inboundState);
    return {
      user: inboundState.user,
      isAuthenticated: inboundState.isAuthenticated,
      // Don't persist loading and error states
    };
  },
  // Transform state being rehydrated
  (outboundState: any) => {
    console.log('🔄 Rehydrating auth state:', outboundState);
    return {
      ...outboundState,
      isLoading: false,
      error: null,
    };
  },
  { whitelist: ['auth'] }
);

const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['isLoading', 'error'],
  transforms: [authTransform],
  debug: true
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: true,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;