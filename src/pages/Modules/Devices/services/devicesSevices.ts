// Updated device services with proper pagination response
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
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<DevicesListResponse> = await getRequest(
        urls.devicesViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
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
      // Return null if device not found instead of throwing
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch device");
    }
  },

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

  update: async (
    id: string | number,
    deviceData: Partial<Row>
  ): Promise<{ device: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
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

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<DeviceData> = await patchRequest(
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

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // If search is empty, return all devices
      if (!searchText.trim()) {
        return deviceServices.getAll(page, limit);
      }

      const response: ApiResponse<DevicesListResponse> = await getRequest(
        `${urls.devicesViewPath}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching devices:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },
};
