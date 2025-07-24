import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import strings from "../../../global/constants/StringConstants";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

export const PasswordChangedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToLogin = () => {
    navigate("/auth/login");
  };

  return (
    <AuthLayout showDownloadSection={true}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-gray-600 mb-2">
              <span className="text-primary-500 font-semibold">
                {strings.ROUTEYE}
              </span>
            </h1>
          </div>
          <LanguageSelector />
        </div>

        {/* Success Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-500"
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
          </div>

          {/* Password Icons */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-primary-500 text-3xl">•••</div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
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
            </div>
          </div>
          <div className="w-full h-1 bg-primary-500 rounded mb-8"></div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {strings.PASSWORD_CHANGED_SUCCESS}
        </h2>

        {/* Return to Login Button */}
        <Button
          type="button"
          onClick={handleReturnToLogin}
          variant="custom"
          customColors={{
            background: "#2463EB",
            text: "#FFFFFF",
            hover: { background: "#1D40B0" },
          }}
          size="lg"
          fullWidth
          className="btn-custom-hover font-semibold"
        >
          {strings.RETURN_TO_LOGIN}
        </Button>
      </div>
    </AuthLayout>
  );
};
