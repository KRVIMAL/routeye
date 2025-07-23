// Road Master services - Read-only data display with search and export
import { Row } from "../../../../components/ui/DataTable/types";
import { getRequest } from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface RoadMasterData {
  _id: string;
  stateName: string;
  districtName: string;
  piuName: string;
  roadCode: string;
  schemeType: string;
  roadName: string;
  contractorName: string;
  packageNo: string;
  sanctionLength: number;
  completedRoadLength: number;
  sanctionDate: string;
  awardDate: string;
  completionDate: string;
  pmisFinalizeDate: string;
  activityName: string;
  activityQuantity: number;
  activityStartDate: string;
  activityCompletionDate: string;
  actualActivityStartDate: string;
  actualActivityCompletionDate: string;
  executedQuantity: number;
  stateCode: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface RoadMasterListResponse {
  data: RoadMasterData[];
  pagination: {
    page: number;
    limit: number;
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

// Transform API road master data to Row format
const transformRoadMasterToRow = (roadData: RoadMasterData): Row => ({
  id: roadData._id,
  stateName: roadData.stateName,
  districtName: roadData.districtName,
  schemeType: roadData.schemeType,
  packageNo: roadData.packageNo,
  roadCode: roadData.roadCode,
  roadName: roadData.roadName,
  piuName: roadData.piuName,
  contractorName: roadData.contractorName,
  // Note: These fields are not in the API response, will show as "N/A"
  noOfDevices: "N/A",
  workStage: "N/A",
  deviceInstallationStatus: "N/A",
  kmlDataStatus: "N/A",
  // End of fields not in API
  sanctionDate: roadData.sanctionDate,
  sanctionLength: roadData.sanctionLength,
  activityName: roadData.activityName,
  activityQuantity: roadData.activityQuantity,
  activity: roadData.activityName, // Same as activityName
  actualActivityStartDate: roadData.actualActivityStartDate,
  activityCompletionDate: roadData.activityCompletionDate,
  actualActivityCompletionDate: roadData.actualActivityCompletionDate,
  awardDate: roadData.awardDate,
  completedRoadLength: roadData.completedRoadLength,
  completionDate: roadData.completionDate,
  executedQuantity: roadData.executedQuantity,
  pmisFinalizeDate: roadData.pmisFinalizeDate,
  status: "active", // Default status as not provided in API
  createdTime: roadData.createdAt,
  updatedTime: roadData.updatedAt,
  inactiveTime: roadData.updatedAt,
});

// Hardcoded state code - you can replace this with dynamic value later
const STATE_CODE = "14";

export const roadMasterServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<RoadMasterListResponse> = await getRequest(
        `${urls.roadMasterViewPath}/${STATE_CODE}`,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformRoadMasterToRow),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch road master data");
      }
    } catch (error: any) {
      console.error("Error fetching road master data:", error.message);
      throw new Error(error.message || "Failed to fetch road master data");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return roadMasterServices.getAll(page, limit);
      }

      const response: ApiResponse<RoadMasterListResponse> = await getRequest(
        `${urls.roadMasterViewPath}/${STATE_CODE}`,
        {
          search: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformRoadMasterToRow),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching road master data:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },

  // Export function
  exportData: async (
    format: "csv" | "pdf" | "excel" = "csv"
  ): Promise<string> => {
    try {
      const response = await fetch(
        `${urls.roadMasterViewPath}/${STATE_CODE}/export?format=${format}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Handle different response types based on format
      if (format === "csv") {
        const csvData = await response.text();
        return csvData;
      } else {
        // For PDF/Excel, you might get a blob or URL
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `road-master-data.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return `Data exported successfully as ${format.toUpperCase()}`;
      }
    } catch (error: any) {
      console.error("Error exporting road master data:", error.message);
      throw new Error(error.message || "Failed to export data");
    }
  },
};
