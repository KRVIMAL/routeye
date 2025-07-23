import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { clearAuthData } from '../store/slices/auth-slices.store';

export const useTokenExpiry = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, expiresAt } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) return;

    const checkExpiry = () => {
      if (Date.now() >= expiresAt) {
        console.log('Token expired, logging out...');
        dispatch(clearAuthData());
        window.location.href = '/login';
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiry, 60000);

    // Set up timeout for exact expiry time
    const timeUntilExpiry = expiresAt - Date.now();
    let timeout: NodeJS.Timeout;

    if (timeUntilExpiry > 0) {
      timeout = setTimeout(() => {
        console.log('Token expired (timeout), logging out...');
        dispatch(clearAuthData());
        window.location.href = '/login';
      }, timeUntilExpiry);
    }

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isAuthenticated, expiresAt, dispatch]);
};