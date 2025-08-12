// groupServices.ts - Fixed Implementation with Filter API Integration
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface GroupData {
  _id: string;
  groupMasterId: string;
  groupType: string;
  stateName: string;
  cityName: string;
  remark: string;
  contactNo: string;
  status: string;
  createdTime: string;
  updatedTime: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GroupsListResponse {
  data: GroupData[];
  pagination: {
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    groupTypes?: Array<{ _id: string; count: number }>;
    statuses?: Array<{ _id: string; count: number }>;
    stateNames?: Array<{ _id: string; count: number }>;
    cityNames?: Array<{ _id: string; count: number }>;
    groupMasterIds?: Array<{ _id: string; count: number }>;
    contactNos?: Array<{ _id: string; count: number }>;
    remarks?: Array<{ _id: string; count: number }>;
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
  totalGroupMasters: number;
  groupTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  stateNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  cityNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Transform API group data to Row format
const transformGroupToRow = (group: GroupData): Row => ({
  id: group._id,
  groupMasterId: group.groupMasterId,
  groupType: group.groupType,
  stateName: group.stateName,
  cityName: group.cityName,
  remark: group.remark,
  contactNo: group.contactNo,
  status: group.status,
  createdTime: group.createdTime || group.createdAt,
  updatedTime: group.updatedTime || group.updatedAt,
  inactiveTime: group.updatedTime || group.updatedAt,
});

export const groupServices = {
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
            case "groupType":
              payload.groupTypes = filter.value;
              break;
            case "stateName":
              payload.stateNames = filter.value;
              break;
            case "cityName":
              payload.cityNames = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "groupMasterId":
              payload.groupMasterIds = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "remark":
              payload.remarks = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<GroupsListResponse> = await postRequest(
        `${urls.groupModuleViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformGroupToRow),
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
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      throw new Error(error.message || "Failed to fetch groups");
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
        `${urls.groupModuleViewPath}/filter-options`,
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
      groupType: "groupTypes",
      stateName: "stateNames",
      cityName: "cityNames",
      status: "statuses",
      groupMasterId: "groupMasterIds",
      contactNo: "contactNos",
      remark: "remarks",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get group by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<GroupData> = await getRequest(
        `${urls.groupModuleViewPath}/${id}`
      );

      if (response.success) {
        return transformGroupToRow(response.data);
      } else {
        throw new Error(response.message || "Group not found");
      }
    } catch (error: any) {
      console.error("Error fetching group:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch group");
    }
  },

  // Create new group
  create: async (
    groupData: Partial<Row>
  ): Promise<{ group: Row; message: string }> => {
    try {
      const payload = {
        groupType: groupData.groupType,
        stateName: groupData.stateName,
        cityName: groupData.cityName,
        remark: groupData.remark,
        contactNo: groupData.contactNo,
        status: groupData.status || "active",
      };

      const response: ApiResponse<GroupData> = await postRequest(
        urls.groupModuleViewPath,
        payload
      );

      if (response.success) {
        return {
          group: transformGroupToRow(response.data),
          message: response.message || "Group created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create group");
      }
    } catch (error: any) {
      console.error("Error creating group:", error.message);
      throw new Error(error.message || "Failed to create group");
    }
  },

  // Update group
  update: async (
    id: string | number,
    groupData: Partial<Row>
  ): Promise<{ group: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (groupData.groupType !== undefined)
        payload.groupType = groupData.groupType;
      if (groupData.stateName !== undefined)
        payload.stateName = groupData.stateName;
      if (groupData.cityName !== undefined)
        payload.cityName = groupData.cityName;
      if (groupData.remark !== undefined) payload.remark = groupData.remark;
      if (groupData.contactNo !== undefined)
        payload.contactNo = groupData.contactNo;
      if (groupData.status !== undefined) payload.status = groupData.status;

      const response: ApiResponse<GroupData> = await putRequest(
        `${urls.groupModuleViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          group: transformGroupToRow(response.data),
          message: response.message || "Group updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update group");
      }
    } catch (error: any) {
      console.error("Error updating group:", error.message);
      throw new Error(error.message || "Failed to update group");
    }
  },

  // Inactivate group (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.groupModuleViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Group inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate group");
      }
    } catch (error: any) {
      console.error("Error inactivating group:", error.message);
      throw new Error(error.message || "Failed to inactivate group");
    }
  },

  // Export groups - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.groupModuleViewPath}/export`;
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
            case "groupType":
              payload.groupTypes = filter.value;
              break;
            case "stateName":
              payload.stateNames = filter.value;
              break;
            case "cityName":
              payload.cityNames = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "groupMasterId":
              payload.groupMasterIds = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "remark":
              payload.remarks = filter.value;
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

        url = `${urls.groupModuleViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting groups:", error.message);
      throw new Error(error.message || "Failed to export groups");
    }
  },

  // Import groups
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.groupModuleViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Groups imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import groups");
      }
    } catch (error: any) {
      console.error("Error importing groups:", error.message);
      throw new Error(error.message || "Failed to import groups");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.groupModuleViewPath}/filter-summary`
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
    return groupServices.getAll(page, limit, searchText);
  },
};