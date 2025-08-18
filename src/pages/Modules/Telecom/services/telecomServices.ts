// telecomServices.ts - Implementation with Filter API Integration
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

interface TelecomData {
  _id: string;
  telecomId?: string;
  telecomOperator: string;
  simType: string;
  numberOfNetworkProfiles: number;
  networkProfile1?: string;
  networkProfile2?: string;
  networkProfile1Generation?: string;
  networkProfile2Generation?: string;
  networkProfile1APN?: string;
  networkProfile2APN?: string;
  billingType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TelecomsListResponse {
  data: TelecomData[];
  pagination: {
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    simTypes?: Array<{ _id: string; count: number }>;
    billingTypes?: Array<{ _id: string; count: number }>;
    telecomOperators?: Array<{ _id: string; count: number }>;
    networkProfile1Generations?: Array<{ _id: string; count: number }>;
    networkProfile2Generations?: Array<{ _id: string; count: number }>;
    numberOfNetworkProfiles?: Array<{ _id: number; count: number }>;
    statuses?: Array<{ _id: string; count: number }>;
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

// Updated Filter interface to support date filters
interface DateFilter {
  dateField: string;
  dateFilterType: string;
  fromDate?: string;
  toDate?: string;
  customValue?: number;
  selectedDates?: Date[];
  isPickAnyDate?: boolean;
}

interface Filter {
  field: string;
  value: any[];
  label?: string;
  type?: "regular" | "date";
  dateFilter?: DateFilter;
}
interface FilterSummaryResponse {
  totalTelecoms: number;
  simTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  billingTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  telecomOperators: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  networkProfile1Generations: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  networkProfile2Generations: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  numberOfNetworkProfiles: Array<{
    count: number;
    value: number;
    label: number;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Transform API telecom data to Row format
const transformTelecomToRow = (telecom: TelecomData): Row => ({
  telecomId: telecom.telecomId || telecom._id,
  id: telecom._id,
  telecomOperator: telecom.telecomOperator,
  simType: telecom.simType,
  numberOfNetworkProfiles: telecom.numberOfNetworkProfiles,
  networkProfile1: telecom.networkProfile1 || "",
  networkProfile2: telecom.networkProfile2 || "",
  networkProfile1Generation: telecom.networkProfile1Generation || "",
  networkProfile2Generation: telecom.networkProfile2Generation || "",
  networkProfile1APN: telecom.networkProfile1APN || "",
  networkProfile2APN: telecom.networkProfile2APN || "",
  billingType: telecom.billingType,
  status: telecom.status,
  createdAt: telecom.createdAt,
  updatedAt: telecom.updatedAt,
});

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

export const telecomServices = {
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
            case "simType":
              payload.simTypes = filter.value;
              break;
            case "billingType":
              payload.billingTypes = filter.value;
              break;
            case "telecomOperator":
              payload.telecomOperators = filter.value;
              break;
            case "networkProfile1Generation":
              payload.networkProfile1Generations = filter.value;
              break;
            case "networkProfile2Generation":
              payload.networkProfile2Generations = filter.value;
              break;
            case "numberOfNetworkProfiles":
              payload.numberOfNetworkProfiles = filter.value.map((v) =>
                parseInt(v)
              );
              break;
            case "status":
              payload.statuses = filter.value;
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
      const response: ApiResponse<TelecomsListResponse> = await postRequest(
        `${urls.telecomViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformTelecomToRow),
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
        throw new Error(response.message || "Failed to fetch telecoms");
      }
    } catch (error: any) {
      console.error("Error fetching telecoms:", error.message);
      throw new Error(error.message || "Failed to fetch telecoms");
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
        `${urls.telecomViewPath}/filter-options`,
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
      simType: "simTypes",
      billingType: "billingTypes",
      telecomOperator: "telecomOperators",
      networkProfile1Generation: "networkProfile1Generations",
      networkProfile2Generation: "networkProfile2Generations",
      numberOfNetworkProfiles: "numberOfNetworkProfiles",
      status: "statuses",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get telecom by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<TelecomData> = await getRequest(
        `${urls.telecomViewPath}/${id}`
      );

      if (response.success) {
        return transformTelecomToRow(response.data);
      } else {
        throw new Error(response.message || "Telecom not found");
      }
    } catch (error: any) {
      console.error("Error fetching telecom:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch telecom");
    }
  },

  // Create new telecom
  create: async (
    telecomData: Partial<Row>
  ): Promise<{ telecom: Row; message: string }> => {
    try {
      const payload: any = {
        telecomOperator: telecomData.telecomOperator,
        simType: telecomData.simType,
        numberOfNetworkProfiles: Number(telecomData.numberOfNetworkProfiles),
        billingType: telecomData.billingType,
        status: telecomData.status || "active",
      };

      // Add network profile 1 fields (always required)
      if (telecomData.networkProfile1) {
        payload.networkProfile1 = telecomData.networkProfile1;
      }
      if (telecomData.networkProfile1Generation) {
        payload.networkProfile1Generation =
          telecomData.networkProfile1Generation;
      }
      if (telecomData.networkProfile1APN) {
        payload.networkProfile1APN = telecomData.networkProfile1APN;
      }

      // Add network profile 2 fields (only if 2 profiles)
      if (telecomData.numberOfNetworkProfiles === 2) {
        if (telecomData.networkProfile2) {
          payload.networkProfile2 = telecomData.networkProfile2;
        }
        if (telecomData.networkProfile2Generation) {
          payload.networkProfile2Generation =
            telecomData.networkProfile2Generation;
        }
        if (telecomData.networkProfile2APN) {
          payload.networkProfile2APN = telecomData.networkProfile2APN;
        }
      }

      const response: ApiResponse<TelecomData> = await postRequest(
        urls.telecomViewPath,
        payload
      );

      if (response.success) {
        return {
          telecom: transformTelecomToRow(response.data),
          message: response.message || "Telecom created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create telecom");
      }
    } catch (error: any) {
      console.error("Error creating telecom:", error.message);
      throw new Error(error.message || "Failed to create telecom");
    }
  },

  // Update telecom
  update: async (
    id: string | number,
    telecomData: Partial<Row>
  ): Promise<{ telecom: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (telecomData.telecomOperator !== undefined)
        payload.telecomOperator = telecomData.telecomOperator;
      if (telecomData.simType !== undefined)
        payload.simType = telecomData.simType;
      if (telecomData.numberOfNetworkProfiles !== undefined)
        payload.numberOfNetworkProfiles = Number(
          telecomData.numberOfNetworkProfiles
        );
      if (telecomData.networkProfile1 !== undefined)
        payload.networkProfile1 = telecomData.networkProfile1;
      if (telecomData.networkProfile2 !== undefined)
        payload.networkProfile2 = telecomData.networkProfile2;
      if (telecomData.networkProfile1Generation !== undefined)
        payload.networkProfile1Generation =
          telecomData.networkProfile1Generation;
      if (telecomData.networkProfile2Generation !== undefined)
        payload.networkProfile2Generation =
          telecomData.networkProfile2Generation;
      if (telecomData.networkProfile1APN !== undefined)
        payload.networkProfile1APN = telecomData.networkProfile1APN;
      if (telecomData.networkProfile2APN !== undefined)
        payload.networkProfile2APN = telecomData.networkProfile2APN;
      if (telecomData.billingType !== undefined)
        payload.billingType = telecomData.billingType;
      if (telecomData.status !== undefined) payload.status = telecomData.status;

      const response: ApiResponse<TelecomData> = await patchRequest(
        `${urls.telecomViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          telecom: transformTelecomToRow(response.data),
          message: response.message || "Telecom updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update telecom");
      }
    } catch (error: any) {
      console.error("Error updating telecom:", error.message);
      throw new Error(error.message || "Failed to update telecom");
    }
  },

  // Inactivate telecom (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.telecomViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Telecom inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate telecom");
      }
    } catch (error: any) {
      console.error("Error inactivating telecom:", error.message);
      throw new Error(error.message || "Failed to inactivate telecom");
    }
  },

  // Export telecoms - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.telecomViewPath}/export`;
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
            case "simType":
              payload.simTypes = filter.value;
              break;
            case "billingType":
              payload.billingTypes = filter.value;
              break;
            case "telecomOperator":
              payload.telecomOperators = filter.value;
              break;
            case "networkProfile1Generation":
              payload.networkProfile1Generations = filter.value;
              break;
            case "networkProfile2Generation":
              payload.networkProfile2Generations = filter.value;
              break;
            case "numberOfNetworkProfiles":
              payload.numberOfNetworkProfiles = filter.value.map((v) =>
                parseInt(v)
              );
              break;
            case "status":
              payload.statuses = filter.value;
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

        url = `${urls.telecomViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting telecoms:", error.message);
      throw new Error(error.message || "Failed to export telecoms");
    }
  },

  // Import telecoms
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.telecomViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Telecoms imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import telecoms");
      }
    } catch (error: any) {
      console.error("Error importing telecoms:", error.message);
      throw new Error(error.message || "Failed to import telecoms");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.telecomViewPath}/filter-summary`
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
    return telecomServices.getAll(page, limit, searchText);
  },
};
