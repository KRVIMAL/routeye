// src/modules/drivers/services/driversService.ts - Updated with server-side filtering
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
    page: string;
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

// Server-side filter interface (matches your API)
interface ServerFilter {
  field: string;
  operator: string;
  value: string;
}

// API request payload interface
interface DriversRequestPayload {
  page: number;
  limit: number;
  search?: string;
  filters?: ServerFilter[];
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
  createdTime: driver.createdAt,
  updatedTime: driver.updatedAt,
  inactiveTime: driver.updatedAt,
});

// Transform client-side filters to server-side format
const transformFiltersToServerFormat = (filters: any[]): ServerFilter[] => {
  return filters.map((filter) => ({
    field: filter.field || filter.column, // Support both field and column properties
    operator: filter.operator,
    value: filter.value,
  }));
};

export const driverServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10,
    searchText?: string,
    filters?: any[]
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const payload: DriversRequestPayload = {
        page,
        limit,
      };

      // Add search if provided
      if (searchText && searchText.trim()) {
        payload.search = searchText.trim();
      }

      // Add filters if provided
      if (filters && filters.length > 0) {
        payload.filters = transformFiltersToServerFormat(filters);
      }

      const response: ApiResponse<DriversListResponse> = await postRequest(
        `${urls.driversViewPath}/listDriver`,
        payload
      );
      console.log({ response });

      if (response.success) {
        return {
          data: response.data.data.map(transformDriverToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch drivers");
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error.message);
      throw new Error(error.message || "Failed to fetch drivers");
    }
  },

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
      // Return null if driver not found instead of throwing
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch driver");
    }
  },

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
        status: driverData.status,
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

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<DriverData> = await patchRequest(
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

  // Deprecated: Use getAll with searchText parameter instead
  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    return driverServices.getAll(page, limit, searchText);
  },

  // New method specifically for filtering
  getWithFilters: async (
    page: number = 1,
    limit: number = 10,
    searchText?: string,
    filters?: any[]
  ): Promise<PaginatedResponse<Row>> => {
    return driverServices.getAll(page, limit, searchText, filters);
  },
};
