import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Group interface
interface Group {
  _id: string;
  groupId: string;
  groupName: string;
  groupType: string;
  imei: string[];
  stateName: string;
  cityName: string;
  remark: string;
  contactNo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Module Permission interface
interface ModulePermission {
  module: string;
  permissions: string[];
  _id: string;
}

// Role interface
interface Role {
  _id: string;
  name: string;
  modulePermissions: ModulePermission[];
}

// User interface based on API response
interface User {
  id: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  email: string;
  contactNo: string;
  status: string;
  group?: Group;
  role: Role;
}

// Login response interface
interface LoginResponse {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  accountId:string;
}

export interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  expiresAt: number | null; // Timestamp when token expires
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  tokenType: null,
  expiresIn: null,
  expiresAt: null,
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<LoginResponse>) => {
      const { user, accessToken, tokenType, expiresIn} = action.payload;
      state.accessToken = accessToken;
      state.tokenType = tokenType;
      state.expiresIn = expiresIn;
      state.expiresAt = Date.now() + (expiresIn * 1000); // Convert seconds to milliseconds
      state.user=user;
      state.isAuthenticated = true;
      
      // Store in localStorage for persistence
      localStorage.setItem('auth', JSON.stringify({
        accessToken,
        tokenType,
        expiresIn,
        expiresAt: state.expiresAt,
        user,
        isAuthenticated: true,
      }));
    },
    
    clearAuthData: (state) => {
      state.accessToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.expiresAt = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Clear from localStorage
      localStorage.removeItem('auth');
    },
    
    loadAuthFromStorage: (state) => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          
          // Check if token is still valid
          if (authData.expiresAt && Date.now() < authData.expiresAt) {
            state.accessToken = authData.accessToken;
            state.tokenType = authData.tokenType;
            state.expiresIn = authData.expiresIn;
            state.expiresAt = authData.expiresAt;
            state.user = authData.user;
            state.isAuthenticated = true;
          } else {
            // Token expired, clear storage
            localStorage.removeItem('auth');
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('auth');
        }
      }
    },
    
    checkTokenExpiry: (state) => {
      if (state.expiresAt && Date.now() >= state.expiresAt) {
        // Token expired, clear auth data
        state.accessToken = null;
        state.tokenType = null;
        state.expiresIn = null;
        state.expiresAt = null;
        state.user = null;
        state.isAuthenticated = false;
        
        localStorage.removeItem('auth');
      }
    },
  },
});

export const { setAuthData, clearAuthData, loadAuthFromStorage, checkTokenExpiry } = authSlice.actions;
export default authSlice.reducer;