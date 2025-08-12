// CustomTable.tsx - Complete Implementation with HTML Table Structure
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload,
  Grid3X3,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Settings,
  Move,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
} from "lucide-react";

// Custom Pagination Component - Complete Implementation
const CustomPagination: React.FC<{
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(pageInput);
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      onPageChange(pageNumber);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePageInputSubmit();
    }
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 1) return [1];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return [...new Set(rangeWithDots)]; // Remove duplicates
  };

  const startRecord = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRows);

  return (
    <div
      className="flex items-center justify-between px-4 py-1 text-white rounded-b-xl"
      style={{ backgroundColor: "#1F3A8A", color: "#FFFFFF" }}
    >
      {/* Left side - Page size selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm whitespace-nowrap">Rows per page:</span>
        <select
          value={pageSize === 0 ? "all" : pageSize.toString()}
          onChange={(e) =>
            onPageSizeChange(
              e.target.value === "all" ? 0 : parseInt(e.target.value)
            )
          }
          className="bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm min-w-[60px] focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Center - Records info */}
      <div className="hidden md:flex items-center text-sm">
        <span>
          {pageSize === 0
            ? `Showing all ${totalRows} rows`
            : `Row ${startRecord}-${endRecord} of ${totalRows}`}
        </span>
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Page input - only show when not showing all */}
        {pageSize !== 0 && (
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm whitespace-nowrap">Page</span>
            <input
              type="number"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              onKeyPress={handlePageInputKeyPress}
              min="1"
              max={totalPages.toString()}
              className="bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm text-center w-16 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-sm whitespace-nowrap">of {totalPages}</span>
          </div>
        )}

        {/* Navigation buttons - only show when not showing all */}
        {pageSize !== 0 && (
          <div className="flex items-center space-x-1">
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className="p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers (desktop only) */}
            <div className="hidden lg:flex items-center space-x-1">
              {getVisiblePageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-2 py-1 text-white"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[32px] px-2 py-1 text-sm rounded transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white font-semibold"
                        : "hover:bg-blue-600 text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next page */}
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Types
interface Column {
  field: string;
  headerName: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  type?: "string" | "number" | "date" | "boolean";
  renderCell?: (params: any) => React.ReactNode;
  hidden?: boolean;
}

interface Row {
  id: string | number;
  [key: string]: any;
}

interface Filter {
  field: string;
  value: any[];
  label?: string;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface DataTableProps {
  columns: Column[];
  rows: Row[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  onSearch?: (searchText: string) => void;
  onSort?: (field: string, direction: "asc" | "desc" | null) => void;
  onFilter?: (filters: Filter[]) => void;
  onRowSelect?: (selectedRows: (string | number)[]) => void;
  onRowAction?: (
    action: "view" | "edit" | "delete",
    rowId: string | number
  ) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onAdd?: () => void;
  onGetFilterOptions?: (
    field: string,
    searchText?: string
  ) => Promise<FilterOption[]>;
  height?: number;
}

// Filter Chip Component
const FilterChip: React.FC<{
  filter: Filter;
  colorIndex: number;
  onRemove: (field: string) => void;
  onClick: (field: string) => void;
  "data-filter-field"?: string;
}> = ({
  filter,
  colorIndex,
  onRemove,
  onClick,
  "data-filter-field": dataFilterField,
}) => {
  const colors = [
    { bg: "#1E764E1F", text: "#1E764E", border: "#1E764E40" },
    { bg: "#C06C2B1F", text: "#C06C2B", border: "#C06C2B40" },
    { bg: "#8A38F51F", text: "#8A38F5", border: "#8A38F540" },
  ];

  const color = colors[colorIndex % colors.length];
  const valueCount = filter.value.length;

  // Show individual values if 1-2 values, otherwise show count
  let displayText;
  if (valueCount === 1) {
    displayText = `${filter.field}: ${filter.value[0]}`;
  } else if (valueCount === 2) {
    displayText = `${filter.field}: ${filter.value.join(", ")}`;
  } else {
    displayText = `${filter.field} (${valueCount})`;
  }

  return (
    <div
      data-filter-field={filter.field}
      className="flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer font-medium"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        height: "24px",
        maxWidth: "250px",
      }}
      onClick={() => onClick(filter.field)}
    >
      <span className="truncate flex-1 text-left" title={displayText}>
        {displayText}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(filter.field);
        }}
        className="ml-2 hover:opacity-70"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// Filter Popover Component
const FilterPopover: React.FC<{
  field: string;
  position: { x: number; y: number };
  onClose: () => void;
  onApply: (field: string, values: string[]) => void;
  onGetFilterOptions?: (
    field: string,
    searchText?: string
  ) => Promise<FilterOption[]>;
  currentFilter?: string[];
}> = ({
  field,
  position,
  onClose,
  onApply,
  onGetFilterOptions,
  currentFilter = [],
}) => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(currentFilter)
  );
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFilterOptions();
  }, [field]);

  useEffect(() => {
    setSelectedValues(new Set(currentFilter));
  }, [currentFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchText) {
        loadFilterOptions(searchText);
      }
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchText]);

  const loadFilterOptions = async (search?: string) => {
    if (!onGetFilterOptions) return;

    setLoading(true);
    try {
      const result = await onGetFilterOptions(field, search);
      setOptions(result);
    } catch (error) {
      console.error("Failed to load filter options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(field, Array.from(selectedValues));
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedValues.size === options.length) {
      setSelectedValues(new Set());
    } else {
      setSelectedValues(new Set(options.map((opt) => opt.value)));
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64"
      style={{ left: position.x, top: position.y }}
    >
      <div className="p-3 border-b">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search values..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-2 border-b">
        <button
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {selectedValues.size === options.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : options.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchText
              ? "No matching options found"
              : "Unable to load filter options"}
          </div>
        ) : (
          options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.has(option.value)}
                onChange={(e) => {
                  const newSelected = new Set(selectedValues);
                  if (e.target.checked) {
                    newSelected.add(option.value);
                  } else {
                    newSelected.delete(option.value);
                  }
                  setSelectedValues(newSelected);
                }}
                className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex-1">
                {option.label}
              </span>
              <span className="text-xs text-gray-500">({option.count})</span>
            </label>
          ))
        )}
      </div>

      <div className="p-3 border-t flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

