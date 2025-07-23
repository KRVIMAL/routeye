// Reports services for all report types
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
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

interface ImeiDevice {
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

interface AccountHierarchyResponse {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
  accountId: string;
  children: AccountHierarchyResponse[];
  parentAccount: any;
}

interface ReportPayload {
  imei: string;
  account: string;
  startDate: string;
  endDate: string;
  clientId: string;
}

export type ReportType = 
  | "deviceData" 
  | "distance" 
  | "ignition" 
  | "overstoppage" 
  | "geofence" 
  | "loadSensor" 
  | "overspeed" 
  | "routeDeviation";

// Pagination response interface
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  rawData?:any;
}

// Report endpoints mapping
const REPORT_ENDPOINTS: Record<ReportType, string> = {
  deviceData: "/track-data/deviceData-report",
  distance: "/track-data/distance-report",
  ignition: "/track-data/ignition-report",
  overstoppage: "/track-data/overStop-report",
  geofence: "/track-data/geofence-report",
  loadSensor: "/track-data/loadSensor-report",
  overspeed: "/track-data/overspeed-report",
  routeDeviation: "/track-data/route-deviation-report"
};

// CSV export endpoints mapping (correct backend URLs)
const CSV_EXPORT_ENDPOINTS: Record<ReportType, string> = {
  deviceData: "/track-data/deviceData-report/csv",
  distance: "/track-data/distance-report/csv", 
  ignition: "/track-data/ignition-report/csv",
  overstoppage: "/track-data/overStop-report/csv",
  geofence: "/track-data/geofence-report/csv",
  loadSensor: "/track-data/loadSensor-report/csv",
  overspeed: "/track-data/overspeed-report/csv",
  routeDeviation: "/track-data/route-deviation-report/csv"
};

