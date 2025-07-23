import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiAlertTriangle, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import AlertConfigurationTabs from "./AlertConfigurationTabs";
import {
  alertServices,
  DeviceType,
  Account,
  Group,
  ImeiDevice,
  AlertConfig,
  AlertData,
  Geofence,
  Route,
} from "../services/alerts.services";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { store } from "../../../../store";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface AlertFormState {
  deviceType: {
    value: string;
    error: string;
  };
  accountId: {
    value: string;
    error: string;
  };
  groupId: {
    value: string[];
    error: string;
  };
  selectedImeis: {
    value: string[];
    error: string;
  };
  category: {
    value: "fuel" | "load" | "elock" | "tracker" | "";
    error: string;
  };
}

// Initial form state
const initialFormState = (): AlertFormState => ({
  deviceType: {
    value: "",
    error: "",
  },
  accountId: {
    value: "",
    error: "",
  },
  groupId: {
    value: [],
    error: "",
  },
  selectedImeis: {
    value: [],
    error: "",
  },
  category: {
    value: "",
    error: "",
  },
});

const AddEditAlertForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_ALERT : strings.ADD_ALERT);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AlertFormState>(initialFormState());

  // Dropdown data
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [accountHierarchy, setAccountHierarchy] = useState<Account | null>(
    null
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [imeiDevices, setImeiDevices] = useState<ImeiDevice[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingImeis, setLoadingImeis] = useState(false);

  // Alert configurations
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);

  // User permissions from store
  const [userHasAccountAccess, setUserHasAccountAccess] = useState(false);
  const [userHasGroupAccess, setUserHasGroupAccess] = useState(false);
  // const [geofences, setGeofences] = useState<Geofence[]>([]);
  // const [routes, setRoutes] = useState<Route[]>([]);

  console.log({ userHasAccountAccess });
  const categoryOptions = [
    { value: "fuel", label: "Fuel" },
    { value: "load", label: "Load" },
    { value: "elock", label: "E-Lock" },
    { value: "tracker", label: "Tracker" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.ALERTS, href: urls.alertsViewPath, icon: FiAlertTriangle },
    {
      label: isEdit ? strings.EDIT_ALERT : strings.ADD_ALERT,
      isActive: true,
      icon: FiPlus,
    },
  ];

  // Check user permissions from localStorage/store
  const checkUserPermissions = () => {
    // This would be based on your actual user permission logic
    // For now, I'm assuming both are true, but you can implement the actual logic
    const user = store.getState()?.auth?.user;
    if (user.account) {
      setUserHasAccountAccess(true); // Replace with actual account access check
    }
    if (user.group) {
      setUserHasGroupAccess(true); // Replace with actual group access check
    }
    console.log({ user });
    // Example logic - replace with your actual permission checking
  };

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [
        deviceTypesData,
        accountData,
        groupsData,
        // geofencesData,
        // routesData,
      ] = await Promise.all([
        alertServices.getDeviceTypes(),

        alertServices.getAccountHierarchy(),

        userHasGroupAccess ? alertServices.getGroups() : Promise.resolve([]),
        // alertServices.getGeofences(),
        // alertServices.getRoutes(),
      ]);

      setDeviceTypes(deviceTypesData);
      if (accountData) {
        setAccountHierarchy(accountData);
      }
      setGroups(groupsData);
      // setGeofences(geofencesData);
      // setRoutes(routesData);
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Update the loadAlert function to load IMEIs
  const loadAlert = async () => {
    setLoading(true);
    try {
      const alert = await alertServices.getById(id!);
      if (alert) {
        // Populate form with existing alert data
        const formState = {
          deviceType: {
            value: alert.deviceType._id,
            error: "",
          },
          accountId: {
            value: alert.accountId?._id || "",
            error: "",
          },
          groupId: {
            value: alert.groupId ? [alert.groupId._id] : [],
            error: "",
          },
          selectedImeis: {
            value: alert.alertConfigs.map((config) => config.imei),
            error: "",
          },
          category: {
            value: alert.category,
            error: "",
          },
        };

        setFormData(formState);
        setAlertConfigs(alert.alertConfigs);

        // Load IMEI devices for the dropdown
        await loadImeiDevices(
          alert.deviceType._id,
          alert.accountId?._id,
          alert.groupId?._id
        );
      } else {
        navigate(urls.alertsViewPath);
      }
    } catch (error: any) {
      console.error("Error loading alert:", error);
      toast.error(error.message || "Failed to fetch alert");
      navigate(urls.alertsViewPath);
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect to call loadAlert after dropdown data is loaded
  useEffect(() => {
    const initializeForm = async () => {
      checkUserPermissions();
      await loadDropdownData();

      if (isEdit && id) {
        await loadAlert();
      }
    };

    initializeForm();
  }, [isEdit, id]);

  const handleSelectChange =
    (field: keyof AlertFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as any,
          error: "",
        },
      }));

      // Load IMEIs when device type and account/group are selected
      if (
        field === "deviceType" ||
        field === "accountId" ||
        field === "groupId"
      ) {
        const newFormData = {
          ...formData,
          [field]: {
            value: value as any,
            error: "",
          },
        };

        if (
          newFormData.deviceType.value &&
          (newFormData.accountId.value || newFormData.groupId.value.length > 0)
        ) {
          loadImeiDevices(
            newFormData.deviceType.value,
            newFormData.accountId.value,
            newFormData.groupId.value[0] // Take first group for now
          );
        }
      }
    };

  const loadImeiDevices = async (
    deviceTypeId: string,
    accountId?: string,
    groupId?: string
  ) => {
    if (!deviceTypeId) return;

    setLoadingImeis(true);
    try {
      const imeiData = await alertServices.getImeiDetails(
        deviceTypeId,
        accountId,
        groupId
      );
      setImeiDevices(imeiData);
    } catch (error: any) {
      console.error("Error loading IMEI devices:", error);
      toast.error("Failed to load IMEI devices");
    } finally {
      setLoadingImeis(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<AlertFormState> = {};
    let isValid = true;

    // Device Type validation
    if (!formData.deviceType.value.trim()) {
      errors.deviceType = {
        ...formData.deviceType,
        error: "Device Type is required",
      };
      isValid = false;
    }

    // Account or Group validation
    if (
      userHasAccountAccess &&
      !formData.accountId.value.trim() &&
      userHasGroupAccess &&
      formData.groupId.value.length === 0
    ) {
      if (userHasAccountAccess) {
        errors.accountId = {
          ...formData.accountId,
          error: "Account is required",
        };
      }
      if (userHasGroupAccess) {
        errors.groupId = { ...formData.groupId, error: "Group is required" };
      }
      isValid = false;
    }

    // Category validation
    if (!formData.category.value) {
      errors.category = { ...formData.category, error: "Category is required" };
      isValid = false;
    }

    if (!isValid) {
      setFormData((prev) => ({ ...prev, ...errors }));
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (alertConfigs.length === 0) {
      toast.error("Please configure at least one alert");
      return;
    }

    setSaving(true);
    try {
      const alertData = {
        deviceType: formData.deviceType.value,
        ...(formData.accountId.value && {
          accountId: formData.accountId.value,
        }),
        ...(formData.groupId.value.length > 0 && {
          groupId: formData.groupId.value[0],
        }),
        category: formData.category.value as "fuel" | "load" | "elock",
        alertConfigs: alertConfigs,
      };

      const result = isEdit
        ? await alertServices.update(id!, {
            category: alertData.category,
            alertConfigs: alertData.alertConfigs,
          })
        : await alertServices.create(alertData);

      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.alertsViewPath);
      }, 1500);
    } catch (error: any) {
      console.error("Error saving alert:", error);
      toast.error(error.message || "Failed to save alert");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.alertsViewPath);
  };

  // Create options for dropdowns
  const deviceTypeOptions = deviceTypes.map((device) => ({
    value: device._id,
    label: `${device.modelName} (${device.deviceType})`,
  }));

  // Create account options (include main account and children)
  const accountOptions: { value: string; label: string }[] = [];
  if (accountHierarchy) {
    // Add main account
    accountOptions.push({
      value: accountHierarchy._id,
      label: accountHierarchy.accountName,
    });

    // Add sub-accounts (children)
    accountHierarchy.children.forEach((child) => {
      accountOptions.push({
        value: child._id,
        label: `${child.accountName} (Sub-account)`,
      });
    });
  }

  const groupOptions = groups.map((group) => ({
    value: group._id,
    label: group.groupName,
  }));

  const imeiOptions = imeiDevices.map((device) => ({
    value: device.deviceIMEI,
    label: `${device.deviceIMEI} - ${device.vehicleDescription}`,
  }));

  // const geofenceOptions = geofences.map((geofence) => ({
  //   value: geofence._id,
  //   label: `${geofence.name} - ${geofence.finalAddress}`,
  // }));

  // const routeOptions = routes.map((route) => ({
  //   value: route._id,
  //   label: `${route.name} (${route.distance.text})`,
  // }));

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
        title={isEdit ? strings.EDIT_ALERT : strings.ADD_ALERT}
        breadcrumbs={breadcrumbs}
        showCancelButton
        showSaveButton
        onSaveClick={handleSave}
        onCancelClick={handleCancel}
        saveText={saving ? "Saving..." : "Save"}
      />

      <div className="p-6 space-y-6">
        {/* Selection Form */}
        <Card>
          <Card.Body className="p-6">
            {loadingDropdowns && (
              <div className="flex items-center justify-center py-4 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-gray-600">Loading form data...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Select
                  label={strings.DEVICE_TYPE}
                  options={deviceTypeOptions}
                  value={formData.deviceType.value}
                  onChange={handleSelectChange("deviceType")}
                  placeholder="Select Device Type"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.deviceType.error}
                />
              </div>

              {userHasAccountAccess && (
                <div>
                  <Select
                    label={strings.ACCOUNT_NAME}
                    options={accountOptions}
                    value={formData.accountId.value}
                    onChange={handleSelectChange("accountId")}
                    placeholder="Select Account"
                    required={!userHasGroupAccess}
                    disabled={
                      saving ||
                      loadingDropdowns ||
                      formData.groupId.value.length > 0
                    }
                    error={formData.accountId.error}
                  />
                </div>
              )}

              {userHasGroupAccess && (
                <div>
                  <Select
                    label={strings.GROUP_NAME}
                    options={groupOptions}
                    value={formData.groupId.value}
                    onChange={handleSelectChange("groupId")}
                    placeholder="Select Groups..."
                    multiple
                    required={!userHasAccountAccess}
                    disabled={
                      saving ||
                      loadingDropdowns ||
                      formData.accountId.value !== ""
                    }
                    error={formData.groupId.error}
                    helper="You can select multiple groups"
                  />
                </div>
              )}

              <div>
                <Select
                  label={strings.SELECT_IMEI}
                  options={imeiOptions}
                  value={formData.selectedImeis.value}
                  onChange={handleSelectChange("selectedImeis")}
                  placeholder="Select IMEIs..."
                  multiple
                  disabled={saving || loadingImeis || imeiDevices.length === 0}
                  error={formData.selectedImeis.error}
                  helper={
                    loadingImeis
                      ? "Loading IMEIs..."
                      : "Select IMEIs to configure alerts"
                  }
                />
              </div>

              <div>
                <Select
                  label={strings.CATEGORY}
                  options={categoryOptions}
                  value={formData.category.value}
                  onChange={handleSelectChange("category")}
                  placeholder="Select Category"
                  required
                  disabled={saving || loadingDropdowns}
                  error={formData.category.error}
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Alert Configuration Tabs */}
        {/* {formData.category.value && formData.selectedImeis.value.length > 0 && ( */}
        <AlertConfigurationTabs
          category={
            formData.category.value as "fuel" | "load" | "elock" | "tracker"
          }
          selectedImeis={formData.selectedImeis.value}
          alertConfigs={alertConfigs}
          onConfigsChange={setAlertConfigs}
          disabled={saving}
        />
        {/* )} */}
      </div>
    </div>
  );
};

export default AddEditAlertForm;
