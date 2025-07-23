// src/modules/clients/services/clients.services.ts
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

interface ClientData {
  clientId: string;
  _id: string;
  name: string;
  contactName: string;
  email: string;
  contactNo: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  stateName: string;
  cityName: string;
  remark: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ClientsListResponse {
  data: ClientData[];
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

// Transform API client data to Row format
const transformClientToRow = (client: ClientData): Row => ({
  clientId: client.clientId,
  id: client._id,
  name: client.name,
  contactName: client.contactName,
  email: client.email,
  contactNo: client.contactNo,
  panNumber: client.panNumber,
  aadharNumber: client.aadharNumber,
  gstNumber: client.gstNumber,
  stateName: client.stateName,
  cityName: client.cityName,
  remark: client.remark,
  status: client.status || "active",
  createdTime: client.createdAt,
  updatedTime: client.updatedAt,
  inactiveTime: client.updatedAt,
});

export const clientServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const response: ApiResponse<ClientsListResponse> = await getRequest(
        urls.clientsViewPath,
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformClientToRow),
          total: response.data.pagination.total,
          page: parseInt(response.data.pagination.page),
          limit: parseInt(response.data.pagination.limit),
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch clients");
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      throw new Error(error.message || "Failed to fetch clients");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<ClientData> = await getRequest(
        `${urls.clientsViewPath}/${id}`
      );

      if (response.success) {
        return transformClientToRow(response.data);
      } else {
        throw new Error(response.message || "Client not found");
      }
    } catch (error: any) {
      console.error("Error fetching client:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch client");
    }
  },

  create: async (
    clientData: Partial<Row>
  ): Promise<{ client: Row; message: string }> => {
    try {
      const payload = {
        name: clientData.name,
        contactName: clientData.contactName,
        email: clientData.email,
        contactNo: clientData.contactNo,
        panNumber: clientData.panNumber,
        aadharNumber: clientData.aadharNumber,
        gstNumber: clientData.gstNumber,
        stateName: clientData.stateName,
        cityName: clientData.cityName,
        remark: clientData.remark,
        status: clientData.status || "active",
      };

      const response: ApiResponse<ClientData> = await postRequest(
        urls.clientsViewPath,
        payload
      );

      if (response.success) {
        return {
          client: transformClientToRow(response.data),
          message: response.message || "Client created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create client");
      }
    } catch (error: any) {
      console.error("Error creating client:", error.message);
      throw new Error(error.message || "Failed to create client");
    }
  },

  update: async (
    id: string | number,
    clientData: Partial<Row>
  ): Promise<{ client: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (clientData.name !== undefined) payload.name = clientData.name;
      if (clientData.contactName !== undefined)
        payload.contactName = clientData.contactName;
      if (clientData.email !== undefined) payload.email = clientData.email;
      if (clientData.contactNo !== undefined)
        payload.contactNo = clientData.contactNo;
      if (clientData.panNumber !== undefined)
        payload.panNumber = clientData.panNumber;
      if (clientData.aadharNumber !== undefined)
        payload.aadharNumber = clientData.aadharNumber;
      if (clientData.gstNumber !== undefined)
        payload.gstNumber = clientData.gstNumber;
      if (clientData.stateName !== undefined)
        payload.stateName = clientData.stateName;
      if (clientData.cityName !== undefined)
        payload.cityName = clientData.cityName;
      if (clientData.remark !== undefined) payload.remark = clientData.remark;
      if (clientData.status !== undefined) payload.status = clientData.status;

      const response: ApiResponse<ClientData> = await patchRequest(
        `${urls.clientsViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          client: transformClientToRow(response.data),
          message: response.message || "Client updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update client");
      }
    } catch (error: any) {
      console.error("Error updating client:", error.message);
      throw new Error(error.message || "Failed to update client");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<ClientData> = await patchRequest(
        `${urls.clientsViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Client inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate client");
      }
    } catch (error: any) {
      console.error("Error inactivating client:", error.message);
      throw new Error(error.message || "Failed to inactivate client");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // If search is empty, return all clients
      if (!searchText.trim()) {
        return clientServices.getAll(page, limit);
      }

      const response: ApiResponse<ClientsListResponse> = await getRequest(
        `${urls.clientsViewPath}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformClientToRow),
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
      console.error("Error searching clients:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },
};