// Transform Device Data to Row format
const transformDeviceDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.records && dayData.records.length > 0) {
        dayData.records.forEach((record: any) => {
          rows.push({
            id: `${record.deviceImei}-${record.timestampUTC}`,
            timestamp: record.timestamp,
            imei: record.deviceImei,
            vehicleNo: record.vechileNo,
            latitude: record.latitude,
            longitude: record.longitude,
            speed: record.speed,
            altitude: record.altitude,
            ignition: record.ignition,
            satelliteUsed: record.satelliteUsed,
            signalStrength: record.signalStrength,
            batteryVoltage: record.externalBatteryVoltage,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Distance Data to Row format
const transformDistanceDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.sessions && dayData.sessions.length > 0) {
        dayData.sessions.forEach((session: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            sessionType: "Movement",
            startTime: session.t1,
            endTime: session.t2,
            distance: session.dc,
            startLocation: session.l1,
            endLocation: session.l2,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Ignition Data to Row format
const transformIgnitionDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.sessions && dayData.sessions.length > 0) {
        dayData.sessions.forEach((session: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            sessionType: session.sessionType,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            startLocation: session.startLocation,
            endLocation: session.endLocation,
            ignitionStatus: session.ignitionStatus,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Overstoppage Data to Row format
const transformOverstoppageDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.sessions && dayData.sessions.length > 0) {
        dayData.sessions.forEach((session: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            sessionType: session.sessionType,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            location: session.location,
            engineStatus: session.engineStatus,
            isOverstayage: session.isOverstayage || false,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Geofence Data to Row format
const transformGeofenceDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.events && dayData.events.length > 0) {
        dayData.events.forEach((event: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            eventType: event.eventType,
            timestamp: event.timestamp,
            geofenceName: event.geofenceName,
            location: event.location,
            duration: event.duration || "N/A",
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Load Sensor Data to Row format
const transformLoadSensorDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.readings && dayData.readings.length > 0) {
        dayData.readings.forEach((reading: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            timestamp: reading.timestamp,
            loadValue: reading.ain1Value,
            averageLoad: reading.averageLoad,
            maxLoad: dayData.maxLoad,
            minLoad: dayData.minLoad,
            windowSize: reading.windowSize,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Overspeed Data to Row format
const transformOverspeedDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.events && dayData.events.length > 0) {
        dayData.events.forEach((event: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            startTime: event.startTime,
            endTime: event.endTime,
            maxSpeed: event.maxSpeed,
            speedLimit: event.speedLimit,
            duration: event.duration,
            location: event.location,
          });
        });
      }
    });
  }
  
  return rows;
};

// Transform Route Deviation Data to Row format
const transformRouteDeviationDataToRow = (data: any): Row[] => {
  const rows: Row[] = [];
  
  if (data.dayWiseData && data.dayWiseData.length > 0) {
    data.dayWiseData.forEach((dayData: any) => {
      if (dayData.events && dayData.events.length > 0) {
        dayData.events.forEach((event: any, index: number) => {
          rows.push({
            id: `${dayData.date}-${index}`,
            date: dayData.date,
            timestamp: event.timestamp,
            routeName: event.routeName,
            deviationDistance: event.deviationDistance,
            duration: event.duration,
            location: event.location,
          });
        });
      }
    });
  }
  
  return rows;
};

export const reportsServices = {
  // Get client ID from store
  getClientId: (): string => {
    
    return  "fmb920";
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

  // Get IMEI details by account
  getImeiByAccount: async (accountId: string): Promise<ImeiDevice[]> => {
    try {
      const response: ApiResponse<ImeiDevice[]> = await getRequest(
        `${urls.deviceOnboardingViewPath}/imei-details`,
        {
          accountId: accountId,
        }
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

  // Get Report Data with pagination (using accountId parameter)
  getReportData: async (
    reportType: ReportType,
    imei: string,
    accountId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const endpoint = REPORT_ENDPOINTS[reportType];
      if (!endpoint) {
        throw new Error(`Unknown report type: ${reportType}`);
      }

      // Use accountId parameter
      const payload: ReportPayload = {
        imei,
        account: accountId,
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
        clientId: "fmb920",
      };

      const response: ApiResponse<any> = await postRequest(endpoint, payload);

      if (response.success) {
        let transformedData: Row[] = [];
        
        // Transform data based on report type
        switch (reportType) {
          case "deviceData":
            transformedData = transformDeviceDataToRow(response.data);
            break;
          case "distance":
            transformedData = transformDistanceDataToRow(response.data);
            break;
          case "ignition":
            transformedData = transformIgnitionDataToRow(response.data);
            break;
          case "overstoppage":
            transformedData = transformOverstoppageDataToRow(response.data);
            break;
          case "geofence":
            transformedData = transformGeofenceDataToRow(response.data);
            break;
          case "loadSensor":
            transformedData = transformLoadSensorDataToRow(response.data);
            break;
          case "overspeed":
            transformedData = transformOverspeedDataToRow(response.data);
            break;
          case "routeDeviation":
            transformedData = transformRouteDeviationDataToRow(response.data);
            break;
          default:
            transformedData = [];
        }

        // Implement client-side pagination since API doesn't support it
        const startIndex = (page - 1) * limit;
        const endIndex = limit === 0 ? transformedData.length : startIndex + limit;
        const paginatedData = limit === 0 ? transformedData : transformedData.slice(startIndex, endIndex);
        const totalPages = limit === 0 ? 1 : Math.ceil(transformedData.length / limit);

        return {
          data: paginatedData,
          total: transformedData.length,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          rawData:response.data
        };
      } else {
        throw new Error(response.message || `Failed to fetch ${reportType} data`);
      }
    } catch (error: any) {
      console.error(`Error fetching ${reportType} data:`, error.message);
      throw new Error(error.message || `Failed to fetch ${reportType} data`);
    }
  },

  // Export report as CSV (using accountId parameter)
  exportReport: async (
    reportType: ReportType,
    imei: string,
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<void> => {
    try {
      const endpoint = CSV_EXPORT_ENDPOINTS[reportType];
      if (!endpoint) {
        throw new Error(`CSV export not available for ${reportType}`);
      }

      // Convert params to query string (correct backend format)
      const queryParams = new URLSearchParams({
        imei,
        account: accountId, // Use accountId parameter
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
        clientId: "fmb920",
      });

      const exportUrl = `${endpoint}?${queryParams.toString()}`;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = `${urls.baseURL}${exportUrl}`;
      link.download = `${reportType}_report_${imei}_${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      console.error(`Error exporting ${reportType} report:`, error.message);
      throw new Error(error.message || `Failed to export ${reportType} report`);
    }
  },

  // Get available device types (for future enhancements)
  getDeviceTypes: async (): Promise<any[]> => {
    try {
      const response: ApiResponse<{ data: any[] }> = await getRequest(
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

  // Get available IMEIs (hardcoded for now, similar to device data)
  getAvailableIMEIs: async (): Promise<string[]> => {
    try {
      // Hardcoded IMEI list as in device data services
      const hardcodedIMEIs = [
        "0356860820043161",
        "350317177912155",
        "866477069411380",
        "220604557",
        "350317177912156",
        "350317177912157",
        "350317177912158",
        "350317177912159",
        "350317177912160",
        "350317177912161",
        "350317177912162",
        "350317177912163",
        "350317177912164",
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return hardcodedIMEIs;
    } catch (error: any) {
      console.error("Error fetching IMEIs:", error.message);
      throw new Error(error.message || "Failed to fetch IMEIs");
    }
  },

  // Validate report parameters
  validateReportParams: (payload: ReportPayload): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!payload.imei || payload.imei.trim() === "") {
      errors.push("IMEI is required");
    }

    if (!payload.account || payload.account.trim() === "") {
      errors.push("Account is required");
    }

    if (!payload.startDate || payload.startDate.trim() === "") {
      errors.push("Start date is required");
    }

    if (!payload.endDate || payload.endDate.trim() === "") {
      errors.push("End date is required");
    }

    if (!payload.clientId || payload.clientId.trim() === "") {
      errors.push("Client ID is required");
    }

    // Validate date format and range
    if (payload.startDate && payload.endDate) {
      const startDate = new Date(payload.startDate);
      const endDate = new Date(payload.endDate);
      
      if (startDate > endDate) {
        errors.push("Start date cannot be after end date");
      }

      // Check if date range is not too large (e.g., more than 31 days)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 31) {
        errors.push("Date range cannot exceed 31 days");
      }
    }

    // Validate IMEI format (basic validation)
    if (payload.imei && !/^\d{15,17}$/.test(payload.imei.replace(/\s/g, ""))) {
      errors.push("IMEI should be 15-17 digits");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },
};