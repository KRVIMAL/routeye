// src/core-services/rest-api/apiHelpers.ts - Complete API helpers with filtering support
import apiClient from "./api-client";
import { FilterCondition } from '../../components/ui/DataTable/types';
import urls from "../../global/constants/UrlConstants";
import { store } from "../../store";

// Server-side filter interface (matches your API)
export interface ServerFilter {
  field: string;
  operator: string;
  value: string;
}

// API request payload interface for list endpoints
export interface ListRequestPayload {
  page: number;
  limit: number;
  searchText?: string;
  filters?: ServerFilter[];
}

  console.log(store.getState.auth?.accessToken,"token");
   console.log(store.getState.auth?.user.userName,"uwername");
// Helper for GET requests
export const getRequest = async (url: string, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "API GET request failed";
    throw new Error(errorMessage);
  }
};

// Helper for POST requests
export const postRequest = async (url: string, data = {}) => {
  try {
    console.log("api called")
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "API POST request failed";
    throw new Error(errorMessage);
  }
};

// Helper for PATCH requests
export const patchRequest = async (url: string, data = {}) => {
  try {
    const response = await apiClient.patch(url, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "API PATCH request failed";
    throw new Error(errorMessage);
  }
};

// Helper for DELETE requests
export const deleteRequest = async (url: string) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "API DELETE request failed";
    throw new Error(errorMessage);
  }
};

// Helper for PUT requests
export const putRequest = async (url: string, data = {}) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "API PUT request failed";
    throw new Error(errorMessage);
  }
};

// Export service for downloading files
export const exportService = {
  exportData: async (
    modulePath: string,
    format: "csv" | "xlsx" | "pdf",
    filename?: string
  ) => {
    try {
      const response = await fetch(
        `${urls.baseURL}${modulePath}?format=${format}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      const defaultFilename = filename || "export";
      a.download = `${defaultFilename}-${timestamp}.${format}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      console.error("Export error:", error);
      throw new Error(error.message || "Export failed");
    }
  },
};

// ==================== NEW FILTERING UTILITIES ====================

/**
 * Transform client-side filters to server-side format
 * Handles both 'field' and 'column' properties for backwards compatibility
 */
export const transformFiltersToServerFormat = (filters: FilterCondition[]): ServerFilter[] => {
  return filters
    .filter(filter => {
      // Only include filters that have a value (except for isEmpty/isNotEmpty)
      return filter.value.trim() !== "" || 
             filter.operator === "isEmpty" || 
             filter.operator === "isNotEmpty";
    })
    .map(filter => ({
      field: filter.field || filter.column,
      operator: filter.operator,
      value: filter.value,
    }));
};

/**
 * Create a standardized request payload for list endpoints
 */
export const createListRequestPayload = (
  page: number,
  limit: number,
  searchText?: string,
  filters?: FilterCondition[]
): ListRequestPayload => {
  const payload: ListRequestPayload = {
    page,
    limit,
  };

  // Add search if provided
  if (searchText && searchText.trim()) {
    payload.searchText = searchText.trim();
  }

  // Add filters if provided
  if (filters && filters.length > 0) {
    const serverFilters = transformFiltersToServerFormat(filters);
    if (serverFilters.length > 0) {
      payload.filters = serverFilters;
    }
  }

  return payload;
};

/**
 * Validate filter values based on operator
 */
export const validateFilterValue = (operator: string, value: string): boolean => {
  switch (operator) {
    case 'isEmpty':
    case 'isNotEmpty':
      return true; // These operators don't need a value
    case 'greaterThan':
    case 'lessThan':
    case 'greaterThanOrEqual':
    case 'lessThanOrEqual':
      return !isNaN(Number(value)); // Numeric operators need valid numbers
    default:
      return value.trim() !== ''; // All other operators need a non-empty value
  }
};

/**
 * Get appropriate operators for a column type
 */
export const getOperatorsForColumnType = (columnType: string = 'string') => {
  const allOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Does not equal' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
    { value: 'lessThanOrEqual', label: 'Less than or equal' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ];

  switch (columnType) {
    case 'number':
      return allOperators.filter(op =>
        ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'isEmpty', 'isNotEmpty'].includes(op.value)
      );
    case 'boolean':
      return allOperators.filter(op =>
        ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'].includes(op.value)
      );
    case 'date':
      return allOperators.filter(op =>
        ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'isEmpty', 'isNotEmpty'].includes(op.value)
      );
    default: // string
      return allOperators;
  }
};

/**
 * Format date values for API requests
 */
export const formatDateForAPI = (dateValue: string, operator: string): string => {
  if (!dateValue) return '';
  
  // Add time component based on operator for more accurate filtering
  switch (operator) {
    case 'greaterThan':
    case 'greaterThanOrEqual':
      return `${dateValue}T00:00:00.000Z`;
    case 'lessThan':
    case 'lessThanOrEqual':
      return `${dateValue}T23:59:59.999Z`;
    default:
      return dateValue;
  }
};

/**
 * Create a reusable service adapter for modules
 * This helps standardize how different modules interact with the filtering system
 */
export class FilteringServiceAdapter<T> {
  constructor(
    private apiEndpoint: string,
    private listEndpoint: string = '/listData', // Default list endpoint
    private transformResponse: (apiData: any) => T
  ) {}

  async getAll(
    page: number,
    limit: number,
    searchText?: string,
    filters?: FilterCondition[]
  ) {
    const payload = createListRequestPayload(page, limit, searchText, filters);
    
    // Use the existing postRequest function
    const response = await postRequest(
      `${this.apiEndpoint}${this.listEndpoint}`,
      payload
    );

    if (response.success) {
      return {
        data: response.data.data.map(this.transformResponse),
        total: response.data.pagination.total,
        page: parseInt(response.data.pagination.page),
        limit: parseInt(response.data.pagination.limit),
        totalPages: response.data.pagination.totalPages,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
      };
    } else {
      throw new Error(response.message || 'Failed to fetch data');
    }
  }
}