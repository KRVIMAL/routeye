import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiHome, FiShield, FiPlus } from "react-icons/fi";
import ModuleHeader from "../../../../components/ui/ModuleHeader";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  roleServices,
  AVAILABLE_MODULES,
  AVAILABLE_PERMISSIONS,
  USER_ROLE_TYPES,
  ModulePermissionForm,
} from "../services/rolesServices";
import strings from "../../../../global/constants/StringConstants";
import urls from "../../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../../utils/tab-title";

// Form state type
interface RoleFormState {
  name: {
    value: string;
    error: string;
  };
  displayName: {
    value: string;
    error: string;
  };
  description: {
    value: string;
    error: string;
  };
  modulePermissions: {
    value: ModulePermissionForm[];
    error: string;
  };
  status: {
    value: string;
    error: string;
  };
}

// Initial form state
const initialFormState = (preState?: any): RoleFormState => ({
  name: {
    value: preState?.name || "",
    error: "",
  },
  displayName: {
    value: preState?.displayName || "",
    error: "",
  },
  description: {
    value: preState?.description || "",
    error: "",
  },
  modulePermissions: {
    value: preState?.modulePermissions || [],
    error: "",
  },
  status: {
    value: preState?.status || "active",
    error: "",
  },
});

const AddEditRoleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  tabTitle(isEdit === true ? strings.EDIT_ROLE : strings.ADD_ROLE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<RoleFormState>(initialFormState());

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // const roleTypeOptions = USER_ROLE_TYPES.map((type) => ({
  //   value: type.toLowerCase().replace(/\s+/g, "_"),
  //   label: type,
  // }));

  const moduleOptions = AVAILABLE_MODULES.map((module) => ({
    value: module,
    label: module.replace(/_/g, " "),
  }));

  const permissionOptions = AVAILABLE_PERMISSIONS.map((permission) => ({
    value: permission,
    label: permission,
  }));

  const breadcrumbs = [
    { label: strings.HOME, href: urls.landingViewPath, icon: FiHome },
    { label: strings.ROLES, href: urls.rolesViewPath, icon: FiShield },
    {
      label: isEdit ? strings.EDIT_ROLE : strings.ADD_ROLE,
      isActive: true,
      icon: FiPlus,
    },
  ];

  useEffect(() => {
    if (isEdit && id) {
      const { state } = location;

      if (state?.roleData) {
        setFormData(initialFormState(state.roleData));
      } else {
        loadRole();
      }
    }
  }, [isEdit, id, location]);

  const loadRole = async () => {
    setLoading(true);
    try {
      const role = await roleServices.getById(id!);
      if (role) {
        setFormData(initialFormState(role));
      } else {
        navigate(urls.rolesViewPath);
      }
    } catch (error: any) {
      console.error("Error loading role:", error);
      toast.error(error.message || "Failed to fetch role");
      navigate(urls.rolesViewPath);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof RoleFormState) =>
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
    (field: keyof RoleFormState) => (value: string | string[] | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          value: value as string,
          error: "",
        },
      }));
    };

  // Handle module permission changes
  const addModulePermission = () => {
    setFormData((prev) => ({
      ...prev,
      modulePermissions: {
        value: [
          ...prev.modulePermissions.value,
          { module: "", permissions: [] },
        ],
        error: "",
      },
    }));
  };

  const removeModulePermission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modulePermissions: {
        value: prev.modulePermissions.value.filter((_, i) => i !== index),
        error: "",
      },
    }));
  };

  const updateModulePermission = (
    index: number,
    field: "module" | "permissions",
    value: string | string[]
  ) => {
    setFormData((prev) => {
      const updated = [...prev.modulePermissions.value];
      if (field === "module") {
        updated[index] = { ...updated[index], module: value as string };
      } else {
        updated[index] = { ...updated[index], permissions: value as string[] };
      }
      return {
        ...prev,
        modulePermissions: {
          value: updated,
          error: "",
        },
      };
    });
  };

  const getAvailableModulesForIndex = (currentIndex: number) => {
    const selectedModules = formData.modulePermissions.value
      .map((mp, index) => (index !== currentIndex ? mp.module : null))
      .filter((module) => module && module.trim() !== "");

    return moduleOptions.filter(
      (option) => !selectedModules.includes(option.value)
    );
  };

  const handleBlur = (field: keyof RoleFormState) => () => {
    const value = formData[field].value;
    let error = "";

    switch (field) {
      case "name":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Role Name is required";
        }
        break;
      case "displayName":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Display Name is required";
        }
        break;
      case "description":
        if (!value || (typeof value === "string" && !value.trim())) {
          error = "Description is required";
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
    const errors: Partial<RoleFormState> = {};
    let isValid = true;

    // Role Name validation
    if (!formData.name.value.trim()) {
      errors.name = { ...formData.name, error: "Role Name is required" };
      isValid = false;
    }

    // Display Name validation
    if (!formData.displayName.value.trim()) {
      errors.displayName = {
        ...formData.displayName,
        error: "Display Name is required",
      };
      isValid = false;
    }

    // Description validation
    if (!formData.description.value.trim()) {
      errors.description = {
        ...formData.description,
        error: "Description is required",
      };
      isValid = false;
    }

    // Module Permissions validation
    if (formData.modulePermissions.value.length === 0) {
      errors.modulePermissions = {
        ...formData.modulePermissions,
        error: "At least one module permission is required",
      };
      isValid = false;
    } else {
      // Validate each module permission
      for (let i = 0; i < formData.modulePermissions.value.length; i++) {
        const mp = formData.modulePermissions.value[i];
        if (!mp.module || mp.permissions.length === 0) {
          errors.modulePermissions = {
            ...formData.modulePermissions,
            error:
              "All module permissions must have a module and at least one permission selected",
          };
          isValid = false;
          break;
        }
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
      const roleData = {
        name: formData.name.value,
        displayName: formData.displayName.value,
        description: formData.description.value,
        modulePermissions: formData.modulePermissions.value,
        status: formData.status.value,
      };

      const result = isEdit
        ? await roleServices.update(id!, roleData)
        : await roleServices.create(roleData);
      toast.success(result.message);

      setTimeout(() => {
        navigate(urls.rolesViewPath);
      }, 1300);
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast.error(error.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(urls.rolesViewPath);
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
        title={isEdit ? strings.EDIT_ROLE : strings.ADD_ROLE}
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
                  label={strings.ROLE_NAME}
                  value={formData.name.value}
                  onChange={handleInputChange("name")}
                  onBlur={handleBlur("name")}
                  required
                  placeholder="Enter role name"
                  disabled={
                    saving || (isEdit && formData.name.value === "superadmin")
                  }
                  autoValidate={false}
                  error={formData.name.error}
                />
              </div>

              <div>
                <CustomInput
                  label={strings.DISPLAY_NAME}
                  value={formData.displayName.value}
                  onChange={handleInputChange("displayName")}
                  onBlur={handleBlur("displayName")}
                  required
                  placeholder="Enter display name"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.displayName.error}
                />
              </div>

              <div className="md:col-span-2">
                <CustomInput
                  label={strings.DESCRIPTION}
                  value={formData.description.value}
                  onChange={handleInputChange("description")}
                  onBlur={handleBlur("description")}
                  required
                  placeholder="Enter role description"
                  disabled={saving}
                  autoValidate={false}
                  error={formData.description.error}
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

            {/* Module Permissions Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Module Permissions
                </h3>
                <button
                  type="button"
                  onClick={addModulePermission}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Add Module
                </button>
              </div>

              {formData.modulePermissions.error && (
                <div className="text-red-600 text-sm mb-4">
                  {formData.modulePermissions.error}
                </div>
              )}

              <div className="space-y-4">
                {formData.modulePermissions.value.map(
                  (modulePermission, index) => (
                    <div
                      key={index}
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4
                          className="text-md font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Module Permission {index + 1}
                        </h4>
                        {formData.modulePermissions.value.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModulePermission(index)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Select
                            label="Module"
                            options={getAvailableModulesForIndex(index)}
                            value={modulePermission.module}
                            onChange={(value) =>
                              updateModulePermission(
                                index,
                                "module",
                                value as string
                              )
                            }
                            placeholder="Select Module"
                            required
                            disabled={saving}
                          />
                        </div>

                        <div>
                          <Select
                            label="Permissions"
                            options={permissionOptions}
                            value={modulePermission.permissions}
                            onChange={(value) =>
                              updateModulePermission(
                                index,
                                "permissions",
                                value as string[]
                              )
                            }
                            placeholder="Select Permissions"
                            multiple
                            required
                            disabled={saving}
                            helper="You can select multiple permissions"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {formData.modulePermissions.value.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No module permissions added. Click "Add Module" to get
                  started.
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddEditRoleForm;
