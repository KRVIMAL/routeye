// src/components/ui/DataTable/types.ts - Updated types with server-side filtering
import React from "react";

export interface Column {
  field: string;
  headerName: string;
  width?: number;
  type?: "string" | "number" | "boolean" | "date" | "actions";
  editable?: boolean;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  hide?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: CellParams) => React.ReactNode;
  renderEditCell?: (params: EditCellParams) => React.ReactNode;
}

export interface Row {
  id: string | number;
  [key: string]: any;
  isNew?: boolean;
}

export interface CellParams {
  id: string | number;
  field: string;
  value: any;
  row: Row;
}

export interface EditCellParams extends CellParams {
  onChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export type RowMode = "view" | "edit";

export interface RowModesModel {
  [id: string | number]: { mode: RowMode; fieldToFocus?: string };
}

export interface FilterCondition {
  id: string;
  field?: string; // Make optional for backwards compatibility
  column: string; // Keep this for consistency with existing code
  operator:
    | "contains"
    | "notContains"
    | "equals"
    | "notEquals"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "greaterThanOrEqual"
    | "lessThanOrEqual"
    | "isEmpty"
    | "isNotEmpty";
  value: string;
}

// Server-side filter format (matches your API)
export interface ServerFilterCondition {
  field: string;
  operator: string;
  value: string;
}

export interface ColumnState {
  field: string;
  visible: boolean;
  pinned?: "left" | "right" | null;
  width?: number;
  sortDirection?: "asc" | "desc" | null;
}

// src/components/ui/DataTable/types.ts - Add missing props to DataTableProps interface
export interface DataTableProps {
  columns: Column[];
  rows: Row[];
  loading?: boolean;
  onSaveRow?: (
    id: string | number,
    updatedRow: Row,
    oldRow: Row,
    rows: Row[]
  ) => void;
  onDeleteRow?: (id: string | number, deletedRow: Row, rows: Row[]) => void;
  createRowData?: (rows: Row[]) => Partial<Row>;
  noActionColumn?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  disableColumnMenu?: boolean;
  toolbar?: React.ComponentType<any>;
  className?: string;
  onColumnStateChange?: (columnStates: ColumnState[]) => void;
  initialColumnStates?: ColumnState[];
  // Edit functionality props
  editPath?: string;
  onEditClick?: (id: string | number) => void;
  // Search functionality
  onSearch?: (searchValue: string) => void;
  // Server-side pagination props
  currentPage?: number;
  totalPages?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  disableClientSidePagination?: boolean;
  // Server-side filtering props
  onFiltersChange?: (filters: FilterCondition[]) => void;
  serverSideFiltering?: boolean;
  exportConfig?: {
    modulePath: string;
    filename: string;
    queryParams?: { [key: string]: string };
  };
  
  // Add these missing props
  onAddClick?: () => void;
  onImportClick?: () => void;
  onTemplateClick?: () => void;
  showAddButton?: boolean;
  showImportButton?: boolean;
  showTemplateButton?: boolean;
}

export interface TableToolbarProps {
  columns: Column[];
  rows: Row[];
  setRows: (rows: Row[]) => void;
  setRowModesModel: (model: any) => void;
  createRowData?: (rows: Row[]) => Partial<Row>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  visibleColumns: { [key: string]: boolean };
  onColumnVisibilityChange: (field: string, visible: boolean) => void;
  showAddButton?: boolean;
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  showColumnMenu: boolean;
  setShowColumnMenu: (show: boolean) => void;
  showFilterComponent: boolean;
  setShowFilterComponent: (show: boolean) => void;
  exportConfig?: {
    modulePath: string;
    filename: string;
    queryParams?: { [key: string]: string };
  };
}

export interface TableCellProps {
  params: CellParams;
  column: Column;
  isEditing: boolean;
  onStartEdit: () => void;
}

export interface EditableCellProps {
  id: string | number;
  field: string;
  value: any;
  row: Row;
  onChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface ActionButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface ColumnHeaderMenuProps {
  column: Column;
  columnState: ColumnState;
  onSort: (field: string, direction?: "asc" | "desc" | null) => void;
  onPin: (field: string, position: "left" | "right" | null) => void;
  onHide: (field: string) => void;
  onOpenColumnManager: () => void;
  onOpenFilter: (field: string) => void;
  hasFilter: boolean;
}
