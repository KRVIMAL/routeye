// types/dateFilter.ts - Comprehensive Type Definitions for Date Filter Integration

// ==================== Core Date Filter Types ====================

export interface DateFilter {
  dateField: string;
  dateFilterType: DateFilterType;
  fromDate?: string;
  toDate?: string;
  customValue?: number;
  selectedDates?: Date[];
  isPickAnyDate?: boolean;
}

export type DateFilterType = 
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'this_year'
  | 'last_x_days'
  | 'last_x_weeks'
  | 'last_x_months'
  | 'last_x_years'
  | 'last_x_hours'
  | 'last_x_minutes'
  | 'custom_range'
  | 'pick_any_date'
  | 'clear';

// DateRangePicker preset mapping
export type DateRangePickerPreset =
  | 'customised'
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'this-month'
  | 'this-year'
  | 'last-x-days'
  | 'last-x-weeks'
  | 'last-x-months'
  | 'last-x-years'
  | 'last-x-hours'
  | 'last-x-minutes'
  | 'pick-any-date';

// ==================== Filter System Types ====================

export interface Filter {
  field: string;
  value: any[];
  label?: string;
  type?: FilterType;
  dateFilter?: DateFilter;
}

export type FilterType = 'regular' | 'date';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// ==================== Table Column Types ====================

export interface Column {
  field: string;
  headerName: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  type?: ColumnType;
  renderCell?: (params: CellRenderParams) => React.ReactNode;
  hidden?: boolean;
}

export type ColumnType = 'string' | 'number' | 'date' | 'boolean';

export interface CellRenderParams {
  value: any;
  row: Row;
  field?: string;
  colDef?: Column;
}

export interface Row {
  id: string | number;
  [key: string]: any;
}

// ==================== DateRangePicker Types ====================

export interface DateRangePickerProps {
  onApply: (result: DateRangePickerResult) => void;
  onCancel: () => void;
  onClear: () => void;
  placeholders?: DateRangePickerPlaceholders;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

export interface DateRangePickerResult {
  startDate: Date | null;
  endDate: Date | null;
  selectedDates?: Date[];
  startTime: TimeSelection;
  endTime: TimeSelection;
  preset: DateRangePickerPreset;
  isPickAnyDate: boolean;
}

export interface TimeSelection {
  hours: number;
  minutes: number;
}

export interface DateRangePickerPlaceholders {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PresetOption {
  id: DateRangePickerPreset;
  label: string;
  suffix?: string;
  hasInput?: boolean;
  icon?: string;
}

// ==================== API Request/Response Types ====================

export interface FilterRequest {
  page: number;
  limit: number;
  searchText?: string;
  sortBy?: string;
  sortOrder?: SortDirection;
  
  // Date filter parameters
  dateField?: string;
  dateFilterType?: DateFilterType;
  fromDate?: string;
  toDate?: string;
  customValue?: number;
  
