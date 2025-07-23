import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { driverServices } from "../services/driversService";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface DriverFormState {
  name: {
    value: string;
    error: string;
  };
  contactNo: {
    value: string;
    error: string;
  };
  email: {
    value: string;
    error: string;
  };
  licenseNo: {
    value: string;
    error: string;
  };
  adharNo: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): DriverFormState => ({
  name: {
    value: preState?.name || "",
    error: "",
  },
  contactNo: {
    value: preState?.contactNo || "",
    error: "",
  },
  email: {
    value: preState?.email || "",
    error: "",
  },
  licenseNo: {
    value: preState?.licenseNo || "",
    error: "",
  },
  adharNo: {
    value: preState?.adharNo || "",
    error: "",
  },
  status: {
    value: preState?.status || "",
    error: "",
  },
});

const AddEditDriverForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_DRIVER : strings.ADD_DRIVER);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DriverFormState>(initialFormState());

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.DRIVERS, href: urls.driversViewPath, icon: FiUsers },
    {
      label: isEdit ? strings.EDIT_DRIVER : strings.ADD_DRIVER,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;
      if (state?.driverData) {
        setFormData(initialFormState(state.driverData));
      } else {
        loadDriver(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadDriver = async () => {
    setLoading(true);
    try {
      const driver = await driverServices.getById(id!);
      if (driver) {
        setFormData(initialFormState(driver));
      } else {
        navigate(urls.driversViewPath);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch driver");
      navigate(urls.driversViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof DriverFormState) =>
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
    (field: keyof DriverFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof DriverFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Driver Name is required";
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
      case "licenseNo":
        if (!value.trim()) {
          error = "License Number is required";
        } else {
          // Basic license format validation - adjust as needed
          if (value.length < 8) {
            error = "License number must be at least 8 characters";
          }
        }
        break;
      case "adharNo":
        if (!value.trim()) {
          error = "Aadhar Number is required";
        } else {
          const adharRegex = /^\d{12}$/;
          if (!adharRegex.test(value)) {
            error = "Aadhar number must be 12 digits";
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
    const errors: Partial<DriverFormState> = {};
    let isValid = true;

    // Name validation
    if (!formData.name.value.trim()) {
      errors.name = {
        ...formData.name,
        error: "Driver Name is required",
      };
      isValid = false;
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

    // Email validation
    if (!formData.email.value.trim()) {
      errors.email = {
        ...formData.email,
        error: "Email is required",
      };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.value)) {
        errors.email = {
          ...formData.email,
          error: "Invalid email format",
        };
        isValid = false;
      }
    }

    // License Number validation
    if (!formData.licenseNo.value.trim()) {
      errors.licenseNo = {
        ...formData.licenseNo,
        error: "License Number is required",
      };
      isValid = false;
    } else if (formData.licenseNo.value.length < 8) {
      errors.licenseNo = {
        ...formData.licenseNo,
        error: "License number must be at least 8 characters",
      };
      isValid = false;
    }

    // Aadhar Number validation
    if (!formData.adharNo.value.trim()) {
      errors.adharNo = {
        ...formData.adharNo,
        error: "Aadhar Number is required",
      };
      isValid = false;
    } else {
      const adharRegex = /^\d{12}$/;
      if (!adharRegex.test(formData.adharNo.value)) {
        errors.adharNo = {
          ...formData.adharNo,
          error: "Aadhar number must be 12 digits",
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
      const driverData = {
        name: formData.name.value,
        contactNo: formData.contactNo.value,
        email: formData.email.value,
        licenseNo: formData.licenseNo.value,
        adharNo: formData.adharNo.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await driverServices.update(id!, driverData)
        : await driverServices.create(driverData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.driversViewPath);
      }, 1300);
    } catch (error: any) {
      toast.error(error.message || "Failed to save driver");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.driversViewPath);
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
        title={isEdit ? strings.EDIT_DRIVER : strings.ADD_DRIVER}
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
                  label={strings.DRIVER_NAME}
                  value={formData.name.value}
                  onChange={handleInputChange("name")}
                  onBlur={handleBlur("name")}
                  required
                  placeholder="Enter driver name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.name.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.DRIVER_CONTACT_NO}
                  value={formData.contactNo.value}
                  onChange={handleInputChange("contactNo")}
                  maxLength={10}
                  onBlur={handleBlur("contactNo")}
                  required
                  placeholder="Enter contact number"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.contactNo.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.DRIVER_EMAIL}
                  value={formData.email.value}
                  onChange={handleInputChange("email")}
                  onBlur={handleBlur("email")}
                  required
                  placeholder="Enter email address"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.email.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.DRIVER_LICENSE_NO}
                  value={formData.licenseNo.value}
                  onChange={handleInputChange("licenseNo")}
                  maxLength={16}
                  onBlur={handleBlur("licenseNo")}
                  required
                  placeholder="Enter license number"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.licenseNo.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.DRIVER_ADHAR_NO}
                  value={formData.adharNo.value}
                  onChange={handleInputChange("adharNo")}
                  maxLength={12}
                  onBlur={handleBlur("adharNo")}
                  required
                  placeholder="Enter aadhar number"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.adharNo.error}
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
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditDriverForm;
