import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { getUserProfile, clearUser, setAuthFromPersist } from '../store/slices/authSlice';

// export const useAuthInit = () => {
//   const dispatch = useAppDispatch();
//   const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
//   const hasInitialized = useRef(false);

//   useEffect(() => {
//     if (hasInitialized.current || isLoading) return;

//     const hasTokens = document.cookie.includes('accessToken') || document.cookie.includes('refreshToken');

//     // Check persisted state
//     const persistedData = localStorage.getItem('persist:auth');
//     if (persistedData) {
//       try {
//         const parsed = JSON.parse(persistedData);
//         let persistedUser = null;
        
//         if (parsed.user && parsed.user !== 'null' && parsed.user !== '"null"') {
//           persistedUser = typeof parsed.user === 'string' ? JSON.parse(parsed.user) : parsed.user;
//         }
        
//         if (persistedUser && hasTokens) {
//           // Restore persisted auth state
//           dispatch(setAuthFromPersist({ user: persistedUser, isAuthenticated: true }));
//           hasInitialized.current = true;
//           return;
//         }
//       } catch (e) {
//         console.error('Error parsing persisted auth:', e);
//       }
//     }

//     // No valid persisted state - check tokens
//     hasInitialized.current = true;
//     if (hasTokens) {
//       dispatch(getUserProfile());
//     } else {
//       dispatch(clearUser());
//     }
//   }, [dispatch, isLoading]);

//   return hasInitialized.current;
// };


export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;

    const init = () => {
      // If we already have user state from persistence, we're ready
      if (user && isAuthenticated) {
        setIsReady(true);
        return;
      }

      // Check for tokens
      const hasTokens = document.cookie.includes('accessToken') || 
                       document.cookie.includes('refreshToken');

      if (hasTokens && !isLoading) {
        initRef.current = true;
        dispatch(getUserProfile()).finally(() => {
          setIsReady(true);
        });
      } else {
        dispatch(clearUser());
        setIsReady(true);
      }
    };

    // Wait a moment for persistence to complete
    const timer = setTimeout(init, 200);
    return () => clearTimeout(timer);
  }, [dispatch, user, isAuthenticated, isLoading]);

  return isReady;
};
