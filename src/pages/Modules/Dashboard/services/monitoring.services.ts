// src/services/monitoringServices.ts
import { getRequest } from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";

// Define interfaces for monitoring API responses
interface MonitoringDevice {
  deviceImei: string;
  status: string;
  lastSeen: string;
  lastSeenFormatted: string;
  timeDifference: string;
  location: {
    latitude: number;
    longitude: number;
  };
  motion: number;
  ignition: number;
  speed: number;
  batteryPercentage: number;
  accountId: string;
  accountName: string;
  hierarchyPath: string;
  cacheTime: number;
  lastOTSTimestamp: number;
}

interface MonitoringSummary {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  haltCount: number;
  motionCount: number;
  idleCount: number;
  neverConnectedCount: number;
}

interface MonitoringPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface MonitoringPerformance {
  responseTime: number;
  totalDevicesChecked: number;
  cacheHitRate: number;
  autoRefreshed: boolean;
  forceRefreshed: boolean;
  cacheAge: number;
  freshDataFetched: number;
  newDataDetected: boolean;
  realTimeInvalidations: number;
}

interface MonitoringDebug {
  cacheSettings: {
    ttlSeconds: number;
    maxAgeMinutes: number;
    onlineThresholdMinutes: number;
  };
  cacheInfo: {
    hitRate: number;
    averageAge: number;
    freshDataCount: number;
    staleCount: number;
    totalCached: number;
    totalDevices: number;
    realTimeInvalidations: number;
  };
  lastRefreshTime: number;
  totalRefreshes: number;
  hasNewData: boolean;
  cacheIsStale: boolean;
}

export interface MonitoringResponse {
  summary: MonitoringSummary;
  devices: MonitoringDevice[] | null;
  pagination: MonitoringPagination;
  performance: MonitoringPerformance;
  debug: MonitoringDebug;
}

export const monitoringServices = {
  getDevicesMonitoring: async (
    accountId: string,
    clientId?: string
  ): Promise<MonitoringResponse> => {
    try {
      const params: any = { accountId };
      if (clientId) {
        params.clientId = clientId;
      }

      const response = await getRequest(urls.monitoringDevicesPath, params);
      
      return response;
    } catch (error: any) {
      console.error("Error fetching monitoring data:", error.message);
      throw new Error(error.message || "Failed to fetch monitoring data");
    }
  },

  // Get monitoring data with refresh
  getDevicesMonitoringWithRefresh: async (
    accountId: string,
    clientId?: string,
    forceRefresh: boolean = false
  ): Promise<MonitoringResponse> => {
    try {
      const params: any = { accountId, forceRefresh };
      if (clientId) {
        params.clientId = clientId;
      }

      const response = await getRequest(urls.monitoringDevicesPath, params);
      
      return response;
    } catch (error: any) {
      console.error("Error fetching monitoring data with refresh:", error.message);
      throw new Error(error.message || "Failed to fetch monitoring data");
    }
  },
};