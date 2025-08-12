import urls from "../../../../constants/UrlConstants";
import { postRequest } from "../../../../core-services/rest-api/apiHelpers";

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
}

// UPDATE: Make the response type more flexible for both OTP and direct login
export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data:
    | {
        requiresOTP: boolean;
        message: string;
        username: string;
        maskedPhone: string;
        otpExpiresIn: number;
      }
    | {
        requiresOTP?: false; // ADD: Make this optional for direct login
        user: {
          id: string;
          username: string;
          firstName: string;
          middleName: string;
          lastName: string;
          fullName: string;
          email: string;
          contactNo: string;
          twoFA: boolean;
          status: string;
          account: {
            _id: string;
            accountName: string;
            // ADD: Include other account fields that might be in response
            parentAccount?: any;
            clientId?: string;
            level?: number;
            hierarchyPath?: string;
            children?: string[];
            createdAt?: string;
            updatedAt?: string;
            __v?: number;
            client?: any;
          };
          role: {
            _id: string;
            name: string;
            modulePermissions: Array<{
              module: string;
              permissions: string[];
              _id: string;
            }>;
          };
        };
        accessToken: string;
        tokenType: string;
        expiresIn: number;
      };
}

export interface VerifyOtpRequest {
  username: string;
  otp: string;
}

// UPDATE: VerifyOtpResponse should be same as LoginResponse since they return same structure
export type VerifyOtpResponse = LoginResponse;

export interface ResendOtpRequest {
  username: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ResetPasswordRequest {
  username: string;
  otp: string;
  newPassword: string;
}

export const authServices = {
  // Login API
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await postRequest(urls.loginPath, data);

      // ADD: Basic response validation
      if (!response || typeof response.success !== "boolean") {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("Login API error:", error); // ADD: Better error logging
      throw new Error(error.message || "Login failed");
    }
  },

  // UPDATE: Use the correct response type
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
      const response = await postRequest(urls.verifyOtpPath, data);

      // ADD: Basic response validation
      if (!response || typeof response.success !== "boolean") {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("Verify OTP API error:", error); // ADD: Better error logging
      throw new Error(error.message || "OTP verification failed");
    }
  },

  // Resend OTP API
  resendOtp: async (data: ResendOtpRequest): Promise<any> => {
    try {
      const response = await postRequest(urls.resendOtpPath, data);

      // ADD: Basic response validation
      if (!response || typeof response.success !== "boolean") {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("Resend OTP API error:", error); // ADD: Better error logging
      throw new Error(error.message || "Failed to resend OTP");
    }
  },

  // Forgot Password API
  forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
    try {
      const response = await postRequest(urls.forgotPasswordPath, data);

      // ADD: Basic response validation
      if (!response || typeof response.success !== "boolean") {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("Forgot Password API error:", error); // ADD: Better error logging
      throw new Error(error.message || "Failed to send reset password OTP");
    }
  },

  // Reset Password API
  resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
    try {
      const response = await postRequest(urls.resetPasswordPath, data);

      // ADD: Basic response validation
      if (!response || typeof response.success !== "boolean") {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("Reset Password API error:", error); // ADD: Better error logging
      throw new Error(error.message || "Failed to reset password");
    }
  },
};
