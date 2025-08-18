import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiLogIn, FiClock } from "react-icons/fi";
import Button from "./ui/Button";
// import Button from "../../../../components/ui/Button";

interface PasswordChangeSuccessModalProps {
  isOpen: boolean;
  onLoginRedirect: () => void;
  userName: string;
  userEmail: string;
}

const PasswordChangeSuccessModal: React.FC<PasswordChangeSuccessModalProps> = ({
  isOpen,
  onLoginRedirect,
  userName,
  userEmail,
}) => {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(20); // Reset countdown when modal closes
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto logout after 20 seconds
          onLoginRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, onLoginRedirect]);

  const handleLoginRedirect = () => {
    onLoginRedirect();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent modal from closing when clicking on the modal content
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent modal from closing when clicking on backdrop (as per requirement)
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick} // Prevent closing on backdrop click
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative"
        onClick={handleModalClick} // Prevent event bubbling
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{
              fontFamily: "Work Sans",
              fontWeight: 700,
              lineHeight: "100%",
              letterSpacing: "1%",
            }}
          >
            Password Changed Successfully
          </h2>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              You have been logged out from the current session.
            </p>
            <p className="text-gray-600">
              Please log in again with your new password.
            </p>
          </div>

          {/* User Info */}
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Logging out:</div>
            <div className="font-semibold text-gray-900">{userName}</div>
            <div className="text-sm text-gray-600">{userEmail}</div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-2 mb-6 text-orange-600">
            <FiClock className="w-5 h-5" />
            <span className="text-sm font-medium">
              Auto logout in {countdown} seconds
            </span>
          </div>

          {/* Login Button */}
          <Button
            variant="custom"
            customColors={{
              background: "#0052CC",
              text: "#FFFFFF",
              hover: { background: "#0047B3" },
            }}
            onClick={handleLoginRedirect}
            className="w-full btn-custom-hover"
            size="lg"
          >
            <FiLogIn className="mr-2" />
            Log In Now
          </Button>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Security Notice:</strong> For your security, you have been automatically 
              logged out after changing your password. This helps protect your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeSuccessModal;