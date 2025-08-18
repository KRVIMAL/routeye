// driversService.ts - Fixed Implementation with Filter API Integration
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

interface DriverData {
  driverId: string;
  _id: string;
  name: string;
  contactNo: string;
  email: string;
  licenseNo: string;
  adharNo: string;
  status: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface DriversListResponse {
  data: DriverData[];
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
    licenseTypes?: Array<{ _id: string; count: number }>;
    experienceLevels?: Array<{ _id: string; count: number }>;
    locations?: Array<{ _id: string; count: number }>;
    names?: Array<{ _id: string; count: number }>;
    contactNos?: Array<{ _id: string; count: number }>;
    emails?: Array<{ _id: string; count: number }>;
    licenseNos?: Array<{ _id: string; count: number }>;
    adharNos?: Array<{ _id: string; count: number }>;
    driverIds?: Array<{ _id: string; count: number }>;
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
  totalDrivers: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  licenseTypes?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  experienceLevels?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  locations?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Server-side filter interface (matches your current API)
interface ServerFilter {
  field: string;
  operator: string;
  value: string;
}

// Transform API driver data to Row format
const transformDriverToRow = (driver: DriverData): Row => ({
  driverId: driver.driverId,
  id: driver._id,
  name: driver.name,
  contactNo: driver.contactNo,
  email: driver.email,
  licenseNo: driver.licenseNo,
  adharNo: driver.adharNo,
  status: driver.status || (driver.isActive ? "active" : "inactive"),
  createdAt: driver.createdAt,
  updatedAt: driver.updatedAt,
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

export const driverServices = {
  // Updated getAll method - now handles both regular and date filters
  getAll: async (
    page: number = 1,
    limit: number = 10,
    searchText?: string,
    sortField?: string,
    sortDirection?: "asc" | "desc",
    filters?: Filter[]
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // Check if we have the new filter API endpoint
      const hasFilterAPI = true; // You can make this configurable

      if (hasFilterAPI && (filters || sortField || sortDirection)) {
        // Use new filter API
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
        const regularFilters = filters.filter(f => f.type !== "date");
        const dateFilters = filters.filter(f => f.type === "date");
        
        // Handle regular filters
        regularFilters.forEach((filter) => {
            switch (filter.field) {
              case "status":
                payload.statuses = filter.value;
                break;
              case "name":
                payload.names = filter.value;
                break;
              case "contactNo":
                payload.contactNos = filter.value;
                break;
              case "email":
                payload.emails = filter.value;
                break;
              case "licenseNo":
                payload.licenseNos = filter.value;
                break;
              case "adharNo":
                payload.adharNos = filter.value;
                break;
              case "driverId":
                payload.driverIds = filter.value;
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

        const response: ApiResponse<DriversListResponse> = await postRequest(
          `${urls.driversViewPath}/filter`,
          payload
        );

        if (response.success) {
          return {
            data: response.data.data.map(transformDriverToRow),
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
          throw new Error(response.message || "Failed to fetch drivers");
        }
      } else {
        // Use legacy listDriver API for backwards compatibility
        const payload: any = {
          page,
          limit,
        };

        // Add search if provided
        if (searchText && searchText.trim()) {
          payload.search = searchText.trim();
        }

        // Legacy filter format for old API
        if (filters && filters.length > 0) {
          const serverFilters: ServerFilter[] = filters.map((filter) => ({
            field: filter.field,
            operator: "in", // Default operator
            value: Array.isArray(filter.value)
              ? filter.value.join(",")
              : filter.value,
          }));
          payload.filters = serverFilters;
        }

        const response: ApiResponse<DriversListResponse> = await postRequest(
          `${urls.driversViewPath}/listDriver`,
          payload
        );

        if (response.success) {
          return {
            data: response.data.data.map(transformDriverToRow),
            total: response.data.pagination.total,
            page: parseInt(response.data.pagination.page.toString()),
            limit: parseInt(response.data.pagination.limit.toString()),
            totalPages: response.data.pagination.totalPages,
            hasNext: response.data.pagination.hasNext,
            hasPrev: response.data.pagination.hasPrev,
          };
        } else {
          throw new Error(response.message || "Failed to fetch drivers");
        }
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error.message);
      throw new Error(error.message || "Failed to fetch drivers");
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
        `${urls.driversViewPath}/filter-options`,
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
      name: "names",
      contactNo: "contactNos",
      email: "emails",
      licenseNo: "licenseNos",
      adharNo: "adharNos",
      driverId: "driverIds",
      licenseType: "licenseTypes",
      experienceLevel: "experienceLevels",
      location: "locations",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get driver by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<DriverData> = await getRequest(
        `${urls.driversViewPath}/${id}`
      );

      if (response.success) {
        return transformDriverToRow(response.data);
      } else {
        throw new Error(response.message || "Driver not found");
      }
    } catch (error: any) {
      console.error("Error fetching driver:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch driver");
    }
  },

  // Create new driver
  create: async (
    driverData: Partial<Row>
  ): Promise<{ driver: Row; message: string }> => {
    try {
      const payload = {
        name: driverData.name,
        contactNo: driverData.contactNo,
        email: driverData.email,
        licenseNo: driverData.licenseNo,
        adharNo: driverData.adharNo,
        status: driverData.status || "active",
      };

      const response: ApiResponse<DriverData> = await postRequest(
        urls.driversViewPath,
        payload
      );

      if (response.success) {
        return {
          driver: transformDriverToRow(response.data),
          message: response.message || "Driver created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create driver");
      }
    } catch (error: any) {
      console.error("Error creating driver:", error.message);
      throw new Error(error.message || "Failed to create driver");
    }
  },

  // Update driver
  update: async (
    id: string | number,
    driverData: Partial<Row>
  ): Promise<{ driver: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (driverData.name !== undefined) payload.name = driverData.name;
      if (driverData.contactNo !== undefined)
        payload.contactNo = driverData.contactNo;
      if (driverData.email !== undefined) payload.email = driverData.email;
      if (driverData.licenseNo !== undefined)
        payload.licenseNo = driverData.licenseNo;
      if (driverData.adharNo !== undefined)
        payload.adharNo = driverData.adharNo;
      if (driverData.status !== undefined) payload.status = driverData.status;

      const response: ApiResponse<DriverData> = await patchRequest(
        `${urls.driversViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          driver: transformDriverToRow(response.data),
          message: response.message || "Driver updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update driver");
      }
    } catch (error: any) {
      console.error("Error updating driver:", error.message);
      throw new Error(error.message || "Failed to update driver");
    }
  },

  // Inactivate driver (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.driversViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Driver inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate driver");
      }
    } catch (error: any) {
      console.error("Error inactivating driver:", error.message);
      throw new Error(error.message || "Failed to inactivate driver");
    }
  },

  // Export drivers - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.driversViewPath}/export`;
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
            case "name":
              payload.names = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "email":
              payload.emails = filter.value;
              break;
            case "licenseNo":
              payload.licenseNos = filter.value;
              break;
            case "adharNo":
              payload.adharNos = filter.value;
              break;
            case "driverId":
              payload.driverIds = filter.value;
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

        url = `${urls.driversViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting drivers:", error.message);
      throw new Error(error.message || "Failed to export drivers");
    }
  },

  // Import drivers
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.driversViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Drivers imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import drivers");
      }
    } catch (error: any) {
      console.error("Error importing drivers:", error.message);
      throw new Error(error.message || "Failed to import drivers");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.driversViewPath}/filter-summary`
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

  // Legacy methods for backwards compatibility
  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    return driverServices.getAll(page, limit, searchText);
  },

  getWithFilters: async (
    page: number = 1,
    limit: number = 10,
    searchText?: string,
    filters?: any[]
  ): Promise<PaginatedResponse<Row>> => {
    // Transform legacy filter format to new format
    const newFilters: Filter[] =
      filters?.map((f) => ({
        field: f.field || f.column,
        value: Array.isArray(f.value) ? f.value : [f.value],
        label: f.label,
      })) || [];

    return driverServices.getAll(
      page,
      limit,
      searchText,
      undefined,
      undefined,
      newFilters
    );
  },
  // Helper method to create a date filter
  createDateFilter: (
    dateField: string,
    dateFilterType: string,
    options?: {
      fromDate?: string;
      toDate?: string;
      customValue?: number;
      selectedDates?: Date[];
      isPickAnyDate?: boolean;
    }
  ): Filter => {
    return {
      field: dateField,
      value: [],
      type: "date",
      dateFilter: {
        dateField,
        dateFilterType,
        ...options,
      },
      label: `${dateField}: Date Filter`,
    };
  },
};
