// vehiclesServices.ts - Fixed Implementation with Filter API Integration
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

interface VehicleData {
  vehcileId: string;
  _id: string;
  brandName: string;
  modelName: string;
  vehicleType: string;
  icon: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface VehiclesListResponse {
  data: VehicleData[];
  pagination: {
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    vehicleTypes?: Array<{ _id: string; count: number }>;
    statuses?: Array<{ _id: string; count: number }>;
    brandNames?: Array<{ _id: string; count: number }>;
    modelNames?: Array<{ _id: string; count: number }>;
    vehcileIds?: Array<{ _id: string; count: number }>;
    icons?: Array<{ _id: string; count: number }>;
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
  totalVehicles: number;
  vehicleTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  brandNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Transform API vehicle data to Row format
const transformVehicleToRow = (vehicle: VehicleData): Row => ({
  vehcileId: vehicle.vehcileId,
  id: vehicle._id,
  brandName: vehicle.brandName,
  modelName: vehicle.modelName,
  vehicleType: vehicle.vehicleType,
  icon: vehicle.icon,
  status: vehicle.status,
  createdTime: vehicle.createdAt,
  updatedTime: vehicle.updatedAt,
  inactiveTime: vehicle.updatedAt,
});

export const vehicleServices = {
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
            case "vehicleType":
              payload.vehicleTypes = filter.value;
              break;
            case "brandName":
              payload.brandNames = filter.value;
              break;
            case "modelName":
              payload.modelNames = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "vehcileId":
              payload.vehcileIds = filter.value;
              break;
            case "icon":
              payload.icons = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<VehiclesListResponse> = await postRequest(
        `${urls.vehiclesViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleToRow),
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
        throw new Error(response.message || "Failed to fetch vehicles");
      }
    } catch (error: any) {
      console.error("Error fetching vehicles:", error.message);
      throw new Error(error.message || "Failed to fetch vehicles");
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
        `${urls.vehiclesViewPath}/filter-options`,
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
      vehicleType: "vehicleTypes",
      brandName: "brandNames",
      modelName: "modelNames",
      status: "statuses",
      vehcileId: "vehcileIds",
      icon: "icons",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get vehicle by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<VehicleData> = await getRequest(
        `${urls.vehiclesViewPath}/${id}`
      );

      if (response.success) {
        return transformVehicleToRow(response.data);
      } else {
        throw new Error(response.message || "Vehicle not found");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch vehicle");
    }
  },

  // Create new vehicle
  create: async (
    vehicleData: Partial<Row>
  ): Promise<{ vehicle: Row; message: string }> => {
    try {
      const payload = {
        brandName: vehicleData.brandName,
        modelName: vehicleData.modelName,
        vehicleType: vehicleData.vehicleType,
        icon: vehicleData.icon,
        status: vehicleData.status || "active",
      };

      const response: ApiResponse<VehicleData> = await postRequest(
        urls.vehiclesViewPath,
        payload
      );

      if (response.success) {
        return {
          vehicle: transformVehicleToRow(response.data),
          message: response.message || "Vehicle created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create vehicle");
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error.message);
      throw new Error(error.message || "Failed to create vehicle");
    }
  },

  // Update vehicle
  update: async (
    id: string | number,
    vehicleData: Partial<Row>
  ): Promise<{ vehicle: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (vehicleData.brandName !== undefined)
        payload.brandName = vehicleData.brandName;
      if (vehicleData.modelName !== undefined)
        payload.modelName = vehicleData.modelName;
      if (vehicleData.vehicleType !== undefined)
        payload.vehicleType = vehicleData.vehicleType;
      if (vehicleData.icon !== undefined) payload.icon = vehicleData.icon;
      if (vehicleData.status !== undefined) payload.status = vehicleData.status;

      const response: ApiResponse<VehicleData> = await putRequest(
        `${urls.vehiclesViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          vehicle: transformVehicleToRow(response.data),
          message: response.message || "Vehicle updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update vehicle");
      }
    } catch (error: any) {
      console.error("Error updating vehicle:", error.message);
      throw new Error(error.message || "Failed to update vehicle");
    }
  },

  // Inactivate vehicle (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.vehiclesViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Vehicle inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate vehicle");
      }
    } catch (error: any) {
      console.error("Error inactivating vehicle:", error.message);
      throw new Error(error.message || "Failed to inactivate vehicle");
    }
  },

  // Export vehicles - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.vehiclesViewPath}/export`;
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
            case "vehicleType":
              payload.vehicleTypes = filter.value;
              break;
            case "brandName":
              payload.brandNames = filter.value;
              break;
            case "modelName":
              payload.modelNames = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "vehcileId":
              payload.vehcileIds = filter.value;
              break;
            case "icon":
              payload.icons = filter.value;
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

        url = `${urls.vehiclesViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting vehicles:", error.message);
      throw new Error(error.message || "Failed to export vehicles");
    }
  },

  // Import vehicles
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.vehiclesViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Vehicles imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import vehicles");
      }
    } catch (error: any) {
      console.error("Error importing vehicles:", error.message);
      throw new Error(error.message || "Failed to import vehicles");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.vehiclesViewPath}/filter-summary`
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
    return vehicleServices.getAll(page, limit, searchText);
  },
};