  // Regular filter parameters
  statuses?: string[];
  stateNames?: string[];
  cityNames?: string[];
  names?: string[];
  contactNames?: string[];
  emails?: string[];
  contactNos?: string[];
  panNumbers?: string[];
  aadharNumbers?: string[];
  gstNumbers?: string[];
  clientIds?: string[];
}

export interface FilterResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  filterCounts?: FilterCounts;
}

export interface PaginationInfo {
  page: number | string;
  limit: number | string;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterCounts {
  [key: string]: Array<{ _id: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ==================== Service Types ====================

export interface ClientData {
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

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface FilterOptionsResponse {
  options: FilterOption[];
  total: number;
}

export interface FilterSummaryResponse {
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

// ==================== Table Component Types ====================

export interface DataTableProps {
  columns: Column[];
  rows: Row[];
  loading?: boolean;
  pagination?: PaginationProps;
  onSearch?: (searchText: string) => void;
  onSort?: (field: string, direction: SortDirection | null) => void;
  onFilter?: (filters: Filter[]) => void;
  onRowSelect?: (selectedRows: (string | number)[]) => void;
  onRowAction?: (action: RowAction, rowId: string | number) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onAdd?: () => void;
  onGetFilterOptions?: (field: string, searchText?: string) => Promise<FilterOption[]>;
  height?: number;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export type SortDirection = 'asc' | 'desc';
export type RowAction = 'view' | 'edit' | 'delete';

// ==================== Popover Component Types ====================

export interface FilterPopoverProps {
  field: string;
  position: PopoverPosition;
  onClose: () => void;
  onApply: (field: string, values: string[]) => void;
  onGetFilterOptions?: (field: string, searchText?: string) => Promise<FilterOption[]>;
  currentFilter?: string[];
  columnType?: ColumnType;
}

export interface DateFilterPopoverProps {
  field: string;
  position: PopoverPosition;
  onClose: () => void;
  onApply: (field: string, dateFilter: DateFilter) => void;
  currentFilter?: DateFilter;
}

export interface PopoverPosition {
  x: number;
  y: number;
}

// ==================== Filter Chip Types ====================

export interface FilterChipProps {
  filter: Filter;
  colorIndex: number;
  onRemove: (field: string) => void;
  onClick: (field: string) => void;
  'data-filter-field'?: string;
}

export interface FilterChipColor {
  bg: string;
  text: string;
  border: string;
}

// ==================== Header Component Types ====================

export interface ResizableHeaderProps {
  column: Column;
  sortConfig: SortConfig | null;
  activeFilters: Filter[];
  onSort: (field: string) => void;
  onFilter: (e: React.MouseEvent, field: string) => void;
  onDateFilter: (e: React.MouseEvent, field: string) => void;
  onResize: (field: string, width: number) => void;
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// ==================== Utility Types ====================

// export interface DateFilterMapping {
//   [key in DateRangePickerPreset]: DateFilterType;
// }

export interface CustomNumberValues {
  [presetId: string]: number;
}

// ==================== Error Types ====================

export interface DateFilterError {
  type: 'validation' | 'api' | 'network';
  message: string;
  field?: string;
  details?: any;
}

// ==================== Event Handler Types ====================

export type DateFilterEventHandler = (dateFilter: DateFilter) => void;
export type FilterEventHandler = (filters: Filter[]) => void;
export type SearchEventHandler = (searchText: string) => void;
export type SortEventHandler = (field: string, direction: SortDirection | null) => void;
export type PageChangeEventHandler = (page: number) => void;
export type PageSizeChangeEventHandler = (size: number) => void;
export type RowSelectEventHandler = (selectedRows: (string | number)[]) => void;
export type RowActionEventHandler = (action: RowAction, rowId: string | number) => void;

// ==================== State Management Types ====================

export interface TableState {
  selectedRows: Set<string | number>;
  sortConfig: SortConfig | null;
  activeFilters: Filter[];
  searchText: string;
  currentPage: number;
  pageSize: number;
  loading: boolean;
}

export interface DateFilterState {
  selectedRange: {
    start: Date | null;
    end: Date | null;
  };
  selectedDates: Set<string>;
  startTime: TimeSelection;
  endTime: TimeSelection;
  currentMonth: Date;
  activePreset: DateRangePickerPreset;
  customNumbers: CustomNumberValues;
  isPickAnyDate: boolean;
  isRangeSelectionMode: boolean;
}

// ==================== Constants ====================

export const DATE_FILTER_TYPES: Record<DateFilterType, string> = {
  'today': 'Today',
  'yesterday': 'Yesterday',
  'this_week': 'This Week',
  'this_month': 'This Month',
  'this_year': 'This Year',
  'last_x_days': 'Last X Days',
  'last_x_weeks': 'Last X Weeks',
  'last_x_months': 'Last X Months',
  'last_x_years': 'Last X Years',
  'last_x_hours': 'Last X Hours',
  'last_x_minutes': 'Last X Minutes',
  'custom_range': 'Custom Range',
  'pick_any_date': 'Pick Any Date',
  'clear': 'Clear'
};

export const COLUMN_TYPES: Record<ColumnType, string> = {
  'string': 'String',
  'number': 'Number', 
  'date': 'Date',
  'boolean': 'Boolean'
};

// ==================== Type Guards ====================

export const isDateFilter = (filter: Filter): filter is Filter & { dateFilter: DateFilter } => {
  return filter.type === 'date' && !!filter.dateFilter;
};

export const isDateColumn = (column: Column): boolean => {
  return column.type === 'date';
};

export const hasCustomValue = (dateFilterType: DateFilterType): boolean => {
  return dateFilterType.startsWith('last_x_');
};

export const isCustomRange = (dateFilterType: DateFilterType): boolean => {
  return dateFilterType === 'custom_range';
};


// Helper function to convert DateRangePicker preset to API format
const convertDateFilterTypeToAPI = (dateFilterType: string): string => {
  const mapping: { [key: string]: string } = {
    "customised": "custom_range",
    "today": "today",
    "yesterday": "yesterday",
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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

// Helper function to process date filters for API
export const processDateFilters = (filters: Filter[], payload: any) => {
  const dateFilters = filters.filter(f => f.type === "date" && f.dateFilter);
  
  dateFilters.forEach(filter => {
    const dateFilter = filter.dateFilter!;
    const apiField = dateFilter.dateField;
    
    // Set the date field (e.g., "createdAt", "updatedAt")
    payload.dateField = apiField;
    
    // Convert the filter type to API format
    payload.dateFilterType = convertDateFilterTypeToAPI(dateFilter.dateFilterType);
    
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
          payload.toDate = formatDateForAPI(sortedDates[sortedDates.length - 1]);
        }
        break;
        
      // For preset filters like "today", "yesterday", etc., no additional params needed
      default:
        break;
    }
  });
};

// ==================== Export All Types ====================

export * from './dateFilter';

// Re-export commonly used React types for convenience
export type { MouseEvent, ChangeEvent, KeyboardEvent } from 'react';