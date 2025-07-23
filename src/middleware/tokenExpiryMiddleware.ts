
import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { clearAuthData } from '../store/slices/auth-slices.store';

export const tokenExpiryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check token expiry after every action
  const state = store.getState();
  const { isAuthenticated, expiresAt } = state.auth;
  
  if (isAuthenticated && expiresAt && Date.now() >= expiresAt) {
    console.log('Token expired, logging out user...');
    store.dispatch(clearAuthData());
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  return result;
};