// ===== AUTH HOOK =====
import { useAppSelector } from './useAppDispatch';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};
