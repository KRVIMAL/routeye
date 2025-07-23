// Device Data services for hex data and track data
import { Row } from "../../../../components/ui/DataTable/types";
import { getRequest } from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";
import { store } from "../../../../store";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface HexDataItem {
  _id: string;
  topic: string;
  partition: number;
  offset: number;
  timestamp: string;
  created_at: string;
  imei: string;
  rawHexData: string;
  resp:string;
  clientId:string|number;
}

interface TrackDataItem {
  _id: string;
  account: string;
  activeGSMOperator: number;
  ain1: number;
  clientId: string;
  course: number;
  digitalInput1: number;
  gnssFixStatus: number;
  packetType: string;
  accStatus: number;
  externalBatteryVoltage: number;
  heading: number;
  motion: number;
  signalStrength: number;
  speed: number;
  batteryPercentage: number;
  gpsValidStatus: number;
  lac1: number;
  sateliteInView: number;
  vechileNo: string;
  chargingCurrent: number;
  iccid: string;
  insertedAt: string;
  ots: string;
  totalOdometer: number;
  analogInput1: number;
  cellId1: number;
  device: string;
  deviceImei: string;
  gnssModuleStatus: string;
  internalBatteryStatus: number;
  satelliteUsed: number;
  internalBatteryVoltage: number;
  altitude: number;
  chargingMedium: string;
  din1: number;
  gpsModuleOnOff: number;
  hdop: number;
  ignition: number;
  imsi: string;
  pdop: number;
  resp: string;
  rts: string;
  dateTime: string;
  dateTimeUTC: string;
  latitude?: number;
  longitude?: number;
}


interface DataListResponse<T> {
  data: T[];
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

// Transform hex data to Row format
const transformHexDataToRow = (hexData: HexDataItem): Row => ({
  id: hexData._id,
  topic: hexData.topic,
  response:hexData.resp,
  partition: hexData.partition,
  offset: hexData.offset,
  timestamp: new Date(hexData.timestamp).toLocaleString(),
  created_at: new Date(hexData.created_at).toLocaleString(),
  imei: hexData.imei,
  rawHexData: hexData.rawHexData,
  clientId:hexData.clientId,
});

// Transform track data to Row format
const transformTrackDataToRow = (trackData: TrackDataItem): Row => ({
  id: trackData._id,
  imei: trackData.deviceImei,
  deviceType: trackData.device || "N/A",
  dateTime: trackData.dateTime
    ? new Date(trackData.dateTime).toLocaleString()
    : "N/A",
  latitude:
    trackData.latitude !== undefined ? trackData.latitude.toFixed(6) : "N/A",
  longitude:
    trackData.longitude !== undefined ? trackData.longitude.toFixed(6) : "N/A",
  speed: trackData.speed !== undefined ? trackData.speed : "N/A",
  bearing: trackData.course !== undefined ? trackData.course : "N/A", // course is bearing
  altitude: trackData.altitude !== undefined ? trackData.altitude : "N/A",
  satellites: trackData.satelliteUsed !== undefined ? trackData.satelliteUsed : "N/A",
  ignition: trackData.ignition === 1 ? "Ignition On" : "Ignition Off",
  motion: trackData.motion === 1 ? "Moving" : "Stationary",
  gsmSignalStrength:
    trackData.signalStrength !== undefined ? trackData.signalStrength : "N/A",
  externalVoltage:
    trackData.externalBatteryVoltage !== undefined ? trackData.externalBatteryVoltage : "N/A",
  gnssStatus: trackData.gnssModuleStatus || "N/A",
  clientId: trackData.clientId,
  // Additional fields from API
  vehicleNo: trackData.vechileNo || "N/A",
  packetType: trackData.packetType || "N/A",
  totalOdometer: trackData.totalOdometer !== undefined ? trackData.totalOdometer : "N/A",
  batteryPercentage: trackData.batteryPercentage !== undefined ? trackData.batteryPercentage : "N/A",
  hdop: trackData.hdop !== undefined ? trackData.hdop : "N/A",
  pdop: trackData.pdop !== undefined ? trackData.pdop : "N/A",
  gpsValidStatus: trackData.gpsValidStatus === 1 ? "Valid" : "Invalid",
  gnssFixStatus: trackData.gnssFixStatus === 1 ? "Fixed" : "Not Fixed",
});


export const deviceDataServices = {
  // Get Hex Data
  getHexData: async (
    imei: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
    clientId:string="fmb920",
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<DataListResponse<HexDataItem>> =
        await getRequest(urls.hexDataViewPath, {
          imei,
          startDate,
          endDate,
          clientId,
          page,
          limit,
        });

      if (response.success) {
        return {
          data: response.data.data.map(transformHexDataToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch hex data");
      }
    } catch (error: any) {
      console.error("Error fetching hex data:", error.message);
      throw new Error(error.message || "Failed to fetch hex data");
    }
  },

  // Get Track Data
  getTrackData: async (
    imei: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
    clientId:string="fmb920",
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<DataListResponse<TrackDataItem>> =
        await getRequest(urls.trackDataViewPath, {
          imei,
          startDate,
          endDate,
          clientId,
          page,
          limit,
        });
      if (response.success) {
        return {
          data: response.data.data.map(transformTrackDataToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch track data");
      }
    } catch (error: any) {
      console.error("Error fetching track data:", error.message);
      throw new Error(error.message || "Failed to fetch track data");
    }
  },

  // Get available IMEIs (hardcoded for now, can be replaced with API call later)
  getAvailableIMEIs: async (): Promise<string[]> => {
    try {
      // Hardcoded IMEI list as requested
      // TODO: Replace with actual API call when available
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
};
