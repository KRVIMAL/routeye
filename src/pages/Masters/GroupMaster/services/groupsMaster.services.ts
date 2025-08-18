// groupsMaster.services.ts - Fixed Implementation with Filter API Integration
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

interface GroupModuleInfo {
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

interface ImeiDevice {
  _id: string;
  deviceOnboardingId: string;
  account: string;
  deviceIMEI: string;
  deviceSerialNo: string;
  simNo1: string;
  simNo2: string;
  simNo1Operator: string;
  simNo2Operator: string;
  vehicleDescription: string;
  vehicle: string;
  driver: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GroupMasterData {
  _id: string;
  groupId: string;
  groupName: string;
  groupModule: GroupModuleInfo[] | string; // Can be populated array or just ID
  imei: ImeiDevice[] | string[]; // Can be populated array or just IDs
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GroupMastersListResponse {
  data: GroupMasterData[];
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
    groupNames?: Array<{ _id: string; count: number }>;
    groupIds?: Array<{ _id: string; count: number }>;
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

// Date Filter interface
interface DateFilter {
  dateField: string;
  dateFilterType: string;
  fromDate?: string;
  toDate?: string;
  customValue?: number;
  selectedDates?: Date[];
  isPickAnyDate?: boolean;
}

// Filter interface - Updated to support date filters
interface Filter {
  field: string;
  value: any[];
  label?: string;
  type?: "regular" | "date";
  dateFilter?: DateFilter;
}

interface FilterSummaryResponse {
  totalGroups: number;
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
  deviceCounts: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Group Module interface for dropdown
export interface GroupModuleForDropdown {
  _id: string;
  groupMasterId: string;
  groupType: string;
  stateName: string;
  cityName: string;
  status: string;
}

// Device for IMEI dropdown
export interface DeviceForImei {
  _id: string;
  deviceIMEI: string;
  deviceSerialNo: string;
  vehicleDescription: string;
}

// Transform API group master data to Row format
const transformGroupMasterToRow = (groupMaster: GroupMasterData): Row => {
  // Handle Group Module - extract group type for display and ID for edit
  let groupType = "N/A";
  let groupModuleId = "";

  if (
    Array.isArray(groupMaster.groupModule) &&
    groupMaster.groupModule.length > 0
  ) {
    // Populated object
    const groupModuleInfo = groupMaster.groupModule[0] as GroupModuleInfo;
    groupType = groupModuleInfo.groupType;
    groupModuleId = groupModuleInfo._id;
  } else if (typeof groupMaster.groupModule === "string") {
    // Just ID
    groupModuleId = groupMaster.groupModule;
    groupType = "Loading...";
  }

  // Handle IMEI array - extract IMEIs for display and IDs for edit
  let imeiDisplay = "N/A";
  let imeiIds: string[] = [];
  let stateName = "N/A";
  let cityName = "N/A";
  let remark = "N/A";
  let contactNo = "N/A";

  if (Array.isArray(groupMaster.imei)) {
    if (groupMaster.imei.length > 0) {
      // Check if items have deviceIMEI (populated) or are just strings (IDs)
      if (
        typeof groupMaster.imei[0] === "object" &&
        "deviceIMEI" in groupMaster.imei[0]
      ) {
        // Populated objects
        const populatedImei = groupMaster.imei as ImeiDevice[];
        imeiDisplay = populatedImei
          .map((device) => device.deviceIMEI)
          .join(", ");
        imeiIds = populatedImei.map((device) => device._id);
      } else {
        // Just IDs
        imeiIds = groupMaster.imei as string[];
        imeiDisplay = `${imeiIds.length} device(s)`;
      }
    }
  }

  // Get state, city, remark, contact from group module if available
  if (
    Array.isArray(groupMaster.groupModule) &&
    groupMaster.groupModule.length > 0
  ) {
    const groupModuleInfo = groupMaster.groupModule[0] as GroupModuleInfo;
    stateName = groupModuleInfo.stateName;
    cityName = groupModuleInfo.cityName;
    remark = groupModuleInfo.remark;
    contactNo = groupModuleInfo.contactNo;
  }

  return {
    id: groupMaster._id,
    groupId: groupMaster.groupId,
    groupName: groupMaster.groupName,
    groupType: groupType,
    imeiDisplay: imeiDisplay,
    stateName: stateName,
    cityName: cityName,
    remark: remark,
    contactNo: contactNo,
    status: groupMaster.status,
    createdTime: groupMaster.createdAt,
    updatedTime: groupMaster.updatedAt,
    inactiveTime: groupMaster.updatedAt,
    // Store IDs for edit functionality
    groupModule: groupModuleId,
    imei: imeiIds,
  };
};

// Helper function to convert DateRangePicker preset to API format
const convertDateFilterTypeToAPI = (dateFilterType: string): string => {
  const mapping: { [key: string]: string } = {
    customised: "custom_range",
    today: "today",
    yesterday: "yesterday",
    "this-week": "this_week",
    "this-month": "this_month",
    "this-year": "this_year",
    "last-x-days": "last_x_days",
    "last-x-weeks": "last_x_weeks",
    "last-x-months": "last_x_months",
    "last-x-years": "last_x_years",
    "last-x-hours": "last_x_hours",
    "last-x-minutes": "last_x_minutes",
    "pick-any-date": "custom_range", // Handle as custom range for now
  };

  return mapping[dateFilterType] || dateFilterType;
};

// Helper function to format date without timezone conversion
const formatDateForAPI = (date: Date): string => {
  // Format date as YYYY-MM-DDTHH:mm:ss.sssZ without timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

// Helper function to process date filters for API
const processDateFilters = (filters: Filter[], payload: any) => {
  const dateFilters = filters.filter((f) => f.type === "date" && f.dateFilter);

  dateFilters.forEach((filter) => {
    const dateFilter = filter.dateFilter!;
    const apiField = dateFilter.dateField;

    // Set the date field (e.g., "createdAt", "updatedAt")
    payload.dateField = apiField;

    // Convert the filter type to API format
    payload.dateFilterType = convertDateFilterTypeToAPI(
      dateFilter.dateFilterType
    );

    // Handle different date filter types
    switch (payload.dateFilterType) {
      case "custom_range":
        if (dateFilter.fromDate && dateFilter.toDate) {
          // Use our custom formatter to avoid timezone conversion
          const fromDate = new Date(dateFilter.fromDate);
          const toDate = new Date(dateFilter.toDate);

          payload.fromDate = formatDateForAPI(fromDate);
          payload.toDate = formatDateForAPI(toDate);
        }
        break;

      case "last_x_days":
      case "last_x_weeks":
      case "last_x_months":
      case "last_x_years":
      case "last_x_hours":
      case "last_x_minutes":
        if (dateFilter.customValue) {
          payload.customValue = dateFilter.customValue;
        }
        break;

      case "pick_any_date":
        // For pick any date, we'll use custom range with the selected dates
        if (dateFilter.selectedDates && dateFilter.selectedDates.length > 0) {
          const sortedDates = [...dateFilter.selectedDates].sort();
          payload.dateFilterType = "custom_range";
          payload.fromDate = formatDateForAPI(sortedDates[0]);
          payload.toDate = formatDateForAPI(
            sortedDates[sortedDates.length - 1]
          );
        }
        break;

      // For preset filters like "today", "yesterday", etc., no additional params needed
      default:
        break;
    }
  });
};

export const groupsMasterServices = {
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

      // Process filters
      if (filters && filters.length > 0) {
        // Separate regular filters and date filters
        const regularFilters = filters.filter((f) => f.type !== "date");
        const dateFilters = filters.filter((f) => f.type === "date");

        // Handle regular filters
        regularFilters.forEach((filter) => {
          switch (filter.field) {
            case "groupType":
              payload.groupTypes = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "stateName":
              payload.stateNames = filter.value;
              break;
            case "cityName":
              payload.cityNames = filter.value;
              break;
            case "groupName":
              payload.groupNames = filter.value;
              break;
            case "groupId":
              payload.groupIds = filter.value;
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
        // Handle date filters
        if (dateFilters.length > 0) {
          processDateFilters(dateFilters, payload);
        }
      }

      // Always use the filter endpoint
      const response: ApiResponse<GroupMastersListResponse> = await postRequest(
        `${urls.groupMasterViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformGroupMasterToRow),
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
        throw new Error(response.message || "Failed to fetch groups master");
      }
    } catch (error: any) {
      console.error("Error fetching groups master:", error.message);
      throw new Error(error.message || "Failed to fetch groups master");
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
        `${urls.groupMasterViewPath}/filter-options`,
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
      status: "statuses",
      stateName: "stateNames",
      cityName: "cityNames",
      groupName: "groupNames",
      groupId: "groupIds",
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
      const response: ApiResponse<GroupMasterData> = await getRequest(
        `${urls.groupMasterViewPath}/${id}`
      );

      if (response.success) {
        return transformGroupMasterToRow(response.data);
      } else {
        throw new Error(response.message || "Groups Master not found");
      }
    } catch (error: any) {
      console.error("Error fetching groups master:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch groups master");
    }
  },

  // Create new group
  create: async (
    groupMasterData: Partial<Row>
  ): Promise<{ groupMaster: Row; message: string }> => {
    try {
      const payload = {
        groupName: groupMasterData.groupName,
        groupModule: groupMasterData.groupModule,
        imei: groupMasterData.imei || [], // Array of device-onboarding IDs
        status: groupMasterData.status || "active",
      };

      const response: ApiResponse<GroupMasterData> = await postRequest(
        urls.groupMasterViewPath,
        payload
      );

      if (response.success) {
        return {
          groupMaster: transformGroupMasterToRow(response.data),
          message: response.message || "Groups Master created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create groups master");
      }
    } catch (error: any) {
      console.error("Error creating groups master:", error.message);
      throw new Error(error.message || "Failed to create groups master");
    }
  },

  // Update group
  update: async (
    id: string | number,
    groupMasterData: Partial<Row>
  ): Promise<{ groupMaster: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (groupMasterData.groupName !== undefined)
        payload.groupName = groupMasterData.groupName;
      if (groupMasterData.groupModule !== undefined)
        payload.groupModule = groupMasterData.groupModule;
      if (groupMasterData.imei !== undefined)
        payload.imei = groupMasterData.imei;
      if (groupMasterData.status !== undefined)
        payload.status = groupMasterData.status;

      const response: ApiResponse<GroupMasterData> = await patchRequest(
        `${urls.groupMasterViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          groupMaster: transformGroupMasterToRow(response.data),
          message: response.message || "Groups Master updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update groups master");
      }
    } catch (error: any) {
      console.error("Error updating groups master:", error.message);
      throw new Error(error.message || "Failed to update groups master");
    }
  },

  // Inactivate group (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.groupMasterViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Groups Master inactivated successfully",
        };
      } else {
        throw new Error(
          response.message || "Failed to inactivate groups master"
        );
      }
    } catch (error: any) {
      console.error("Error inactivating groups master:", error.message);
      throw new Error(error.message || "Failed to inactivate groups master");
    }
  },

  // Import groups
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.groupMasterViewPath}/import`, {
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
      console.error("Error importing groups master:", error.message);
      throw new Error(error.message || "Failed to import groups");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.groupMasterViewPath}/filter-summary`
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
    return groupsMasterServices.getAll(page, limit, searchText);
  },

