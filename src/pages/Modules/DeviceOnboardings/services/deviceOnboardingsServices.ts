// Device On-boarding services with complex relationship mapping
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";
import { store } from "../../../../store";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface AccountDetails {
  _id: string;
  accountName: string;
}

interface VehicleDetails {
  _id: string;
  vehicleNumber: string;
}

interface DriverDetails {
  _id: string;
  name: string;
  contactNo: string;
  licenseNo: string;
}

interface VehicleNoDetails {
  _id: string;
  brandName: string;
  modelName: string;
  vehicleType: string;
}

interface DeviceOnboardingData {
  _id: string;
  account?: string;
  deviceIMEI: string;
  deviceSerialNo: string;
  vehicleNo?: string;
  simNo1: string;
  simNo2: string;
  simNo1Operator: string;
  simNo2Operator: string;
  vehicleDescription: string;
  vehicle: string;
  driver: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountDetails?: AccountDetails;
  vehicleDetails?: VehicleDetails;
  driverDetails?: DriverDetails;
  vehcileNoDetails?: VehicleNoDetails;
  deviceModule?: string;
  mobileNo1?: string;
  mobileNo2?: string;
  deviceDetails?: {
    _id: string;
    deviceId: string;
    modelName: string;
    deviceType: string;
    manufacturerName: string;
    ipAddress: string;
    port: number;
  };
  mobileNo1Details?: {
    _id: string;
    ccidNumber: string;
    imsiNumber: string;
    telecomOperator: string;
    simType: string;
    mobileNo1: string;
    mobileNo2?: string;
    networkSupport: string;
    apn1: string;
    apn2?: string;
    status: string;
  };
  mobileNo2Details?: {
    _id: string;
    ccidNumber: string;
    imsiNumber: string;
    telecomOperator: string;
    simType: string;
    mobileNo1: string;
    mobileNo2?: string;
    networkSupport: string;
    apn1: string;
    apn2?: string;
    status: string;
  };
}

export interface TelecomMaster {
  _id: string;
  ccidNumber: string;
  imsiNumber: string;
  telecomOperator: string;
  simType: string;
  noOfNetwork: number;
  mobileNo1: string;
  mobileNo2?: string;
  networkSupport: string;
  apn1: string;
  apn2?: string;
  status: string;
}

