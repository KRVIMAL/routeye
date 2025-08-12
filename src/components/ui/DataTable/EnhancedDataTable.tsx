// src/components/ui/DataTable/EnhancedDataTable.tsx - Fixed scrolling and layout
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Column,
  Row,
  RowModesModel,
  DataTableProps,
  FilterCondition,
  ColumnState,
} from "./types";
import TableToolbar from "./TableToolbar";
import ColumnHeaderMenu from "./ColumnHeaderMenu";
import {
  FiFilter,
  FiArrowUp,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import Button from "../Button";
import EnhancedTableCell from "./EnhancedTableCell";
import EnhancedPagination from "./EnhancedPagination";

const EnhancedDataTable: React.FC<DataTableProps> = ({
  columns: initialColumns,
  rows: externalRows,
  loading = false,
  onSaveRow,
  onDeleteRow,
  createRowData,
  noActionColumn = false,
  pageSize: initialPageSize = 25,
  pageSizeOptions = [5, 10, 25, 50, 100],
  checkboxSelection = false,
  disableColumnMenu = false,
  toolbar: CustomToolbar,
  className = "",
  onColumnStateChange,
  initialColumnStates,
  editPath,
  onEditClick,
  onSearch,
  // Server-side pagination props
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  totalRows: externalTotalRows,
  onPageChange: externalPageChange,
  onPageSizeChange: externalPageSizeChange,
  disableClientSidePagination = false,
  // Server-side filtering props
  onFiltersChange: externalFiltersChange,
  serverSideFiltering = false,
  exportConfig,
  onAddClick,
  onImportClick,
  onTemplateClick,
  showAddButton = true,
  showImportButton = true,
  showTemplateButton = true,
}) => {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const [internalRows, setInternalRows] = useState<Row[]>(externalRows);
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [searchValue, setSearchValue] = useState("");

  // Client-side pagination state
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showFilterComponent, setShowFilterComponent] = useState(false);

  // Column states for pinning, visibility, etc.
  const [columnStates, setColumnStates] = useState<ColumnState[]>(() => {
    if (initialColumnStates) {
      const states = [...initialColumnStates];
      if (!noActionColumn && !states.find((s) => s.field === "actions")) {
        states.push({
          field: "actions",
          visible: true,
          pinned: "right", // Actions column pinned to right by default
          sortDirection: null,
          width: 120,
        });
      }
      return states;
    }

    const states = initialColumns.map((col) => ({
      field: col.field,
      visible: !col.hide,
      pinned: null,
      sortDirection: null,
      width: col.width,
    }));

    if (!noActionColumn) {
      states.push({
        field: "actions",
        visible: true,
        pinned: "right", // Actions column pinned to right by default
        sortDirection: null,
        width: 120,
      });
    }

    return states;
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<{
    [key: string]: boolean;
  }>(() => {
    const visibility: { [key: string]: boolean } = {};
    if (initialColumnStates) {
      initialColumnStates.forEach((state) => {
        visibility[state.field] = state.visible;
      });
      if (!noActionColumn) {
        visibility["actions"] = true;
      }
    } else {
      initialColumns.forEach((col) => {
        visibility[col.field] = !col.hide;
      });
      if (!noActionColumn) {
        visibility["actions"] = true;
      }
    }
    return visibility;
  });

  // Add actions column if needed
  const columns = useMemo(() => {
    const actionsColumn: Column = {
      field: "actions",
      headerName: "Action",
      width: 120,
      type: "actions",
      align: "center",
      editable: false,
      sortable: false,
      filterable: false,
    };

    return noActionColumn ? initialColumns : [...initialColumns, actionsColumn];
  }, [initialColumns, noActionColumn]);

  // Update internal rows when external rows change
  useEffect(() => {
    setInternalRows(externalRows);
  }, [externalRows]);

  // Notify parent about column state changes
  useEffect(() => {
    if (onColumnStateChange) {
      onColumnStateChange(columnStates);
    }
  }, [columnStates, onColumnStateChange]);

  // Handle filters change with server-side filtering
  useEffect(() => {
    if (serverSideFiltering && externalFiltersChange) {
      externalFiltersChange(filters);
    }
  }, [filters, serverSideFiltering, externalFiltersChange]);

  // Process rows (sorting and filtering for client-side only)
  const processedRows = useMemo(() => {
    if (serverSideFiltering) {
      return internalRows;
    }

    let filtered = internalRows;

    // Apply client-side filtering
    if (filters.length > 0) {
      filtered = filtered.filter((row) => {
        return filters.every((filter) => {
          const value = row[filter.column];
          const filterValue = filter.value.toLowerCase();
          const cellValue = String(value || "").toLowerCase();

          switch (filter.operator) {
            case "contains":
              return cellValue.includes(filterValue);
            case "notContains":
              return !cellValue.includes(filterValue);
            case "equals":
              return cellValue === filterValue;
            case "notEquals":
              return cellValue !== filterValue;
            case "startsWith":
              return cellValue.startsWith(filterValue);
            case "endsWith":
              return cellValue.endsWith(filterValue);
            case "greaterThan":
              return Number(value) > Number(filter.value);
            case "lessThan":
              return Number(value) < Number(filter.value);
            case "greaterThanOrEqual":
              return Number(value) >= Number(filter.value);
            case "lessThanOrEqual":
              return Number(value) <= Number(filter.value);
            case "isEmpty":
              return !value || String(value).trim() === "";
            case "isNotEmpty":
              return value && String(value).trim() !== "";
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === bVal) return 0;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [internalRows, sortField, sortDirection, filters, serverSideFiltering]);

  // Pagination logic
  const currentPage = disableClientSidePagination
    ? externalCurrentPage || 1
    : internalCurrentPage;
  const totalRows = disableClientSidePagination
    ? externalTotalRows || 0
    : processedRows.length;
  const totalPages = disableClientSidePagination
    ? externalTotalPages || 0
    : Math.ceil(processedRows.length / pageSize);

  // Get rows to display
  const displayRows = disableClientSidePagination
    ? processedRows
    : processedRows.slice(
        (internalCurrentPage - 1) * pageSize,
        internalCurrentPage * pageSize
      );

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (disableClientSidePagination && externalPageChange) {
      externalPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    if (disableClientSidePagination && externalPageSizeChange) {
      externalPageSizeChange(size);
    } else {
      setInternalCurrentPage(1);
    }
  };

  // Handle search with debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (onSearch) {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        onSearch(value);
      }, 500);

      setSearchTimeout(timeout);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    setFilters(newFilters);

    if (!serverSideFiltering) {
      setInternalCurrentPage(1);
    }
  };

  // Handle edit click
  const handleEditClick = (id: string | number) => {
    if (onEditClick) {
      onEditClick(id);
    } else if (editPath) {
      navigate(`${editPath}/${id}`);
    }
  };

  const handleDeleteClick = (id: string | number) => {
    const rowToDelete = internalRows.find((row) => row.id === id);
    if (rowToDelete) {
      setInternalRows(internalRows.filter((row) => row.id !== id));
      onDeleteRow?.(id, rowToDelete, internalRows);
    }
  };

  const handleColumnVisibilityChange = (field: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [field]: visible }));
    setColumnStates((prev) =>
      prev.map((cs) => (cs.field === field ? { ...cs, visible } : cs))
    );
  };

  const handleSort = (field: string, direction?: "asc" | "desc" | null) => {
    if (direction !== undefined) {
      if (direction === null) {
        setSortField("");
        setSortDirection("asc");
      } else {
        setSortField(field);
        setSortDirection(direction);
      }
    } else {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    }

    setColumnStates((prev) =>
      prev.map((cs) =>
        cs.field === field
          ? {
              ...cs,
              sortDirection:
                direction ||
                (sortField === field && sortDirection === "asc"
                  ? "desc"
                  : "asc"),
            }
          : { ...cs, sortDirection: null }
      )
    );
  };

  const handlePin = (field: string, position: "left" | "right" | null) => {
    setColumnStates((prev) =>
      prev.map((cs) => (cs.field === field ? { ...cs, pinned: position } : cs))
    );
  };

  const handleHideColumn = (field: string) => {
    setVisibleColumns((prev) => ({ ...prev, [field]: false }));
    setColumnStates((prev) =>
      prev.map((cs) => (cs.field === field ? { ...cs, visible: false } : cs))
    );
  };

  const handleOpenColumnFilter = (field: string) => {
    setShowFilterComponent(true);
    if (!filters.some((f) => f.column === field)) {
      const newFilter: FilterCondition = {
        id: Date.now().toString(),
        column: field,
        operator: "contains",
        value: "",
      };
      setFilters((prev) => [...prev, newFilter]);
    }
  };

  // Get ordered columns (pinned left, normal, pinned right)
  const orderedColumns = useMemo(() => {
    const pinnedLeft = columns.filter((col) => {
      const state = columnStates.find((cs) => cs.field === col.field);
      return state?.pinned === "left";
    });

    const normal = columns.filter((col) => {
      const state = columnStates.find((cs) => cs.field === col.field);
      return !state?.pinned;
    });

    const pinnedRight = columns.filter((col) => {
      const state = columnStates.find((cs) => cs.field === col.field);
      return state?.pinned === "right";
    });

    return [...pinnedLeft, ...normal, ...pinnedRight];
  }, [columns, columnStates]);

  const ToolbarComponent = CustomToolbar || TableToolbar;

  // Check if all columns are hidden
  const allColumnsHidden = Object.values(visibleColumns).every(
    (visible) => !visible
  );

  // Calculate table width
  const tableWidth = orderedColumns
    .filter(col => visibleColumns[col.field])
    .reduce((sum, col) => sum + (col.width || 150), 0);

  return (
    <div className={`bg-white border border-gray-200 flex flex-col h-full overflow-hidden w-full ${className}`}>
      {/* Fixed Toolbar */}
      <div className="flex-shrink-0">
        <ToolbarComponent
          columns={columns}
          rows={internalRows}
          setRows={setInternalRows}
          setRowModesModel={setRowModesModel}
          createRowData={createRowData}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showAddButton={false}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showColumnMenu={showColumnMenu}
          setShowColumnMenu={setShowColumnMenu}
          showFilterComponent={showFilterComponent}
          setShowFilterComponent={setShowFilterComponent}
          exportConfig={exportConfig}
          onAddClick={onAddClick}
          onImportClick={onImportClick}
          onTemplateClick={onTemplateClick}
          showImportButton={showImportButton}
          showTemplateButton={showTemplateButton}
        />
      </div>

      {/* Table Container - Takes remaining height */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
        {allColumnsHidden ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-gray-600">
                No columns visible
              </p>
              <Button
                variant="primary"
                onClick={() => setShowColumnMenu(true)}
              >
                MANAGE COLUMNS
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full table-container">
            {/* Fixed Table Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 overflow-hidden w-full">
              <div 
                ref={headerScrollRef}
                className="overflow-x-auto overflow-y-hidden header-scroll"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  width: '100%'
                }}
                onScroll={(e) => {
                  if (tableRef.current) {
                    tableRef.current.scrollLeft = e.currentTarget.scrollLeft;
                  }
                }}
              >
                <table 
                  className="border-collapse" 
                  style={{ 
                    width: `${tableWidth}px`,
                    minWidth: `${tableWidth}px`,
                    tableLayout: 'fixed'
                  }}
                >
                  <thead style={{ backgroundColor: "#EEEEEE" }}>
                    <tr>
                      {orderedColumns
                        .filter((col) => visibleColumns[col.field])
                        .map((column) => {
                          const headerAlign =
                            column.headerAlign || column.align || "center";
                          const alignClasses = {
                            left: "text-left",
                            center: "text-center",
                            right: "text-right",
                          };

                          const columnState = columnStates.find(
                            (cs) => cs.field === column.field
                          ) || {
                            field: column.field,
                            visible: true,
                            pinned: null,
                            sortDirection: null,
                          };

                          const hasFilter = filters.some(
                            (f) => f.column === column.field
                          );
                          const isPinned = columnState.pinned;
                          const isActionColumn = column.field === "actions";

                          return (
                            <th
                              key={column.field}
                              className={`px-4 py-3 font-semibold group relative hover:bg-gray-200 transition-colors border-b border-gray-300 ${
                                alignClasses[headerAlign]
                              } ${
                                isPinned
                                  ? `sticky ${
                                      isPinned === "left" ? "left-0" : "right-0"
                                    } z-30`
                                  : ""
                              } ${isActionColumn ? "z-40" : ""}`}
                              style={{
                                width: column.width,
                                minWidth: column.width,
                                backgroundColor: isPinned
                                  ? "#EEEEEE"
                                  : "inherit",
                                // Header typography as specified
                                color: "#4B5563",
                                fontFamily: "Work Sans, sans-serif",
                                fontWeight: 600,
                                fontSize: "13px",
                                lineHeight: "100%",
                                letterSpacing: "3%",
                                textTransform: "capitalize",
                              }}
                            >
                              <div className="flex items-center justify-center space-x-1">
                                <div
                                  className="flex items-center space-x-1 cursor-pointer"
                                  onClick={() =>
                                    column.sortable !== false &&
                                    handleSort(column.field)
                                  }
                                >
                                  <span>{column.headerName}</span>
                                  {sortField === column.field && (
                                    <span className="text-xs">
                                      {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                  )}
                                  {hasFilter && (
                                    <FiFilter className="w-3 h-3 text-blue-500" />
                                  )}
                                </div>

                                {!disableColumnMenu &&
                                  column.field !== "actions" && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ColumnHeaderMenu
                                        column={column}
                                        columnState={columnState}
                                        onSort={handleSort}
                                        onPin={handlePin}
                                        onHide={handleHideColumn}
                                        onOpenColumnManager={() =>
                                          setShowColumnMenu(true)
                                        }
                                        onOpenFilter={handleOpenColumnFilter}
                                        hasFilter={hasFilter}
                                      />
                                    </div>
                                  )}
                              </div>
                            </th>
                          );
                        })}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>

            {/* Scrollable Table Body */}
            <div
              ref={tableRef}
              className="flex-1 bg-white table-body-scroll"
              style={{
                overflow: 'auto',
                width: '100%',
                height: '100%'
              }}
              onScroll={(e) => {
                if (headerScrollRef.current) {
                  headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
            >
              <table 
                className="border-collapse" 
                style={{ 
                  width: `${tableWidth}px`,
                  minWidth: `${tableWidth}px`,
                  tableLayout: 'fixed'
                }}
              >
                {/* Hidden header for column width consistency */}
                <thead className="opacity-0 pointer-events-none">
                  <tr style={{ backgroundColor: "#EEEEEE" }}>
                    {orderedColumns
                      .filter((col) => visibleColumns[col.field])
                      .map((column) => (
                        <th
                          key={column.field}
                          className="px-4 py-3"
                          style={{ width: column.width, minWidth: column.width }}
                        >
                          {column.headerName}
                        </th>
                      ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={
                          orderedColumns.filter(
                            (col) => visibleColumns[col.field]
                          ).length
                        }
                        className="px-4 py-12 text-center"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="text-gray-600">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : displayRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          orderedColumns.filter(
                            (col) => visibleColumns[col.field]
                          ).length
                        }
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row, rowIndex) => {
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "#F3F4F6";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "transparent";
                          }}
                        >
                          {orderedColumns
                            .filter((col) => visibleColumns[col.field])
                            .map((column) => {
                              const cellParams = {
                                id: row.id,
                                field: column.field,
                                value: row[column.field],
                                row,
                              };

                              const columnState = columnStates.find(
                                (cs) => cs.field === column.field
                              );
                              const isPinned = columnState?.pinned;
                              const isActionColumn = column.field === "actions";

                              if (column.field === "actions") {
                                return (
                                  <td
                                    key={column.field}
                                    className={`px-4 py-3 text-center bg-white ${
                                      isPinned
                                        ? `sticky ${
                                            isPinned === "left"
                                              ? "left-0"
                                              : "right-0"
                                          } z-20`
                                        : ""
                                    } ${isActionColumn ? "z-30" : ""}`}
                                    style={{
                                      backgroundColor: "white",
                                      borderLeft:
                                        isPinned === "right"
                                          ? "1px solid #E5E7EB"
                                          : "none",
                                    }}
                                  >
                                    <div className="flex items-center justify-center space-x-1">
                                      {(editPath || onEditClick) && (
                                        <button
                                          onClick={() =>
                                            handleEditClick(row.id)
                                          }
                                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                          title="Edit"
                                        >
                                          <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                                        title="More options"
                                      >
                                        <FiMoreVertical className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={column.field}
                                  className={`${
                                    isPinned
                                      ? `sticky ${
                                          isPinned === "left"
                                            ? "left-0"
                                            : "right-0"
                                        } z-10 bg-white`
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor: isPinned
                                      ? "white"
                                      : "transparent",
                                    borderRight:
                                      isPinned === "left"
                                        ? "1px solid #E5E7EB"
                                        : "none",
                                  }}
                                >
                                  <EnhancedTableCell
                                    params={cellParams}
                                    column={column}
                                    isEditing={false}
                                    onStartEdit={() => {}}
                                  />
                                </td>
                              );
                            })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixed Pagination */}
        {!allColumnsHidden && totalRows > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
            <EnhancedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              totalRows={totalRows}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDataTable;