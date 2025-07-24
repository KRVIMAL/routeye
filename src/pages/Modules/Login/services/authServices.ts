import urls from "../../../../constants/UrlConstants";
import { postRequest } from "../../../../core-services/rest-api/apiHelpers";

// Types for API requests and responses
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        requiresOTP: boolean;
        message: string;
        username: string;
        maskedPhone: string;
        otpExpiresIn: number;
    } | {
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
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    // Verify OTP API
    verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
        try {
            const response = await postRequest(urls.verifyOtpPath, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'OTP verification failed');
        }
    },

    // Resend OTP API
    resendOtp: async (data: ResendOtpRequest): Promise<any> => {
        try {
            const response = await postRequest(urls.resendOtpPath, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to resend OTP');
        }
    },

    // Forgot Password API
    forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
        try {
            const response = await postRequest(urls.forgotPasswordPath, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to send reset password OTP');
        }
    },

    // Reset Password API
    resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
        try {
            const response = await postRequest(urls.resetPasswordPath, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to reset password');
        }
    },
};