import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomInput from "../../../components/ui/CustomInput";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import { groupServices } from "./AddGroup/groups.services";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";

// Form state type
interface GroupFormState {
  groupType: {
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
  contactNo: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): GroupFormState => ({
  groupType: {
    value: preState?.groupType || "",
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
  contactNo: {
    value: preState?.contactNo || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditGroupForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_GROUP : strings.ADD_GROUP);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GroupFormState>(initialFormState());

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

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
    { value: "Delhi", label: "Delhi" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.GROUPS, href: urls.groupsViewPath, icon: FiUsers },
    {
      label: isEdit ? strings.EDIT_GROUP : strings.ADD_GROUP,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      const { state } = location;
      console.log({ state });

      if (state?.groupData) {
        setFormData(initialFormState(state.groupData));
      } else {
        loadGroup();
      }
    }
  }, [isEdit, id, location]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      const group = await groupServices.getById(id!);
      if (group) {
        setFormData(initialFormState(group));
      } else {
        navigate(urls.groupsViewPath);
      }
    } catch (error: any) {
      console.error("Error loading group:", error);
      toast.error(error.message || "Failed to fetch group");
      navigate(urls.groupsViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof GroupFormState) =>
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
    (field: keyof GroupFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  const handleBlur = (field: keyof GroupFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "groupType":
        if (!value.trim()) error = "Group Type is required";
        break;
      case "stateName":
        if (!value.trim()) error = "State Name is required";
        break;
      case "cityName":
        if (!value.trim()) error = "City Name is required";
        break;
      case "remark":
        if (!value.trim()) error = "Remark is required";
        break;
      case "contactNo":
        if (!value.trim()) {
          error = "Contact Number is required";
        } else {
          const contactRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!contactRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
            error = "Invalid contact number format";
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
    const errors: Partial<GroupFormState> = {};
    let isValid = true;

    // Group Type validation
    if (!formData.groupType.value.trim()) {
      errors.groupType = {
        ...formData.groupType,
        error: "Group Type is required",
      };
      isValid = false;
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

    // Remark validation
    if (!formData.remark.value.trim()) {
      errors.remark = { ...formData.remark, error: "Remark is required" };
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
      const contactRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (
        !contactRegex.test(formData.contactNo.value.replace(/[\s\-\(\)]/g, ""))
      ) {
        errors.contactNo = {
          ...formData.contactNo,
          error: "Invalid contact number format",
        };
        isValid = false;
      }
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
      const groupData = {
        groupType: formData.groupType.value,
        stateName: formData.stateName.value,
        cityName: formData.cityName.value,
        remark: formData.remark.value,
        contactNo: formData.contactNo.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await groupServices.update(id!, groupData)
        : await groupServices.create(groupData);
      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.groupsViewPath);
      }, 1500);
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast.error(error.message || "Failed to save group");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.groupsViewPath);
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
        title={isEdit ? strings.EDIT_GROUP : strings.ADD_GROUP}
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
                  label={strings.GROUP_TYPE}
                  value={formData.groupType.value}
                  onChange={handleInputChange("groupType")}
                  onBlur={handleBlur("groupType")}
                  required
                  placeholder="Enter group type (e.g., Manipur Police)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.groupType.error}
                />
              </div>

              <div>
                <Select
                  label={strings.STATE_NAME}
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
                  label={strings.CITY_NAME}
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
                <CustomInput
                  label={strings.CONTACT_NO}
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

              <div className="md:col-span-2">
                <CustomInput
                  label={strings.REMARK}
                  value={formData.remark.value}
                  onChange={handleInputChange("remark")}
                  onBlur={handleBlur("remark")}
                  required
                  placeholder="Enter remark"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.remark.error}
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
                    disabled={saving}
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

export default AddEditGroupForm;
