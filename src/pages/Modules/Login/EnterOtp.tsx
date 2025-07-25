import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import { authServices } from "./services/authServices";

import { flagLoading } from "../../../store/slices/customLoaderSlice";

import strings from "../../../global/constants/StringConstants";
import urls from "../../../constants/UrlConstants";
import { useCountdown } from "../../../hooks/useCountdown";
import { loginAction } from "../../../store/slices/authSlice";
import { OtpInput } from "../../../components/ui/OtpInput";
import { IoChevronForward, IoArrowBack } from "react-icons/io5";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

interface LocationState {
  username: string;
  maskedPhone: string;
  otpExpiresIn: number;
  isLogin?: boolean;
  isForgotPassword?: boolean;
}

export const EnterOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const state = location.state as LocationState;

  // Redirect if no state
  useEffect(() => {
    if (!state || !state.username) {
      navigate("/auth/login");
    }
  }, [state, navigate]);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const {
    timeLeft,
    formattedTime,
    isComplete: isTimerComplete,
    restart: restartTimer,
  } = useCountdown(state?.otpExpiresIn || 300); // Default 5 minutes

  useEffect(() => {
    if (state?.otpExpiresIn) {
      restartTimer(state.otpExpiresIn);
    }
  }, [state?.otpExpiresIn, restartTimer]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (otpError) {
      setOtpError("");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError(strings.INVALID_OTP);
      return;
    }

    setIsLoading(true);
    dispatch(flagLoading(true));

    try {
      if (state.isForgotPassword) {
        // For forgot password, just navigate to reset password with OTP
        navigate("/auth/reset-password", {
          state: {
            username: state.username,
            otp: otp,
          },
        });
        toast.success("OTP verified successfully");
      } else {
        // For login OTP verification
        const response = await authServices.verifyOtp({
          username: state.username,
          otp: otp,
        });

        if (response.success && "user" in response.data) {
          // Store user data in Redux
          dispatch(
            loginAction({
              authenticated: true,
              accessToken: response.data.accessToken,
              tokenType: response.data.tokenType,
              userName: response.data.user.fullName,
              userRole: response.data.user.role.name,
              userType: response.data.user.role.name,
              userEmail: response.data.user.email,
              userAccount: response.data.user.account.accountName,
              userId: response.data.user.id,
              expiresIn: response.data.expiresIn,
            })
          );

          toast.success(response.message || "OTP verified successfully");
          navigate(urls.dashboardViewPath);
        }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "OTP verification failed");
      setOtpError(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
      dispatch(flagLoading(false));
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    dispatch(flagLoading(true));

    try {
      const response = await authServices.resendOtp({
        username: state.username,
      });

      if (response.success) {
        toast.success(response.message || "OTP sent successfully");
        setOtp(""); // Clear current OTP
        setOtpError("");
        restartTimer(300); // Restart 5-minute timer
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
      dispatch(flagLoading(false));
    }
  };

  const handleBack = () => {
    if (state.isForgotPassword) {
      navigate("/auth/forgot-password");
    } else {
      navigate("/auth/login");
    }
  };

  const handleContactSupport = () => {
    navigate("/auth/contact-support");
  };

  const handleGetDemo = () => {
    navigate("/auth/contact-support");
  };

  if (!state) {
    return null;
  }

  return (
    <AuthLayout showDownloadSection={true} particlesVariant="trail">
      <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
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
              {strings.ENTER_OTP}
            </h2>
          </div>
          <LanguageSelector />
        </div>

        {/* OTP Message */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">
            {state.isForgotPassword
              ? strings.OTP_SENT_EMAIL_MESSAGE
              : strings.OTP_SENT_MESSAGE}
          </p>
          <p className="text-gray-800 font-medium">{state.maskedPhone}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <OtpInput
            length={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={isLoading}
            error={!!otpError}
            autoFocus
          />
          {otpError && (
            <p className="text-red-500 text-sm text-center mt-2">{otpError}</p>
          )}
        </div>

        {/* Timer and Resend */}
        <div className="flex items-center justify-between mb-6">
          {!isTimerComplete ? (
            <p className="text-gray-600 text-sm">
              {strings.RESEND_OTP_IN}{" "}
              <span className="font-medium">{formattedTime}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {isResending ? strings.RESENDING_OTP : strings.RESEND_OTP}
            </button>
          )}

          <button
            type="button"
            onClick={handleContactSupport}
            className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors bg-primary-50 px-3 py-1 rounded"
          >
            {strings.HAVING_TROUBLE_OTP}
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
            type="button"
            onClick={handleVerifyOtp}
            variant="custom"
            customColors={{
              background: otp.length === 6 ? "#2463EB" : "#F6F6F6",
              text: otp.length === 6 ? "#FFFFFF" : "#000000",
              hover: { background: otp.length === 6 ? "#1D40B0" : "#F6F6F6" },
            }}
            loading={isLoading}
            disabled={isLoading || otp.length !== 6}
            size="custom"
            className="btn-custom-hover font-bold text-base tracking-[0.04em] uppercase leading-none flex-1 h-[53px] rounded-xl px-6 py-3"
            style={{
              width: "372px",
              fontFamily: "Work Sans",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "4%",
              textTransform: "uppercase",
            }}
          >
            {isLoading ? strings.VERIFYING_OTP : strings.CONTINUE}
          </Button>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-4">{strings.TERMS_MESSAGE}</p>
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
