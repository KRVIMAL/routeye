import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setAuthData,
  clearAuthData,
  loadAuthFromStorage,
  checkTokenExpiry,
} from "../store/slices/auth-slices.store";
import { postRequest } from "../core-services/rest-api/apiHelpers";
import toast from "react-hot-toast";
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken, expiresAt } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load auth data from localStorage on app start
  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, [dispatch]);

  // Set up token expiry check interval
  useEffect(() => {
    if (isAuthenticated && expiresAt) {
      // Check token expiry immediately
      dispatch(checkTokenExpiry());

      // Set up interval to check token expiry every minute
      const interval = setInterval(() => {
        dispatch(checkTokenExpiry());
      }, 60000); // Check every minute

      // Set up timeout to automatically logout when token expires
      const timeUntilExpiry = expiresAt - Date.now();
      let logoutTimeout: NodeJS.Timeout;

      if (timeUntilExpiry > 0) {
        logoutTimeout = setTimeout(() => {
          console.log("Token expired, logging out...");
          logout();
        }, timeUntilExpiry);
      }

      return () => {
        clearInterval(interval);
        if (logoutTimeout) {
          clearTimeout(logoutTimeout);
        }
      };
    }
  }, [isAuthenticated, expiresAt, dispatch]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await postRequest("/users/login", {
        username,
        password,
      });

      if (response.success && response.data) {
        dispatch(setAuthData(response.data));
        toast.success(response.message || "Login successful!");
        return true;
      } else {
        // Handle unsuccessful response from backend
        const errorMessage =
          response.message || response.errors || "Login failed";
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Extract error message from different possible sources
      let errorMessage = "Login failed. Please try again.";

      if (error.message) {
        // This will contain the message from the API helper which extracts response.data.message
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    dispatch(clearAuthData());
    // Redirect to login page
    window.location.href = "/login";
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
