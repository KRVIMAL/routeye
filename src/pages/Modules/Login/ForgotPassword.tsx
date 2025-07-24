import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import { authServices } from "./services/authServices";

import { flagLoading } from "../../../store/slices/customLoaderSlice";

import strings from "../../../global/constants/StringConstants";
import { IoArrowBack } from "react-icons/io5";
import { CustomInput } from "../../../components/ui/Input";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError(strings.REQUIRED_FIELD);
      return false;
    }

    // Basic email or username validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(username.trim());
    const isValidUsername = username.trim().length >= 3;

    if (!isEmail && !isValidUsername) {
      setError(
        "Please enter a valid email address or username (minimum 3 characters)"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    dispatch(flagLoading(true));

    try {
      const response = await authServices.forgotPassword({
        username: username.trim(),
      });

      if (response.success) {
        toast.success(response.message || "OTP sent successfully");

        // Navigate to OTP screen with forgot password data
        navigate("/auth/enter-otp", {
          state: {
            username: response.data.username,
            maskedPhone: response.data.maskedPhone,
            otpExpiresIn: response.data.otpExpiresIn,
            isForgotPassword: true,
          },
        });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset password OTP");
      setError(
        error.message ||
          "Failed to send OTP. Please check your username or email."
      );
    } finally {
      setIsLoading(false);
      dispatch(flagLoading(false));
    }
  };

  const handleBack = () => {
    navigate("/auth/login");
  };

  const handleForgotUsername = () => {
    navigate("/auth/contact-support");
  };

  const handleReturnToLogin = () => {
    navigate("/auth/login");
  };

  const handleInputChange = (value: string) => {
    setUsername(value);
    if (error) {
      setError("");
    }
  };

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
              {strings.FORGOT_PASSWORD_TITLE}
            </h2>
          </div>
          <LanguageSelector />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username/Email Field */}
          <div>
            <CustomInput
              label={strings.ENTER_USERNAME}
              required
              asteriskPosition="right"
              placeholder="Username or email"
              value={username}
              onValueChange={handleInputChange}
              error={error}
              disabled={isLoading}
              size="lg"
              fullWidth
              autoComplete="username"
              autoFocus
              validation={{
                required: true,
                custom: (value: string) => {
                  const trimmedValue = value.trim();
                  if (!trimmedValue) return "This field is required";

                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const isEmail = emailRegex.test(trimmedValue);
                  const isValidUsername = trimmedValue.length >= 3;

                  if (!isEmail && !isValidUsername) {
                    return "Please enter a valid email address or username (minimum 3 characters)";
                  }

                  return null;
                },
              }}
              helperText="Enter your registered username or email address"
            />
          </div>

          {/* Forgot Username Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotUsername}
              className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              {strings.FORGOT_USERNAME}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="flex items-center justify-center w-[53px] h-[53px] rounded-xl border-[1.5px] border-[#0052CC] text-[#0052CC] bg-[#F0F4FF] hover:bg-[#E6EFFF] transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>

            {/* Continue Button */}
            <Button
              type="submit"
              variant="custom"
              customColors={{
                background: !username.trim() ? "#F6F6F6" : "#2463EB",
                text: !username.trim() ? "#000000" : "#FFFFFF",
                hover: { background: !username.trim() ? "#F6F6F6" : "#1D40B0" },
              }}
              loading={isLoading}
              disabled={isLoading || !username.trim()}
              size="custom"
              fullWidth
              style={{
                width: "372px",
                fontFamily: "Work Sans",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "4%",
                textTransform: "uppercase",
              }}
              className="btn-custom-hover font-bold text-base tracking-[0.04em] uppercase leading-none flex-1 h-[53px] rounded-xl px-6 py-3"
            >
              {isLoading ? strings.SENDING_OTP : strings.CONTINUE}
            </Button>
          </div>
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