// Draggable Column Item
const DraggableColumnItem: React.FC<{
  column: Column;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
}> = ({ column, index, onReorder }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const toIndex = index;
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move transition-opacity ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical size={16} className="text-gray-400" />
      <span className="text-sm text-gray-700 flex-1">{column.headerName}</span>
    </div>
  );
};

// Helper function to get filter color
const getFilterColor = (field: string, activeFilters: Filter[]) => {
  const filterIndex = activeFilters.findIndex((f) => f.field === field);
  if (filterIndex === -1) return { bg: "", border: "" };

  const colors = [
    { bg: "#1E764E1F", border: "#1E764E" },
    { bg: "#C06C2B1F", border: "#C06C2B" },
    { bg: "#8A38F51F", border: "#8A38F5" },
  ];
  const color = colors[filterIndex % colors.length];
  return {
    bg: color.bg,
    border: `2px solid ${color.border}`,
  };
};

// Resizable Column Header
const ResizableHeader: React.FC<{
  column: Column;
  sortConfig: { field: string; direction: "asc" | "desc" } | null;
  activeFilters: Filter[];
  onSort: (field: string) => void;
  onFilter: (e: React.MouseEvent, field: string) => void;
  onResize: (field: string, width: number) => void;
}> = ({ column, sortConfig, activeFilters, onSort, onFilter, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!column.resizable) return;
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(column.width);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      onResize(column.field, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, startX, startWidth, column.field, onResize]);

  const isFiltered = activeFilters.some((f) => f.field === column.field);
  const filterColor = isFiltered
    ? getFilterColor(column.field, activeFilters)
    : { bg: "", border: "" };

  return (
    <div
      ref={headerRef}
      className="flex items-center justify-between relative group w-full h-full"
      style={{
        backgroundColor: isFiltered ? filterColor.bg : "transparent",
        border: filterColor.border || "none",
      }}
    >
      <span className="truncate text-left flex-1 pr-2">
        {column.headerName}
      </span>

      <div className="flex items-center space-x-1 flex-shrink-0">
        {column.sortable !== false && (
          <button
            onClick={() => onSort(column.field)}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
            style={{ minWidth: "18px", height: "18px" }}
          >
            {sortConfig?.field === column.field ? (
              sortConfig.direction === "asc" ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )
            ) : (
              <ArrowUpDown size={14} />
            )}
          </button>
        )}
        {column.filterable !== false && (
          <button
            onClick={(e) => onFilter(e, column.field)}
            className={`p-0.5 rounded transition-colors ${
              isFiltered
                ? "text-blue-600 hover:text-blue-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ minWidth: "18px", height: "18px" }}
          >
            <Filter size={14} />
          </button>
        )}
      </div>

      {/* Resize Handle */}
      {column.resizable !== false && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-all duration-150 z-10 hover:bg-blue-300"
          onMouseDown={handleMouseDown}
        >
          {isResizing && (
            <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-500 z-20" />
          )}
        </div>
      )}
    </div>
  );
};

// Client-side sorting utility
const sortData = (data: Row[], field: string, direction: "asc" | "desc") => {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === "asc" ? -1 : 1;
    if (bVal == null) return direction === "asc" ? 1 : -1;

    // Handle different data types
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Convert to string and compare
    const aStr = String(aVal);
    const bStr = String(bVal);
    return direction === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
};

// Main CustomTable Component
const CustomTable: React.FC<DataTableProps> = ({
  columns: initialColumns,
  rows,
  loading = false,
  pagination,
  onSearch,
  onSort,
  onFilter,
  onRowSelect,
  onRowAction,
  onExport,
  onImport,
  onAdd,
  onGetFilterOptions,
  height = 650,
}) => {
  // State management
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnSettingsTab, setColumnSettingsTab] = useState<
    "hide" | "reorder"
  >("hide");
  const [columnSearchText, setColumnSearchText] = useState("");
  const [filterPopover, setFilterPopover] = useState<{
    field: string;
    x: number;
    y: number;
  } | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate heights
  const toolbarHeight = 34;
  const filterRowHeight = activeFilters.length > 0 ? 37 : 0;
  const headerHeight = 37;
  const paginationHeight = 60;
  const availableHeight =
    height -
    toolbarHeight -
    filterRowHeight -
    headerHeight -
    paginationHeight -
    16;

  // Memoized visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => !col.hidden);
  }, [columns]);

  // Client-side sorting (only when no server-side sorting)
  const sortedRows = useMemo(() => {
    if (onSort || !sortConfig) return rows; // Use server-side sorting if onSort is provided

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Handle different data types
      let comparison = 0;

      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        // Convert to strings for comparison
        comparison = String(aVal)
          .toLowerCase()
          .localeCompare(String(bVal).toLowerCase());
      }

      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  }, [rows, sortConfig, onSort]);

  // Filtered columns for search
  const filteredColumnsForSettings = useMemo(() => {
    if (!columnSearchText) return columns;
    return columns.filter(
      (col) =>
        col.headerName.toLowerCase().includes(columnSearchText.toLowerCase()) ||
        col.field.toLowerCase().includes(columnSearchText.toLowerCase())
    );
  }, [columns, columnSearchText]);

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  // Handle client-side and server-side sorting
  const handleSort = useCallback(
    (field: string) => {
      if (onSort) {
        // Server-side sorting - use the provided onSort callback
        let newDirection: "asc" | "desc" | null = "asc";

        if (sortConfig?.field === field) {
          if (sortConfig.direction === "asc") {
            newDirection = "desc";
          } else if (sortConfig.direction === "desc") {
            newDirection = null;
          }
        }

        setSortConfig(newDirection ? { field, direction: newDirection } : null);
        onSort(field, newDirection);
      } else {
        // Client-side sorting - handle locally
        let newDirection: "asc" | "desc" | null = "asc";

        if (sortConfig?.field === field) {
          if (sortConfig.direction === "asc") {
            newDirection = "desc";
          } else if (sortConfig.direction === "desc") {
            newDirection = null;
          }
        }

        setSortConfig(newDirection ? { field, direction: newDirection } : null);
      }
    },
    [sortConfig, onSort]
  );

  // Handle row selection
  const handleRowSelect = useCallback(
    (rowId: string | number, checked: boolean) => {
      const newSelected = new Set(selectedRows);
      if (checked) {
        newSelected.add(rowId);
      } else {
        newSelected.delete(rowId);
      }
      setSelectedRows(newSelected);
      onRowSelect?.(Array.from(newSelected));
    },
    [selectedRows, onRowSelect]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = new Set(sortedRows.map((row) => row.id));
        setSelectedRows(allIds);
        onRowSelect?.(Array.from(allIds));
      } else {
        setSelectedRows(new Set());
        onRowSelect?.([]);
      }
    },
    [sortedRows, onRowSelect]
  );

  // Handle column visibility
  const handleColumnVisibility = useCallback(
    (field: string, visible: boolean) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.field === field ? { ...col, hidden: !visible } : col
        )
      );
    },
    []
  );

  // Handle show/hide all columns
  const handleShowHideAll = useCallback((show: boolean) => {
    setColumns((prev) => prev.map((col) => ({ ...col, hidden: !show })));
  }, []);

  // Handle reset columns
  const handleResetColumns = useCallback(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // Handle column reorder
  const handleColumnReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newColumns = [...columns];
      const [movedColumn] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, movedColumn);
      setColumns(newColumns);
    },
    [columns]
  );

  // Handle column resize
  const handleColumnResize = useCallback((field: string, width: number) => {
    setColumns((prev) =>
      prev.map((col) => (col.field === field ? { ...col, width } : col))
    );
  }, []);

  // Handle filter
  const handleFilter = useCallback(
    (field: string, values: string[]) => {
      const existingFilterIndex = activeFilters.findIndex(
        (f) => f.field === field
      );
      let newFilters = [...activeFilters];

      if (values.length === 0) {
        if (existingFilterIndex >= 0) {
          newFilters.splice(existingFilterIndex, 1);
        }
      } else {
        const column = columns.find((c) => c.field === field);
        const newFilter: Filter = {
          field,
          value: values,
          label: `${column?.headerName}: ${values.join(", ")}`,
        };

        if (existingFilterIndex >= 0) {
          newFilters[existingFilterIndex] = newFilter;
        } else {
          newFilters.push(newFilter);
        }
      }

      setActiveFilters(newFilters);
      onFilter?.(newFilters);
    },
    [activeFilters, columns, onFilter]
  );

  // Remove filter
  const removeFilter = useCallback(
    (field: string) => {
      const newFilters = activeFilters.filter((f) => f.field !== field);
      setActiveFilters(newFilters);
      onFilter?.(newFilters);
    },
    [activeFilters, onFilter]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    onFilter?.([]);
  }, [onFilter]);

  // Handle filter popover (from column header)
  const handleFilterClick = useCallback(
    (e: React.MouseEvent, field: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setFilterPopover({
        field,
        x: rect.left,
        y: rect.bottom + 5,
      });
    },
    []
  );

  // Handle filter chip click
  const handleFilterChipClick = useCallback((field: string) => {
    // Find a reference element for positioning
    const chipElement = document.querySelector(
      `[data-filter-field="${field}"]`
    );
    if (chipElement) {
      const rect = chipElement.getBoundingClientRect();
      setFilterPopover({
        field,
        x: rect.left,
        y: rect.bottom + 5,
      });
    } else {
      // Fallback positioning
      setFilterPopover({
        field,
        x: 200,
        y: 150,
      });
    }
  }, []);

  // Sync columns when initialColumns change
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const isAllSelected =
    selectedRows.size === sortedRows.length && sortedRows.length > 0;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < sortedRows.length;

  return (
    <>
      <div
        className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex flex-col w-full mx-auto custom-table-container"
        style={{
          height,
          maxWidth: "calc(100vw - 6.8rem)",
          width: "100%",
          fontFamily:
            "Work Sans, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between mb-2 px-2"
          style={{
            height: toolbarHeight,
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          <div className="flex items-center space-x-2">
            {/* Columns Button */}
            <button
              onClick={() => setShowColumnSettings(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <Settings size={16} />
              <span>Columns</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search for vehicles or devices"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-1.5 border border-blue-800/50 rounded-lg text-xs text-gray-600 font-medium leading-none bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                style={{
                  fontFamily: "Work Sans",
                  letterSpacing: "0.03em",
                }}
              />
            </div>

            {/* Filter Button */}
            <button className="p-1 rounded bg-gray-100 text-gray-600">
              <Filter size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Import */}
            <button
              onClick={() => document.getElementById("import-file")?.click()}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
            <input
              id="import-file"
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={(e) =>
                e.target.files?.[0] && onImport?.(e.target.files[0])
              }
            />

            {/* Export */}
            <button
              onClick={onExport}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <Download size={16} />
              <span>Export</span>
            </button>

            {/* Table View */}
            <button className="flex items-center space-x-1 px-3 py-1 bg-[#1F3A8A] text-white rounded-lg text-sm font-medium hover:bg-[#1F3A8A]/90">
              <Grid3X3 size={16} />
              <span>Table View</span>
            </button>

            {/* Add Button */}
            <button
              onClick={onAdd}
              className="px-4 py-1 bg-[#1F3A8A] text-white rounded-lg text-sm font-medium hover:bg-[#1F3A8A]/90"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div
            className="mb-2 py-2 px-2"
            style={{
              backgroundColor: "#EEEEEE",
              borderRadius: "8px",
              minHeight: filterRowHeight,
              maxHeight: "120px",
            }}
          >
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-20">
              {activeFilters.map((filter, index) => (
                <FilterChip
                  key={filter.field}
                  filter={filter}
                  colorIndex={index}
                  onRemove={removeFilter}
                  onClick={handleFilterChipClick}
                  data-filter-field={filter.field}
                />
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="mt-2 px-3 py-1 text-xs font-medium text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: "#1F3A8A" }}
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="flex-1 border border-gray-200 rounded-t-xl overflow-x-auto">
          <table className="w-full" style={{ minWidth: "max-content" }}>
            {/* Header */}
            <thead
              className="bg-gray-50 border-b border-gray-200"
              style={{ height: headerHeight }}
            >
              <tr>
                {/* Selection Header */}
                <th
                  className="sticky left-0 z-20 bg-gray-50 border-r border-gray-200 px-3"
                  style={{ width: 50 }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded focus:ring-blue-500"
                    style={{
                      width: "19px",
                      height: "19px",
                      backgroundColor: "#ECF1F4",
                      borderColor: "#D7D7D7",
                      borderRadius: "5px",
                      borderWidth: "1px",
                    }}
                  />
                </th>

                {/* Column Headers */}
                {visibleColumns.map((column) => (
                  <th
                    key={column.field}
                    className="px-3 border-r border-gray-200 last:border-r-0 relative group bg-gray-50"
                    style={{
                      width: column.width,
                      minWidth: column.width,
                      fontFamily: "Work Sans",
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "100%",
                      letterSpacing: "0.03em",
                      color: "#4B5563",
                    }}
                  >
                    <ResizableHeader
                      column={column}
                      sortConfig={sortConfig}
                      activeFilters={activeFilters}
                      onSort={handleSort}
                      onFilter={handleFilterClick}
                      onResize={handleColumnResize}
                    />
                  </th>
                ))}

                {/* Action Header */}
                <th
                  className="sticky right-0 z-20 bg-gray-50 border-l border-gray-200 px-3"
                  style={{ width: 80 }}
                >
                  <span
                    style={{
                      fontFamily: "Work Sans",
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "100%",
                      letterSpacing: "0.03em",
                      color: "#4B5563",
                    }}
                  >
                    Action
                  </span>
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="text-center py-8"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="text-center py-8 text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, rowIndex) => {
                  const isSelected = selectedRows.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      }`}
                      style={{ height: 42 }}
                    >
                      {/* Selection Cell */}
                      <td
                        className="sticky left-0 z-10 bg-inherit border-r border-gray-200"
                        style={{ width: 50 }}
                      >
                        <div className="flex items-center justify-center px-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={(e) =>
                              handleRowSelect(row.id, e.target.checked)
                            }
                            className="rounded focus:ring-blue-500"
                            style={{
                              width: "19px",
                              height: "19px",
                              backgroundColor: "#FFFFFF",
                              borderColor: "#D1D5DB",
                              borderRadius: "4px",
                              borderWidth: "1px",
                            }}
                          />
                        </div>
                      </td>

                      {/* Data Cells */}
                      {visibleColumns.map((column) => (
                        <td
                          key={column.field}
                          className="px-3 border-r border-gray-200 last:border-r-0"
                          style={{
                            width: column.width,
                            minWidth: column.width,
                            fontFamily: "Work Sans",
                            fontWeight: 400,
                            fontSize: "12px",
                            lineHeight: "100%",
                            letterSpacing: "0.03em",
                            color: "#374151",
                          }}
                        >
                          <div className="truncate w-full text-left">
                            {column.renderCell
                              ? column.renderCell({
                                  value: row[column.field],
                                  row,
                                })
                              : row[column.field] || "-"}
                          </div>
                        </td>
                      ))}

                      {/* Action Cell */}
                      <td
                        className="sticky right-0 z-10 bg-inherit border-l border-gray-200"
                        style={{ width: 80 }}
                      >
                        <div className="flex items-center justify-center px-3">
                          <div className="relative group">
                            <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 top-8 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-36">
                              <button
                                onClick={() => onRowAction?.("view", row.id)}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye size={14} />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => onRowAction?.("edit", row.id)}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={14} />
                                <span>Edit Details</span>
                              </button>
                              <button
                                onClick={() => onRowAction?.("delete", row.id)}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        {pagination && (
          <CustomPagination
            currentPage={pagination.page}
            totalPages={Math.ceil(
              pagination.total / (pagination.pageSize || 1)
            )}
            pageSize={pagination.pageSize}
            totalRows={pagination.total}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        )}

        {/* Column Settings Modal */}
        {showColumnSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Column Settings</h3>
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b">
                <button
                  onClick={() => setColumnSettingsTab("hide")}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    columnSettingsTab === "hide"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Hide/Unhide
                </button>
                <button
                  onClick={() => setColumnSettingsTab("reorder")}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    columnSettingsTab === "reorder"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Reorder
                </button>
              </div>

              <div className="p-4 border-b">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search for columns"
                    value={columnSearchText}
                    onChange={(e) => setColumnSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="px-4 py-2 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Available Columns
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShowHideAll(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => handleShowHideAll(false)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Hide All
                    </button>
                    <button
                      onClick={handleResetColumns}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {columnSettingsTab === "hide" ? (
                  <div className="space-y-2">
                    {filteredColumnsForSettings.map((column) => (
                      <label
                        key={column.field}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!column.hidden}
                          onChange={(e) =>
                            handleColumnVisibility(
                              column.field,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {column.headerName}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredColumnsForSettings.map((column, index) => (
                      <DraggableColumnItem
                        key={column.field}
                        column={column}
                        index={index}
                        onReorder={handleColumnReorder}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter Popover */}
        {filterPopover && (
          <FilterPopover
            field={filterPopover.field}
            position={{ x: filterPopover.x, y: filterPopover.y }}
            onClose={() => setFilterPopover(null)}
            onApply={handleFilter}
            onGetFilterOptions={onGetFilterOptions}
            currentFilter={
              activeFilters.find((f) => f.field === filterPopover.field)
                ?.value || []
            }
          />
        )}
      </div>
    </>
  );
};

export default CustomTable;
