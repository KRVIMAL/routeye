import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { clientServices } from "../services/clientsServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface ClientFormState {
  name: {
    value: string;
    error: string;
  };
  contactName: {
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
  panNumber: {
    value: string;
    error: string;
  };
  aadharNumber: {
    value: string;
    error: string;
  };
  gstNumber: {
    value: string;
    error: string;
  };
  stateName: {
    value: string;
    error: string;
  };
  cityName: {
    value: string;
    error: string;
  };
  remark: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): ClientFormState => ({
  name: {
    value: preState?.name || "",
    error: "",
  },
  contactName: {
    value: preState?.contactName || "",
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
  panNumber: {
    value: preState?.panNumber || "",
    error: "",
  },
  aadharNumber: {
    value: preState?.aadharNumber || "",
    error: "",
  },
  gstNumber: {
    value: preState?.gstNumber || "",
    error: "",
  },
  stateName: {
    value: preState?.stateName || "",
    error: "",
  },
  cityName: {
    value: preState?.cityName || "",
    error: "",
  },
  remark: {
    value: preState?.remark || "",
    error: "",
  },
  status: {
    value: preState?.status || "",
    error: "",
  },
});

const AddEditClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_CLIENT : strings.ADD_CLIENT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ClientFormState>(initialFormState());

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Indian states options (you can extend this list)
  const stateOptions = [
    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
    { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
    { value: "Assam", label: "Assam" },
    { value: "Bihar", label: "Bihar" },
    { value: "Chhattisgarh", label: "Chhattisgarh" },
    { value: "Goa", label: "Goa" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Haryana", label: "Haryana" },
    { value: "Himachal Pradesh", label: "Himachal Pradesh" },
    { value: "Jharkhand", label: "Jharkhand" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kerala", label: "Kerala" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Manipur", label: "Manipur" },
    { value: "Meghalaya", label: "Meghalaya" },
    { value: "Mizoram", label: "Mizoram" },
    { value: "Nagaland", label: "Nagaland" },
    { value: "Odisha", label: "Odisha" },
    { value: "Punjab", label: "Punjab" },
    { value: "Rajasthan", label: "Rajasthan" },
    { value: "Sikkim", label: "Sikkim" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Telangana", label: "Telangana" },
    { value: "Tripura", label: "Tripura" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Uttarakhand", label: "Uttarakhand" },
    { value: "West Bengal", label: "West Bengal" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.CLIENTS, href: urls.clientsViewPath, icon: FiUsers },
    {
      label: isEdit ? strings.EDIT_CLIENT : strings.ADD_CLIENT,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;

      if (state?.clientData) {
        setFormData(initialFormState(state.clientData));
      } else {
        loadClient(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const client = await clientServices.getById(id!);
      if (client) {
        setFormData(initialFormState(client));
      } else {
        navigate(urls.clientsViewPath);
      }
    } catch (error: any) {
      console.error("Error loading client:", error);
      toast.error(error.message || "Failed to fetch client");
      navigate(urls.clientsViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof ClientFormState) =>
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
    (field: keyof ClientFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Add blur validation handler for individual fields
  const handleBlur = (field: keyof ClientFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Client Name is required";
        break;
      case "contactName":
        if (!value.trim()) error = "Contact Name is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email ID is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Invalid email format";
          }
        }
        break;
      case "contactNo":
        if (!value.trim()) {
          error = "Contact No is required";
        } else {
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(value)) {
            error = "Invalid contact number format";
          }
        }
        break;
      case "panNumber":
        if (!value.trim()) {
          error = "Pan Number is required";
        } else {
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(value)) {
            error = "Invalid PAN format (e.g., ABCDE1234F)";
          }
        }
        break;
      case "aadharNumber":
        if (!value.trim()) {
          error = "Aadhar Number is required";
        } else {
          const aadharRegex = /^\d{12}$/;
          if (!aadharRegex.test(value)) {
            error = "Invalid Aadhar format (12 digits)";
          }
        }
        break;
      case "gstNumber":
        if (!value.trim()) {
          error = "GST Number is required";
        } else {
          const gstRegex =
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(value)) {
            error = "Invalid GST format";
          }
        }
        break;
      case "stateName":
        if (!value.trim()) error = "State Name is required";
        break;
      case "cityName":
        if (!value.trim()) error = "City Name is required";
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
    const errors: Partial<ClientFormState> = {};
    let isValid = true;

    // Client Name validation
    if (!formData.name.value.trim()) {
      errors.name = {
        ...formData.name,
        error: "Client Name is required",
      };
      isValid = false;
    }

    // Contact Name validation
    if (!formData.contactName.value.trim()) {
      errors.contactName = {
        ...formData.contactName,
        error: "Contact Name is required",
      };
      isValid = false;
    }

    // Email validation
    if (!formData.email.value.trim()) {
      errors.email = {
        ...formData.email,
        error: "Email ID is required",
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

    // Contact No validation
    if (!formData.contactNo.value.trim()) {
      errors.contactNo = {
        ...formData.contactNo,
        error: "Contact No is required",
      };
      isValid = false;
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.contactNo.value)) {
        errors.contactNo = {
          ...formData.contactNo,
          error: "Invalid contact number format",
        };
        isValid = false;
      }
    }

    // Pan Number validation
    if (!formData.panNumber.value.trim()) {
      errors.panNumber = {
        ...formData.panNumber,
        error: "Pan Number is required",
      };
      isValid = false;
    } else {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.panNumber.value)) {
        errors.panNumber = {
          ...formData.panNumber,
          error: "Invalid PAN format (e.g., ABCDE1234F)",
        };
        isValid = false;
      }
    }

    // Aadhar Number validation
    if (!formData.aadharNumber.value.trim()) {
      errors.aadharNumber = {
        ...formData.aadharNumber,
        error: "Aadhar Number is required",
      };
      isValid = false;
    } else {
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(formData.aadharNumber.value)) {
        errors.aadharNumber = {
          ...formData.aadharNumber,
          error: "Invalid Aadhar format (12 digits)",
        };
        isValid = false;
      }
    }

    // GST Number validation
    if (!formData.gstNumber.value.trim()) {
      errors.gstNumber = {
        ...formData.gstNumber,
        error: "GST Number is required",
      };
      isValid = false;
    } else {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstNumber.value)) {
        errors.gstNumber = {
          ...formData.gstNumber,
          error: "Invalid GST format",
        };
        isValid = false;
      }
    }

    // State Name validation
    if (!formData.stateName.value.trim()) {
      errors.stateName = {
        ...formData.stateName,
        error: "State Name is required",
      };
      isValid = false;
    }

    // City Name validation
    if (!formData.cityName.value.trim()) {
      errors.cityName = {
        ...formData.cityName,
        error: "City Name is required",
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
      const clientData = {
        name: formData.name.value,
        contactName: formData.contactName.value,
        email: formData.email.value,
        contactNo: formData.contactNo.value,
        panNumber: formData.panNumber.value,
        aadharNumber: formData.aadharNumber.value,
        gstNumber: formData.gstNumber.value,
        stateName: formData.stateName.value,
        cityName: formData.cityName.value,
        remark: formData.remark.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await clientServices.update(id!, clientData)
        : await clientServices.create(clientData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.clientsViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast.error(error.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.clientsViewPath);
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
        title={isEdit ? strings.EDIT_CLIENT : strings.ADD_CLIENT}
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
                  label="Client Name"
                  value={formData.name.value}
                  onChange={handleInputChange("name")}
                  onBlur={handleBlur("name")}
                  required
                  placeholder="Enter client name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.name.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Contact Name"
                  value={formData.contactName.value}
                  onChange={handleInputChange("contactName")}
                  onBlur={handleBlur("contactName")}
                  required
                  placeholder="Enter contact name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.contactName.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Email ID"
                  type="email"
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
                  label="Contact No"
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
                  label="Pan Number"
                  value={formData.panNumber.value}
                  onChange={handleInputChange("panNumber")}
                  onBlur={handleBlur("panNumber")}
                  maxLength={10}
                  required
                  placeholder="ABCDE1234F"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.panNumber.error}
                />
              </div>

              <div>
                <CustomInput
                  label="Aadhar Number"
                  value={formData.aadharNumber.value}
                  onChange={handleInputChange("aadharNumber")}
                  onBlur={handleBlur("aadharNumber")}
                  maxLength={12}
                  required
                  placeholder="123456789012"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.aadharNumber.error}
                />
              </div>

              <div>
                <CustomInput
                  label="GST Number"
                  value={formData.gstNumber.value}
                  onChange={handleInputChange("gstNumber")}
                  onBlur={handleBlur("gstNumber")}
                  maxLength={15}
                  required
                  placeholder="22AAAAA0000A1Z5"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.gstNumber.error}
                />
              </div>

              <div>
                <Select
                  label="State Name"
                  options={stateOptions}
                  value={formData.stateName.value}
                  onChange={handleSelectChange("stateName")}
                  placeholder="Select State"
                  required
                  disabled={saving}
                  error={formData.stateName.error}
                />
              </div>

              <div>
                <CustomInput
                  label="City Name"
                  value={formData.cityName.value}
                  onChange={handleInputChange("cityName")}
                  onBlur={handleBlur("cityName")}
                  required
                  placeholder="Enter city name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.cityName.error}
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

              <div className="md:col-span-2">
                <CustomInput
                  label="Remark"
                  value={formData.remark.value}
                  onChange={handleInputChange("remark")}
                  placeholder="Enter remark (optional)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.remark.error}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditClientForm;
