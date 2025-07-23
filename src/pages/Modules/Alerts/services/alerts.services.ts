// Alerts services with complex relationship mapping
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

// Device Type interface
export interface DeviceType {
  _id: string;
  deviceId: string;
  modelName: string;
  deviceType: string;
  manufacturerName: string;
  ipAddress: string;
  port: number;
  status: string;
}

// Account interface
export interface Account {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
  accountId: string;
  children: Account[];
}

// Group interface
export interface Group {
  _id: string;
  groupId: string;
  groupName: string;
  status: string;
}

// IMEI Device interface
export interface ImeiDevice {
  _id: string;
  deviceOnboardingId: string;
  account: string;
  deviceModule: string;
  deviceIMEI: string;
  deviceSerialNo: string;
  simNo1: string;
  simNo2: string;
  simNo1Operator: string;
  simNo2Operator: string;
  vehicleDescription: string;
  vehicle: string;
  driver: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  accountDetails: {
    _id: string;
    accountName: string;
    clientId: string;
  };
  vehicleDetails: {
    _id: string;
    vehicleNumber: string;
  };
  deviceDetails: {
    deviceId: string;
    modelName: string;
    deviceType: string;
    manufacturerName: string;
    ipAddress: string;
    port: number;
  };
}

// Contact Details interfaces
export interface WhatsappContact {
  name: string;
  number: string;
  countryCode: string;
  _id?: string;
}

export interface EmailContact {
  name: string;
  email: string;
  _id?: string;
}

export interface SmsContact {
  name: string;
  number: string;
  countryCode: string;
  _id?: string;
}

export interface TelegramContact {
  name: string;
  username: string;
  chatId: string;
  _id?: string;
}

export interface IvrContact {
  name: string;
  number: string;
  countryCode: string;
  _id?: string;
}

export interface ContactDetails {
  whatsappContacts: WhatsappContact[];
  emailContacts: EmailContact[];
  smsContacts: SmsContact[];
  telegramContacts: TelegramContact[];
  ivrContacts: IvrContact[];
  _id?: string;
}

// Alert Criteria interface
export interface AlertCriteria {
  lock: boolean;
  unlock: boolean;
  ignitionOn: boolean;
  ignitionOff: boolean;
  speeding: boolean;
  fuelLow: boolean;
  fuelTheft: boolean;
  fuelRefill: boolean;
  fuelDrain: boolean;

  // ADVANCED TRACKER CRITERIA (properly structured):
  geofence?: {
    enabled: boolean;
    geofenceList: Array<{
      in?: boolean;
      out?: boolean;
      geofenceInList?: string[];
      geofenceOutList?: string[];
    }>;
  };
  overspeed?: {
    enabled: boolean;
    threshold: string; // "100km/h"
  };
  overStoppage?: {
    enabled: boolean;
    threshold: string; // "30min"
  };
  ignition?: {
    enabled: boolean;
    on: boolean;
    off: boolean;
  };
  routeDeviation?: {
    enabled: boolean;
    threshold: string; // "300m"
    routeList: string[];
  };
  _id?: string;
}

// Notifications interface
export interface Notifications {
  logs: boolean;
  push: boolean;
  trigger: boolean;
  whatsapp: boolean;
  email: boolean;
  sms: boolean;
  telegram: boolean;
  ivr: boolean;
  acknowledgement: boolean;
  _id?: string;
}

// Alert Config interface
export interface AlertConfig {
  sno: number;
  imei: string;
  alertName: string[] | string;
  alertDescription: string;
  alertEnable: boolean;
  alertCriteria: AlertCriteria;
  alertPriority: "none" | "low" | "mid" | "high";
  notifications: Notifications;
  contactDetails: ContactDetails;
  template: string;
  _id?: string;
}

// Alert Data interface
export interface AlertData {
  _id: string;
  deviceType: {
    _id: string;
    deviceId: string;
    modelName: string;
    deviceType: string;
    status: string;
  };
  accountId?: {
    _id: string;
    accountId: string;
    accountName: string;
    parentAccount: string | null;
    clientId: string;
    status: string;
  };
  groupId?: {
    _id: string;
    groupId: string;
    groupName: string;
    status: string;
  };
  category: "fuel" | "load" | "elock";
  alertConfigs: AlertConfig[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalConfigs: number;
  activeConfigs: number;
  highPriorityConfigs: number;
}

// Alerts List Response
interface AlertsListResponse {
  data: AlertData[];
  pagination: {
    page: string;
    limit: string;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Add these interfaces to alerts.services.ts
export interface Geofence {
  _id: string;
  name: string;
  mobileNumber?: number;
  address: {
    zipCode: string;
    country: string;
    state: string;
    area: string;
    city: string;
    district: string;
  };
  finalAddress: string;
  geoCodeData: any;
  isPrivate: boolean;
  isPublic: boolean;
  status?: string;
}

export interface Route {
  _id: string;
  routeId: string;
  name: string;
  travelMode: string;
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  isDelete: boolean;
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

// Account hierarchy response
interface AccountHierarchyResponse {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
  accountId: string;
  children: Account[];
  parentAccount: any;
}

// Transform API alert data to Row format
const transformAlertToRow = (alert: AlertData): Row => ({
  id: alert._id,
  deviceType: alert.deviceType?.deviceType || "N/A",
  deviceModel: alert.deviceType?.modelName || "N/A",
  accountName: alert.accountId?.accountName || "N/A",
  groupName: alert.groupId?.groupName || "N/A",
  category: alert.category,
  totalConfigs: alert.totalConfigs,
  activeConfigs: alert.activeConfigs,
  highPriorityConfigs: alert.highPriorityConfigs,
  isActive: alert.isActive,
  createdTime: alert.createdAt,
  updatedTime: alert.updatedAt,
  // Store original data for edit
  originalData: alert,
});

export const alertServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<AlertsListResponse> = await getRequest(
        urls.alertsViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformAlertToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch alerts");
      }
    } catch (error: any) {
      console.error("Error fetching alerts:", error.message);
      throw new Error(error.message || "Failed to fetch alerts");
    }
  },

