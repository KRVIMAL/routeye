// Telecom Master services with proper pagination response
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
} from "../../../../core-services/rest-api/apiHelpers";
import urls from "../../../../global/constants/UrlConstants";
// import urls from "../../../../global/constants/url-constants";

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface TelecomMasterData {
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
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TelecomMasterListResponse {
  data: TelecomMasterData[];
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

// Transform API telecom master data to Row format
const transformTelecomMasterToRow = (telecom: TelecomMasterData): Row => ({
  id: telecom._id,
  ccidNumber: telecom.ccidNumber,
  imsiNumber: telecom.imsiNumber,
  telecomOperator: telecom.telecomOperator,
  simType: telecom.simType,
  noOfNetwork: telecom.noOfNetwork,
  mobileNo1: telecom.mobileNo1,
  mobileNo2: telecom.mobileNo2 || "N/A",
  networkSupport: telecom.networkSupport,
  apn1: telecom.apn1,
  apn2: telecom.apn2 || "N/A",
  status: telecom.status,
  createdTime: telecom.createdAt,
  updatedTime: telecom.updatedAt,
  inactiveTime: telecom.updatedAt,
});

export const telecomMasterServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<TelecomMasterListResponse> = await getRequest(
        urls.telecomMasterViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformTelecomMasterToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch telecom masters");
      }
    } catch (error: any) {
      console.error("Error fetching telecom masters:", error.message);
      throw new Error(error.message || "Failed to fetch telecom masters");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<TelecomMasterData> = await getRequest(
        `${urls.telecomMasterViewPath}/${id}`
      );

      if (response.success) {
        return transformTelecomMasterToRow(response.data);
      } else {
        throw new Error(response.message || "Telecom Master not found");
      }
    } catch (error: any) {
      console.error("Error fetching telecom master:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch telecom master");
    }
  },

  create: async (
    telecomData: Partial<Row>
  ): Promise<{ telecom: Row; message: string }> => {
    try {
      const payload: any = {
        ccidNumber: telecomData.ccidNumber,
        imsiNumber: telecomData.imsiNumber,
        telecomOperator: telecomData.telecomOperator,
        simType: telecomData.simType,
        noOfNetwork: Number(telecomData.noOfNetwork),
        mobileNo1: telecomData.mobileNo1,
        networkSupport: telecomData.networkSupport,
        apn1: telecomData.apn1,
        status: telecomData.status || "active",
      };

      // Add optional fields only if they exist
      if (telecomData.mobileNo2 && telecomData.mobileNo2 !== "N/A") {
        payload.mobileNo2 = telecomData.mobileNo2;
      }
      if (telecomData.apn2 && telecomData.apn2 !== "N/A") {
        payload.apn2 = telecomData.apn2;
      }

      const response: ApiResponse<TelecomMasterData> = await postRequest(
        urls.telecomMasterViewPath,
        payload
      );

      if (response.success) {
        return {
          telecom: transformTelecomMasterToRow(response.data),
          message: response.message || "Telecom Master created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create telecom master");
      }
    } catch (error: any) {
      console.error("Error creating telecom master:", error.message);
      throw new Error(error.message || "Failed to create telecom master");
    }
  },

  update: async (
    id: string | number,
    telecomData: Partial<Row>
  ): Promise<{ telecom: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (telecomData.ccidNumber !== undefined)
        payload.ccidNumber = telecomData.ccidNumber;
      if (telecomData.imsiNumber !== undefined)
        payload.imsiNumber = telecomData.imsiNumber;
      if (telecomData.telecomOperator !== undefined)
        payload.telecomOperator = telecomData.telecomOperator;
      if (telecomData.simType !== undefined)
        payload.simType = telecomData.simType;
      if (telecomData.noOfNetwork !== undefined)
        payload.noOfNetwork = Number(telecomData.noOfNetwork);
      if (telecomData.mobileNo1 !== undefined)
        payload.mobileNo1 = telecomData.mobileNo1;
      if (
        telecomData.mobileNo2 !== undefined &&
        telecomData.mobileNo2 !== "N/A"
      )
        payload.mobileNo2 = telecomData.mobileNo2;
      if (telecomData.networkSupport !== undefined)
        payload.networkSupport = telecomData.networkSupport;
      if (telecomData.apn1 !== undefined) payload.apn1 = telecomData.apn1;
      if (telecomData.apn2 !== undefined && telecomData.apn2 !== "N/A")
        payload.apn2 = telecomData.apn2;
      if (telecomData.status !== undefined) payload.status = telecomData.status;

      const response: ApiResponse<TelecomMasterData> = await patchRequest(
        `${urls.telecomMasterViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          telecom: transformTelecomMasterToRow(response.data),
          message: response.message || "Telecom Master updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update telecom master");
      }
    } catch (error: any) {
      console.error("Error updating telecom master:", error.message);
      throw new Error(error.message || "Failed to update telecom master");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<TelecomMasterData> = await patchRequest(
        `${urls.telecomMasterViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message:
            response.message || "Telecom Master inactivated successfully",
        };
      } else {
        throw new Error(
          response.message || "Failed to inactivate telecom master"
        );
      }
    } catch (error: any) {
      console.error("Error inactivating telecom master:", error.message);
      throw new Error(error.message || "Failed to inactivate telecom master");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return telecomMasterServices.getAll(page, limit);
      }

      const response: ApiResponse<TelecomMasterListResponse> = await getRequest(
        urls.telecomMasterViewPath,
        {
          search: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformTelecomMasterToRow),
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
      console.error("Error searching telecom masters:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },
};
