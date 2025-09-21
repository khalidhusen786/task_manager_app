// src/hooks/useAuth.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useAuth = () => {
  const authState = useSelector((state: RootState) => state.auth);

  const isAuthenticated = authState.isAuthenticated;
  const isLoading = authState.isLoading;

  return { isAuthenticated, isLoading, user: authState.user, accessToken: authState.accessToken };
};
