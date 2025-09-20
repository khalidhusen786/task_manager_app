// ===== AUTH INITIALIZATION HOOK =====
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { getUserProfile } from '../store/slices/authSlice';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize authentication once
    if (!hasInitialized.current && !user && !isLoading && !error) {
      hasInitialized.current = true;
      dispatch(getUserProfile());
    }
  }, [dispatch, user, isLoading, error]);

  return { hasInitialized: hasInitialized.current };
};