  getById: async (id: string | number): Promise<AlertData | null> => {
    try {
      const response: ApiResponse<AlertData> = await getRequest(
        `${urls.alertsViewPath}/${id}`
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Alert not found");
      }
    } catch (error: any) {
      console.error("Error fetching alert:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch alert");
    }
  },

  create: async (alertData: {
    deviceType: string;
    accountId?: string;
    groupId?: string;
    category: string;
    alertConfigs: AlertConfig[];
  }): Promise<{ alert: AlertData; message: string }> => {
    try {
      const payload = {
        deviceType: alertData.deviceType,
        ...(alertData.accountId && { accountId: alertData.accountId }),
        ...(alertData.groupId && { groupId: alertData.groupId }),
        category: alertData.category,
        alertConfigs: alertData.alertConfigs,
      };

      const response: ApiResponse<AlertData> = await postRequest(
        urls.alertsViewPath,
        payload
      );

      if (response.success) {
        return {
          alert: response.data,
          message: response.message || "Alert created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create alert");
      }
    } catch (error: any) {
      console.error("Error creating alert:", error.message);
      throw new Error(error.message || "Failed to create alert");
    }
  },

  update: async (
    id: string | number,
    alertData: {
      category: string;
      alertConfigs: AlertConfig[];
    }
  ): Promise<{ alert: AlertData; message: string }> => {
    try {
      const payload = {
        category: alertData.category,
        alertConfigs: alertData.alertConfigs,
      };

      const response: ApiResponse<AlertData> = await patchRequest(
        `${urls.alertsViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          alert: response.data,
          message: response.message || "Alert updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update alert");
      }
    } catch (error: any) {
      console.error("Error updating alert:", error.message);
      throw new Error(error.message || "Failed to update alert");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return alertServices.getAll(page, limit);
      }

      const response: ApiResponse<AlertsListResponse> = await getRequest(
        `${urls.alertsViewPath}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformAlertToRow),
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
      console.error("Error searching alerts:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },

  // Get Device Types for dropdown
  getDeviceTypes: async (): Promise<DeviceType[]> => {
    try {
      const response: ApiResponse<{ data: DeviceType[] }> = await getRequest(
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
        throw new Error(response.message || "Failed to fetch device types");
      }
    } catch (error: any) {
      console.error("Error fetching device types:", error.message);
      throw new Error(error.message || "Failed to fetch device types");
    }
  },

  // Get Account Hierarchy
  getAccountHierarchy: async (): Promise<AccountHierarchyResponse> => {
    try {
      const accountId = store.getState()?.auth?.user?.account?._id;
      if (!accountId) {
        throw new Error("Account ID not found in store");
      }

      const response: ApiResponse<AccountHierarchyResponse> = await getRequest(
        `${urls.accountsViewPath}/${accountId}/hierarchy-optimized`
      );

      if (response.success) {
        return response.data;
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

  // Get Groups for dropdown
  getGroups: async (): Promise<Group[]> => {
    try {
      const response: ApiResponse<{ data: Group[] }> = await getRequest(
        urls.groupsViewPath,
        {
          page: 1,
          limit: 0,
        }
      );

      if (response.success) {
        return response.data.data.filter((group) => group.status === "active");
      } else {
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      throw new Error(error.message || "Failed to fetch groups");
    }
  },

  // Get IMEI details based on device type and account/group
  getImeiDetails: async (
    deviceModuleId: string,
    accountId?: string,
    groupId?: string
  ): Promise<ImeiDevice[]> => {
    try {
      const params: any = {
        deviceModuleId,
      };

      if (accountId) {
        params.accountId = accountId;
      }

      if (groupId) {
        params.groupId = groupId;
      }

      const response: ApiResponse<ImeiDevice[]> = await getRequest(
        `${urls.deviceOnboardingViewPath}/imei-details`,
        params
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch IMEI details");
      }
    } catch (error: any) {
      console.error("Error fetching IMEI details:", error.message);
      throw new Error(error.message || "Failed to fetch IMEI details");
    }
  },

  getGeofences: async (): Promise<Geofence[]> => {
    try {
      const response: ApiResponse<{ data: Geofence[] }> = await getRequest(
        urls.geofencesViewPath,
        {
          page: 1,
          limit: 10,
        }
      );
      return response.success
        ? response.data.data.filter((g) => !g.isPrivate)
        : [];
    } catch (error) {
      console.error("Error fetching geofences:", error);
      return [];
    }
  },

  getRoutes: async (): Promise<Route[]> => {
    try {
      const response: ApiResponse<{ data: { routes: Route[] } }> =
        await getRequest(urls.routesViewPath, {
          page: 1,
          limit: 10,
        });

      if (response.success && response.data?.data?.routes) {
        return response.data.data.routes.filter((r) => !r.isDelete);
      }
      return [];
    } catch (error) {
      console.error("Error fetching routes:", error);
      return [];
    }
  },
};
