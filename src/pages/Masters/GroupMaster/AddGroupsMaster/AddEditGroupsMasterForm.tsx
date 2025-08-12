import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  groupsMasterServices,
  GroupModuleForDropdown,
  DeviceForImei,
} from "../services/groupsMaster.services";
import urls from "../../../../global/constants/UrlConstants";
import strings from "../../../../global/constants/StringConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";
import ProgressBar from "../../../../components/ui/ProgressBar";
import Button from "../../../../components/ui/Button";

// Form state type
interface GroupsMasterFormState {
  groupName: {
    value: string;
    error: string;
  };
  groupModule: {
    value: string;
    error: string;
  };
  imei: {
    value: string[];
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): GroupsMasterFormState => ({
  groupName: {
    value: preState?.groupName || "",
    error: "",
  },
  groupModule: {
    value: preState?.groupModule || "",
    error: "",
  },
  imei: {
    value: preState?.imei || [],
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditGroupsMasterForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(
    isEdit === true ? strings.EDIT_GROUPS_MASTER : strings.ADD_GROUPS_MASTER
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GroupsMasterFormState>(
    initialFormState()
  );

  // Dropdown data
  const [groupModules, setGroupModules] = useState<GroupModuleForDropdown[]>(
    []
  );
  const [devices, setDevices] = useState<DeviceForImei[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    {
      label: strings.GROUPS_MASTER,
      href: urls.groupsMasterViewPath,
      icon: FiUsers,
    },
    {
      label: isEdit ? strings.EDIT_GROUPS_MASTER : strings.ADD_GROUPS_MASTER,
      isActive: true,
      icon: FiPlus,
    },
  ];

  // Update this function to count only required fields
  const calculateProgress = () => {
    // Define which fields are required
    const requiredFields = [
      "groupName",
      "groupModule",
      "status",
    ] as (keyof GroupsMasterFormState)[];

    const filledRequiredFields = requiredFields.filter((fieldName) => {
      const field = formData[fieldName];
      const value = field.value;
      if (fieldName === "imei") {
        // IMEI is optional, so don't count it as required
        return true;
      }
      return (
        value !== null && value !== undefined && String(value).trim() !== ""
      );
    }).length;

    const totalRequiredFields = requiredFields.length;
    const progress =
      totalRequiredFields > 0
        ? Math.round((filledRequiredFields / totalRequiredFields) * 100)
        : 0;

    // Debug log to check calculation
    console.log("Progress calculation (required fields only):", {
      filledRequiredFields,
      totalRequiredFields,
      progress,
      requiredFieldValues: requiredFields.map((field) => ({
        field,
        value: formData[field].value,
        filled: String(formData[field].value).trim() !== "",
      })),
    });

    return progress;
  };

  const getProgressMessage = () => {
    const progress = calculateProgress();
    if (progress === 0) return "You are about to add a new group.";
    if (progress < 50)
      return "Please continue filling the required fields to proceed.";
    if (progress < 100)
      return "Almost done! Complete the remaining required fields.";
    return "All required fields completed! You can now save the group.";
  };

  // Add this helper function to check if form is complete
  const isFormComplete = () => {
    return calculateProgress() === 100;
  };

  // Update the useEffect to ensure proper loading order:
  useEffect(() => {
    const initializeForm = async () => {
      // Load dropdown data first and wait for it to complete
      await loadDropdownData();

      if (isEdit && id) {
        const { state } = location;
        if (state?.groupsMasterData) {
          console.log("Using navigation state data:", state.groupsMasterData);
          console.log("Available group modules:", groupModules); // Debug log

          const cleanedData = {
            ...state.groupsMasterData,
            imei: Array.isArray(state.groupsMasterData.imei)
              ? state.groupsMasterData.imei.filter(
                  (id: any) => typeof id === "string" && id.trim()
                )
              : [],
            groupModule:
              typeof state.groupsMasterData.groupModule === "object"
                ? state.groupsMasterData.groupModule?._id || ""
                : state.groupsMasterData.groupModule || "",
          };

          console.log("Cleaned data for form:", cleanedData); // Debug log
          setFormData(initialFormState(cleanedData));
        } else {
          await loadGroupsMaster();
        }
      }
    };

    initializeForm();
  }, [isEdit, id, location]); // Remove groupModules dependency to avoid infinite loop

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [groupModulesData, devicesData] = await Promise.all([
        groupsMasterServices.getGroupModules(),
        groupsMasterServices.getDevicesForImei(),
      ]);

      setGroupModules(groupModulesData);
      setDevices(devicesData);

      console.log("Dropdown data loaded:", {
        groupModules: groupModulesData.length,
        devices: devicesData.length,
      });
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // In the loadGroupsMaster function, update this part:
  const loadGroupsMaster = async () => {
    setLoading(true);
    try {
      const groupsMaster = await groupsMasterServices.getById(id!);
      if (groupsMaster) {
        console.log("Loaded groups master data:", groupsMaster);

        // Ensure IMEI array contains only string IDs
        const cleanedGroupsMaster = {
          ...groupsMaster,
          imei: Array.isArray(groupsMaster.imei)
            ? groupsMaster.imei.filter(
                (id) => typeof id === "string" && id.trim()
              )
            : [],
          // Make sure groupModule is the ID string, not an object
          groupModule:
            typeof groupsMaster.groupModule === "object"
              ? groupsMaster.groupModule?._id || ""
              : groupsMaster.groupModule || "",
        };

        setFormData(initialFormState(cleanedGroupsMaster));
      } else {
        navigate(urls.groupsMasterViewPath);
      }
    } catch (error: any) {
      console.error("Error loading groups master:", error);
      toast.error(error.message || "Failed to fetch groups master");
      navigate(urls.groupsMasterViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof GroupsMasterFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: e.target.value, // This will be empty string when cleared
          error: "",
        },
      }));
    };

  const handleSelectChange =
    (field: keyof GroupsMasterFormState) =>
    (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value:
            field === "imei"
              ? (value as string[]) || []
              : value === null ? "" : (value as string), // Convert null to empty string for non-array fields
          error: "",
        },
      }));
    };

  const handleBlur = (field: keyof GroupsMasterFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "groupName":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Group Name is required";
        }
        break;
      case "groupModule":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Group Module is required";
        }
        break;
      case "status":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Status is required";
        }
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], error },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<GroupsMasterFormState> = {};
    let isValid = true;

    // Group Name validation
    if (!formData.groupName.value.trim()) {
      errors.groupName = {
        ...formData.groupName,
        error: "Group Name is required",
      };
      isValid = false;
    }

    // Group Module validation
    if (!formData.groupModule.value.trim()) {
      errors.groupModule = {
        ...formData.groupModule,
        error: "Group Module is required",
      };
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
      // Ensure IMEI array contains only string IDs, no duplicates
      const imeiArray = Array.isArray(formData.imei.value)
        ? formData.imei.value
        : [];
      const uniqueImeiIds = [
        ...new Set(
          imeiArray.filter((id) => typeof id === "string" && id.trim())
        ),
      ];

      const groupsMasterData = {
        groupName: formData.groupName.value,
        groupModule: formData.groupModule.value,
        imei: uniqueImeiIds, // Array of device-onboarding IDs (strings only)
        status: formData.status.value,
      };

      console.log("Saving groups master data:", groupsMasterData); // Debug log

      const result = isEdit
        ? await groupsMasterServices.update(id!, groupsMasterData)
        : await groupsMasterServices.create(groupsMasterData);
      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.groupsMasterViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving groups master:", error);
      toast.error(error.message || "Failed to save groups master");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.groupsMasterViewPath);
  };

  // Create options for dropdowns
  const groupModuleOptions = groupModules.map((groupModule) => ({
    value: groupModule._id,
    label: `${groupModule.groupType} (${groupModule.stateName} - ${groupModule.cityName})`,
  }));

  const imeiOptions = devices.map((device) => ({
    value: device._id,
    label: `${device.deviceIMEI} - ${device.vehicleDescription}`,
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
        title={isEdit ? strings.EDIT_GROUPS_MASTER : strings.ADD_GROUPS_MASTER}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
        titleClassName="module-title-custom" // Add this prop
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
                  <CustomInput
                    label={strings.GROUP_NAME}
                    value={formData.groupName.value}
                    onChange={handleInputChange("groupName")}
                    onBlur={handleBlur("groupName")}
                    required
                    placeholder="Enter group name"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.groupName.error}
                  />
                </div>

                <div>
                  <Select
                    label={strings.GROUP_MODULE}
                    options={groupModuleOptions}
                    value={formData.groupModule.value}
                    onChange={handleSelectChange("groupModule")}
                    placeholder="Select Group Module"
                    required
                    disabled={saving || loadingDropdowns}
                    error={formData.groupModule.error}
                  />
                </div>

                <div className="md:col-span-2">
                  <Select
                    label={strings.SELECT_ASSET_IMEI}
                    options={imeiOptions}
                    value={formData.imei.value}
                    onChange={handleSelectChange("imei")}
                    placeholder="Select Assets/IMEI..."
                    multiple
                    disabled={saving || loadingDropdowns}
                    error={formData.imei.error}
                    helper="You can select multiple devices (optional)"
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

                  {/* Action Buttons - Update the Save button */}
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
                      disabled={saving || !isFormComplete()} // Disable if saving OR form incomplete
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

export default AddEditGroupsMasterForm;