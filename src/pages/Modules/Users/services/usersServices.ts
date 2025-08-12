// usersServices.ts - Fixed Implementation with Filter API Integration
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
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
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    statuses?: Array<{ _id: string; count: number }>;
    accountNames?: Array<{ _id: string; count: number }>;
    groupNames?: Array<{ _id: string; count: number }>;
    roleNames?: Array<{ _id: string; count: number }>;
    usernames?: Array<{ _id: string; count: number }>;
    emails?: Array<{ _id: string; count: number }>;
    contactNos?: Array<{ _id: string; count: number }>;
    firstNames?: Array<{ _id: string; count: number }>;
    lastNames?: Array<{ _id: string; count: number }>;
    userIds?: Array<{ _id: string; count: number }>;
  };
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterOptionsResponse {
  options: FilterOption[];
  total: number;
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

// Filter interface
interface Filter {
  field: string;
  value: any[];
  label?: string;
}

interface FilterSummaryResponse {
  totalUsers: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  accountNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  groupNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  roleNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  twoFAStatuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
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
  // Updated getAll method - now uses filter API exclusively
  getAll: async (
    page: number = 1,
    limit: number = 10,
    searchText?: string,
    sortField?: string,
    sortDirection?: "asc" | "desc",
    filters?: Filter[]
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const payload: any = {
        page,
        limit,
      };

      // Add search if provided
      if (searchText && searchText.trim()) {
        payload.searchText = searchText.trim();
      }

      // Add sorting if provided
      if (sortField && sortDirection) {
        payload.sortBy = sortField;
        payload.sortOrder = sortDirection;
      }

      // Transform filters to the API format
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          switch (filter.field) {
            case "status":
              payload.statuses = filter.value;
              break;
            case "accountOrGroup":
              // This is complex - might need to split into accounts/groups
              payload.accountNames = filter.value;
              break;
            case "username":
              payload.usernames = filter.value;
              break;
            case "firstName":
              payload.firstNames = filter.value;
              break;
            case "lastName":
              payload.lastNames = filter.value;
              break;
            case "email":
              payload.emails = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "userRole":
              payload.roleNames = filter.value;
              break;
            case "userId":
              payload.userIds = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<UsersListResponse> = await postRequest(
        `${urls.usersViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformUserToRow),
          total: response.data.pagination.total,
          page:
            typeof response.data.pagination.page === "string"
              ? parseInt(response.data.pagination.page)
              : response.data.pagination.page,
          limit:
            typeof response.data.pagination.limit === "string"
              ? parseInt(response.data.pagination.limit)
              : response.data.pagination.limit,
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

  // Get filter options for a specific column
  getFilterOptions: async (
    column: string,
    searchText?: string,
    limit: number = 10
  ): Promise<FilterOption[]> => {
    try {
      const params: any = { column, limit };

      if (searchText && searchText.trim()) {
        params.search = searchText.trim();
      }

      const response: ApiResponse<FilterOptionsResponse> = await getRequest(
        `${urls.usersViewPath}/filter-options`,
        params
      );

      if (response.success) {
        return response.data.options;
      } else {
        throw new Error(response.message || "Failed to fetch filter options");
      }
    } catch (error: any) {
      console.error("Error fetching filter options:", error.message);
      throw new Error(error.message || "Failed to fetch filter options");
    }
  },

  // Helper method to parse filter counts from filter API response
  parseFilterCounts: (filterCounts: any, field: string): FilterOption[] => {
    const fieldMapping: { [key: string]: string } = {
      status: "statuses",
      accountOrGroup: "accountNames",
      username: "usernames",
      firstName: "firstNames",
      lastName: "lastNames",
      email: "emails",
      contactNo: "contactNos",
      userRole: "roleNames",
      userId: "userIds",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
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
        password: userData.password || "defaultPassword123",
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

      const response: ApiResponse<UserData> = await putRequest(
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
      const response: ApiResponse<any> = await patchRequest(
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

  // Export users - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.usersViewPath}/export`;
      let requestOptions: RequestInit = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      // If filters exist, use POST method with filter data
      if (filters && filters.length > 0) {
        const payload: any = {};

        filters.forEach((filter) => {
          switch (filter.field) {
            case "status":
              payload.statuses = filter.value;
              break;
            case "accountOrGroup":
              payload.accountNames = filter.value;
              break;
            case "username":
              payload.usernames = filter.value;
              break;
            case "firstName":
              payload.firstNames = filter.value;
              break;
            case "lastName":
              payload.lastNames = filter.value;
              break;
            case "email":
              payload.emails = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "userRole":
              payload.roleNames = filter.value;
              break;
            case "userId":
              payload.userIds = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });

        requestOptions = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        };

        url = `${urls.usersViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting users:", error.message);
      throw new Error(error.message || "Failed to export users");
    }
  },

  // Import users
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.usersViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Users imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import users");
      }
    } catch (error: any) {
      console.error("Error importing users:", error.message);
      throw new Error(error.message || "Failed to import users");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.usersViewPath}/filter-summary`
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch filter summary");
      }
    } catch (error: any) {
      console.error("Error fetching filter summary:", error.message);
      throw new Error(error.message || "Failed to fetch filter summary");
    }
  },

  // Legacy search method for backwards compatibility
  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    // Use the new getAll method with search parameter
    return userServices.getAll(page, limit, searchText);
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