import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { getUserProfile, clearUser, setAuthFromPersist } from '../store/slices/authSlice';
export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuth = async () => {
      const hasTokens = document.cookie.includes('accessToken') || document.cookie.includes('refreshToken');

      if (!hasTokens) {
        dispatch(clearUser());
        setInitialized(true);
        return;
      }

      try {
        await dispatch(getUserProfile()).unwrap();
      } catch {
        dispatch(clearUser());
      } finally {
        setInitialized(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  return initialized;
};

