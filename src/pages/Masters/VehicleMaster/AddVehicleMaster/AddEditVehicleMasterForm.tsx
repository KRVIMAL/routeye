import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiTruck, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  DriverModule,
  vehicleMasterServices,
  VehicleModule,
} from "../services/vehicleMasters";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface VehicleMasterFormState {
  vehicleNumber: {
    value: string;
    error: string;
  };
  chassisNumber: {
    value: string;
    error: string;
  };
  engineNumber: {
    value: string;
    error: string;
  };
  vehicleModule: {
    value: string;
    error: string;
  };
  driverModule: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): VehicleMasterFormState => ({
  vehicleNumber: {
    value: preState?.vehicleNumber || "",
    error: "",
  },
  chassisNumber: {
    value: preState?.chassisNumber || "",
    error: "",
  },
  engineNumber: {
    value: preState?.engineNumber || "",
    error: "",
  },
  vehicleModule: {
    value: preState?.vehicleModule || "",
    error: "",
  },
  driverModule: {
    value: preState?.driverModule || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditVehicleMasterForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(
    isEdit === true ? strings.EDIT_VEHICLE_MASTER : strings.ADD_VEHICLE_MASTER
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VehicleMasterFormState>(
    initialFormState()
  );

  // Dropdown data
  const [vehicleModules, setVehicleModules] = useState<VehicleModule[]>([]);
  const [driverModules, setDriverModules] = useState<DriverModule[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    {
      label: strings.VEHICLE_MASTERS,
      href: urls.vehicleMastersViewPath,
      icon: FiTruck,
    },
    {
      label: isEdit ? strings.EDIT_VEHICLE_MASTER : strings.ADD_VEHICLE_MASTER,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    loadDropdownData();

    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;

      if (state?.vehicleMasterData) {
        setFormData(initialFormState(state.vehicleMasterData));
      } else {
        loadVehicleMaster(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [vehicleModulesData, driverModulesData] = await Promise.all([
        vehicleMasterServices.getVehicleModules(),
        vehicleMasterServices.getDriverModules(1, 0),
      ]);

      setVehicleModules(vehicleModulesData);
      setDriverModules(driverModulesData);
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load vehicle and driver data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadVehicleMaster = async () => {
    setLoading(true);
    try {
      const vehicleMaster = await vehicleMasterServices.getById(id!);
      if (vehicleMaster) {
        setFormData(initialFormState(vehicleMaster));
      } else {
        navigate(urls.vehicleMastersViewPath);
      }
    } catch (error: any) {
      console.error("Error loading vehicle master:", error);
      toast.error(error.message || "Failed to fetch vehicle master");
      navigate(urls.vehicleMastersViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof VehicleMasterFormState) =>
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
    (field: keyof VehicleMasterFormState) =>
    (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof VehicleMasterFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "vehicleNumber":
        if (!value.trim()) error = "Vehicle Number is required";
        break;
      case "chassisNumber":
        if (!value.trim()) error = "Chassis Number is required";
        break;
      case "engineNumber":
        if (!value.trim()) error = "Engine Number is required";
        break;
      case "vehicleModule":
        if (!value.trim()) error = "Vehicle Model is required";
        break;
      case "driverModule":
        if (!value.trim()) error = "Driver is required";
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
    const errors: Partial<VehicleMasterFormState> = {};
    let isValid = true;

    // Vehicle Number validation
    if (!formData.vehicleNumber.value.trim()) {
      errors.vehicleNumber = {
        ...formData.vehicleNumber,
        error: "Vehicle Number is required",
      };
      isValid = false;
    }

    // Chassis Number validation
    if (!formData.chassisNumber.value.trim()) {
      errors.chassisNumber = {
        ...formData.chassisNumber,
        error: "Chassis Number is required",
      };
      isValid = false;
    }

    // Engine Number validation
    if (!formData.engineNumber.value.trim()) {
      errors.engineNumber = {
        ...formData.engineNumber,
        error: "Engine Number is required",
      };
      isValid = false;
    }

    // Vehicle Module validation
    if (!formData.vehicleModule.value.trim()) {
      errors.vehicleModule = {
        ...formData.vehicleModule,
        error: "Vehicle Model is required",
      };
      isValid = false;
    }

    // Driver Module validation
    if (!formData.driverModule.value.trim()) {
      errors.driverModule = {
        ...formData.driverModule,
        error: "Driver is required",
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
      const vehicleMasterData = {
        vehicleNumber: formData.vehicleNumber.value,
        chassisNumber: formData.chassisNumber.value,
        engineNumber: formData.engineNumber.value,
        vehicleModule: formData.vehicleModule.value,
        driverModule: formData.driverModule.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await vehicleMasterServices.update(id!, vehicleMasterData)
        : await vehicleMasterServices.create(vehicleMasterData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.vehicleMastersViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving vehicle master:", error);
      toast.error(error.message || "Failed to save vehicle master");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.vehicleMastersViewPath);
  };

  // Create options for vehicle modules dropdown
  const vehicleModuleOptions = vehicleModules.map((vehicle) => ({
    value: vehicle._id,
    label: `${vehicle.brandName} - ${vehicle.modelName} (${vehicle.vehicleType})`,
  }));

  // Create options for driver modules dropdown
  const driverModuleOptions = driverModules.map((driver) => ({
    value: driver._id,
    label: `${driver.name} - ${driver.adharNo}`,
  }));

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
        title={
          isEdit ? strings.EDIT_VEHICLE_MASTER : strings.ADD_VEHICLE_MASTER
        }
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
            {loadingDropdowns && (
              <div className="flex items-center justify-center py-4 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-gray-600">
                  Loading vehicle and driver data...
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CustomInput
                  label={strings.VEHICLE_NUMBER}
                  value={formData.vehicleNumber.value}
                  onChange={handleInputChange("vehicleNumber")}
                  maxLength={12}
                  onBlur={handleBlur("vehicleNumber")}
                  required
                  placeholder="Enter vehicle number"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.vehicleNumber.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.CHASSIS_NUMBER}
                  value={formData.chassisNumber.value}
                  onChange={handleInputChange("chassisNumber")}
                  maxLength={17}
                  onBlur={handleBlur("chassisNumber")}
                  required
                  placeholder="Enter chassis number"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.chassisNumber.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.ENGINE_NUMBER}
                  value={formData.engineNumber.value}
                  onChange={handleInputChange("engineNumber")}
                  maxLength={14}
                  onBlur={handleBlur("engineNumber")}
                  required
                  placeholder="Enter engine number"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.engineNumber.error}
                />
              </div>

              <div>
                <Select
                  label={strings.VEHICLE_MODEL_NAME}
                  options={vehicleModuleOptions}
                  value={formData.vehicleModule.value}
                  onChange={handleSelectChange("vehicleModule")}
                  placeholder="Select Vehicle Model"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.vehicleModule.error}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label={strings.DRIVER_SELECTION}
                  options={driverModuleOptions}
                  value={formData.driverModule.value}
                  onChange={handleSelectChange("driverModule")}
                  placeholder="Select Driver (Name - Aadhar No)"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.driverModule.error}
                />
              </div>

              {isEdit && (
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
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditVehicleMasterForm;
