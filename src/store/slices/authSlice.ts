import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface AuthState {
  authenticated: boolean;
  accessToken: string;
  tokenType: string;
  loading: boolean;
  userName: string;
  userRole: string;
  userType: string;
  userEmail: string;
  userId: string;
  userAccount: string;
  hideAppDrawer: boolean;
  isAuthenticated: boolean;
  expiresAt: number | null;
  expiresIn: number | null;
  user: any;
}

const initialState: AuthState = {
  authenticated: false,
  isAuthenticated: false,
  accessToken: "",
  tokenType: "Bearer",
  loading: false,
  userName: "",
  userRole: "",
  userType: "",
  userEmail: "",
  userId: "",
  userAccount: "",
  hideAppDrawer: false,
  expiresAt: null,
  expiresIn: null,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (
      state,
      action: PayloadAction<{
        authenticated: boolean;
        accessToken: string;
        tokenType?: string;
        userName: string;
        userRole: string;
        userType: string;
        userEmail: string;
        userAccount: string;
        userId: string;
        expiresIn?: number;
        user?: any;
      }>
    ) => {
      state.authenticated = action.payload.authenticated;
      state.isAuthenticated = action.payload.authenticated;
      state.accessToken = action.payload.accessToken;
      state.tokenType = action.payload.tokenType || "Bearer";
      state.userName = action.payload.userName;
      state.userRole = action.payload.userRole;
      state.userType = action.payload.userType;
      state.userEmail = action.payload.userEmail;
      state.userAccount = action.payload.userAccount;
      state.userId = action.payload.userId;
      state.hideAppDrawer = false;
      state.user = action.payload.user || null;
      state.loading = false;

      if (action.payload.expiresIn) {
        state.expiresIn = action.payload.expiresIn;
        state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      }
    },
    addLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logOutAction: (state) => {
      state.authenticated = false;
      state.isAuthenticated = false;
      state.loading = false;
      state.accessToken = "";
      state.tokenType = "Bearer";
      state.userName = "";
      state.userEmail = "";
      state.hideAppDrawer = false;
      state.userType = "";
      state.userRole = "";
      state.userId = "";
      state.userAccount = "";
      state.expiresAt = null;
      state.expiresIn = null;
      state.user = null;
    },
    clearAuthData: (state) => {
      Object.assign(state, initialState);
    },
    checkTokenExpiry: (state) => {
      if (state.expiresAt && Date.now() > state.expiresAt) {
        Object.assign(state, initialState);
      }
    },
    addUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    addUserType: (state, action: PayloadAction<string>) => {
      state.userType = action.payload;
    },
    makeAppDrawerHide: (state, action: PayloadAction<boolean>) => {
      state.hideAppDrawer = action.payload;
    },
  },
});

export const {
  loginAction,
  logOutAction,
  addLoading,
  clearAuthData,
  checkTokenExpiry,
  addUserId,
  addUserType,
  makeAppDrawerHide,
} = authSlice.actions;

// Selectors
export const selectAuthenticated = (state: RootState) =>
  state.auth.authenticated;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectTokenType = (state: RootState) => state.auth.tokenType;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectEmail = (state: RootState) => state.auth.userEmail;
export const selectUserName = (state: RootState) => state.auth.userName;
export const selectRole = (state: RootState) => state.auth.userRole;
export const selectType = (state: RootState) => state.auth.userType;
export const selectId = (state: RootState) => state.auth.userId;
export const selectUserAccount = (state: RootState) => state.auth.userAccount;
export const selectHideAppDrawer = (state: RootState) =>
  state.auth.hideAppDrawer;
export const selectUser = (state: RootState) => state.auth.user;
export const selectExpiresIn = (state: RootState) => state.auth.expiresIn;
// New selectors for permissions (add these)
export const selectModulePermissions = (state: RootState) =>
  state.auth.user?.role?.modulePermissions || [];

export const selectUserPermissions = (state: RootState) => {
  const modulePermissions = state.auth.user?.role?.modulePermissions || [];
  return modulePermissions;
};

export const selectUserRole = (state: RootState) => state.auth.user?.role;

// Utility selector for checking permissions
export const selectHasPermission = (
  state: RootState,
  module: string,
  permission: string
) => {
  const modulePermissions = state.auth.user?.role?.modulePermissions || [];
  const modulePermission = modulePermissions.find(
    (p: any) => p.module === module
  );
  return modulePermission?.permissions.includes(permission) || false;
};
export default authSlice.reducer;
