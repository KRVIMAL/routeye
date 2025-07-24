// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import { authServices } from "./services/authServices";

import { flagLoading } from "../../../store/slices/customLoaderSlice";

import strings from "../../../global/constants/StringConstants";
import { CustomInput } from "../../../components/ui/Input";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

interface LocationState {
  username: string;
  otp: string;
}

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const state = location.state as LocationState;

  // Redirect if no state
  useEffect(() => {
    if (!state || !state.username || !state.otp) {
      toast.error("Invalid reset session. Please try again.");
      navigate("/auth/forgot-password");
    }
  }, [state, navigate]);

  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  // Password strength validation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";

    if (password.length === 0) {
      return { score: 0, feedback: "" };
    }

    if (password.length < 8) {
      feedback = "Password must be at least 8 characters";
      return { score: 1, feedback };
    }

    // Check for different character types
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (hasLowercase) score++;
    if (hasUppercase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    if (password.length >= 12) score++;

    // Determine feedback based on score
    switch (score) {
      case 0:
      case 1:
        feedback = "Very weak password";
        break;
      case 2:
        feedback = "Weak password";
        break;
      case 3:
        feedback = "Good password";
        break;
      case 4:
        feedback = "Strong password";
        break;
      case 5:
        feedback = "Very strong password";
        break;
      default:
        feedback = "Password strength unknown";
    }

    return { score, feedback };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = strings.PASSWORD_REQUIRED;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (passwordStrength.score < 2) {
      newErrors.newPassword =
        "Password is too weak. Please include uppercase, lowercase, numbers, and special characters.";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = strings.PASSWORD_REQUIRED;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = strings.PASSWORDS_DONT_MATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Calculate password strength for new password
    if (field === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    dispatch(flagLoading(true));

    try {
      const response = await authServices.resetPassword({
        username: state.username,
        otp: state.otp,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        toast.success(response.message || "Password reset successful");

        // Navigate to success page
        navigate("/auth/password-changed");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password");

      // If OTP is invalid or expired, redirect back to forgot password
      if (
        error.message.toLowerCase().includes("otp") ||
        error.message.toLowerCase().includes("expired")
      ) {
        setTimeout(() => {
          navigate("/auth/forgot-password");
        }, 2000);
      }
    } finally {
      setIsLoading(false);
      dispatch(flagLoading(false));
    }
  };

  const handleReturnToLogin = () => {
    navigate("/auth/login");
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-green-600";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthWidth = () => {
    return `${(passwordStrength.score / 5) * 100}%`;
  };

  if (!state) {
    return null;
  }

  return (
    <AuthLayout showDownloadSection={true}>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-gray-600 mb-2">
              <span className="text-primary-500 font-semibold">
                {strings.ROUTEYE}
              </span>
            </h1>
            <h2 className="text-3xl font-bold text-primary-500">
              {strings.REGISTER_NEW_PASSWORD}
            </h2>
          </div>
          <LanguageSelector />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <CustomInput
              label={strings.ENTER_NEW_PASSWORD}
              required
              asteriskPosition="right"
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
              onValueChange={handleInputChange("newPassword")}
              error={errors.newPassword}
              disabled={isLoading}
              size="lg"
              fullWidth
              autoComplete="new-password"
              autoFocus
            />

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    Password Strength
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.score <= 1
                        ? "text-red-500"
                        : passwordStrength.score <= 2
                        ? "text-orange-500"
                        : passwordStrength.score <= 3
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {passwordStrength.feedback}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: getPasswordStrengthWidth() }}
                  />
                </div>

                {/* Password Requirements */}
                <div className="mt-2 text-xs text-gray-500">
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`flex items-center ${
                        formData.newPassword.length >= 8
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span className="mr-1">
                        {formData.newPassword.length >= 8 ? "✓" : "○"}
                      </span>
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center ${
                        /[A-Z]/.test(formData.newPassword)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span className="mr-1">
                        {/[A-Z]/.test(formData.newPassword) ? "✓" : "○"}
                      </span>
                      Uppercase letter
                    </div>
                    <div
                      className={`flex items-center ${
                        /[a-z]/.test(formData.newPassword)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span className="mr-1">
                        {/[a-z]/.test(formData.newPassword) ? "✓" : "○"}
                      </span>
                      Lowercase letter
                    </div>
                    <div
                      className={`flex items-center ${
                        /\d/.test(formData.newPassword)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span className="mr-1">
                        {/\d/.test(formData.newPassword) ? "✓" : "○"}
                      </span>
                      Number
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <CustomInput
              label={strings.CONFIRM_NEW_PASSWORD}
              required
              asteriskPosition="right"
              type="password"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onValueChange={handleInputChange("confirmPassword")}
              error={errors.confirmPassword}
              disabled={isLoading}
              size="lg"
              fullWidth
              autoComplete="new-password"
            />

            {/* Password Match Indicator */}
            {formData.confirmPassword && formData.newPassword && (
              <div className="mt-2">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center text-green-500 text-sm">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center text-red-500 text-sm">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change Password Button */}
          <Button
            type="submit"
            variant="custom"
            customColors={{
              background: "#2463EB",
              text: "#FFFFFF",
              hover: { background: "#1D40B0" },
            }}
            loading={isLoading}
            disabled={
              isLoading ||
              !formData.newPassword ||
              !formData.confirmPassword ||
              passwordStrength.score < 2
            }
            size="lg"
            fullWidth
            className="btn-custom-hover font-semibold"
          >
            {isLoading ? strings.CHANGING_PASSWORD : strings.CHANGE_PASSWORD}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {strings.RETURN_TO_LOGIN_LINK}{" "}
            <button
              type="button"
              onClick={handleReturnToLogin}
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {strings.SIGN_IN}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
