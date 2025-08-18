// changePasswordServices.ts - API service for password change
import {
  patchRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import { store } from "../../../../store";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

// Helper function to get logged-in user ID
const getLoggedInUserId = (): string => {
  // Try to get from Redux store first
  let userId = store.getState()?.auth?.userId || store.getState()?.auth?.user?.id;
  
  if (!userId) {
    // Fallback to localStorage
    try {
      const routeyeState = localStorage.getItem("routeye-state");
      if (routeyeState) {
        const parsedState = JSON.parse(routeyeState);
        userId = parsedState?.auth?.userId || parsedState?.auth?.user?.id;
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
    }
  }

  if (!userId) {
    throw new Error("User ID not found. Please log in again.");
  }
  
  return userId;
};

export const changePasswordServices = {
  // Change user password
  changePassword: async (
    passwordData: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    try {
      const userId = getLoggedInUserId();
      
      // Prepare payload - API expects only the new password
      const payload = {
        password: passwordData.newPassword,
      };

      console.log("Changing password for user:", userId);

      const response: ApiResponse<null> = await patchRequest(
        `/users/${userId}/password`,
        payload
      );

      if (response.success) {
        return {
          message: response.message || "Password updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      
      // Handle specific error messages
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        throw new Error("Current password is incorrect");
      } else if (error.message.includes("400") || error.message.includes("Bad Request")) {
        throw new Error("Invalid password format. Please check password requirements.");
      } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
        throw new Error("You don't have permission to change this password");
      } else {
        throw new Error(error.message || "Failed to change password. Please try again.");
      }
    }
  },

  // Validate password strength (optional helper)
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    
    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }
    
    // Optional: Add more complex validation rules
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // You can uncomment these for stricter validation
    // if (!hasUpperCase) {
    //   errors.push("Password must contain at least one uppercase letter");
    // }
    // if (!hasLowerCase) {
    //   errors.push("Password must contain at least one lowercase letter");
    // }
    // if (!hasNumbers) {
    //   errors.push("Password must contain at least one number");
    // }
    // if (!hasSpecialChar) {
    //   errors.push("Password must contain at least one special character");
    // }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Check if new password is different from current (client-side helper)
  isDifferentPassword: (currentPassword: string, newPassword: string): boolean => {
    return currentPassword !== newPassword;
  },

  // Get current user info for display
  getCurrentUserInfo: () => {
    try {
      // Try Redux store first
      const authState = store.getState()?.auth;
      if (authState?.user) {
        return {
          id: authState.userId || authState.user.id,
          name: authState.userName || authState.user.fullName,
          email: authState.userEmail || authState.user.email,
          role: authState.userRole || authState.user.role?.name,
        };
      }

      // Fallback to localStorage
      const routeyeState = localStorage.getItem("routeye-state");
      if (routeyeState) {
        const parsedState = JSON.parse(routeyeState);
        const auth = parsedState?.auth;
        
        return {
          id: auth?.userId || auth?.user?.id,
          name: auth?.userName || auth?.user?.fullName,
          email: auth?.userEmail || auth?.user?.email,
          role: auth?.userRole || auth?.user?.role?.name,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting current user info:", error);
      return null;
    }
  },
};