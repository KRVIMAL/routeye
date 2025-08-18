// deviceOnboardingsServices.ts - Fixed Implementation with Filter API Integration
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
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    statuses?: Array<{ _id: string; count: number }>;
    accountNames?: Array<{ _id: string; count: number }>;
    vehicleNumbers?: Array<{ _id: string; count: number }>;
    driverNames?: Array<{ _id: string; count: number }>;
    deviceTypes?: Array<{ _id: string; count: number }>;
    telecomOperators?: Array<{ _id: string; count: number }>;
    mobileNumbers?: Array<{ _id: string; count: number }>;
    deviceIMEIs?: Array<{ _id: string; count: number }>;
    deviceSerialNos?: Array<{ _id: string; count: number }>;
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
  totalDevices: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  accountNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  vehicleNumbers: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  driverNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  deviceTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  telecomOperators: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  mobileNumbers: Array<{
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

export const deviceOnboardingServices = {
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
            case "status":
              payload.statuses = filter.value;
              break;
            case "accountName":
              payload.accountNames = filter.value;
              break;
            case "vehicleNo":
              payload.vehicleNumbers = filter.value;
              break;
            case "driverName":
              payload.driverNames = filter.value;
              break;
            case "deviceType":
              payload.deviceTypes = filter.value;
              break;
            case "telecomMaster1":
            case "telecomMaster2":
              payload.mobileNumbers = filter.value;
              break;
            case "deviceIMEI":
              payload.deviceIMEIs = filter.value;
              break;
            case "deviceSerialNo":
              payload.deviceSerialNos = filter.value;
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
      const response: ApiResponse<DeviceOnboardingListResponse> =
        await postRequest(`${urls.deviceOnboardingViewPath}/filter`, payload);

      if (response.success) {
        return {
          data: response.data.data.map(transformDeviceOnboardingToRow),
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
        throw new Error(
          response.message || "Failed to fetch device onboardings"
        );
      }
    } catch (error: any) {
      console.error("Error fetching device onboardings:", error.message);
      throw new Error(error.message || "Failed to fetch device onboardings");
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
        `${urls.deviceOnboardingViewPath}/filter-options`,
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
      accountName: "accountNames",
      vehicleNo: "vehicleNumbers",
      driverName: "driverNames",
      deviceType: "deviceTypes",
      telecomOperators: "telecomOperators",
      mobileNumbers: "mobileNumbers",
      deviceIMEI: "deviceIMEIs",
      deviceSerialNo: "deviceSerialNos",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
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

  // Export devices - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.deviceOnboardingViewPath}/export`;
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
            case "accountName":
              payload.accountNames = filter.value;
              break;
            case "vehicleNo":
              payload.vehicleNumbers = filter.value;
              break;
            case "driverName":
              payload.driverNames = filter.value;
              break;
            case "deviceType":
              payload.deviceTypes = filter.value;
              break;
            case "telecomMaster1":
            case "telecomMaster2":
              payload.mobileNumbers = filter.value;
              break;
            case "deviceIMEI":
              payload.deviceIMEIs = filter.value;
              break;
            case "deviceSerialNo":
              payload.deviceSerialNos = filter.value;
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

        url = `${urls.deviceOnboardingViewPath}/export-filtered`;
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

      const response = await fetch(`${urls.deviceOnboardingViewPath}/import`, {
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

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.deviceOnboardingViewPath}/filter-summary`
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
    return deviceOnboardingServices.getAll(page, limit, searchText);
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
        `${urls.accountsViewPath}/${
          store.getState()?.auth?.user?.account?._id
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
