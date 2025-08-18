import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiPhone, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
// import { telecomServices } from "../services/telecomServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";
import ProgressBar from "../../../../components/ui/ProgressBar";
import Button from "../../../../components/ui/Button";
import { telecomServices } from "../services/telecomServices";

// Form state type
interface TelecomFormState {
  telecomOperator: {
    value: string;
    error: string;
  };
  simType: {
    value: string;
    error: string;
  };
  numberOfNetworkProfiles: {
    value: string;
    error: string;
  };
  networkProfile1: {
    value: string;
    error: string;
  };
  networkProfile2: {
    value: string;
    error: string;
  };
  networkProfile1Generation: {
    value: string;
    error: string;
  };
  networkProfile2Generation: {
    value: string;
    error: string;
  };
  networkProfile1APN: {
    value: string;
    error: string;
  };
  networkProfile2APN: {
    value: string;
    error: string;
  };
  billingType: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): TelecomFormState => ({
  telecomOperator: {
    value: preState?.telecomOperator || "",
    error: "",
  },
  simType: {
    value: preState?.simType || "",
    error: "",
  },
  numberOfNetworkProfiles: {
    value: preState?.numberOfNetworkProfiles?.toString() || "1",
    error: "",
  },
  networkProfile1: {
    value: preState?.networkProfile1 || "",
    error: "",
  },
  networkProfile2: {
    value: preState?.networkProfile2 || "",
    error: "",
  },
  networkProfile1Generation: {
    value: preState?.networkProfile1Generation || "",
    error: "",
  },
  networkProfile2Generation: {
    value: preState?.networkProfile2Generation || "",
    error: "",
  },
  networkProfile1APN: {
    value: preState?.networkProfile1APN || "",
    error: "",
  },
  networkProfile2APN: {
    value: preState?.networkProfile2APN || "",
    error: "",
  },
  billingType: {
    value: preState?.billingType || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditTelecomForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_TELECOM : strings.ADD_TELECOM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TelecomFormState>(initialFormState());

  const simTypeOptions = [
    { value: "esim", label: "eSIM" },
    { value: "plastic", label: "Plastic SIM" },
  ];

  const networkProfileOptions = [
    { value: "1", label: "1 Profile" },
    { value: "2", label: "2 Profiles" },
  ];

  const billingTypeOptions = [
    { value: "postpaid", label: "Postpaid" },
    { value: "prepaid", label: "Prepaid" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.TELECOM, href: urls.telecomViewPath, icon: FiPhone },
    {
      label: isEdit ? strings.EDIT_TELECOM : strings.ADD_TELECOM,
      isActive: true,
      icon: FiPlus,
    },
  ];

  // Check if network profile 2 fields should be visible
  const showNetworkProfile2 = formData.numberOfNetworkProfiles.value === "2";

  // Update this function to count only required fields based on current state
  const calculateProgress = () => {
    // Define which fields are always required
    const requiredFields = [
      "telecomOperator",
      "simType",
      "numberOfNetworkProfiles",
      "billingType",
      "status",
    ] as (keyof TelecomFormState)[];

    // Add conditionally required fields
    if (formData.numberOfNetworkProfiles.value === "1" || formData.numberOfNetworkProfiles.value === "2") {
      requiredFields.push("networkProfile1", "networkProfile1Generation", "networkProfile1APN");
    }

    if (formData.numberOfNetworkProfiles.value === "2") {
      requiredFields.push("networkProfile2", "networkProfile2Generation", "networkProfile2APN");
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

    console.log("Progress calculation:", {
      filledRequiredFields,
      totalRequiredFields,
      progress,
      showNetworkProfile2,
      requiredFields,
    });

    return progress;
  };

  const getProgressMessage = () => {
    const progress = calculateProgress();
    if (progress === 0) return "You are about to add a new telecom configuration.";
    if (progress < 50)
      return "Please continue filling the required fields to proceed.";
    if (progress < 100)
      return "Almost done! Complete the remaining required fields.";
    return "All required fields completed! You can now save the telecom configuration.";
  };

  // Add this helper function to check if form is complete
  const isFormComplete = () => {
    return calculateProgress() === 100;
  };

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;

      if (state?.telecomData) {
        setFormData(initialFormState(state.telecomData));
      } else {
        loadTelecom(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadTelecom = async () => {
    setLoading(true);
    try {
      const telecom = await telecomServices.getById(id!);
      if (telecom) {
        setFormData(initialFormState(telecom));
      } else {
        navigate(urls.telecomViewPath);
      }
    } catch (error: any) {
      console.error("Error loading telecom:", error);
      toast.error(error.message || "Failed to fetch telecom");
      navigate(urls.telecomViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof TelecomFormState) =>
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
    (field: keyof TelecomFormState) => (value: string | string[] | null) => {
      const newValue = value === null ? "" : (value as string);
      
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          [field]: {
            value: newValue,
            error: "",
          },
        };

        // Clear network profile 2 fields when changing from 2 to 1 profiles
        if (field === "numberOfNetworkProfiles" && newValue === "1") {
          newFormData.networkProfile2 = { value: "", error: "" };
          newFormData.networkProfile2Generation = { value: "", error: "" };
          newFormData.networkProfile2APN = { value: "", error: "" };
        }

        return newFormData;
      });
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof TelecomFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "telecomOperator":
        if (!value.trim()) error = "Telecom Operator is required";
        break;
      case "simType":
        if (!value.trim()) error = "SIM Type is required";
        break;
      case "numberOfNetworkProfiles":
        if (!value.trim()) error = "Number of Network Profiles is required";
        break;
      case "networkProfile1":
        if (!value.trim()) error = "Network Profile 1 is required";
        break;
      case "networkProfile2":
        if (showNetworkProfile2 && !value.trim()) {
          error = "Network Profile 2 is required";
        }
        break;
      case "networkProfile1Generation":
        if (!value.trim()) error = "Network Profile 1 Generation is required";
        break;
      case "networkProfile2Generation":
        if (showNetworkProfile2 && !value.trim()) {
          error = "Network Profile 2 Generation is required";
        }
        break;
      case "networkProfile1APN":
        if (!value.trim()) error = "Network Profile 1 APN is required";
        break;
      case "networkProfile2APN":
        if (showNetworkProfile2 && !value.trim()) {
          error = "Network Profile 2 APN is required";
        }
        break;
      case "billingType":
        if (!value.trim()) error = "Billing Type is required";
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
    const errors: Partial<TelecomFormState> = {};
    let isValid = true;

    // Telecom Operator validation
    if (!formData.telecomOperator.value.trim()) {
      errors.telecomOperator = {
        ...formData.telecomOperator,
        error: "Telecom Operator is required",
      };
      isValid = false;
    }

    // SIM Type validation
    if (!formData.simType.value.trim()) {
      errors.simType = {
        ...formData.simType,
        error: "SIM Type is required",
      };
      isValid = false;
    }

    // Number of Network Profiles validation
    if (!formData.numberOfNetworkProfiles.value.trim()) {
      errors.numberOfNetworkProfiles = {
        ...formData.numberOfNetworkProfiles,
        error: "Number of Network Profiles is required",
      };
      isValid = false;
    }

    // Network Profile 1 validation (always required)
    if (!formData.networkProfile1.value.trim()) {
      errors.networkProfile1 = {
        ...formData.networkProfile1,
        error: "Network Profile 1 is required",
      };
      isValid = false;
    }

    // Network Profile 1 Generation validation (always required)
    if (!formData.networkProfile1Generation.value.trim()) {
      errors.networkProfile1Generation = {
        ...formData.networkProfile1Generation,
        error: "Network Profile 1 Generation is required",
      };
      isValid = false;
    }

    // Network Profile 1 APN validation (always required)
    if (!formData.networkProfile1APN.value.trim()) {
      errors.networkProfile1APN = {
        ...formData.networkProfile1APN,
        error: "Network Profile 1 APN is required",
      };
      isValid = false;
    }

    // Network Profile 2 validation (only if 2 profiles selected)
    if (showNetworkProfile2) {
      if (!formData.networkProfile2.value.trim()) {
        errors.networkProfile2 = {
          ...formData.networkProfile2,
          error: "Network Profile 2 is required",
        };
        isValid = false;
      }

      if (!formData.networkProfile2Generation.value.trim()) {
        errors.networkProfile2Generation = {
          ...formData.networkProfile2Generation,
          error: "Network Profile 2 Generation is required",
        };
        isValid = false;
      }

      if (!formData.networkProfile2APN.value.trim()) {
        errors.networkProfile2APN = {
          ...formData.networkProfile2APN,
          error: "Network Profile 2 APN is required",
        };
        isValid = false;
      }
    }

    // Billing Type validation
    if (!formData.billingType.value.trim()) {
      errors.billingType = {
        ...formData.billingType,
        error: "Billing Type is required",
      };
      isValid = false;
    }

    // Status validation
    if (!formData.status.value.trim()) {
      errors.status = {
        ...formData.status,
        error: "Status is required",
      };
      isValid = false;
    }

    // Update form data with errors only if there are any
    if (!isValid) {
      setFormData((prev) => ({
        ...prev,
        ...errors,
      }));
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const telecomData: any = {
        telecomOperator: formData.telecomOperator.value,
        simType: formData.simType.value,
        numberOfNetworkProfiles: parseInt(formData.numberOfNetworkProfiles.value),
        networkProfile1: formData.networkProfile1.value,
        networkProfile1Generation: formData.networkProfile1Generation.value,
        networkProfile1APN: formData.networkProfile1APN.value,
        billingType: formData.billingType.value,
        status: formData.status.value,
      };

      // Add network profile 2 fields only if 2 profiles selected
      if (showNetworkProfile2) {
        telecomData.networkProfile2 = formData.networkProfile2.value;
        telecomData.networkProfile2Generation = formData.networkProfile2Generation.value;
        telecomData.networkProfile2APN = formData.networkProfile2APN.value;
      }

      const result = isEdit
        ? await telecomServices.update(id!, telecomData)
        : await telecomServices.create(telecomData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.telecomViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving telecom:", error);
      toast.error(error.message || "Failed to save telecom");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.telecomViewPath);
  };

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
        title={isEdit ? strings.EDIT_TELECOM : strings.ADD_TELECOM}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
        titleClassName="module-title-custom"
      />
      {/* Main content area */}
      <div className="flex-1">
        <div className="p-6">
          <Card className="p-6 !rounded-[24px]">
            <Card.Body className="p-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <CustomInput
                    label="Telecom Operator"
                    value={formData.telecomOperator.value}
                    onChange={handleInputChange("telecomOperator")}
                    onBlur={handleBlur("telecomOperator")}
                    required
                    placeholder="Enter telecom operator name"
                    disabled={saving}
                    autoValidate={false}
                    error={formData.telecomOperator.error}
                  />
                </div>

                <div>
                  <Select
                    label="SIM Type"
                    options={simTypeOptions}
                    value={formData.simType.value}
                    onChange={handleSelectChange("simType")}
                    placeholder="Select SIM Type"
                    required
                    disabled={saving}
                    error={formData.simType.error}
                  />
                </div>

                <div>
                  <Select
                    label="Number of Network Profiles"
                    options={networkProfileOptions}
                    value={formData.numberOfNetworkProfiles.value}
                    onChange={handleSelectChange("numberOfNetworkProfiles")}
                    placeholder="Select Number of Profiles"
                    required
                    disabled={saving}
                    searchable={false}
                    error={formData.numberOfNetworkProfiles.error}
                  />
                </div>

                <div>
                  <Select
                    label="Billing Type"
                    options={billingTypeOptions}
                    value={formData.billingType.value}
                    onChange={handleSelectChange("billingType")}
                    placeholder="Select Billing Type"
                    required
                    disabled={saving}
                    searchable={false}
                    error={formData.billingType.error}
                  />
                </div>

                {/* Network Profile 1 Fields - Always visible when numberOfNetworkProfiles is selected */}
                {(formData.numberOfNetworkProfiles.value === "1" || formData.numberOfNetworkProfiles.value === "2") && (
                  <>
                    <div>
                      <CustomInput
                        label="Network Profile 1"
                        value={formData.networkProfile1.value}
                        onChange={handleInputChange("networkProfile1")}
                        onBlur={handleBlur("networkProfile1")}
                        required
                        placeholder="Enter network profile 1 name"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile1.error}
                      />
                    </div>

                    <div>
                      <CustomInput
                        label="Network Profile 1 Generation"
                        value={formData.networkProfile1Generation.value}
                        onChange={handleInputChange("networkProfile1Generation")}
                        onBlur={handleBlur("networkProfile1Generation")}
                        required
                        placeholder="e.g., 4g, 2g, 5g"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile1Generation.error}
                      />
                    </div>

                    <div>
                      <CustomInput
                        label="Network Profile 1 APN"
                        value={formData.networkProfile1APN.value}
                        onChange={handleInputChange("networkProfile1APN")}
                        onBlur={handleBlur("networkProfile1APN")}
                        required
                        placeholder="Enter APN for profile 1"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile1APN.error}
                      />
                    </div>
                  </>
                )}

                {/* Network Profile 2 Fields - Only visible when 2 profiles selected */}
                {showNetworkProfile2 && (
                  <>
                    <div>
                      <CustomInput
                        label="Network Profile 2"
                        value={formData.networkProfile2.value}
                        onChange={handleInputChange("networkProfile2")}
                        onBlur={handleBlur("networkProfile2")}
                        required
                        placeholder="Enter network profile 2 name"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile2.error}
                      />
                    </div>

                    <div>
                      <CustomInput
                        label="Network Profile 2 Generation"
                        value={formData.networkProfile2Generation.value}
                        onChange={handleInputChange("networkProfile2Generation")}
                        onBlur={handleBlur("networkProfile2Generation")}
                        required
                        placeholder="e.g., 4g, 2g, 5g"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile2Generation.error}
                      />
                    </div>

                    <div>
                      <CustomInput
                        label="Network Profile 2 APN"
                        value={formData.networkProfile2APN.value}
                        onChange={handleInputChange("networkProfile2APN")}
                        onBlur={handleBlur("networkProfile2APN")}
                        required
                        placeholder="Enter APN for profile 2"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.networkProfile2APN.error}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status.value}
                    onChange={handleSelectChange("status")}
                    placeholder="Select Status"
                    required
                    disabled={saving}
                    searchable={false}
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

export default AddEditTelecomForm;