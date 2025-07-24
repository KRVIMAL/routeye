import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../../components/layouts/AuthLayout";
import Button from "../../../components/ui/Button";
import strings from "../../../global/constants/StringConstants";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

export const ContactSupportPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToLogin = () => {
    navigate("/auth/login");
  };

  const handleEmailSupport = () => {
    window.location.href = `mailto:${strings.SUPPORT_EMAIL}`;
  };

  const handleCallSupport = () => {
    window.location.href = `tel:${strings.SUPPORT_PHONE}`;
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
              {strings.CONTACT_IMZ_SUPPORT}
            </h2>
          </div>
          <LanguageSelector />
        </div>

        {/* Contact Information */}
        <div className="space-y-6 mb-8">
          {/* Email */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                {strings.SUPPORT_EMAIL}
              </p>
              <button
                onClick={handleEmailSupport}
                className="text-primary-500 hover:text-primary-600 transition-colors text-sm"
              >
                Send Email
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                {strings.SUPPORT_PHONE}
              </p>
              <button
                onClick={handleCallSupport}
                className="text-primary-500 hover:text-primary-600 transition-colors text-sm"
              >
                Call Support
              </button>
            </div>
          </div>
        </div>

        {/* Support Message */}
        <div className="mb-8">
          <p className="text-gray-600 leading-relaxed">
            {strings.SUPPORT_MESSAGE}
          </p>
        </div>

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
