import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  userServices,
  Role,
  Group,
  FlatAccount,
} from "../services/usersServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";
import ProgressBar from "../../../../components/ui/ProgressBar";
import Button from "../../../../components/ui/Button";

// Form state type
interface UserFormState {
  accountOrGroupType: {
    value: "account" | "group" | "";
    error: string;
  };
  accountId: {
    value: string;
    error: string;
  };
  groupId: {
    value: string;
    error: string;
  };
  username: {
    value: string;
    error: string;
  };
  firstName: {
    value: string;
    error: string;
  };
  middleName: {
    value: string;
    error: string;
  };
  lastName: {
    value: string;
    error: string;
  };
  email: {
    value: string;
    error: string;
  };
  contactNo: {
    value: string;
    error: string;
  };
  password: {
    value: string;
    error: string;
  };
  roleId: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): UserFormState => {
  // Determine if user has account or group
  let accountOrGroupType: "account" | "group" | "" = "";
  if (preState?.accountId) {
    accountOrGroupType = "account";
  } else if (preState?.groupId) {
    accountOrGroupType = "group";
  }

  return {
    accountOrGroupType: {
      value: accountOrGroupType,
      error: "",
    },
    accountId: {
      value: preState?.accountId || "",
      error: "",
    },
    groupId: {
      value: preState?.groupId || "",
      error: "",
    },
    username: {
      value: preState?.username || "",
      error: "",
    },
    firstName: {
      value: preState?.firstName || "",
      error: "",
    },
    middleName: {
      value: preState?.middleName || "",
      error: "",
    },
    lastName: {
      value: preState?.lastName || "",
      error: "",
    },
    email: {
      value: preState?.email || "",
      error: "",
    },
    contactNo: {
      value: preState?.contactNo || "",
      error: "",
    },
    password: {
      value: preState?.password || "",
      error: "",
    },
    roleId: {
      value: preState?.roleId || "",
      error: "",
    },
    status: {
      value: preState?.status || "active",
      error: "",
    },
  };
};

const AddEditUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_USER : strings.ADD_USER);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserFormState>(initialFormState());

  // Dropdown data
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [accounts, setAccounts] = useState<FlatAccount[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const accountOrGroupOptions = [
    { value: "account", label: "Account" },
    { value: "group", label: "Group" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.USERS, href: urls.usersViewPath, icon: FiUser },
    {
      label: isEdit ? strings.EDIT_USER : strings.ADD_USER,
      isActive: true,
      icon: FiPlus,
    },
  ];

  // Update this function to count only required fields
  const calculateProgress = () => {
    // Define which fields are required
    const requiredFields = [
      "accountOrGroupType",
      "username",
      "firstName",
      "lastName",
      "email",
      "contactNo",
      "roleId",
      "status",
    ] as (keyof UserFormState)[];

    // Add conditional required fields
    if (formData.accountOrGroupType.value === "account") {
      requiredFields.push("accountId");
    }
    if (formData.accountOrGroupType.value === "group") {
      requiredFields.push("groupId");
    }
    if (!isEdit) {
      requiredFields.push("password");
    }

    const filledRequiredFields = requiredFields.filter((fieldName) => {
      const field = formData[fieldName];
      const value = field.value;
      return (
        value !== null && value !== undefined && String(value).trim() !== ""
      );
    }).length;

    const totalRequiredFields = requiredFields.length;
    const progress =
      totalRequiredFields > 0
        ? Math.round((filledRequiredFields / totalRequiredFields) * 100)
        : 0;

    return progress;
  };

  const getProgressMessage = () => {
    const progress = calculateProgress();
    if (progress === 0) return "You are about to add a new user.";
    if (progress < 50)
      return "Please continue filling the required fields to proceed.";
    if (progress < 100)
      return "Almost done! Complete the remaining required fields.";
    return "All required fields completed! You can now save the user.";
  };

  // Add this helper function to check if form is complete
  const isFormComplete = () => {
    return calculateProgress() === 100;
  };

  useEffect(() => {
    const initializeForm = async () => {
      await loadDropdownData();

      if (isEdit && id) {
        const { state } = location;
        if (state?.userData) {
          setFormData(initialFormState(state.userData));
        } else {
          await loadUser();
        }
      }
    };

    initializeForm();
  }, [isEdit, id, location]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [rolesData, groupsData, accountsData] = await Promise.all([
        userServices.getRoles(),
        userServices.getGroups(),
        userServices.getAccountHierarchy(),
      ]);

      setRoles(rolesData);
      setGroups(groupsData);
      setAccounts(accountsData);

      console.log("Dropdown data loaded:", {
        roles: rolesData.length,
        groups: groupsData.length,
        accounts: accountsData.length,
      });
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const user = await userServices.getById(id!);
      if (user) {
        console.log("Loaded user data:", user);
        setFormData(initialFormState(user));
      } else {
        navigate(urls.usersViewPath);
      }
    } catch (error: any) {
      console.error("Error loading user:", error);
      toast.error(error.message || "Failed to fetch user");
      navigate(urls.usersViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof UserFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: e.target.value,
          error: "",
        },
      }));
    };

  const handleSelectChange =
    (field: keyof UserFormState) => (value: string | string[] | null) => {
      if (field === "accountOrGroupType") {
        // Clear account/group selections when type changes
        setFormData((prev) => ({
          ...prev,
          [field]: {
            value: value === null ? "" : (value as "account" | "group" | ""),
            error: "",
          },
          accountId: { value: "", error: "" },
          groupId: { value: "", error: "" },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: {
            value: value === null ? "" : (value as string),
            error: "",
          },
        }));
      }
    };

  const handleBlur = (field: keyof UserFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "accountOrGroupType":
        if (!value) error = "Please select Account or Group";
        break;
      case "accountId":
        if (formData.accountOrGroupType.value === "account" && !value) {
          error = "Account is required";
        }
        break;
      case "groupId":
        if (formData.accountOrGroupType.value === "group" && !value) {
          error = "Group is required";
        }
        break;
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "firstName":
        if (!value.trim()) error = "First Name is required";
        break;
      case "lastName":
        if (!value.trim()) error = "Last Name is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Invalid email format";
          }
        }
        break;
      case "contactNo":
        if (!value.trim()) {
          error = "Contact Number is required";
        } else {
          const contactRegex = /^[6-9]\d{9}$/;
          if (!contactRegex.test(value)) {
            error = "Invalid contact number format";
          }
        }
        break;
      case "password":
        if (!isEdit && !value.trim()) {
          error = "Password is required";
        } else if (value && value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "roleId":
        if (!value.trim()) error = "Role is required";
        break;
      case "status":
        if (!value.trim()) error = "Status is required";
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], error },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserFormState> = {};
    let isValid = true;

    // Account or Group Type validation
    if (!formData.accountOrGroupType.value) {
      errors.accountOrGroupType = {
        ...formData.accountOrGroupType,
        error: "Please select Account or Group",
      };
      isValid = false;
    }

    // Account/Group validation based on type
    if (
      formData.accountOrGroupType.value === "account" &&
      !formData.accountId.value.trim()
    ) {
      errors.accountId = {
        ...formData.accountId,
        error: "Account is required",
      };
      isValid = false;
    }

    if (
      formData.accountOrGroupType.value === "group" &&
      !formData.groupId.value.trim()
    ) {
      errors.groupId = { ...formData.groupId, error: "Group is required" };
      isValid = false;
    }

    // Username validation
    if (!formData.username.value.trim()) {
      errors.username = { ...formData.username, error: "Username is required" };
      isValid = false;
    }

    // First Name validation
    if (!formData.firstName.value.trim()) {
      errors.firstName = {
        ...formData.firstName,
        error: "First Name is required",
      };
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName.value.trim()) {
      errors.lastName = {
        ...formData.lastName,
        error: "Last Name is required",
      };
      isValid = false;
    }

    // Email validation
    if (!formData.email.value.trim()) {
      errors.email = { ...formData.email, error: "Email is required" };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.value)) {
        errors.email = { ...formData.email, error: "Invalid email format" };
        isValid = false;
      }
    }

    // Contact Number validation
    if (!formData.contactNo.value.trim()) {
      errors.contactNo = {
        ...formData.contactNo,
        error: "Contact Number is required",
      };
      isValid = false;
    } else {
      const contactRegex = /^[6-9]\d{9}$/;
      if (!contactRegex.test(formData.contactNo.value)) {
        errors.contactNo = {
          ...formData.contactNo,
          error: "Invalid contact number format",
        };
        isValid = false;
      }
    }

    // Password validation (only for new users)
    if (!isEdit && !formData.password.value.trim()) {
      errors.password = { ...formData.password, error: "Password is required" };
      isValid = false;
    } else if (formData.password.value && formData.password.value.length < 6) {
      errors.password = {
        ...formData.password,
        error: "Password must be at least 6 characters",
      };
      isValid = false;
    }

    // Role validation
    if (!formData.roleId.value.trim()) {
      errors.roleId = { ...formData.roleId, error: "Role is required" };
      isValid = false;
    }

    // Status validation
    if (!formData.status.value.trim()) {
      errors.status = { ...formData.status, error: "Status is required" };
      isValid = false;
    }

    if (!isValid) {
      setFormData((prev) => ({ ...prev, ...errors }));
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const userData: any = {
        username: formData.username.value,
        firstName: formData.firstName.value,
        middleName: formData.middleName.value,
        lastName: formData.lastName.value,
        email: formData.email.value,
        contactNo: formData.contactNo.value,
        roleId: formData.roleId.value,
        status: formData.status.value,
      };

      // Add password for new users
      if (!isEdit && formData.password.value) {
        userData.password = formData.password.value;
      }

      // Add account or group ID
      if (formData.accountOrGroupType.value === "account") {
        userData.accountId = formData.accountId.value;
      } else if (formData.accountOrGroupType.value === "group") {
        userData.groupId = formData.groupId.value;
      }

      const result = isEdit
        ? await userServices.update(id!, userData)
        : await userServices.create(userData);
      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.usersViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.usersViewPath);
  };

  // Create options for dropdowns
  const roleOptions = roles.map((role) => ({
    value: role._id,
    label: `${role.displayName} (${role.name})`,
  }));

  const groupOptions = groups.map((group) => ({
    value: group._id,
    label: `${group.groupName} - ${group.groupType}`,
  }));

  const accountOptions = accounts.map((account) => ({
    value: account._id,
    label: `${account.accountName} (ID: ${account.accountId})`,
  }));

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-secondary rounded-t-[24px] overflow-hidden flex flex-col">
      <ModuleHeader
        title={isEdit ? strings.EDIT_USER : strings.ADD_USER}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
        titleClassName="module-title-custom"
      />
      {/* Main content area */}
      <div className="flex-1">
        <div className="p-6">
          <Card className="p-6 !rounded-[24px]">
            <Card.Body className="p-6">
              {loadingDropdowns && (
                <div className="flex items-center justify-center py-4 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-2 text-gray-600">Loading form data...</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    label={strings.SELECT_ACCOUNT_OR_GROUP}
                    options={accountOrGroupOptions}
                    value={formData.accountOrGroupType.value}
                    onChange={handleSelectChange("accountOrGroupType")}
                    placeholder="Select Account or Group"
                    required
                    disabled={saving || loadingDropdowns}
                    error={formData.accountOrGroupType.error}
                  />
                </div>

                {formData.accountOrGroupType.value === "account" && (
                  <div>
                    <Select
                      label={strings.ACCOUNT_NAME}
                      options={accountOptions}
                      value={formData.accountId.value}
                      onChange={handleSelectChange("accountId")}
                      placeholder="Select Account"
                      required
                      disabled={saving || loadingDropdowns}
                      error={formData.accountId.error}
                    />
                  </div>
                )}

                {formData.accountOrGroupType.value === "group" && (
                  <div>
                    <Select
                      label={strings.GROUP_NAME}
                      options={groupOptions}
                      value={formData.groupId.value}
                      onChange={handleSelectChange("groupId")}
                      placeholder="Select Group"
                      required
                      disabled={saving || loadingDropdowns}
                      error={formData.groupId.error}
                    />
                  </div>
                )}

                <div>
                  <CustomInput
                    label={strings.USERNAME}
                    value={formData.username.value}
                    onChange={handleInputChange("username")}
                    onBlur={handleBlur("username")}
                    required
                    placeholder="Enter username"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.username.error}
                  />
                </div>

                <div>
                  <CustomInput
                    label={strings.FIRST_NAME}
                    value={formData.firstName.value}
                    onChange={handleInputChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    required
                    placeholder="Enter first name"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.firstName.error}
                  />
                </div>

                <div>
                  <CustomInput
                    label={strings.MIDDLE_NAME}
                    value={formData.middleName.value}
                    onChange={handleInputChange("middleName")}
                    placeholder="Enter middle name (optional)"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.middleName.error}
                  />
                </div>

                <div>
                  <CustomInput
                    label={strings.LAST_NAME}
                    value={formData.lastName.value}
                    onChange={handleInputChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    required
                    placeholder="Enter last name"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.lastName.error}
                  />
                </div>

                <div>
                  <CustomInput
                    label={strings.EMAIL}
                    type="email"
                    value={formData.email.value}
                    onChange={handleInputChange("email")}
                    onBlur={handleBlur("email")}
                    required
                    placeholder="Enter email address"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.email.error}
                  />
                </div>

                <div>
                  <CustomInput
                    label={strings.CONTACT_NO}
                    value={formData.contactNo.value}
                    onChange={handleInputChange("contactNo")}
                    onBlur={handleBlur("contactNo")}
                    maxLength={10}
                    required
                    placeholder="Enter contact number"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.contactNo.error}
                  />
                </div>

                {!isEdit && (
                  <div>
                    <CustomInput
                      label={strings.PASSWORD}
                      type="password"
                      value={formData.password.value}
                      onChange={handleInputChange("password")}
                      onBlur={handleBlur("password")}
                      required
                      placeholder="Enter password"
                      disabled={saving || loadingDropdowns}
                      autoValidate={false}
                      error={formData.password.error}
                    />
                  </div>
                )}

                <div>
                  <Select
                    label={strings.USER_ROLE}
                    options={roleOptions}
                    value={formData.roleId.value}
                    onChange={handleSelectChange("roleId")}
                    placeholder="Select Role"
                    required
                    disabled={saving || loadingDropdowns}
                    error={formData.roleId.error}
                  />
                </div>

                <div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status.value}
                    onChange={handleSelectChange("status")}
                    placeholder="Select Status"
                    required
                    disabled={saving || loadingDropdowns}
                    error={formData.status.error}
                  />
                </div>
              </div>

              {/* Progress Bar Section - Inside Card */}
              <div className="mt-16">
                <ProgressBar value={calculateProgress()} animated={true} />

                {/* Message and Buttons on same line - Inside Card */}
                <div className="flex items-center justify-between mt-4">
                  {/* Progress Message */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#1F3A8A] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <p className="text-sm text-[#1F3A8A] font-medium">
                      {getProgressMessage()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="custom"
                      customColors={{
                        background: "#F3F4F6",
                        text: "#374151",
                        border: "#E5E7EB",
                        hover: { background: "#F1F1F1" },
                      }}
                      onClick={handleCancel}
                      disabled={saving}
                      className="btn-custom-hover border"
                      size="lg"
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="custom"
                      customColors={{
                        background: "#1F3A8A",
                        text: "#FFFFFF",
                        hover: { background: "#1D40B0" },
                      }}
                      onClick={handleSave}
                      loading={saving}
                      disabled={saving || !isFormComplete()}
                      className="btn-custom-hover"
                      size="lg"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1F3A8A] text-white py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center text-sm">
            Routeye software - All rights reserved - © 2025
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AddEditUserForm;