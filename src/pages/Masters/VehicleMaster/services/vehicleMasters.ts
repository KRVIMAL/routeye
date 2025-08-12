// vehicleMasterServices.ts - Fixed Implementation with Filter API Integration
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

interface VehicleInfo {
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

interface DriverInfo {
  _id: string;
  name: string;
  contactNo: string;
  email: string;
  licenseNo: string;
  adharNo: string;
  status?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface VehicleMasterData {
  vehcileMasterId: string;
  _id: string;
  vehicleNumber: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleModule: string;
  driverModule: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  vehicleInfo?: VehicleInfo;
  driverInfo?: DriverInfo;
}

interface VehicleMastersListResponse {
  data: VehicleMasterData[];
  pagination: {
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    vehicleNumbers?: Array<{ _id: string; count: number }>;
    chassisNumbers?: Array<{ _id: string; count: number }>;
    engineNumbers?: Array<{ _id: string; count: number }>;
    vehicleModules?: Array<{ _id: string; count: number }>;
    driverModules?: Array<{ _id: string; count: number }>;
    statuses?: Array<{ _id: string; count: number }>;
    vehcileMasterIds?: Array<{ _id: string; count: number }>;
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
  totalVehicleMasters: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  vehicleBrands: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  vehicleTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  vehicleStatuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  driverNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Vehicle Module interface for dropdown
export interface VehicleModule {
  _id: string;
  brandName: string;
  modelName: string;
  vehicleType: string;
  status: string;
}

// Driver Module interface for dropdown
export interface DriverModule {
  _id: string;
  name: string;
  adharNo: string;
  contactNo: string;
  email: string;
  status?: string;
  isActive?: boolean;
}

interface ServerFilter {
  field: string;
  operator: string;
  value: string;
}

// API request payload interface
interface DriversRequestPayload {
  page: number;
  limit: number;
  searchText?: string;
  filters?: ServerFilter[];
}

// Transform API vehicle master data to Row format
const transformVehicleMasterToRow = (
  vehicleMaster: VehicleMasterData
): Row => ({
  vehcileMasterId: vehicleMaster.vehcileMasterId,
  id: vehicleMaster._id,
  vehicleNumber: vehicleMaster.vehicleNumber,
  chassisNumber: vehicleMaster.chassisNumber,
  engineNumber: vehicleMaster.engineNumber,
  vehicleModule: vehicleMaster.vehicleModule,
  driverModule: vehicleMaster.driverModule,
  vehicleModelName: vehicleMaster.vehicleInfo?.modelName || "N/A",
  driverName: vehicleMaster.driverInfo?.name || "N/A",
  driverAdharNo: vehicleMaster.driverInfo?.adharNo || "N/A",
  status: vehicleMaster.status || "active",
  createdTime: vehicleMaster.createdAt,
  updatedTime: vehicleMaster.updatedAt,
  inactiveTime: vehicleMaster.updatedAt,
});

export const vehicleMasterServices = {
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
            case "vehicleNumber":
              payload.vehicleNumbers = filter.value;
              break;
            case "chassisNumber":
              payload.chassisNumbers = filter.value;
              break;
            case "engineNumber":
              payload.engineNumbers = filter.value;
              break;
            case "vehicleModule":
              payload.vehicleModules = filter.value;
              break;
            case "driverModule":
              payload.driverModules = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "vehcileMasterId":
              payload.vehcileMasterIds = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<VehicleMastersListResponse> = await postRequest(
        `${urls.vehicleMastersViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleMasterToRow),
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
        throw new Error(response.message || "Failed to fetch vehicle masters");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle masters:", error.message);
      throw new Error(error.message || "Failed to fetch vehicle masters");
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
        `${urls.vehicleMastersViewPath}/filter-options`,
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
      vehicleNumber: "vehicleNumbers",
      chassisNumber: "chassisNumbers",
      engineNumber: "engineNumbers",
      vehicleModule: "vehicleModules",
      driverModule: "driverModules",
      status: "statuses",
      vehcileMasterId: "vehcileMasterIds",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get vehicle master by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<VehicleMasterData> = await getRequest(
        `${urls.vehicleMastersViewPath}/${id}`
      );

      if (response.success) {
        return transformVehicleMasterToRow(response.data);
      } else {
        throw new Error(response.message || "Vehicle Master not found");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle master:", error.message);
      // Return null if vehicle master not found instead of throwing
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch vehicle master");
    }
  },

  // Create new vehicle master
  create: async (
    vehicleMasterData: Partial<Row>
  ): Promise<{ vehicleMaster: Row; message: string }> => {
    try {
      const payload = {
        vehicleNumber: vehicleMasterData.vehicleNumber,
        chassisNumber: vehicleMasterData.chassisNumber,
        engineNumber: vehicleMasterData.engineNumber,
        vehicleModule: vehicleMasterData.vehicleModule,
        driverModule: vehicleMasterData.driverModule,
        status: vehicleMasterData.status || "active",
      };

      const response: ApiResponse<VehicleMasterData> = await postRequest(
        urls.vehicleMastersViewPath,
        payload
      );

      if (response.success) {
        return {
          vehicleMaster: transformVehicleMasterToRow(response.data),
          message: response.message || "Vehicle Master created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create vehicle master");
      }
    } catch (error: any) {
      console.error("Error creating vehicle master:", error.message);
      throw new Error(error.message || "Failed to create vehicle master");
    }
  },

  // Update vehicle master
  update: async (
    id: string | number,
    vehicleMasterData: Partial<Row>
  ): Promise<{ vehicleMaster: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (vehicleMasterData.vehicleNumber !== undefined)
        payload.vehicleNumber = vehicleMasterData.vehicleNumber;
      if (vehicleMasterData.chassisNumber !== undefined)
        payload.chassisNumber = vehicleMasterData.chassisNumber;
      if (vehicleMasterData.engineNumber !== undefined)
        payload.engineNumber = vehicleMasterData.engineNumber;
      if (vehicleMasterData.vehicleModule !== undefined)
        payload.vehicleModule = vehicleMasterData.vehicleModule;
      if (vehicleMasterData.driverModule !== undefined)
        payload.driverModule = vehicleMasterData.driverModule;
      if (vehicleMasterData.status !== undefined)
        payload.status = vehicleMasterData.status;

      const response: ApiResponse<VehicleMasterData> = await putRequest(
        `${urls.vehicleMastersViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          vehicleMaster: transformVehicleMasterToRow(response.data),
          message: response.message || "Vehicle Master updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update vehicle master");
      }
    } catch (error: any) {
      console.error("Error updating vehicle master:", error.message);
      throw new Error(error.message || "Failed to update vehicle master");
    }
  },