interface DeviceOnboardingListResponse {
  data: DeviceOnboardingData[];
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

// Vehicle Master interface for dropdown
export interface VehicleMaster {
  _id: string;
  vehicleNumber: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleModule: string;
  driverModule: string;
}

// Account interface for dropdown
export interface Account {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
}

// Account hierarchy response
interface AccountHierarchyResponse {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
  children: Account[];
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

export interface DeviceModule {
  _id: string;
  deviceId: string;
  modelName: string;
  deviceType: string;
  manufacturerName: string;
  ipAddress: string;
  port: number;
  status: string;
}

// Transform API device onboarding data to Row format
const transformDeviceOnboardingToRow = (device: DeviceOnboardingData): Row => ({
  id: device._id,
  accountName: device.accountDetails?.accountName || "N/A",
  deviceIMEI: device.deviceIMEI,
  deviceSerialNo: device.deviceSerialNo,
  deviceModelName: device.deviceDetails?.modelName || "N/A",
  deviceType: device.deviceDetails?.deviceType || "N/A",
  simNo1: device.simNo1,
  simNo2: device.simNo2,
  simNo1Operator: device.simNo1Operator,
  simNo2Operator: device.simNo2Operator,
  vehicleNo: device.vehicleDetails?.vehicleNumber || "N/A",
  vehicleType: device.vehcileNoDetails?.vehicleType || "N/A",
  vehicleDescription: device.vehicleDescription,
  driverName: device.driverDetails?.name || "N/A",
  driverNo: device.driverDetails?.contactNo || "N/A",
  //  deviceModelName: device.deviceDetails?.modelName || "N/A",
  // deviceType: device.deviceDetails?.deviceType || "N/A",
  status: device.status || "active",
  createdTime: device.createdAt,
  updatedTime: device.updatedAt,
  inactiveTime: device.updatedAt,
  telecomMaster1: device.mobileNo1Details?.mobileNo1 || "N/A",
  telecomMaster2: device.mobileNo2Details?.mobileNo1 || "N/A",

  // Store IDs for edit functionality - ensure these are properly mapped
  account: device.account || "",
  vehicleModule: device?.vehcileNoDetails || "68411c4ca980074c6024ae6d", // This should be the vehicle module ID
  vehicleMaster: device.vehicle || "", // This should be the vehicle master ID
  driverModule: device.driver || "", // This should be the driver ID
  deviceModule: device.deviceModule || "",
  mobileNo1: device.mobileNo1 || "",
  mobileNo2: device.mobileNo2 || "",
});

export const deviceOnboardingServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<DeviceOnboardingListResponse> =
        await getRequest(urls.deviceOnboardingViewPath, {
          page,
          limit,
        });

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceOnboardingToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(
          response.message || "Failed to fetch device onboardings"
        );
      }
    } catch (error: any) {
      console.error("Error fetching device onboardings:", error.message);
      throw new Error(error.message || "Failed to fetch device onboardings");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<DeviceOnboardingData> = await getRequest(
        `${urls.deviceOnboardingViewPath}/${id}`
      );

      if (response.success) {
        return transformDeviceOnboardingToRow(response.data);
      } else {
        throw new Error(response.message || "Device Onboarding not found");
      }
    } catch (error: any) {
      console.error("Error fetching device onboarding:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch device onboarding");
    }
  },

  create: async (
    deviceData: Partial<Row>
  ): Promise<{ device: Row; message: string }> => {
    try {
      const payload = {
        account: deviceData.account,
        deviceIMEI: deviceData.deviceIMEI,
        deviceSerialNo: deviceData.deviceSerialNo,
        vehicleNo: deviceData.vehicleModule,
        // simNo1: deviceData.simNo1,
        // simNo2: deviceData.simNo2,
        // simNo1Operator: deviceData.simNo1Operator,
        // simNo2Operator: deviceData.simNo2Operator,
        vehicleDescription: deviceData.vehicleDescription,
        vehicle: deviceData.vehicleMaster,
        driver: deviceData.driverModule,
        deviceModule: deviceData.deviceModule,
        mobileNo1: deviceData.mobileNo1,
        mobileNo2: deviceData.mobileNo2,
        status: deviceData.status || "active",
      };

      const response: ApiResponse<DeviceOnboardingData> = await postRequest(
        urls.deviceOnboardingViewPath,
        payload
      );

      if (response.success) {
        return {
          device: transformDeviceOnboardingToRow(response.data),
          message: response.message || "Device created successfully",
        };
      } else {
        throw new Error(
          response.message || "Failed to create device onboarding"
        );
      }
    } catch (error: any) {
      console.error("Error creating device onboarding:", error.message);
      throw new Error(error.message || "Failed to create device onboarding");
    }
  },

  update: async (
    id: string | number,
    deviceData: Partial<Row>
  ): Promise<{ device: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (deviceData.account !== undefined)
        payload.account = deviceData.account;
      if (deviceData.deviceIMEI !== undefined)
        payload.deviceIMEI = deviceData.deviceIMEI;
      if (deviceData.deviceSerialNo !== undefined)
        payload.deviceSerialNo = deviceData.deviceSerialNo;
      if (deviceData.vehicleModule !== undefined)
        payload.vehicleNo = deviceData.vehicleModule;
      if (deviceData.simNo1 !== undefined) payload.simNo1 = deviceData.simNo1;
      if (deviceData.simNo2 !== undefined) payload.simNo2 = deviceData.simNo2;
      if (deviceData.simNo1Operator !== undefined)
        payload.simNo1Operator = deviceData.simNo1Operator;
      if (deviceData.simNo2Operator !== undefined)
        payload.simNo2Operator = deviceData.simNo2Operator;
      if (deviceData.vehicleDescription !== undefined)
        payload.vehicleDescription = deviceData.vehicleDescription;
      if (deviceData.vehicleMaster !== undefined)
        payload.vehicle = deviceData.vehicleMaster;
      if (deviceData.driverModule !== undefined)
        payload.driver = deviceData.driverModule;
      if (deviceData.status !== undefined) payload.status = deviceData.status;
      if (deviceData.deviceModule !== undefined)
        payload.deviceModule = deviceData.deviceModule;
      if (deviceData.mobileNo1 !== undefined)
        payload.mobileNo1 = deviceData.mobileNo1;
      if (deviceData.mobileNo2 !== undefined)
        payload.mobileNo2 = deviceData.mobileNo2;
      const response: ApiResponse<DeviceOnboardingData> = await patchRequest(
        `${urls.deviceOnboardingViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          device: transformDeviceOnboardingToRow(response.data),
          message: response.message || "Device updated successfully",
        };
      } else {
        throw new Error(
          response.message || "Failed to update device onboarding"
        );
      }
    } catch (error: any) {
      console.error("Error updating device onboarding:", error.message);
      throw new Error(error.message || "Failed to update device onboarding");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<DeviceOnboardingData> = await patchRequest(
        `${urls.deviceOnboardingViewPath}/${id}`,
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
      if (!searchText.trim()) {
        return deviceOnboardingServices.getAll(page, limit);
      }

      const response: ApiResponse<DeviceOnboardingListResponse> =
        await getRequest(`${urls.deviceOnboardingViewPath}/search`, {
          searchText: searchText.trim(),
          page,
          limit,
        });

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceOnboardingToRow),
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
      console.error("Error searching device onboardings:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },

  // Get Vehicle Modules for dropdown
  getVehicleModules: async (): Promise<VehicleModule[]> => {
    try {
      const response: ApiResponse<{ data: VehicleModule[] }> = await getRequest(
        urls.vehiclesViewPath,
        {
          page: 1,
          limit: 0,
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

  // Get Vehicle Masters for dropdown
  getVehicleMasters: async (): Promise<VehicleMaster[]> => {
    try {
      const response: ApiResponse<{ data: VehicleMaster[] }> = await getRequest(
        urls.vehicleMastersViewPath,
        {
          page: 1,
          limit: 0,
        }
      );

      if (response.success) {
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to fetch vehicle masters");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle masters:", error.message);
      throw new Error(error.message || "Failed to fetch vehicle masters");
    }
  },

  // Get Account Hierarchy for dropdown
  getAccountHierarchy: async (): Promise<Account[]> => {
    try {
      const response: ApiResponse<AccountHierarchyResponse> = await getRequest(
        `${urls.accountsViewPath}/${store.getState()?.auth?.user?.account?._id
        }/hierarchy-optimized`
      );
      if (response.success) {
        // Extract immediate children accounts
        return response.data.children.filter(
          (account) => account.status === "active"
        );
      } else {
        throw new Error(
          response.message || "Failed to fetch account hierarchy"
        );
      }
    } catch (error: any) {
      console.error("Error fetching account hierarchy:", error.message);
      throw new Error(error.message || "Failed to fetch account hierarchy");
    }
  },

  // Add getDeviceModules service method
  getDeviceModules: async (): Promise<DeviceModule[]> => {
    try {
      const response: ApiResponse<{ data: DeviceModule[] }> = await getRequest(
        urls.devicesViewPath,
        {
          page: 1,
          limit: 0,
        }
      );

      if (response.success) {
        return response.data.data.filter(
          (device) => device.status === "active"
        );
      } else {
        throw new Error(response.message || "Failed to fetch device modules");
      }
    } catch (error: any) {
      console.error("Error fetching device modules:", error.message);
      throw new Error(error.message || "Failed to fetch device modules");
    }
  },

  // Get Telecom Masters for dropdown
  getTelecomMasters: async (): Promise<TelecomMaster[]> => {
    try {
      const response: ApiResponse<{ data: TelecomMaster[] }> = await getRequest(
        urls.telecomMasterViewPath,
        {
          page: 1,
          limit: 0,
        }
      );

      if (response.success) {
        return response.data.data.filter(
          (telecom) => telecom.status === "active"
        );
      } else {
        throw new Error(response.message || "Failed to fetch telecom masters");
      }
    } catch (error: any) {
      console.error("Error fetching telecom masters:", error.message);
      throw new Error(error.message || "Failed to fetch telecom masters");
    }
  },
};