  // Get Group Modules for dropdown
  getGroupModules: async (): Promise<GroupModuleForDropdown[]> => {
    try {
      // Use the simple groups API endpoint to get group modules
      const response: ApiResponse<{ data: GroupModuleForDropdown[] }> =
        await getRequest(
          urls.groupModuleViewPath, // This points to "/group-master"
          {
            page: 1,
            limit: 0, // Get all records
          }
        );

      if (response.success) {
        return response.data.data.filter(
          (groupModule) => groupModule.status === "active"
        );
      } else {
        throw new Error(response.message || "Failed to fetch group modules");
      }
    } catch (error: any) {
      console.error("Error fetching group modules:", error.message);
      throw new Error(error.message || "Failed to fetch group modules");
    }
  },

  // Get devices for IMEI dropdown
  getDevicesForImei: async (): Promise<DeviceForImei[]> => {
    try {
      const response: ApiResponse<{ data: DeviceForImei[] }> = await getRequest(
        urls.deviceOnboardingViewPath,
        {
          page: 1,
          limit: 0, // Get all records
        }
      );

      if (response.success) {
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to fetch devices");
      }
    } catch (error: any) {
      console.error("Error fetching devices for IMEI:", error.message);
      throw new Error(error.message || "Failed to fetch devices");
    }
  },
};
