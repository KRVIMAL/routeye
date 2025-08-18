// accountsServices.ts - Updated Implementation with New API Integration
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

interface ClientInfo {
  _id: string;
  clientId?: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AccountData {
  _id: string;
  accountId?: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  client?: ClientInfo;
  status: string;
  depth?: number;
  isRoot?: boolean;
  childrenCount?: number;
  parentAccount?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AccountsListResponse {
  accounts: AccountData[];
  pagination: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    skip: number;
  };
  parentAccount?: any;
}

interface AccountsFilterResponse {
  data: AccountData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterCounts?: {
    statuses?: Array<{ _id: string; count: number }>;
    levels?: Array<{ _id: number; count: number }>;
    accountNames?: Array<{ _id: string; count: number }>;
    clientNames?: Array<{ _id: string; count: number }>;
    accountIds?: Array<{ _id: string; count: number }>;
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
  totalAccounts: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  levels: Array<{
    count: number;
    value: number;
    label: number;
  }>;
  accountNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

// Client for dropdown
export interface Client {
  _id: string;
  clientId?: string;
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
  status: string;
}

// Helper function to get logged-in user account ID
const getLoggedInAccountId = (): string => {
  const stateData = localStorage.getItem("routeye-state");
  const data = JSON.parse(stateData!);
  // const state = data?.auth;
  const accountId = data?.auth?.user?.account?._id;
  if (!accountId) {
    throw new Error("User account ID not found. Please log in again.");
  }
  return accountId;
};

// Transform API account data to Row format
const transformAccountToRow = (
  account: any,
  parentAccountsMap?: Map<string, string>
): Row => {
  // Determine parent account name
  let parentAccountName = "Root Account";
  if (account.parentAccount) {
    if (typeof account.parentAccount === "string") {
      // If parentAccount is just an ID, try to get name from map
      parentAccountName =
        parentAccountsMap?.get(account.parentAccount) || "Parent Account";
    } else if (
      typeof account.parentAccount === "object" &&
      account.parentAccount?.accountName
    ) {
      // If parentAccount is an object with accountName
      parentAccountName = account.parentAccount?.accountName;
    }
  }

  return {
    id: account._id,
    accountId: account.accountId || "N/A",
    accountName: account.accountName,
    level: account.level,
    hierarchyPath: account.hierarchyPath,
    parentAccountName: parentAccountName,
    contactName: account.client?.contactName || "N/A",
    email: account.client?.email || "N/A",
    contactNo: account.client?.contactNo || "N/A",
    panNumber: account.client?.panNumber || "N/A",
    aadharNumber: account.client?.aadharNumber || "N/A",
    gstNumber: account.client?.gstNumber || "N/A",
    stateName: account.client?.stateName || "N/A",
    cityName: account.client?.cityName || "N/A",
    remark: account.client?.remark || "N/A",
    childrenCount: account.childrenCount || 0,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    // Store additional data for edit functionality
    parentAccount: account.parentAccount,
    clientId: account.client?._id || "",
    depth: account.depth || 0,
    isRoot: account.isRoot || false,
  };
};

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

export const accountServices = {
  // Default getAll method - uses hierarchy-optimized endpoint
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const accountId = getLoggedInAccountId();

      const response: ApiResponse<AccountsListResponse> = await getRequest(
        `${urls.accountsViewPath}/${accountId}/hierarchy-optimized`,
        {
          page,
          limit,
          includeParent: true,
        }
      );

      if (response.success) {
        // Create a map of account IDs to account names for parent resolution
        const accountsMap = new Map<string, string>();
        response.data.accounts.forEach((account) => {
          accountsMap.set(account._id, account.accountName);
        });

        return {
          data: response.data.accounts.map((account) =>
            transformAccountToRow(account, accountsMap)
          ),
          total: response.data.pagination.totalRecords,
          page: response.data.pagination.currentPage,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch accounts");
      }
    } catch (error: any) {
      console.error("Error fetching accounts:", error.message);
      throw new Error(error.message || "Failed to fetch accounts");
    }
  },

  // Search accounts using search endpoint
  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const accountId = getLoggedInAccountId();

      if (!searchText.trim()) {
        return accountServices.getAll(page, limit);
      }

      const response: ApiResponse<AccountsListResponse> = await getRequest(
        `${urls.accountsViewPath}/${accountId}/search`,
        {
          searchText: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        // Create a map of account IDs to account names for parent resolution
        const accountsMap = new Map<string, string>();
        response.data.accounts.forEach((account) => {
          accountsMap.set(account._id, account.accountName);
        });

        return {
          data: response.data.accounts.map((account) =>
            transformAccountToRow(account, accountsMap)
          ),
          total: response.data.pagination.totalRecords,
          page: response.data.pagination.currentPage,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching accounts:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },

  // Filter accounts using filter endpoint
  filter: async (
    page: number = 1,
    limit: number = 10,
    sortField?: string,
    sortDirection?: "asc" | "desc",
    filters?: Filter[]
  ): Promise<PaginatedResponse<Row>> => {
    try {
      const payload: any = {
        page,
        limit,
      };

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
            case "level":
              payload.levels = filter.value.map((v) => parseInt(v));
              break;
            case "accountName":
              payload.accountNames = filter.value;
              break;
            case "accountId":
              payload.accountIds = filter.value;
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

      const response: ApiResponse<AccountsFilterResponse> = await postRequest(
        `${urls.accountsViewPath}/filter`,
        payload
      );

      if (response.success) {
        // Create a map for accounts if needed (filter response might not have full hierarchy)
        const accountsMap = new Map<string, string>();
        response.data.data.forEach((account) => {
          accountsMap.set(account._id, account.accountName);
        });

        return {
          data: response.data.data.map((account) =>
            transformAccountToRow(account, accountsMap)
          ),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to filter accounts");
      }
    } catch (error: any) {
      console.error("Error filtering accounts:", error.message);
      throw new Error(error.message || "Failed to filter accounts");
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
        `${urls.accountsViewPath}/filter-options`,
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
      level: "levels",
      accountName: "accountNames",
      clientName: "clientNames",
      accountId: "accountIds",
    };

    const apiField = fieldMapping[field] || `${field}s`;
    const counts = filterCounts[apiField] || [];

    return counts.map((item: any) => ({
      value: item._id.toString(),
      label: item._id.toString(),
      count: item.count,
    }));
  },

  // Get account by ID
  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<AccountData> = await getRequest(
        `${urls.accountsViewPath}/${id}`
      );

      if (response.success) {
        return transformAccountToRow(response.data);
      } else {
        throw new Error(response.message || "Account not found");
      }
    } catch (error: any) {
      console.error("Error fetching account:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch account");
    }
  },

  // Create new account
  create: async (
    accountData: Partial<Row>
  ): Promise<{ account: Row; message: string }> => {
    try {
      const payload = {
        accountName: accountData.accountName,
        parentAccount: accountData.parentAccount || getLoggedInAccountId(),
        clientId: accountData.clientId,
        status: accountData.status || "active",
      };

      const response: ApiResponse<AccountData> = await postRequest(
        urls.accountsViewPath,
        payload
      );

      if (response.success) {
        return {
          account: transformAccountToRow(response.data),
          message: response.message || "Account created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Error creating account:", error.message);
      throw new Error(error.message || "Failed to create account");
    }
  },

  // Update account
  update: async (
    id: string | number,
    accountData: Partial<Row>
  ): Promise<{ account: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (accountData.accountName !== undefined)
        payload.accountName = accountData.accountName;
      if (accountData.parentAccount !== undefined)
        payload.parentAccount = accountData.parentAccount;
      if (accountData.clientId !== undefined)
        payload.clientId = accountData.clientId;
      if (accountData.status !== undefined) payload.status = accountData.status;

      const response: ApiResponse<AccountData> = await patchRequest(
        `${urls.accountsViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          account: transformAccountToRow(response.data),
          message: response.message || "Account updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update account");
      }
    } catch (error: any) {
      console.error("Error updating account:", error.message);
      throw new Error(error.message || "Failed to update account");
    }
  },

  // Inactivate account (soft delete)
  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<any> = await patchRequest(
        `${urls.accountsViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Account inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate account");
      }
    } catch (error: any) {
      console.error("Error inactivating account:", error.message);
      throw new Error(error.message || "Failed to inactivate account");
    }
  },

  // Export accounts - Updated to work with filters
  export: async (filters?: Filter[]): Promise<Blob> => {
    try {
      let url = `${urls.accountsViewPath}/export`;
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
            case "level":
              payload.levels = filter.value.map((v) => parseInt(v));
              break;
            case "accountName":
              payload.accountNames = filter.value;
              break;
            case "accountId":
              payload.accountIds = filter.value;
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

        url = `${urls.accountsViewPath}/export-filtered`;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Error exporting accounts:", error.message);
      throw new Error(error.message || "Failed to export accounts");
    }
  },

  // Import accounts
  import: async (file: File): Promise<{ message: string; errors?: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${urls.accountsViewPath}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          message: result.message || "Accounts imported successfully",
          errors: result.errors || [],
        };
      } else {
        throw new Error(result.message || "Failed to import accounts");
      }
    } catch (error: any) {
      console.error("Error importing accounts:", error.message);
      throw new Error(error.message || "Failed to import accounts");
    }
  },

  // Get filter summary for dashboard
  getFilterSummary: async (): Promise<FilterSummaryResponse> => {
    try {
      const response: ApiResponse<FilterSummaryResponse> = await getRequest(
        `${urls.accountsViewPath}/filter-summary`
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

  // Get clients for dropdown
  getClients: async (): Promise<Client[]> => {
    try {
      const response: ApiResponse<{ data: Client[] }> = await getRequest(
        urls.clientsViewPath,
        {
          page: 1,
          limit: 999999, // Get all records
        }
      );

      if (response.success) {
        return response.data.data.filter(
          (client) => client.status === "active"
        );
      } else {
        throw new Error(response.message || "Failed to fetch clients");
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      throw new Error(error.message || "Failed to fetch clients");
    }
  },

  // Get account hierarchy for parent account
  getAccountHierarchy: async (): Promise<any> => {
    try {
      const accountId = getLoggedInAccountId();
      const response: ApiResponse<AccountsListResponse> = await getRequest(
        `${urls.accountsViewPath}/${accountId}/hierarchy-optimized`,
        {
          includeParent: true,
        }
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
};
