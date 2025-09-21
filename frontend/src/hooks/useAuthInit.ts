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
      // Wait for persist
      await new Promise(r => setTimeout(r, 200));
      
      const hasTokens = document.cookie.includes('accessToken') || 
                       document.cookie.includes('refreshToken');

      if (hasTokens) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (error) {
          dispatch(clearUser());
        }
      } else {
        dispatch(clearUser());
      }
      
      setInitialized(true);
    };

    checkAuth();
  }, [dispatch]);

  return initialized;
};