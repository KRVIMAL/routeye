// Accounts services with client and parent account relationship mapping
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

interface ParentAccountInfo {
  _id: string;
  accountId?: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  client?: ClientInfo;
}

interface AccountData {
  _id: string;
  accountId?: string;
  accountName: string;
  parentAccount?: string | ParentAccountInfo;
  clientId: string;
  level: number;
  hierarchyPath: string;
  children: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  client?: ClientInfo;
  totalDevices?: number;
}

interface AccountsListResponse {
  data: AccountData[];
  pagination: {
    page: string | number;
    limit: string;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Pagination response interface

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

// Account hierarchy response for parent account
interface AccountHierarchyResponse {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  status: string;
  client: ClientInfo;
  parentAccount?: ParentAccountInfo;
}

// Transform API account data to Row format
const transformAccountToRow = (account: any): Row => {
  console.log({ account });
  return {
    id: account._id,
    accountId: account.accountId || "N/A",
    accountName: account.accountName,
    parentAccountName: account?.parentAccount?.accountName || "N/A",
    contactName: account.client?.contactName || "N/A",
    email: account.client?.email || "N/A",
    contactNo: account.client?.contactNo || "N/A",
    panNumber: account.client?.panNumber || "N/A",
    aadharNumber: account.client?.aadharNumber || "N/A",
    gstNumber: account.client?.gstNumber || "N/A",
    stateName: account.client?.stateName || "N/A",
    cityName: account.client?.cityName || "N/A",
    remark: account.client?.remark || "N/A",
    totalDevices: account.totalDevices || 0,
    status: account.status,
    createdTime: account.createdAt,
    updatedTime: account.updatedAt,
    inactiveTime: account.updatedAt,
    // Store IDs for edit functionality
    parentAccount:
      typeof account.parentAccount === "object" && account.parentAccount
        ? account.parentAccount._id
        : account.parentAccount || "",
    clientId: account.clientId,
  };
};

export const accountServices = {
  getAll: async (): Promise<Row[]> => {
    try {
      const response: any = await getRequest(
        `${urls.accountsViewPath}/${
          store.getState()?.auth?.user?.account?._id
        }/hierarchy-optimized`
      );

      if (response.success) {
        // Extract accounts from hierarchy structure
        const accounts: AccountData[] = [];

        // Add current account
        accounts.push({
          _id: response.data._id,
          accountName: response.data.accountName,
          accountId: response?.data?.accountId,
          level: response.data.level,
          hierarchyPath: response.data.hierarchyPath,
          client: response.data.client,
          status: response.data.status,
          children:
            response.data.children?.map((child: any) => child._id) || [],
          clientId: response.data.client?._id || "",
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString(),
          parentAccount: response.data.parentAccount,
          __v: 0,
          totalDevices: 0, // This would come from actual API
        } as AccountData);

        // Add children accounts
        if (response.data.children) {
          response.data.children.forEach((child: any) => {
            accounts.push({
              _id: child._id,
              accountId: child.accountId,
              accountName: child.accountName,
              level: child.level,
              hierarchyPath: child.hierarchyPath,
              client: child.client,
              status: child.status,
              // parentAccount:child.parentAccount,
              children: child.children || [],
              clientId: child.client?._id || "",
              createdAt: child.createdAt || new Date().toISOString(),
              updatedAt: child.updatedAt || new Date().toISOString(),
              __v: 0,
              totalDevices: 0,
              parentAccount: response.data._id, // Set parent reference
            } as AccountData);
          });
        }

        return accounts.map(transformAccountToRow);
      } else {
        throw new Error(response.message || "Failed to fetch accounts");
      }
    } catch (error: any) {
      console.error("Error fetching accounts:", error.message);
      throw new Error(error.message || "Failed to fetch accounts");
    }
  },

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

  create: async (
    accountData: Partial<Row>
  ): Promise<{ account: Row; message: string }> => {
    try {
      const payload = {
        accountName: accountData.accountName,
        parentAccount: accountData.parentAccount,
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

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<AccountData> = await patchRequest(
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

  // search: async (
  //   searchText: string,
  //   page: number = 1,
  //   limit: number = 10
  // ): Promise<PaginatedResponse<Row>> => {
  //   try {
  //     if (!searchText.trim()) {
  //       return accountServices.getAll(page, limit);
  //     }

  //     const response: ApiResponse<AccountsListResponse> = await getRequest(
  //       `${urls.accountsViewPath}/search`,
  //       {
  //         searchText: searchText.trim(),
  //         page,
  //         limit,
  //       }
  //     );

  //     if (response.success) {
  //       return {
  //         data: response.data.data.map(transformAccountToRow),
  //         total: response.data.pagination.total,
  //         page: typeof response.data.pagination.page === 'string'
  //           ? parseInt(response.data.pagination.page)
  //           : response.data.pagination.page,
  //         limit: parseInt(response.data.pagination.limit),
  //         totalPages: response.data.pagination.totalPages,
  //         hasNext: response.data.pagination.hasNext,
  //         hasPrev: response.data.pagination.hasPrev,
  //       };
  //     } else {
  //       throw new Error(response.message || "Search failed");
  //     }
  //   } catch (error: any) {
  //     console.error("Error searching accounts:", error.message);
  //     // Fallback to getAll if search endpoint doesn't exist
  //     return accountServices.getAll(page, limit);
  //   }
  // },

  // Get clients for dropdown
  getClients: async (): Promise<Client[]> => {
    try {
      const response: ApiResponse<{ data: Client[] }> = await getRequest(
        urls.clientsViewPath,
        {
          page: 1,
          limit: 0, // Get all records
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
  getAccountHierarchy: async (): Promise<{
    parentAccount: ParentAccountInfo | null;
    currentAccount: ParentAccountInfo | null;
  }> => {
    try {
      const response: ApiResponse<AccountHierarchyResponse> = await getRequest(
        `${urls.accountsViewPath}/${
          store.getState()?.auth?.user?.account?._id
        }/hierarchy-optimized`
      );

      if (response.success) {
        let parentAccount = null;
        let currentAccount = null;

        // If parentAccount is empty, this account itself is the parent
        if (
          !response.data.parentAccount ||
          Object.keys(response.data.parentAccount).length === 0
        ) {
          currentAccount = {
            _id: response.data._id,
            accountName: response.data.accountName,
            level: response.data.level,
            hierarchyPath: response.data.hierarchyPath,
          };
        } else {
          parentAccount = response.data.parentAccount;
        }

        return {
          parentAccount,
          currentAccount,
        };
      } else {
        throw new Error(
          response.message || "Failed to fetch account hierarchy"
        );
      }
    } catch (error: any) {
      console.error("Error fetching account hierarchy:", error.message);
      return { parentAccount: null, currentAccount: null };
    }
  },
};
