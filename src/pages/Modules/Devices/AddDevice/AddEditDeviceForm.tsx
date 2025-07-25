import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiHardDrive, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { deviceServices } from "../services/devicesSevices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface DeviceFormState {
  modelName: {
    value: string;
    error: string;
  };
  manufacturerName: {
    value: string;
    error: string;
  };
  deviceType: {
    value: string;
    error: string;
  };
  ipAddress: {
    value: string;
    error: string;
  };
  port: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): DeviceFormState => ({
  modelName: {
    value: preState?.modelName || "",
    error: "",
  },
  manufacturerName: {
    value: preState?.manufacturerName || "",
    error: "",
  },
  deviceType: {
    value: preState?.deviceType || "",
    error: "",
  },
  ipAddress: {
    value: preState?.ipAddress || "",
    error: "",
  },
  port: {
    value: preState?.port?.toString() || "",
    error: "",
  },
  status: {
    value: preState?.status || "",
    error: "",
  },
});

const AddEditDeviceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_DEVICE : strings.ADD_DEVICE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DeviceFormState>(initialFormState());

  const deviceTypeOptions = [
    { value: "iot", label: "IoT Device" },
    { value: "lock", label: "Smart Lock" },
    { value: "tracker", label: "GPS Tracker" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.DEVICES, href: urls.devicesViewPath, icon: FiHardDrive },
    {
      label: isEdit ? strings.EDIT_DEVICE : strings.ADD_DEVICE,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;

      if (state?.deviceData) {
        setFormData(initialFormState(state.deviceData));
      } else {
        loadDevice(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadDevice = async () => {
    setLoading(true);
    try {
      const device = await deviceServices.getById(id!);
      if (device) {
        setFormData(initialFormState(device));
      } else {
        navigate(urls.devicesViewPath);
      }
    } catch (error: any) {
      console.error("Error loading device:", error);
      toast.error(error.message || "Failed to fetch device");
      navigate(urls.devicesViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof DeviceFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: e.target.value,
          error: "", // Clear error when user types
        },
      }));
    };

  const handleSelectChange =
    (field: keyof DeviceFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof DeviceFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "modelName":
        if (!value.trim()) error = "Model Name is required";
        break;
      case "manufacturerName":
        if (!value.trim()) error = "Manufacturer Name is required";
        break;
      case "deviceType":
        if (!value.trim()) error = "Device Type is required";
        break;
      case "ipAddress":
        if (!value.trim()) {
          error = "IP Address or Domain is required";
        } else {
          const trimmedValue = value.trim();
          const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
          const domainRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

          const isValidIP = ipRegex.test(trimmedValue);
          const isValidDomain =
            domainRegex.test(trimmedValue) &&
            trimmedValue.length >= 1 &&
            trimmedValue.length <= 255;

          if (!isValidIP && !isValidDomain) {
            error = "Invalid IP Address or Domain format";
          }
        }
        break;
      case "port":
        if (!value.trim()) {
          error = "Port is required";
        } else {
          const portNum = parseInt(value);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            error = "Port must be between 1 and 65535";
          }
        }
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
    const errors: Partial<DeviceFormState> = {};
    let isValid = true;

    // Model Name validation
    if (!formData.modelName.value.trim()) {
      errors.modelName = {
        ...formData.modelName,
        error: "Model Name is required",
      };
      isValid = false;
    }

    // Manufacturer Name validation
    if (!formData.manufacturerName.value.trim()) {
      errors.manufacturerName = {
        ...formData.manufacturerName,
        error: "Manufacturer Name is required",
      };
      isValid = false;
    }

    // Device Type validation
    if (!formData.deviceType.value.trim()) {
      errors.deviceType = {
        ...formData.deviceType,
        error: "Device Type is required",
      };
      isValid = false;
    }

    // IP Address or Domain validation
    if (!formData.ipAddress.value.trim()) {
      errors.ipAddress = {
        ...formData.ipAddress,
        error: "IP Address or Domain is required",
      };
      isValid = false;
    } else {
      const value = formData.ipAddress.value.trim();

      const isValidIPAddress = (ip: string) => {
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(ip)) return false;

        // Additional check for valid IP ranges (0-255)
        const parts = ip.split(".");
        return parts.every((part) => {
          const num = parseInt(part, 10);
          return num >= 0 && num <= 255;
        });
      };

      const isValidDomain = (domain: string) => {
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/;

        // Check length and basic format
        if (
          domain.length < 2 ||
          domain.length > 255 ||
          !domainRegex.test(domain)
        ) {
          return false;
        }

        // Check for valid TLD (optional - for stricter validation)
        const parts = domain.split(".");
        return parts.length >= 1; // Allow single words like 'localhost'
      };

      if (!isValidIPAddress(value) && !isValidDomain(value)) {
        errors.ipAddress = {
          ...formData.ipAddress,
          error:
            "Enter a valid IP Address (e.g., 192.168.1.1) or Domain (e.g., example.com)",
        };
        isValid = false;
      }
    }

    // Port validation
    if (!formData.port.value.trim()) {
      errors.port = { ...formData.port, error: "Port is required" };
      isValid = false;
    } else {
      const portNum = parseInt(formData.port.value);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        errors.port = {
          ...formData.port,
          error: "Port must be between 1 and 65535",
        };
        isValid = false;
      }
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
      const deviceData = {
        modelName: formData.modelName.value,
        manufacturerName: formData.manufacturerName.value,
        deviceType: formData.deviceType.value,
        ipAddress: formData.ipAddress.value,
        port: formData.port.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await deviceServices.update(id!, deviceData)
        : await deviceServices.create(deviceData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.devicesViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving device:", error);
      toast.error(error.message || "Failed to save device");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.devicesViewPath);
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={isEdit ? strings.EDIT_DEVICE : strings.ADD_DEVICE}
        breadcrumbs={breadcrumbs}
        showCancelButton
        showSaveButton
        onSaveClick={handleSave}
        onCancelClick={handleCancel}
        saveText={saving ? "Saving..." : "Save"}
      />

      <div className="p-6">
        <Card>
          <Card.Body className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CustomInput
                  label="Model Name"
                  value={formData.modelName.value}
                  onChange={handleInputChange("modelName")}
                  onBlur={handleBlur("modelName")}
                  required
                  placeholder="Enter model name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.modelName.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Manufacturer Name"
                  value={formData.manufacturerName.value}
                  onChange={handleInputChange("manufacturerName")}
                  onBlur={handleBlur("manufacturerName")}
                  required
                  placeholder="Enter manufacturer name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.manufacturerName.error}
                />
              </div>

              <div>
                <Select
                  label="Device Type"
                  options={deviceTypeOptions}
                  value={formData.deviceType.value}
                  onChange={handleSelectChange("deviceType")}
                  placeholder="Select Device Type" // Add placeholder
                  required
                  disabled={saving}
                  error={formData.deviceType.error}
                />
              </div>

              <div>
                <CustomInput
                  label="IP Address"
                  value={formData.ipAddress.value}
                  onChange={handleInputChange("ipAddress")}
                  onBlur={handleBlur("ipAddress")}
                  required
                  placeholder="192.168.1.100"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.ipAddress.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Port"
                  type="number"
                  value={formData.port.value}
                  onChange={handleInputChange("port")}
                  onBlur={handleBlur("port")}
                  required
                  placeholder="8080"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.port.error}
                />
              </div>

              <div>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status.value}
                  onChange={handleSelectChange("status")}
                  placeholder="Select Status" // Add placeholder
                  required
                  disabled={saving}
                  error={formData.status.error}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditDeviceForm;
