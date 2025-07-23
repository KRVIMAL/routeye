// Users services with complex account/group and role relationship mapping
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";
import { store } from "../../../../store";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface GroupInfo {
  _id: string;
  groupName: string;
}

interface UserData {
  _id: string;
  userId?: string;
  accountId?: string;
  groupId?: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNo: string;
  roleId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  group?: GroupInfo;
  fullName: string;
}

interface UsersListResponse {
  data: UserData[];
  pagination: {
    page: number;
    limit: number;
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

// Role interface for dropdown
export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  status: string;
}

// Group interface for dropdown
export interface Group {
  _id: string;
  groupName: string;
  groupType: string;
  stateName: string;
  cityName: string;
}

// Flattened Account interface for dropdown
export interface FlatAccount {
  _id: string;
  accountName: string;
  accountId: string;
  level: number;
  hierarchyPath: string;
}

// Account hierarchy response
interface AccountHierarchyResponse {
  _id: string;
  accountName: string;
  accountId: string;
  level: number;
  hierarchyPath: string;
  status: string;
  children: AccountHierarchyResponse[];
}

// Transform API user data to Row format
const transformUserToRow = (user: UserData): Row => ({
  id: user._id,
  userId: user.userId || "N/A",
  accountOrGroup: user.groupId ? user.group?.groupName || "N/A" : "Account",
  username: user.username,
  firstName: user.firstName,
  middleName: user.middleName,
  lastName: user.lastName,
  fullName:
    user.fullName ||
    `${user.firstName} ${user.middleName} ${user.lastName}`.trim(),
  email: user.email,
  contactNo: user.contactNo,
  userRole: "User", // This will be populated from role API
  status: user.status,
  createdTime: user.createdAt,
  updatedTime: user.updatedAt,
  inactiveTime: user.updatedAt,
  // Store IDs for edit functionality
  accountId: user.accountId,
  groupId: user.groupId,
  roleId: user.roleId,
});

// Flatten account hierarchy recursively
const flattenAccountHierarchy = (
  account: AccountHierarchyResponse,
  result: FlatAccount[] = []
): FlatAccount[] => {
  // Add current account
  result.push({
    _id: account._id,
    accountName: account.accountName,
    accountId: account.accountId,
    level: account.level,
    hierarchyPath: account.hierarchyPath,
  });

  // Recursively add children
  if (account.children && account.children.length > 0) {
    account.children.forEach((child) => {
      flattenAccountHierarchy(child, result);
    });
  }

  return result;
};

export const userServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<UsersListResponse> = await getRequest(
        urls.usersViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformUserToRow),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      throw new Error(error.message || "Failed to fetch users");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<UserData> = await getRequest(
        `${urls.usersViewPath}/${id}`
      );

      if (response.success) {
        return transformUserToRow(response.data);
      } else {
        throw new Error(response.message || "User not found");
      }
    } catch (error: any) {
      console.error("Error fetching user:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch user");
    }
  },

  create: async (
    userData: Partial<Row>
  ): Promise<{ user: Row; message: string }> => {
    try {
      const payload: any = {
        username: userData.username,
        firstName: userData.firstName,
        middleName: userData.middleName || "",
        lastName: userData.lastName,
        password: userData.password || "defaultPassword123", // You may want to handle this differently
        email: userData.email,
        contactNo: userData.contactNo,
        roleId: userData.roleId,
        status: userData.status || "active",
      };

      // Add either accountId or groupId based on selection
      if (userData.accountId) {
        payload.accountId = userData.accountId;
      } else if (userData.groupId) {
        payload.groupId = userData.groupId;
      }

      const response: ApiResponse<UserData> = await postRequest(
        urls.usersViewPath,
        payload
      );

      if (response.success) {
        return {
          user: transformUserToRow(response.data),
          message: response.message || "User created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Error creating user:", error.message);
      throw new Error(error.message || "Failed to create user");
    }
  },

  update: async (
    id: string | number,
    userData: Partial<Row>
  ): Promise<{ user: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (userData.username !== undefined) payload.username = userData.username;
      if (userData.firstName !== undefined)
        payload.firstName = userData.firstName;
      if (userData.middleName !== undefined)
        payload.middleName = userData.middleName;
      if (userData.lastName !== undefined) payload.lastName = userData.lastName;
      if (userData.email !== undefined) payload.email = userData.email;
      if (userData.contactNo !== undefined)
        payload.contactNo = userData.contactNo;
      if (userData.roleId !== undefined) payload.roleId = userData.roleId;
      if (userData.status !== undefined) payload.status = userData.status;

      // Handle account/group updates
      if (userData.accountId !== undefined) {
        payload.accountId = userData.accountId;
        // Remove groupId if switching to account
        payload.groupId = null;
      } else if (userData.groupId !== undefined) {
        payload.groupId = userData.groupId;
        // Remove accountId if switching to group
        payload.accountId = null;
      }

      const response: ApiResponse<UserData> = await patchRequest(
        `${urls.usersViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          user: transformUserToRow(response.data),
          message: response.message || "User updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Error updating user:", error.message);
      throw new Error(error.message || "Failed to update user");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<UserData> = await patchRequest(
        `${urls.usersViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "User inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate user");
      }
    } catch (error: any) {
      console.error("Error inactivating user:", error.message);
      throw new Error(error.message || "Failed to inactivate user");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return userServices.getAll(page, limit);
      }

      const response: ApiResponse<UsersListResponse> = await getRequest(
        `${urls.usersViewPath}/search`,
        {
          search: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformUserToRow),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching users:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },

  // Get Roles for dropdown
  getRoles: async (): Promise<Role[]> => {
    try {
      const response: ApiResponse<{ data: Role[] }> = await getRequest(
        urls.rolesViewPath,
        {
          page: 1,
          limit: 0, // Get all records
        }
      );

      if (response.success) {
        return response.data.data.filter((role) => role.status === "active");
      } else {
        throw new Error(response.message || "Failed to fetch roles");
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error.message);
      throw new Error(error.message || "Failed to fetch roles");
    }
  },

  // Get Groups for dropdown
  getGroups: async (): Promise<Group[]> => {
    try {
      const response: ApiResponse<{ data: Group[] }> = await getRequest(
        urls.groupsViewPath,
        {
          page: 1,
          limit: 0, // Get all records
        }
      );

      if (response.success) {
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      throw new Error(error.message || "Failed to fetch groups");
    }
  },

  // Get Account Hierarchy (flattened) for dropdown
  getAccountHierarchy: async (): Promise<FlatAccount[]> => {
    try {
      const response: ApiResponse<AccountHierarchyResponse> = await getRequest(
        `${urls.accountsViewPath}/${
          store.getState()?.auth?.user?.account?._id
        }/hierarchy-optimized`
      );

      if (response.success) {
        // Flatten the hierarchy to get all accounts on the same level
        const flatAccounts = flattenAccountHierarchy(response.data);
        return flatAccounts.filter((account) => account._id); // Filter out any invalid accounts
      } else {
        throw new Error(
          response.message || "Failed to fetch account hierarchy"
        );
      }
    } catch (error: any) {
      console.error("Error fetching account hierarchy:", error.message);
      throw new Error(error.message || "Failed to fetch account hierarchy");
    }
  },
};
