// Vehicle Master services with proper pagination and relationship mapping
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
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<VehicleMastersListResponse> =
        await getRequest(urls.vehicleMastersViewPath, {
          page,
          limit,
        });

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleMasterToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
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

      const response: ApiResponse<VehicleMasterData> = await patchRequest(
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

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<VehicleMasterData> = await patchRequest(
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

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // If search is empty, return all vehicle masters
      if (!searchText.trim()) {
        return vehicleMasterServices.getAll(page, limit);
      }

      const response: ApiResponse<VehicleMastersListResponse> =
        await getRequest(`${urls.vehicleMastersViewPath}/search`, {
          searchText: searchText.trim(),
          page,
          limit,
        });

      if (response.success) {
        return {
          data: response.data.data.map(transformVehicleMasterToRow),
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
      console.error("Error searching vehicle masters:", error.message);
      throw new Error(error.message || "Search failed");
    }
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
      // clg

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