  // Inactivate vehicle master (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.vehicleMastersViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message:
            response.message || "Vehicle Master inactivated successfully",
        };
      } else {
        throw new Error(
          response.message || "Failed to inactivate vehicle master"
        );
      }
    } catch (error: any) {
      console.error("Error inactivating vehicle master:", error.message);
      throw new Error(error.message || "Failed to inactivate vehicle master");
    }
  },

  // Export vehicle masters - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.vehicleMastersViewPath}/export`;
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
            case "vehicleNumber":
              payload.vehicleNumbers = filter.value;
              break;
            case "chassisNumber":
              payload.chassisNumbers = filter.value;
              break;
            case "engineNumber":
              payload.engineNumbers = filter.value;
              break;
            case "vehicleModule":
              payload.vehicleModules = filter.value;
              break;
            case "driverModule":
              payload.driverModules = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "vehcileMasterId":
              payload.vehcileMasterIds = filter.value;
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

        url = `${urls.vehicleMastersViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting vehicle masters:", error.message);
      throw new Error(error.message || "Failed to export vehicle masters");
    }
  },

  // Import vehicle masters
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.vehicleMastersViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Vehicle Masters imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import vehicle masters");
      }
    } catch (error: any) {
      console.error("Error importing vehicle masters:", error.message);
      throw new Error(error.message || "Failed to import vehicle masters");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.vehicleMastersViewPath}/filter-summary`
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
    return vehicleMasterServices.getAll(page, limit, searchText);
  },

  // Get Vehicle Modules for dropdown
  getVehicleModules: async (
    page: number = 1,
    limit: number = 0,
    searchText?: string,
    filters?: any[]
  ): Promise<VehicleModule[]> => {
    try {
      const response: ApiResponse<{ data: VehicleModule[] }> = await getRequest(
        urls.vehiclesViewPath,
        {
          page: 1,
          limit: 0, // Get all records
        }
      );

      if (response.success) {
        return response.data.data.filter(
          (vehicle) => vehicle.status === "active"
        );
      } else {
        throw new Error(response.message || "Failed to fetch vehicle modules");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle modules:", error.message);
      throw new Error(error.message || "Failed to fetch vehicle modules");
    }
  },

  // Get Driver Modules for dropdown
  getDriverModules: async (
    page: number = 1,
    limit: number = 0,
    searchText?: string,
    filters?: any[]
  ): Promise<DriverModule[]> => {
    try {
      const payload: DriversRequestPayload = {
        page,
        limit,
      };

      const response: ApiResponse<any> = await postRequest(
        `${urls.driversViewPath}/listDriver`,
        payload
      );

      if (response.success) {
        return response.data.data.filter(
          (driver: any) =>
            driver.status === "active" || driver.isActive === true
        );
      } else {
        throw new Error(response.message || "Failed to fetch driver modules");
      }
    } catch (error: any) {
      console.error("Error fetching driver modules:", error.message);
      throw new Error(error.message || "Failed to fetch driver modules");
    }
  },
};