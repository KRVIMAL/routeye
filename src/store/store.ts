import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import customLoaderSlice from "./slices/customLoaderSlice";

const loadState = () => {
  try {
    const loadedState = localStorage.getItem("routeye-state");
    if (loadedState === null) return undefined;
    return JSON.parse(loadedState);
  } catch (error: any) {
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};

const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("routeye-state", serializedState);
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loader: customLoaderSlice,
  } as any,
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
