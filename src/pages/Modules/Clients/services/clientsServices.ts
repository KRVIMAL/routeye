// clientsServices.ts - Fixed Implementation with Filter API Integration
import { Row } from "../../../../components/ui/DataTable/types";
import {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
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
    page: string | number;
    limit: string | number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    statuses?: Array<{ _id: string; count: number }>;
    stateNames?: Array<{ _id: string; count: number }>;
    cityNames?: Array<{ _id: string; count: number }>;
    names?: Array<{ _id: string; count: number }>;
    contactNames?: Array<{ _id: string; count: number }>;
    emails?: Array<{ _id: string; count: number }>;
    contactNos?: Array<{ _id: string; count: number }>;
    panNumbers?: Array<{ _id: string; count: number }>;
    aadharNumbers?: Array<{ _id: string; count: number }>;
    gstNumbers?: Array<{ _id: string; count: number }>;
    clientIds?: Array<{ _id: string; count: number }>;
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

// Filter interface
interface Filter {
  field: string;
  value: any[];
  label?: string;
}

interface FilterSummaryResponse {
  totalClients: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  stateNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  cityNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
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

      // Transform filters to the API format
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          switch (filter.field) {
            case "status":
              payload.statuses = filter.value;
              break;
            case "stateName":
              payload.stateNames = filter.value;
              break;
            case "cityName":
              payload.cityNames = filter.value;
              break;
            case "name":
              payload.names = filter.value;
              break;
            case "contactName":
              payload.contactNames = filter.value;
              break;
            case "email":
              payload.emails = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "panNumber":
              payload.panNumbers = filter.value;
              break;
            case "aadharNumber":
              payload.aadharNumbers = filter.value;
              break;
            case "gstNumber":
              payload.gstNumbers = filter.value;
              break;
            case "clientId":
              payload.clientIds = filter.value;
              break;
            default:
              payload[`${filter.field}s`] = filter.value;
          }
        });
      }

      // Always use the filter endpoint
      const response: ApiResponse<ClientsListResponse> = await postRequest(
        `${urls.clientsViewPath}/filter`,
        payload
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformClientToRow),
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
        throw new Error(response.message || "Failed to fetch clients");
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      throw new Error(error.message || "Failed to fetch clients");
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
        `${urls.clientsViewPath}/filter-options`,
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
      stateName: "stateNames",
      cityName: "cityNames",
      name: "names",
      contactName: "contactNames",
      email: "emails",
      contactNo: "contactNos",
      panNumber: "panNumbers",
      aadharNumber: "aadharNumbers",
      gstNumber: "gstNumbers",
      clientId: "clientIds",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get client by ID
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

  // Create new client
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

  // Update client
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

      const response: ApiResponse<ClientData> = await putRequest(
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

  // Inactivate client (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
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

  // Export clients - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.clientsViewPath}/export`;
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
            case "stateName":
              payload.stateNames = filter.value;
              break;
            case "cityName":
              payload.cityNames = filter.value;
              break;
            case "name":
              payload.names = filter.value;
              break;
            case "contactName":
              payload.contactNames = filter.value;
              break;
            case "email":
              payload.emails = filter.value;
              break;
            case "contactNo":
              payload.contactNos = filter.value;
              break;
            case "panNumber":
              payload.panNumbers = filter.value;
              break;
            case "aadharNumber":
              payload.aadharNumbers = filter.value;
              break;
            case "gstNumber":
              payload.gstNumbers = filter.value;
              break;
            case "clientId":
              payload.clientIds = filter.value;
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

        url = `${urls.clientsViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting clients:", error.message);
      throw new Error(error.message || "Failed to export clients");
    }
  },

  // Import clients
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.clientsViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Clients imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import clients");
      }
    } catch (error: any) {
      console.error("Error importing clients:", error.message);
      throw new Error(error.message || "Failed to import clients");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.clientsViewPath}/filter-summary`
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
    return clientServices.getAll(page, limit, searchText);
  },
};
