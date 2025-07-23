import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiSmartphone, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  Account,
  DeviceModule,
  deviceOnboardingServices,
  DriverModule,
  TelecomMaster,
  VehicleMaster,
  VehicleModule,
} from "../services/deviceOnboardingsServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface DeviceOnboardingFormState {
  account: {
    value: string;
    error: string;
  };
  deviceIMEI: {
    value: string;
    error: string;
  };
  deviceSerialNo: {
    value: string;
    error: string;
  };
  simNo1: {
    value: string;
    error: string;
  };
  simNo2: {
    value: string;
    error: string;
  };
  simNo1Operator: {
    value: string;
    error: string;
  };
  simNo2Operator: {
    value: string;
    error: string;
  };
  vehicleDescription: {
    value: string;
    error: string;
  };
  vehicleModule: {
    value: string;
    error: string;
  };
  vehicleMaster: {
    value: string;
    error: string;
  };
  driverModule: {
    value: string;
    error: string;
  };
  deviceModule: {
    value: string;
    error: string;
  };

  mobileNo1: {
    value: string;
    error: string;
  };
  mobileNo2: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): DeviceOnboardingFormState => ({
  account: {
    value: preState?.account || "",
    error: "",
  },
  deviceIMEI: {
    value: preState?.deviceIMEI || "",
    error: "",
  },
  deviceSerialNo: {
    value: preState?.deviceSerialNo || "",
    error: "",
  },
  simNo1: {
    value: preState?.simNo1 || "",
    error: "",
  },
  simNo2: {
    value: preState?.simNo2 || "",
    error: "",
  },
  simNo1Operator: {
    value: preState?.simNo1Operator || "",
    error: "",
  },
  simNo2Operator: {
    value: preState?.simNo2Operator || "",
    error: "",
  },
  vehicleDescription: {
    value: preState?.vehicleDescription || "",
    error: "",
  },
  vehicleModule: {
    value: preState?.vehicleModule || "",
    error: "",
  },
  vehicleMaster: {
    value: preState?.vehicleMaster || "",
    error: "",
  },
  driverModule: {
    value: preState?.driverModule || "",
    error: "",
  },
  deviceModule: {
    value: preState?.deviceModule || "",
    error: "",
  },
  mobileNo1: {
    value: preState?.mobileNo1 || "",
    error: "",
  },
  mobileNo2: {
    value: preState?.mobileNo2 || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditDeviceOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(
    isEdit === true
      ? strings.EDIT_DEVICE_ONBOARDING
      : strings.ADD_DEVICE_ONBOARDING
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DeviceOnboardingFormState>(
    initialFormState()
  );

  console.log({ formData });
  // Dropdown data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vehicleModules, setVehicleModules] = useState<VehicleModule[]>([]);
  const [driverModules, setDriverModules] = useState<DriverModule[]>([]);
  const [vehicleMasters, setVehicleMasters] = useState<VehicleMaster[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [deviceModules, setDeviceModules] = useState<DeviceModule[]>([]);
  const [telecomMasters, setTelecomMasters] = useState<TelecomMaster[]>([]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const simOperatorOptions = [
    { value: "Airtel", label: "Airtel" },
    { value: "Vodafone", label: "Vodafone" },
    { value: "Jio", label: "Jio" },
    { value: "BSNL", label: "BSNL" },
    { value: "VI", label: "VI (Vodafone Idea)" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    {
      label: strings.DEVICE_ONBOARDING,
      href: urls.deviceOnboardingViewPath,
      icon: FiSmartphone,
    },
    {
      label: isEdit
        ? strings.EDIT_DEVICE_ONBOARDING
        : strings.ADD_DEVICE_ONBOARDING,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    const initializeForm = async () => {
      // Load dropdown data first
      await loadDropdownData();

      // For edit mode, always load from API to get the relationship IDs
      if (isEdit && id) {
        await loadDevice();
      }
    };

    initializeForm();
  }, [isEdit, id, location]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [
        accountsData,
        vehicleModulesData,
        driverModulesData,
        vehicleMastersData,
        deviceModulesData,
        telecomMastersData,
      ] = await Promise.all([
        deviceOnboardingServices.getAccountHierarchy(),
        deviceOnboardingServices.getVehicleModules(),
        deviceOnboardingServices.getDriverModules(1, 0),
        deviceOnboardingServices.getVehicleMasters(),
        deviceOnboardingServices.getDeviceModules(),
        deviceOnboardingServices.getTelecomMasters(),
      ]);

      setAccounts(accountsData);
      setVehicleModules(vehicleModulesData);
      setDriverModules(driverModulesData);
      setVehicleMasters(vehicleMastersData);
      setDeviceModules(deviceModulesData);
      setTelecomMasters(telecomMastersData);
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadDevice = async () => {
    setLoading(true);
    try {
      const response = await deviceOnboardingServices.getById(id!);
      if (response) {
        setFormData(initialFormState(response));
      } else {
        navigate(urls.deviceOnboardingViewPath);
      }
    } catch (error: any) {
      console.error("Error loading device:", error);
      toast.error(error.message || "Failed to fetch device");
      navigate(urls.deviceOnboardingViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof DeviceOnboardingFormState) =>
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
    (field: keyof DeviceOnboardingFormState) =>
    (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  const handleBlur = (field: keyof DeviceOnboardingFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "account":
        if (!value.trim()) error = "Account is required";
        break;
      case "deviceIMEI":
        if (!value.trim()) {
          error = "Device IMEI is required";
        }
        // else if (value.length < 15 || value.length > 17) {
        //   error = "IMEI should be 15-17 characters";
        // }
        break;
      case "deviceSerialNo":
        if (!value.trim()) error = "Device Serial No is required";
        break;
      // case "simNo1":
      //   if (!value.trim()) error = "SIM No 1 is required";
      //   break;
      // case "simNo2":
      //   if (!value.trim()) error = "SIM No 2 is required";
      //   break;
      // case "simNo1Operator":
      //   if (!value.trim()) error = "SIM 1 Operator is required";
      //   break;
      // case "simNo2Operator":
      //   if (!value.trim()) error = "SIM 2 Operator is required";
      //   break;
      case "vehicleDescription":
        if (!value.trim()) error = "Vehicle Description is required";
        break;
      case "vehicleModule":
        if (!value.trim()) error = "Vehicle Model is required";
        break;
      case "vehicleMaster":
        if (!value.trim()) error = "Vehicle Master is required";
        break;
      case "driverModule":
        if (!value.trim()) error = "Driver is required";
        break;
      case "deviceModule":
        if (!value.trim()) error = "Device Type is required";
        break;

      case "mobileNo1":
        if (!value.trim()) error = "Mobile Number 1 is required";
        break;
      case "mobileNo2":
        if (!value.trim()) error = "Mobile Number 2 is required";
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
    const errors: Partial<DeviceOnboardingFormState> = {};
    let isValid = true;

    // Account validation
    if (!formData.account.value.trim()) {
      errors.account = { ...formData.account, error: "Account is required" };
      isValid = false;
    }

    // Device IMEI validation
    if (!formData.deviceIMEI.value.trim()) {
      errors.deviceIMEI = {
        ...formData.deviceIMEI,
        error: "Device IMEI is required",
      };
      isValid = false;
    }
    // else if (
    //   formData.deviceIMEI.value.length < 15 ||
    //   formData.deviceIMEI.value.length > 17
    // ) {
    //   errors.deviceIMEI = {
    //     ...formData.deviceIMEI,
    //     error: "IMEI should be 15-17 characters",
    //   };
    //   isValid = false;
    // }

    // Device Serial No validation
    if (!formData.deviceSerialNo.value.trim()) {
      errors.deviceSerialNo = {
        ...formData.deviceSerialNo,
        error: "Device Serial No is required",
      };
      isValid = false;
    }

    // SIM No 1 validation
    // if (!formData.simNo1.value.trim()) {
    //   errors.simNo1 = { ...formData.simNo1, error: "SIM No 1 is required" };
    //   isValid = false;
    // }

    // // SIM No 2 validation
    // if (!formData.simNo2.value.trim()) {
    //   errors.simNo2 = { ...formData.simNo2, error: "SIM No 2 is required" };
    //   isValid = false;
    // }

    // // SIM Operator validations
    // if (!formData.simNo1Operator.value.trim()) {
    //   errors.simNo1Operator = {
    //     ...formData.simNo1Operator,
    //     error: "SIM 1 Operator is required",
    //   };
    //   isValid = false;
    // }

    // if (!formData.simNo2Operator.value.trim()) {
    //   errors.simNo2Operator = {
    //     ...formData.simNo2Operator,
    //     error: "SIM 2 Operator is required",
    //   };
    //   isValid = false;
    // }

    // Vehicle Description validation
    if (!formData.vehicleDescription.value.trim()) {
      errors.vehicleDescription = {
        ...formData.vehicleDescription,
        error: "Vehicle Description is required",
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

    // Vehicle Master validation
    if (!formData.vehicleMaster.value.trim()) {
      errors.vehicleMaster = {
        ...formData.vehicleMaster,
        error: "Vehicle Master is required",
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

    if (!formData.deviceModule.value.trim()) {
      errors.deviceModule = {
        ...formData.deviceModule,
        error: "Device Type is required",
      };
      isValid = false;
    }

    if (!formData.mobileNo1.value.trim()) {
      errors.mobileNo1 = {
        ...formData.mobileNo1,
        error: "Mobile Number 1 is required",
      };
      isValid = false;
    }

    if (!formData.mobileNo2.value.trim()) {
      errors.mobileNo2 = {
        ...formData.mobileNo2,
        error: "Mobile Number 2 is required",
      };
      isValid = false;
    }

    // Validation to prevent same selection:
    if (
      formData.mobileNo1.value &&
      formData.mobileNo2.value &&
      formData.mobileNo1.value === formData.mobileNo2.value
    ) {
      errors.mobileNo2 = {
        ...formData.mobileNo2,
        error: "Mobile Number 2 cannot be same as Mobile Number 1",
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
      const deviceData = {
        account: formData.account.value,
        deviceIMEI: formData.deviceIMEI.value,
        deviceSerialNo: formData.deviceSerialNo.value,
        simNo1: formData.simNo1.value,
        simNo2: formData.simNo2.value,
        simNo1Operator: formData.simNo1Operator.value,
        simNo2Operator: formData.simNo2Operator.value,
        vehicleDescription: formData.vehicleDescription.value,
        vehicleModule: formData.vehicleModule.value,
        vehicleMaster: formData.vehicleMaster.value,
        driverModule: formData.driverModule.value,
        deviceModule: formData.deviceModule.value,
        mobileNo1: formData.mobileNo1.value,
        mobileNo2: formData.mobileNo2.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await deviceOnboardingServices.update(id!, deviceData)
        : await deviceOnboardingServices.create(deviceData);
      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.deviceOnboardingViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving device:", error);
      toast.error(error.message || "Failed to save device");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.deviceOnboardingViewPath);
  };

  // Create options for dropdowns
  const accountOptions = accounts.map((account) => ({
    value: account._id,
    label: `${account.accountName} (Level ${account.level})`,
  }));

  console.log({ vehicleModules });

  const vehicleModuleOptions = vehicleModules.map((vehicle) => {
    console.log(vehicle._id); // or any specific part you want to log
    console.log(
      `${vehicle.brandName} - ${vehicle.modelName} (${vehicle.vehicleType})`
    );
    return {
      value: vehicle._id,
      label: `${vehicle.brandName} - ${vehicle.modelName} (${vehicle.vehicleType})`,
    };
  });

  const driverModuleOptions = driverModules.map((driver) => {
    console.log({ driver });
    console.log({ value: driver._id });
    console.log({ label: `${driver.name} - ${driver.adharNo}` });
    return {
      value: driver._id,
      label: `${driver.name} - ${driver.adharNo}`,
    };
  });

  const vehicleMasterOptions = vehicleMasters.map((vehicle) => ({
    value: vehicle._id,
    label: vehicle.vehicleNumber,
  }));

  const deviceModuleOptions = deviceModules.map((device) => ({
    value: device._id,
    label: `${device.modelName} (${device.deviceType})`,
  }));

  const telecomMasterOptions = telecomMasters.map((telecom) => ({
    value: telecom._id,
    label: `${telecom.mobileNo1}${
      telecom.mobileNo2 ? ` / ${telecom.mobileNo2}` : ""
    }`,
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
          isEdit
            ? strings.EDIT_DEVICE_ONBOARDING
            : strings.ADD_DEVICE_ONBOARDING
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
                <span className="ml-2 text-gray-600">Loading form data...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label={strings.ACCOUNT_NAME}
                  options={accountOptions}
                  value={formData.account.value}
                  onChange={handleSelectChange("account")}
                  placeholder="Select Account"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.account.error}
                />
              </div>
              <div>
                <CustomInput
                  label={strings.DEVICE_IMEI}
                  value={formData.deviceIMEI.value}
                  onChange={handleInputChange("deviceIMEI")}
                  onBlur={handleBlur("deviceIMEI")}
                  required
                  placeholder="Enter device IMEI"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.deviceIMEI.error}
                />
              </div>
              <div>
                <CustomInput
                  label={strings.DEVICE_SERIAL_NO}
                  value={formData.deviceSerialNo.value}
                  onChange={handleInputChange("deviceSerialNo")}
                  onBlur={handleBlur("deviceSerialNo")}
                  required
                  placeholder="Enter device serial number"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.deviceSerialNo.error}
                />
              </div>
              {/* <div>
                <CustomInput
                  label={strings.SIM_NO_1}
                  value={formData.simNo1.value}
                  onChange={handleInputChange("simNo1")}
                  onBlur={handleBlur("simNo1")}
                  required
                  placeholder="Enter SIM number 1"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.simNo1.error}
                />
              </div>
              <div>
                <CustomInput
                  label={strings.SIM_NO_2}
                  value={formData.simNo2.value}
                  onChange={handleInputChange("simNo2")}
                  onBlur={handleBlur("simNo2")}
                  required
                  placeholder="Enter SIM number 2"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.simNo2.error}
                />
              </div>
              <div>
                <Select
                  label={strings.SIM_NO_1_OPERATOR}
                  options={simOperatorOptions}
                  value={formData.simNo1Operator.value}
                  onChange={handleSelectChange("simNo1Operator")}
                  placeholder="Select SIM 1 Operator"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.simNo1Operator.error}
                />
              </div>
              <div>
                <Select
                  label={strings.SIM_NO_2_OPERATOR}
                  options={simOperatorOptions}
                  value={formData.simNo2Operator.value}
                  onChange={handleSelectChange("simNo2Operator")}
                  placeholder="Select SIM 2 Operator"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.simNo2Operator.error}
                />
              </div> */}
              <div>
                <CustomInput
                  label={strings.VEHICLE_DESCRIPTION}
                  value={formData.vehicleDescription.value}
                  onChange={handleInputChange("vehicleDescription")}
                  onBlur={handleBlur("vehicleDescription")}
                  required
                  placeholder="Enter vehicle description"
                  disabled={saving || loadingDropdowns}
                  autoValidate={false}
                  error={formData.vehicleDescription.error}
                />
              </div>
              <div>
                <Select
                  label={strings.DEVICE_TYPE}
                  options={deviceModuleOptions}
                  value={formData.deviceModule.value}
                  onChange={handleSelectChange("deviceModule")}
                  placeholder="Select Device Type"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.deviceModule.error}
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
              <div>
                <Select
                  label={strings.VEHICLE_MASTER}
                  options={vehicleMasterOptions}
                  value={formData.vehicleMaster.value}
                  onChange={handleSelectChange("vehicleMaster")}
                  placeholder="Select Vehicle Number"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.vehicleMaster.error}
                />
              </div>
              <div>
                <Select
                  label={strings.DRIVER_SELECTION}
                  options={driverModuleOptions}
                  value={formData.driverModule.value}
                  onChange={handleSelectChange("driverModule")}
                  placeholder="Select Driver (Name - Aadhar)"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.driverModule.error}
                />
              </div>
              <div>
                <Select
                  label={strings.MOBILE_NO_1}
                  options={telecomMasterOptions}
                  value={formData.mobileNo1.value}
                  onChange={handleSelectChange("mobileNo1")}
                  placeholder="Select Mobile Number 1"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.mobileNo1.error}
                />
              </div>
              <div>
                <Select
                  label={strings.MOBILE_NO_2}
                  options={telecomMasterOptions.filter(
                    (option) => option.value !== formData.mobileNo1.value
                  )}
                  value={formData.mobileNo2.value}
                  onChange={handleSelectChange("mobileNo2")}
                  placeholder="Select Mobile Number 2"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.mobileNo2.error}
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

export default AddEditDeviceOnboardingForm;
