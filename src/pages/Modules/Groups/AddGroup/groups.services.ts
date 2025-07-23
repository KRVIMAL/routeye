// Groups services (Simple groups - Group Modules) with corrected API endpoints
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

interface GroupData {
  _id: string;
  groupMasterId: string;
  groupType: string;
  stateName: string;
  cityName: string;
  remark: string;
  contactNo: string;
  status: string;
  createdTime: string;
  updatedTime: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GroupsListResponse {
  data: GroupData[];
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

// Transform API group data to Row format
const transformGroupToRow = (group: GroupData): Row => ({
  id: group._id,
  groupMasterId: group.groupMasterId,
  groupType: group.groupType,
  stateName: group.stateName,
  cityName: group.cityName,
  remark: group.remark,
  contactNo: group.contactNo,
  status: group.status,
  createdTime: group.createdTime,
  updatedTime: group.updatedTime,
  inactiveTime: group.updatedTime,
});

export const groupServices = {
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      // Using corrected API endpoint: /group-master for simple groups
      const response: ApiResponse<GroupsListResponse> = await getRequest(
        urls.groupModuleViewPath, // This points to "/group-master"
        {
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformGroupToRow),
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        };
      } else {
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      throw new Error(error.message || "Failed to fetch groups");
    }
  },

  getById: async (id: string | number): Promise<Row | null> => {
    try {
      const response: ApiResponse<GroupData> = await getRequest(
        `${urls.groupModuleViewPath}/${id}`
      );

      if (response.success) {
        return transformGroupToRow(response.data);
      } else {
        throw new Error(response.message || "Group not found");
      }
    } catch (error: any) {
      console.error("Error fetching group:", error.message);
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return null;
      }
      throw new Error(error.message || "Failed to fetch group");
    }
  },

  create: async (
    groupData: Partial<Row>
  ): Promise<{ group: Row; message: string }> => {
    try {
      const payload = {
        groupType: groupData.groupType,
        stateName: groupData.stateName,
        cityName: groupData.cityName,
        remark: groupData.remark,
        contactNo: groupData.contactNo,
      };

      const response: ApiResponse<GroupData> = await postRequest(
        urls.groupModuleViewPath,
        payload
      );

      if (response.success) {
        return {
          group: transformGroupToRow(response.data),
          message: response.message || "Group created successfully",
        };
      } else {
        throw new Error(response.message || "Failed to create group");
      }
    } catch (error: any) {
      console.error("Error creating group:", error.message);
      throw new Error(error.message || "Failed to create group");
    }
  },

  update: async (
    id: string | number,
    groupData: Partial<Row>
  ): Promise<{ group: Row; message: string }> => {
    try {
      const payload: any = {};

      // Only include fields that are provided
      if (groupData.groupType !== undefined)
        payload.groupType = groupData.groupType;
      if (groupData.stateName !== undefined)
        payload.stateName = groupData.stateName;
      if (groupData.cityName !== undefined)
        payload.cityName = groupData.cityName;
      if (groupData.remark !== undefined) payload.remark = groupData.remark;
      if (groupData.contactNo !== undefined)
        payload.contactNo = groupData.contactNo;
      if (groupData.status !== undefined) payload.status = groupData.status;

      const response: ApiResponse<GroupData> = await patchRequest(
        `${urls.groupModuleViewPath}/${id}`,
        payload
      );

      if (response.success) {
        return {
          group: transformGroupToRow(response.data),
          message: response.message || "Group updated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to update group");
      }
    } catch (error: any) {
      console.error("Error updating group:", error.message);
      throw new Error(error.message || "Failed to update group");
    }
  },

  inactivate: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response: ApiResponse<GroupData> = await patchRequest(
        `${urls.groupModuleViewPath}/${id}`,
        {
          status: "inactive",
        }
      );

      if (response.success) {
        return {
          message: response.message || "Group inactivated successfully",
        };
      } else {
        throw new Error(response.message || "Failed to inactivate group");
      }
    } catch (error: any) {
      console.error("Error inactivating group:", error.message);
      throw new Error(error.message || "Failed to inactivate group");
    }
  },

  search: async (
    searchText: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Row>> => {
    try {
      if (!searchText.trim()) {
        return groupServices.getAll(page, limit);
      }

      const response: ApiResponse<GroupsListResponse> = await getRequest(
        `${urls.groupModuleViewPath}/search`,
        {
          search: searchText.trim(),
          page,
          limit,
        }
      );

      if (response.success) {
        return {
          data: response.data.data.map(transformGroupToRow),
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
      console.error("Error searching groups:", error.message);
      throw new Error(error.message || "Search failed");
    }
  },
};
