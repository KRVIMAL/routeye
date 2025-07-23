// src/modules/vehicles/pages/AddEditVehicleForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiTruck, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { vehicleServices } from "../services/vehiclesServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface VehicleFormState {
  brandName: {
    value: string;
    error: string;
  };
  modelName: {
    value: string;
    error: string;
  };
  vehicleType: {
    value: string;
    error: string;
  };
  icon: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): VehicleFormState => ({
  brandName: {
    value: preState?.brandName || "",
    error: "",
  },
  modelName: {
    value: preState?.modelName || "",
    error: "",
  },
  vehicleType: {
    value: preState?.vehicleType || "",
    error: "",
  },
  icon: {
    value: preState?.icon || "",
    error: "",
  },
  status: {
    value: preState?.status || "",
    error: "",
  },
});

const AddEditVehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_VEHICLE : strings.ADD_VEHICLE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VehicleFormState>(
    initialFormState()
  );

  const vehicleTypeOptions = [
    { value: "car", label: "Car" },
    { value: "truck", label: "Truck" },
    { value: "bike", label: "Bike" },
    { value: "bus", label: "Bus" },
    { value: "van", label: "Van" },
    { value: "auto richshaw", label: "Auto Rickshaw" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.VEHICLES, href: urls.vehiclesViewPath, icon: FiTruck },
    {
      label: isEdit ? strings.EDIT_VEHICLE : strings.ADD_VEHICLE,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;

      if (state?.vehicleData) {
        setFormData(initialFormState(state.vehicleData));
      } else {
        loadVehicle(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const vehicle = await vehicleServices.getById(id!);
      if (vehicle) {
        setFormData(initialFormState(vehicle));
      } else {
        navigate(urls.vehiclesViewPath);
      }
    } catch (error: any) {
      console.error("Error loading vehicle:", error);
      toast.error(error.message || "Failed to fetch vehicle");
      navigate(urls.vehiclesViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof VehicleFormState) =>
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
    (field: keyof VehicleFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof VehicleFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "brandName":
        if (!value.trim()) error = "Brand Name is required";
        break;
      case "modelName":
        if (!value.trim()) error = "Model Name is required";
        break;
      case "vehicleType":
        if (!value.trim()) error = "Vehicle Type is required";
        break;
      case "icon":
        if (!value.trim()) error = "Icon is required";
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
    const errors: Partial<VehicleFormState> = {};
    let isValid = true;

    // Brand Name validation
    if (!formData.brandName.value.trim()) {
      errors.brandName = {
        ...formData.brandName,
        error: "Brand Name is required",
      };
      isValid = false;
    }

    // Model Name validation
    if (!formData.modelName.value.trim()) {
      errors.modelName = {
        ...formData.modelName,
        error: "Model Name is required",
      };
      isValid = false;
    }

    // Vehicle Type validation
    if (!formData.vehicleType.value.trim()) {
      errors.vehicleType = {
        ...formData.vehicleType,
        error: "Vehicle Type is required",
      };
      isValid = false;
    }

    // Icon validation
    if (!formData.icon.value.trim()) {
      errors.icon = {
        ...formData.icon,
        error: "Icon is required",
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
      const vehicleData = {
        brandName: formData.brandName.value,
        modelName: formData.modelName.value,
        vehicleType: formData.vehicleType.value,
        icon: formData.icon.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await vehicleServices.update(id!, vehicleData)
        : await vehicleServices.create(vehicleData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.vehiclesViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast.error(error.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.vehiclesViewPath);
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
        title={isEdit ? strings.EDIT_VEHICLE : strings.ADD_VEHICLE}
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
                  label="Brand Name"
                  value={formData.brandName.value}
                  onChange={handleInputChange("brandName")}
                  onBlur={handleBlur("brandName")}
                  required
                  placeholder="Enter brand name (e.g., Toyota, Honda)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.brandName.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Model Name"
                  value={formData.modelName.value}
                  onChange={handleInputChange("modelName")}
                  onBlur={handleBlur("modelName")}
                  required
                  placeholder="Enter model name (e.g., Camry, Civic)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.modelName.error}
                />
              </div>

              <div>
                <Select
                  label="Vehicle Type"
                  options={vehicleTypeOptions}
                  value={formData.vehicleType.value}
                  onChange={handleSelectChange("vehicleType")}
                  placeholder="Select Vehicle Type"
                  required
                  disabled={saving}
                  error={formData.vehicleType.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Icon"
                  value={formData.icon.value}
                  onChange={handleInputChange("icon")}
                  onBlur={handleBlur("icon")}
                  required
                  placeholder="Enter icon URL or filename"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.icon.error}
                  helperText="Enter the URL or filename for the vehicle icon"
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
                  disabled={saving}
                  error={formData.status.error}
                />
              </div>

              {/* Icon Preview */}
              {formData.icon.value && (
                <div className="md:col-span-2">
                  <label className="block text-body-small font-medium text-text-primary mb-2">
                    Icon Preview
                  </label>
                  <div className="flex items-center space-x-4 p-4 border border-border-light rounded-lg bg-theme-tertiary">
                    <div className="w-16 h-16 flex items-center justify-center border border-border-medium rounded-lg bg-theme-primary">
                      <img
                        src={formData.icon.value}
                        alt="Vehicle Icon Preview"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "block";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">
                        {formData.brandName.value} {formData.modelName.value}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formData.vehicleType.value &&
                          `Type: ${
                            formData.vehicleType.value.charAt(0).toUpperCase() +
                            formData.vehicleType.value.slice(1)
                          }`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditVehicleForm;
