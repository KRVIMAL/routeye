// deviceServices.ts - Fixed Implementation with Filter API Integration
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

interface DeviceData {
  _id: string;
  deviceId: string;
  modelName: string;
  manufacturerName: string;
  deviceType: string;
  ipAddress: string;
  port: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface DevicesListResponse {
  data: DeviceData[];
  pagination: {
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    deviceTypes?: Array<{ _id: string; count: number }>;
    statuses?: Array<{ _id: string; count: number }>;
    manufacturerNames?: Array<{ _id: string; count: number }>;
    ports?: Array<{ _id: number; count: number }>;
    modelNames?: Array<{ _id: string; count: number }>;
    ipAddresses?: Array<{ _id: string; count: number }>;
    deviceIds?: Array<{ _id: string; count: number }>;
    usernames?: Array<{ _id: string; count: number }>;
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
  totalDevices: number;
  deviceTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  manufacturerNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Transform API device data to Row format
const transformDeviceToRow = (device: DeviceData): Row => ({
  deviceId: device.deviceId,
  id: device._id,
  modelName: device.modelName,
  manufacturerName: device.manufacturerName,
  deviceType: device.deviceType,
  ipAddress: device.ipAddress,
  port: device.port,
  status: device.status,
  createdTime: device.createdAt,
  updatedTime: device.updatedAt,
  inactiveTime: device.updatedAt,
  username: "admin",
});

export const deviceServices = {
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
            case "deviceType":
              payload.deviceTypes = filter.value;
              break;
            case "modelName":
              payload.modelNames = filter.value;
              break;
            case "manufacturerName":
              payload.manufacturerNames = filter.value;
              break;
            case "status":
              payload.statuses = filter.value;
              break;
            case "port":
              payload.ports = filter.value.map((v) => parseInt(v));
              break;
            case "ipAddress":
              payload.ipAddresses = filter.value;
              break;
            case "deviceId":
              payload.deviceIds = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<DevicesListResponse> = await postRequest(
        `${urls.devicesViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceToRow),
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
        throw new Error(response.message || "Failed to fetch devices");
      }
    } catch (error: any) {
      console.error("Error fetching devices:", error.message);
      throw new Error(error.message || "Failed to fetch devices");
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
        `${urls.devicesViewPath}/filter-options`,
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
      deviceType: "deviceTypes",
      status: "statuses",
      manufacturerName: "manufacturerNames",
      port: "ports",
      modelName: "modelNames",
      ipAddress: "ipAddresses",
      deviceId: "deviceIds",
      username: "usernames",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get device by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<DeviceData> = await getRequest(
        `${urls.devicesViewPath}/${id}`
      );

      if (response.success) {
        return transformDeviceToRow(response.data);
      } else {
        throw new Error(response.message || "Device not found");
      }
    } catch (error: any) {
      console.error("Error fetching device:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch device");
    }
  },

  // Create new device
  create: async (
    deviceData: Partial<Row>
  ): Promise<{ device: Row; message: string }> => {
    try {
      const payload = {
        modelName: deviceData.modelName,
        manufacturerName: deviceData.manufacturerName,
        deviceType: deviceData.deviceType,
        ipAddress: deviceData.ipAddress,
        port: Number(deviceData.port),
        status: deviceData.status,
      };

      const response: ApiResponse<DeviceData> = await postRequest(
        urls.devicesViewPath,
        payload
      );

      if (response.success) {
        return {
          device: transformDeviceToRow(response.data),
          message: response.message || "Device created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create device");
      }
    } catch (error: any) {
      console.error("Error creating device:", error.message);
      throw new Error(error.message || "Failed to create device");
    }
  },

  // Update device
  update: async (
    id: string | number,
    deviceData: Partial<Row>
  ): Promise<{ device: Row; message: string }> => {
    try {
      const payload: any = {};

      if (deviceData.modelName !== undefined)
        payload.modelName = deviceData.modelName;
      if (deviceData.manufacturerName !== undefined)
        payload.manufacturerName = deviceData.manufacturerName;
      if (deviceData.deviceType !== undefined)
        payload.deviceType = deviceData.deviceType;
      if (deviceData.ipAddress !== undefined)
        payload.ipAddress = deviceData.ipAddress;
      if (deviceData.port !== undefined) payload.port = Number(deviceData.port);
      if (deviceData.status !== undefined) payload.status = deviceData.status;

      const response: ApiResponse<DeviceData> = await putRequest(
        `${urls.devicesViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          device: transformDeviceToRow(response.data),
          message: response.message || "Device updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update device");
      }
    } catch (error: any) {
      console.error("Error updating device:", error.message);
      throw new Error(error.message || "Failed to update device");
    }
  },

  // Inactivate device (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.devicesViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Device inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate device");
      }
    } catch (error: any) {
      console.error("Error inactivating device:", error.message);
      throw new Error(error.message || "Failed to inactivate device");
    }
  },

  // Export devices - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.devicesViewPath}/export`;
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
            case "deviceType":
              payload.deviceTypes = filter.value;
              break;
            case "modelName":
              payload.modelNames = filter.value;
              break;
            case "manufacturerName":
              payload.manufacturerNames = filter.value;
              break;
            case "status":
              payload.status = filter.value;
              break;
            case "port":
              payload.ports = filter.value.map((v) => parseInt(v));
              break;
            case "ipAddress":
              payload.ipAddresses = filter.value;
              break;
            case "deviceId":
              payload.deviceIds = filter.value;
              break;
            case "username":
              payload.usernames = filter.value;
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

        url = `${urls.devicesViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting devices:", error.message);
      throw new Error(error.message || "Failed to export devices");
    }
  },

  // Import devices
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.devicesViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Devices imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import devices");
      }
    } catch (error: any) {
      console.error("Error importing devices:", error.message);
      throw new Error(error.message || "Failed to import devices");
    }
  },
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.devicesViewPath}/filter-summary`
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
};
