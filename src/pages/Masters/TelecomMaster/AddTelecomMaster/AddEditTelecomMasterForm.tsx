import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiPhone, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { telecomMasterServices } from "../services/telecomMaster.services";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface TelecomMasterFormState {
  ccidNumber: {
    value: string;
    error: string;
  };
  imsiNumber: {
    value: string;
    error: string;
  };
  telecomOperator: {
    value: string;
    error: string;
  };
  simType: {
    value: string;
    error: string;
  };
  noOfNetwork: {
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
  networkSupport: {
    value: string;
    error: string;
  };
  apn1: {
    value: string;
    error: string;
  };
  apn2: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): TelecomMasterFormState => ({
  ccidNumber: {
    value: preState?.ccidNumber || "",
    error: "",
  },
  imsiNumber: {
    value: preState?.imsiNumber || "",
    error: "",
  },
  telecomOperator: {
    value: preState?.telecomOperator || "",
    error: "",
  },
  simType: {
    value: preState?.simType || "",
    error: "",
  },
  noOfNetwork: {
    value: preState?.noOfNetwork?.toString() || "1",
    error: "",
  },
  mobileNo1: {
    value: preState?.mobileNo1 || "",
    error: "",
  },
  mobileNo2: {
    value: preState?.mobileNo2 === "N/A" ? "" : preState?.mobileNo2 || "",
    error: "",
  },
  networkSupport: {
    value: preState?.networkSupport || "",
    error: "",
  },
  apn1: {
    value: preState?.apn1 || "",
    error: "",
  },
  apn2: {
    value: preState?.apn2 === "N/A" ? "" : preState?.apn2 || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditTelecomMasterForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(
    isEdit === true ? strings.EDIT_TELECOM_MASTER : strings.ADD_TELECOM_MASTER
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormState());

  const telecomOperatorOptions = [
    { value: "Jio", label: "Reliance Jio" },
    { value: "Airtel", label: "Bharti Airtel" },
    { value: "Vodafone", label: "Vodafone Idea" },
    { value: "BSNL", label: "BSNL" },
    { value: "MTNL", label: "MTNL" },
  ];

  const simTypeOptions = [
    { value: "prepaid", label: "Prepaid" },
    { value: "postpaid", label: "Postpaid" },
  ];

  const networkOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
  ];

  const networkSupportOptions = [
    { value: "GSM", label: "GSM" },
    { value: "LTE", label: "LTE" },
    { value: "5G", label: "5G" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    {
      label: strings.TELECOM_MASTER,
      href: urls.telecomMasterViewPath,
      icon: FiPhone,
    },
    {
      label: isEdit ? strings.EDIT_TELECOM_MASTER : strings.ADD_TELECOM_MASTER,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      // Get data from navigation state first, fallback to API
      const { state } = location;
      console.log({ state });

      if (state?.telecomData) {
        setFormData(initialFormState(state.telecomData));
      } else {
        loadTelecomMaster(); // Only call API if no data passed
      }
    }
  }, [isEdit, id, location]);

  const loadTelecomMaster = async () => {
    setLoading(true);
    try {
      const telecom = await telecomMasterServices.getById(id!);
      if (telecom) {
        setFormData(initialFormState(telecom));
      } else {
        navigate(urls.telecomMasterViewPath);
      }
    } catch (error: any) {
      console.error("Error loading telecom master:", error);
      toast.error(error.message || "Failed to fetch telecom master");
      navigate(urls.telecomMasterViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof TelecomMasterFormState) => (e: React.ChangeEvent | any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: e.target.value,
          error: "", // Clear error when user types
        },
      }));
    };

  const handleSelectChange =
    (field: keyof TelecomMasterFormState) =>
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
  const handleBlur = (field: keyof TelecomMasterFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "ccidNumber":
        if (!value.trim()) {
          error = "CCID Number is required";
        } else if (value.length < 19 || value.length > 22) {
          error = "CCID Number should be 19-22 characters";
        }
        break;
      case "imsiNumber":
        if (!value.trim()) {
          error = "IMSI Number is required";
        } else if (value.length !== 15) {
          error = "IMSI Number should be 15 digits";
        }
        break;
      case "telecomOperator":
        if (!value.trim()) error = "Telecom Operator is required";
        break;
      case "simType":
        if (!value.trim()) error = "SIM Type is required";
        break;
      case "noOfNetwork":
        if (!value.trim()) error = "Number of Network is required";
        break;
      case "mobileNo1":
        if (!value.trim()) {
          error = "Mobile No 1 is required";
        } else {
          const mobileRegex = /^[6-9]\d{9}$/;
          if (!mobileRegex.test(value)) {
            error = "Invalid mobile number format (+91xxxxxxxxxx)";
          }
        }
        break;
      case "mobileNo2":
        if (value.trim()) {
          const mobileRegex = /^[6-9]\d{9}$/;
          if (!mobileRegex.test(value)) {
            error = "Invalid mobile number format (+91xxxxxxxxxx)";
          }
        }
        break;
      case "networkSupport":
        if (!value.trim()) error = "Network Support is required";
        break;
      case "apn1":
        if (!value.trim()) error = "APN 1 is required";
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
    const errors: Partial<TelecomMasterFormState> = {};
    let isValid = true;

    // CCID Number validation
    if (!formData.ccidNumber.value.trim()) {
      errors.ccidNumber = {
        ...formData.ccidNumber,
        error: "CCID Number is required",
      };
      isValid = false;
    } else if (
      formData.ccidNumber.value.length < 19 ||
      formData.ccidNumber.value.length > 22
    ) {
      errors.ccidNumber = {
        ...formData.ccidNumber,
        error: "CCID Number should be 19-22 characters",
      };
      isValid = false;
    }

    // IMSI Number validation
    if (!formData.imsiNumber.value.trim()) {
      errors.imsiNumber = {
        ...formData.imsiNumber,
        error: "IMSI Number is required",
      };
      isValid = false;
    } else if (formData.imsiNumber.value.length !== 15) {
      errors.imsiNumber = {
        ...formData.imsiNumber,
        error: "IMSI Number should be 15 digits",
      };
      isValid = false;
    }

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

    // Number of Network validation
    if (!formData.noOfNetwork.value.trim()) {
      errors.noOfNetwork = {
        ...formData.noOfNetwork,
        error: "Number of Network is required",
      };
      isValid = false;
    }

    // Mobile No 1 validation
    if (!formData.mobileNo1.value.trim()) {
      errors.mobileNo1 = {
        ...formData.mobileNo1,
        error: "Mobile No 1 is required",
      };
      isValid = false;
    } else {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobileNo1.value)) {
        errors.mobileNo1 = {
          ...formData.mobileNo1,
          error: "Invalid mobile number format (+91xxxxxxxxxx)",
        };
        isValid = false;
      }
    }

    // Mobile No 2 validation (optional)
    if (formData.mobileNo2.value.trim()) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobileNo2.value)) {
        errors.mobileNo2 = {
          ...formData.mobileNo2,
          error: "Invalid mobile number format (+91xxxxxxxxxx)",
        };
        isValid = false;
      }
    }

    // Network Support validation
    if (!formData.networkSupport.value.trim()) {
      errors.networkSupport = {
        ...formData.networkSupport,
        error: "Network Support is required",
      };
      isValid = false;
    }

    // APN 1 validation
    if (!formData.apn1.value.trim()) {
      errors.apn1 = {
        ...formData.apn1,
        error: "APN 1 is required",
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
      const telecomData = {
        ccidNumber: formData.ccidNumber.value,
        imsiNumber: formData.imsiNumber.value,
        telecomOperator: formData.telecomOperator.value,
        simType: formData.simType.value,
        noOfNetwork: formData.noOfNetwork.value,
        mobileNo1: formData.mobileNo1.value,
        mobileNo2: formData.mobileNo2.value || undefined,
        networkSupport: formData.networkSupport.value,
        apn1: formData.apn1.value,
        apn2: formData.apn2.value || undefined,
        status: formData.status.value,
      };

      const result = isEdit
        ? await telecomMasterServices.update(id!, telecomData)
        : await telecomMasterServices.create(telecomData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.telecomMasterViewPath);
      }, 1500);
    } catch (error: any) {
      console.error("Error saving telecom master:", error);
      toast.error(error.message || "Failed to save telecom master");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.telecomMasterViewPath);
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
        title={
          isEdit ? strings.EDIT_TELECOM_MASTER : strings.ADD_TELECOM_MASTER
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CustomInput
                  label={strings.CCID_NUMBER}
                  value={formData.ccidNumber.value}
                  onChange={handleInputChange("ccidNumber")}
                  onBlur={handleBlur("ccidNumber")}
                  maxLength={20}
                  required
                  placeholder="Enter CCID number"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.ccidNumber.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.IMSI_NUMBER}
                  value={formData.imsiNumber.value}
                  onChange={handleInputChange("imsiNumber")}
                  onBlur={handleBlur("imsiNumber")}
                  maxLength={15}
                  required
                  placeholder="Enter IMSI number"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.imsiNumber.error}
                />
              </div>

              <div>
                <Select
                  label={strings.TELECOM_OPERATOR}
                  options={telecomOperatorOptions}
                  value={formData.telecomOperator.value}
                  onChange={handleSelectChange("telecomOperator")}
                  placeholder="Select Telecom Operator"
                  required
                  disabled={saving}
                  error={formData.telecomOperator.error}
                />
              </div>

              <div>
                <Select
                  label={strings.SIM_TYPE}
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
                  label={strings.NO_OF_NETWORK}
                  options={networkOptions}
                  value={formData.noOfNetwork.value}
                  onChange={handleSelectChange("noOfNetwork")}
                  placeholder="Select Number of Networks"
                  required
                  disabled={saving}
                  error={formData.noOfNetwork.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.MOBILE_NO_1}
                  value={formData.mobileNo1.value}
                  onChange={handleInputChange("mobileNo1")}
                  onBlur={handleBlur("mobileNo1")}
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.mobileNo1.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.MOBILE_NO_2}
                  value={formData.mobileNo2.value}
                  onChange={handleInputChange("mobileNo2")}
                  onBlur={handleBlur("mobileNo2")}
                  maxLength={10}
                  placeholder="9876543211 (Optional)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.mobileNo2.error}
                />
              </div>

              <div>
                <Select
                  label={strings.NETWORK_SUPPORT}
                  options={networkSupportOptions}
                  value={formData.networkSupport.value}
                  onChange={handleSelectChange("networkSupport")}
                  placeholder="Select Network Support"
                  required
                  disabled={saving}
                  error={formData.networkSupport.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.APN_1}
                  value={formData.apn1.value}
                  onChange={handleInputChange("apn1")}
                  onBlur={handleBlur("apn1")}
                  required
                  placeholder="Enter APN 1"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.apn1.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.APN_2}
                  value={formData.apn2.value}
                  onChange={handleInputChange("apn2")}
                  onBlur={handleBlur("apn2")}
                  placeholder="Enter APN 2 (Optional)"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.apn2.error}
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

export default AddEditTelecomMasterForm;
