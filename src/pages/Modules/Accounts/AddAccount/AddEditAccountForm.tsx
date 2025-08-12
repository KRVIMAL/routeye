import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import { accountServices, Client } from "../services/accountsServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { store } from "../../../../store";
import { tabTitle } from "../../../../utils/tab-title";
import ProgressBar from "../../../../components/ui/ProgressBar";
import Button from "../../../../components/ui/Button";

// Form state type
interface AccountFormState {
  accountName: {
    value: string;
    error: string;
  };
  parentAccount: {
    value: string;
    error: string;
  };
  clientId: {
    value: string;
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): AccountFormState => ({
  accountName: {
    value: preState?.accountName || "",
    error: "",
  },
  parentAccount: {
    value: preState?.parentAccount || "",
    error: "",
  },
  clientId: {
    value: preState?.clientId || "",
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_ACCOUNT : strings.ADD_ACCOUNT);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AccountFormState>(
    initialFormState()
  );

  // Dropdown data
  const [clients, setClients] = useState<Client[]>([]);
  const [parentAccountName, setParentAccountName] = useState<string>("");
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.ACCOUNTS, href: urls.accountsViewPath, icon: FiUsers },
    {
      label: isEdit ? strings.EDIT_ACCOUNT : strings.ADD_ACCOUNT,
      isActive: true,
      icon: FiPlus,
    },
  ];

  // Update this function to count only required fields
  const calculateProgress = () => {
    // Define which fields are required
    const requiredFields = [
      "accountName",
      "clientId",
      "status",
    ] as (keyof AccountFormState)[];

    const filledRequiredFields = requiredFields.filter((fieldName) => {
      const field = formData[fieldName];
      const value = field.value;
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
    if (progress === 0) return "You are about to add a new account.";
    if (progress < 50)
      return "Please continue filling the required fields to proceed.";
    if (progress < 100)
      return "Almost done! Complete the remaining required fields.";
    return "All required fields completed! You can now save the account.";
  };

  // Add this helper function to check if form is complete
  const isFormComplete = () => {
    return calculateProgress() === 100;
  };

  useEffect(() => {
    const initializeForm = async () => {
      await loadDropdownData();

      if (isEdit && id) {
        const { state } = location;

        if (state?.accountData) {
          setFormData(initialFormState(state.accountData));
        } else {
          await loadAccount();
        }
      }
    };

    initializeForm();
  }, [isEdit, id, location]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [clientsData, hierarchyData] = await Promise.all([
        accountServices.getClients(),
        accountServices.getAccountHierarchy(),
      ]);

      setClients(clientsData);

      // Set parent account info from current user account
      const currentAccount = store.getState()?.auth?.user?.account;
      if (currentAccount) {
        setParentAccountName(currentAccount.accountName);
        setFormData((prev) => ({
          ...prev,
          parentAccount: {
            value: currentAccount._id,
            error: "",
          },
        }));
      }

      console.log("Dropdown data loaded:", {
        clients: clientsData.length,
        parentAccount: currentAccount?.accountName,
      });
    } catch (error: any) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadAccount = async () => {
    setLoading(true);
    try {
      const account = await accountServices.getById(id!);
      if (account) {
        console.log("Loaded account data:", account);
        setFormData(initialFormState(account));
      } else {
        navigate(urls.accountsViewPath);
      }
    } catch (error: any) {
      console.error("Error loading account:", error);
      toast.error(error.message || "Failed to fetch account");
      navigate(urls.accountsViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof AccountFormState) =>
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
    (field: keyof AccountFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value === null ? "" : (value as string), // Convert null to empty string
          error: "",
        },
      }));
    };

  const handleBlur = (field: keyof AccountFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "accountName":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Account Name is required";
        }
        break;
      case "clientId":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Client is required";
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
    const errors: Partial<AccountFormState> = {};
    let isValid = true;

    // Account Name validation
    if (!formData.accountName.value.trim()) {
      errors.accountName = {
        ...formData.accountName,
        error: "Account Name is required",
      };
      isValid = false;
    }

    // Client validation
    if (!formData.clientId.value.trim()) {
      errors.clientId = { ...formData.clientId, error: "Client is required" };
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
      const accountData = {
        accountName: formData.accountName.value,
        parentAccount: store.getState()?.auth?.user?.account?._id,
        clientId: formData.clientId.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await accountServices.update(id!, accountData)
        : await accountServices.create(accountData);
      toast.success(result.message);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate(urls.accountsViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving account:", error);
      toast.error(error.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.accountsViewPath);
  };

  // Create options for client dropdown
  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.clientId || "N/A"} - ${client.name}`,
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
        title={isEdit ? strings.EDIT_ACCOUNT : strings.ADD_ACCOUNT}
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
                {/* Parent Account - Read Only */}
                <div>
                  <CustomInput
                    label={strings.PARENT_ACCOUNT}
                    value={store.getState()?.auth?.user?.account?.accountName}
                    onChange={() => {}} // Read only
                    required={false}
                    placeholder="Parent account will be auto-selected"
                    disabled={true}
                    autoValidate={false}
                    error=""
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Parent account is automatically determined
                  </p>
                </div>

                <div>
                  <CustomInput
                    label={strings.ACCOUNT_NAME}
                    value={formData.accountName.value}
                    onChange={handleInputChange("accountName")}
                    onBlur={handleBlur("accountName")}
                    required
                    placeholder="Enter account name"
                    disabled={saving || loadingDropdowns}
                    autoValidate={false}
                    error={formData.accountName.error}
                  />
                </div>

                <div className="md:col-span-2">
                  <Select
                    label={strings.CLIENT_SELECTION}
                    options={clientOptions}
                    value={formData.clientId.value}
                    onChange={handleSelectChange("clientId")}
                    placeholder="Select Client (ID - Name)"
                    required
                    disabled={saving || loadingDropdowns}
                    error={formData.clientId.error}
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

              {/* Information Section */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Account Information
                </h4>
                <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <p>
                    • Parent Account: Automatically determined from account
                    hierarchy
                  </p>
                  <p>• Client: Select the client associated with this account</p>
                  <p>
                    • Account will be created under the current account's
                    hierarchy
                  </p>
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

export default AddEditAccountForm;