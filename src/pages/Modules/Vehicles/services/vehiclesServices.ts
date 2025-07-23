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
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<VehiclesListResponse> = await getRequest(
        urls.vehiclesViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
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

      const response: ApiResponse<VehicleData> = await patchRequest(
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

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<VehicleData> = await patchRequest(
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

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // If search is empty, return all vehicles
      if (!searchText.trim()) {
        return vehicleServices.getAll(page, limit);
      }

      const response: ApiResponse<VehiclesListResponse> = await getRequest(
        `${urls.vehiclesViewPath}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleToRow),
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
      console.error("Error searching vehicles:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },
};
