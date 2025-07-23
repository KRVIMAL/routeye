// Roles services with module permissions management
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface ModulePermission {
  _id?: string;
  module: string;
  permissions: string[];
}

interface RoleData {
  _id: string;
  name: string;
  roleId: string;
  displayName: string;
  description: string;
  modulePermissions: ModulePermission[];
  status: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface RolesListResponse {
  data: RoleData[];
  pagination: {
    page: string | number;
    limit: string;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Pagination response interface
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Module Permission for form
export interface ModulePermissionForm {
  module: string;
  permissions: string[];
}

// Available modules and permissions
export const AVAILABLE_MODULES = [
  "USER",
  "DEVICE",
  "VEHICLE",
  "DRIVER",
  "CLIENT",
  "TRANSPORTER",
  "CONTRACTOR",
  "VEHICLE_MASTER",
  "DEVICE_ONBOARDING",
  "GROUPS",
  "ROLES",
  "PRODUCT",
  "ORDER",
  "REPORT",
  "ACCOUNT",
  "DASHBOARD",
];

export const AVAILABLE_PERMISSIONS = [
  "VIEW",
  "ADD",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "IMPORT",
];

export const USER_ROLE_TYPES = [
  "Superadmin",
  "Admin",
  "Admin Assistant",
  "User",
  "Manager",
  "Operator",
];

// Transform API role data to Row format
const transformRoleToRow = (role: RoleData): Row => {
  // Format module permissions for display
  const modulesList = role.modulePermissions.map((mp) => mp.module).join(", ");
  const permissionsList = role.modulePermissions
    .map((mp) => `${mp.module}: ${mp.permissions.join(", ")}`)
    .join(" | ");

  return {
    roleId: role.roleId,
    id: role._id,
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    modulesList: modulesList,
    permissionsList: permissionsList,
    modulePermissions: role.modulePermissions, // Store for edit
    status: role.status,
    isSystem: role.isSystem,
    createdTime: role.createdAt,
    updatedTime: role.updatedAt,
    inactiveTime: role.updatedAt,
  };
};

export const roleServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<RolesListResponse> = await getRequest(
        urls.rolesViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformRoleToRow),
          total: response.data.pagination.total,
          page:
            typeof response.data.pagination.page === "string"
              ? parseInt(response.data.pagination.page)
              : response.data.pagination.page,
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch roles");
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error.message);
      throw new Error(error.message || "Failed to fetch roles");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<RoleData> = await getRequest(
        `${urls.rolesViewPath}/${id}`
      );

      if (response.success) {
        return transformRoleToRow(response.data);
      } else {
        throw new Error(response.message || "Role not found");
      }
    } catch (error: any) {
      console.error("Error fetching role:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch role");
    }
  },

  create: async (
    roleData: Partial<Row>
  ): Promise<{ role: Row; message: string }> => {
    try {
      const payload = {
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        modulePermissions: roleData.modulePermissions || [],
        status: roleData.status || "active",
      };

      const response: ApiResponse<RoleData> = await postRequest(
        urls.rolesViewPath,
        payload
      );

      if (response.success) {
        return {
          role: transformRoleToRow(response.data),
          message: response.message || "Role created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create role");
      }
    } catch (error: any) {
      console.error("Error creating role:", error.message);
      throw new Error(error.message || "Failed to create role");
    }
  },

  update: async (
    id: string | number,
    roleData: Partial<Row>
  ): Promise<{ role: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (roleData.displayName !== undefined)
        payload.displayName = roleData.displayName;
      if (roleData.description !== undefined)
        payload.description = roleData.description;
      if (roleData.modulePermissions !== undefined)
        payload.modulePermissions = roleData.modulePermissions;
      if (roleData.status !== undefined) payload.status = roleData.status;

      const response: ApiResponse<RoleData> = await patchRequest(
        `${urls.rolesViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          role: transformRoleToRow(response.data),
          message: response.message || "Role updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update role");
      }
    } catch (error: any) {
      console.error("Error updating role:", error.message);
      throw new Error(error.message || "Failed to update role");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<RoleData> = await patchRequest(
        `${urls.rolesViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Role inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate role");
      }
    } catch (error: any) {
      console.error("Error inactivating role:", error.message);
      throw new Error(error.message || "Failed to inactivate role");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return roleServices.getAll(page, limit);
      }

      // Implement search endpoint when available
      const response: ApiResponse<RolesListResponse> = await getRequest(
        `${urls.rolesViewPath}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformRoleToRow),
          total: response.data.pagination.total,
          page:
            typeof response.data.pagination.page === "string"
              ? parseInt(response.data.pagination.page)
              : response.data.pagination.page,
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching roles:", error.message);
      // Fallback to getAll if search endpoint doesn't exist
      return roleServices.getAll(page, limit);
    }
  },
};
