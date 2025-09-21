import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { refreshToken, setUser } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';

export const useAuthInit = () => {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken: storedRefreshToken, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔄 Initializing auth...', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!storedRefreshToken,
        hasUser: !!user,
      });

      // If we have stored tokens and user, we're already authenticated
      if (accessToken && storedRefreshToken && user) {
        console.log('✅ Auth already initialized with stored data');
        setInitialized(true);
        return;
      }

      // If we have a refresh token but no access token, try to refresh
      if (storedRefreshToken && !accessToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          await dispatch(refreshToken()).unwrap();
          console.log('✅ Token refresh successful');
        } catch (err) {
          console.warn('❌ Token refresh failed, user needs to login', err);
        }
      } else {
        console.log('ℹ️ No stored tokens, user needs to login');
      }

      setInitialized(true);
    };

    initAuth();
  }, [dispatch, accessToken, storedRefreshToken, user]);

  return initialized;
};


