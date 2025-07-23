import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/auth-slices.store';
import { tokenExpiryMiddleware } from '../middleware/tokenExpiryMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(tokenExpiryMiddleware),
}) as any;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;