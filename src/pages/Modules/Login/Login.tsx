import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import { GoogleSignInButton } from "../../../components/ui/GoogleSignInButton";
import { authServices } from "./services/authServices";

import { flagLoading } from "../../../store/slices/customLoaderSlice";

import strings from "../../../global/constants/StringConstants";
import urls from "../../../constants/UrlConstants";
import { CustomInput } from "../../../components/ui/Input";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = strings.REQUIRED_FIELD;
    }

    if (!formData.password.trim()) {
      newErrors.password = strings.PASSWORD_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    dispatch(flagLoading(true));

    try {
      const response = await authServices.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response.success) {
        // Check if OTP is required
        if ("requiresOTP" in response.data && response.data.requiresOTP) {
          // Navigate to OTP screen with user data
          navigate("/auth/enter-otp", {
            state: {
              username: response.data.username,
              maskedPhone: response.data.maskedPhone,
              otpExpiresIn: response.data.otpExpiresIn,
              isLogin: true,
            },
          });
        } else {
          // Direct login success - should not happen with 2FA enabled users
          toast.success(response.message || "Login successful");
          navigate(urls.dashboardViewPath);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");

      // Show validation error for wrong credentials
      if (
        error.message.toLowerCase().includes("credential") ||
        error.message.toLowerCase().includes("password") ||
        error.message.toLowerCase().includes("username")
      ) {
        setErrors({
          password: strings.WRONG_CREDENTIALS,
        });
      }
    } finally {
      setIsLoading(false);
      dispatch(flagLoading(false));
    }
  };

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  const handleGetDemo = () => {
    navigate("/auth/contact-support");
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google Sign In
    toast.info("Google Sign In will be implemented later");
  };

  return (
    <AuthLayout showDownloadSection={true}>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-gray-600 mb-2">
              {strings.WELCOME_TO}{" "}
              <span className="text-primary-500 font-semibold">
                {strings.ROUTEYE}
              </span>
            </h1>
            <h2 className="text-3xl font-bold text-primary-500">
              {strings.SIGN_IN}
            </h2>
          </div>
          <LanguageSelector />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google Sign In */}
          {/* <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          /> */}

          {/* Username/Email Field */}
          <div>
            <CustomInput
              label={strings.ENTER_USERNAME_EMAIL}
              required
              asteriskPosition="right"
              placeholder="Username or email address"
              value={formData.username}
              onValueChange={handleInputChange("username")}
              error={errors.username}
              disabled={isLoading}
              size="lg"
              fullWidth
              autoComplete="username"
            />
            {errors.username &&
              !errors.username.includes(strings.REQUIRED_FIELD) && (
                <p className="text-sm text-orange-500 mt-1">
                  {strings.PLEASE_ENTER_USERNAME}
                </p>
              )}
          </div>

          {/* Password Field */}
          <div>
            <CustomInput
              label={strings.ENTER_PASSWORD}
              required
              asteriskPosition="right"
              type="password"
              placeholder="••••••••••••••"
              value={formData.password}
              onValueChange={handleInputChange("password")}
              error={errors.password}
              disabled={isLoading}
              size="lg"
              fullWidth
              autoComplete="current-password"
            />
            {!errors.password && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
                >
                  {strings.FORGOT_PASSWORD}
                </button>
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <CustomInput
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rememberMe: e.target.checked,
                }))
              }
              disabled={isLoading}
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
              {strings.REMEMBER_ME}
            </label>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="custom"
            customColors={{
              background: "#2463EB",
              text: "#FFFFFF",
              hover: { background: "#1D40B0" },
            }}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            fullWidth
            className="btn-custom-hover font-semibold"
          >
            {isLoading ? strings.SIGNING_IN : strings.SIGN_IN}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {strings.DIDNT_HAVE_ACCOUNT}{" "}
            <button
              type="button"
              onClick={handleGetDemo}
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {strings.GET_DEMO}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
