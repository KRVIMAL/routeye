import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomInput from "../../../components/ui/CustomInput";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { changePasswordServices } from "./services/changePasswordServices";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { store } from "../../../store";
import { logOutAction } from "../../../store/slices/authSlice";
import PasswordChangeSuccessModal from "../../../components/PasswordChangeSuccessModal";
import { CloudCog } from "lucide-react";
// import { logOutAction } from "../../../store/auth/authSlice";
// import PasswordChangeSuccessModal from "./components/PasswordChangeSuccessModal";

// Form state type
interface PasswordFormState {
  oldPassword: {
    value: string;
    error: string;
  };
  newPassword: {
    value: string;
    error: string;
  };
  confirmPassword: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (): PasswordFormState => ({
  oldPassword: {
    value: "",
    error: "",
  },
  newPassword: {
    value: "",
    error: "",
  },
  confirmPassword: {
    value: "",
    error: "",
  },
});

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.CHANGE_PASSWORD || "Change Password");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PasswordFormState>(
    initialFormState()
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Get user data from store
  const routeyeState :any= localStorage.getItem("routeye-state");
    const parsedState = JSON.parse(routeyeState);
  const user = parsedState?.auth?.user;
  const userName =  user?.fullName || "User";
  const userEmail =  user?.email || "";
  const userRole =  user?.role?.name || "";

     
    
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: "Account Management", href: "#", icon: FiUser },
    {
      label: strings.CHANGE_PASSWORD || "Change Password",
      isActive: true,
      icon: FiKey,
    },
  ];

  const handleInputChange =
    (field: keyof PasswordFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: e.target.value,
          error: "",
        },
      }));
    };

  const handleBlur = (field: keyof PasswordFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "oldPassword":
        if (!value.trim()) {
          error = "Current password is required";
        }
        break;
      case "newPassword":
        if (!value.trim()) {
          error = "New password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (value === formData.oldPassword.value) {
          error = "New password must be different from current password";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          error = "Please confirm your new password";
        } else if (value !== formData.newPassword.value) {
          error = "Passwords do not match";
        }
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], error },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<PasswordFormState> = {};
    let isValid = true;

    // Old password validation
    if (!formData.oldPassword.value.trim()) {
      errors.oldPassword = {
        ...formData.oldPassword,
        error: "Current password is required",
      };
      isValid = false;
    }

    // New password validation
    if (!formData.newPassword.value.trim()) {
      errors.newPassword = {
        ...formData.newPassword,
        error: "New password is required",
      };
      isValid = false;
    } else if (formData.newPassword.value.length < 6) {
      errors.newPassword = {
        ...formData.newPassword,
        error: "Password must be at least 6 characters",
      };
      isValid = false;
    } else if (formData.newPassword.value === formData.oldPassword.value) {
      errors.newPassword = {
        ...formData.newPassword,
        error: "New password must be different from current password",
      };
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword.value.trim()) {
      errors.confirmPassword = {
        ...formData.confirmPassword,
        error: "Please confirm your new password",
      };
      isValid = false;
    } else if (formData.confirmPassword.value !== formData.newPassword.value) {
      errors.confirmPassword = {
        ...formData.confirmPassword,
        error: "Passwords do not match",
      };
      isValid = false;
    }

    if (!isValid) {
      setFormData((prev) => ({
        ...prev,
        ...errors,
      }));
    }

    return isValid;
  };

  const handleChangePassword = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await changePasswordServices.changePassword({
        currentPassword: formData.oldPassword.value,
        newPassword: formData.newPassword.value,
      });

      toast.success(result.message);

      // Clear form
      setFormData(initialFormState());

      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleSuccessModalAction = useCallback(() => {
    // Close modal first
    setShowSuccessModal(false);

    // Small delay to ensure state is updated
    setTimeout(() => {
      // Logout user and redirect to login
      store.dispatch(logOutAction());
      navigate("/login");
    }, 100);
  }, [navigate]);

  const togglePasswordVisibility = useCallback(
    (field: "old" | "new" | "confirm") => {
      setShowPasswords((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    []
  );

  return (
    <div className="min-h-screen bg-theme-secondary rounded-t-[24px] overflow-hidden flex flex-col">
      <ModuleHeader
        title={strings.CHANGE_PASSWORD || "Change Password"}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
        titleClassName="module-title-custom"
      />

      {/* Main content area */}
      <div className="flex-1 p-6">
        <div className="max-w-10xl">
          {/* Single Card Layout */}
          <div className="bg-[#FFFFFF] rounded-[24px] p-8 border border-[#D6D6D6]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - User Profile + Password Form */}
              <div className="flex flex-col">
                {/* User Avatar and Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 bg-[#4285F4] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {getUserInitials(userName)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {userName}
                      </h2>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                        {userRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FiUser size={16} />
                      <span className="text-sm">{userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-8">
                  <Button
                    variant="custom"
                    customColors={{
                      background: "#4285F4",
                      text: "#FFFFFF",
                      hover: { background: "#3367D6" },
                    }}
                    size="md"
                    className="btn-custom-hover"
                  >
                    Change Avatar
                  </Button>
                  <Button
                    variant="custom"
                    customColors={{
                      background: "transparent",
                      text: "#374151",
                      border: "#374151",
                      hover: { background: "#F1F1F1" },
                    }}
                    size="md"
                    className="btn-custom-hover border"
                  >
                    Remove Avatar
                  </Button>
                </div>

                {/* Password Fields */}
                <div className="w-full space-y-6">
                  <div>
                    <CustomInput
                      label="Enter your old password"
                      type={showPasswords.old ? "text" : "password"}
                      value={formData.oldPassword.value}
                      onChange={handleInputChange("oldPassword")}
                      onBlur={handleBlur("oldPassword")}
                      required
                      placeholder="New Password"
                      disabled={loading}
                      autoValidate={false}
                      error={formData.oldPassword.error}
                      //   rightIcon={
                      //     <button
                      //       type="button"
                      //       onClick={() => togglePasswordVisibility("old")}
                      //       className="text-gray-400 hover:text-gray-600"
                      //     >
                      //       {showPasswords.old ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      //     </button>
                      //   }
                    />
                  </div>

                  <div>
                    <CustomInput
                      label="Enter your new password"
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword.value}
                      onChange={handleInputChange("newPassword")}
                      onBlur={handleBlur("newPassword")}
                      required
                      placeholder="Confirm New Password"
                      disabled={loading}
                      autoValidate={false}
                      error={formData.newPassword.error}
                      //   rightIcon={
                      //     <button
                      //       type="button"
                      //       onClick={() => togglePasswordVisibility("new")}
                      //       className="text-gray-400 hover:text-gray-600"
                      //     >
                      //       {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      //     </button>
                      //   }
                    />
                  </div>

                  <div>
                    <CustomInput
                      label="Confirm your new password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword.value}
                      onChange={handleInputChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      required
                      placeholder="Confirm New Password"
                      disabled={loading}
                      autoValidate={false}
                      error={formData.confirmPassword.error}
                      //   rightIcon={
                      //     <button
                      //       type="button"
                      //       onClick={() => togglePasswordVisibility("confirm")}
                      //       className="text-gray-400 hover:text-gray-600"
                      //     >
                      //       {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      //     </button>
                      //   }
                    />
                  </div>

                  {/* Change Password Button */}
                  <div className="mt-8">
                    <Button
                      variant="custom"
                      customColors={{
                        background: "#0052CC",
                        text: "#FFFFFF",
                        hover: { background: "#0047B3" },
                      }}
                      onClick={handleChangePassword}
                      loading={loading}
                      disabled={loading}
                      className="w-full btn-custom-hover"
                      size="lg"
                    >
                      <FiKey className="mr-2" />
                      {loading ? "Changing Password..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - Coming Soon Message */}
              <div className="flex flex-col justify-center items-center bg-[#EDF0F6] rounded-[24px] p-4">
                <div className="text-center text-gray-500">
                  <p className="text-sm">
                    Profile management section coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      <PasswordChangeSuccessModal
        isOpen={showSuccessModal}
        onLoginRedirect={handleSuccessModalAction}
        userName={userName}
        userEmail={userEmail}
      />
    </div>
  );
};

export default ChangePassword;
