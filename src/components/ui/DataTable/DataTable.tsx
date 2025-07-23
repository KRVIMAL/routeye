// src/components/ui/DataTable/DataTable.tsx - Updated with server-side filtering
import React, { useState, useEffect, useMemo } from "react";
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
import TableCell from "./TableCell";
import Pagination from "./Pagination";
import ColumnHeaderMenu from "./ColumnHeaderMenu";
import { FiFilter, FiArrowUp, FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "../Button";

const DataTable: React.FC<DataTableProps> = ({
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
}) => {
  const navigate = useNavigate();
  const [internalRows, setInternalRows] = useState<Row[]>(externalRows);
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [searchValue, setSearchValue] = useState("");

  // Client-side pagination state (used when server-side is disabled)
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
          pinned: null,
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
        pinned: null,
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
      headerName: "Actions",
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
      // For server-side filtering, just return rows as-is (filtering handled by server)
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

    // Apply sorting only (search and pagination handled by server for server-side mode)
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
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for API call
      const timeout = setTimeout(() => {
        onSearch(value);
      }, 500); // 500ms debounce

      setSearchTimeout(timeout);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    setFilters(newFilters);

    if (!serverSideFiltering) {
      // For client-side filtering, reset to first page
      setInternalCurrentPage(1);
    }
  };

  // Handle edit click - navigate to edit page
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

  return (
    <div
      className={`bg-theme-primary border border-border-light rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
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
      />

      {/* Table */}
      <div className="overflow-x-auto overflow-y-visible">
        {allColumnsHidden ? (
          <div className="px-4 py-16 text-center">
            <div className="space-y-4">
              <p className="text-heading-2 text-text-muted">No columns</p>
              <Button
                variant="primary"
                onClick={() => setShowColumnMenu(true)}
                className="text-primary-500 hover:text-primary-600"
              >
                MANAGE COLUMNS
              </Button>
            </div>
          </div>
        ) : (
          <table className="w-full">
            {/* Header */}
            <thead className="bg-theme-secondary border-b border-border-light">
              <tr>
                {orderedColumns
                  .filter((col) => visibleColumns[col.field])
                  .map((column) => {
                    const headerAlign =
                      column.headerAlign || column.align || "left";
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

                    return (
                      <th
                        key={column.field}
                        className={`px-4 py-3 font-semibold text-text-primary ${
                          alignClasses[headerAlign]
                        } group relative hover:bg-theme-tertiary transition-colors ${
                          columnState.pinned ? "sticky bg-theme-secondary" : ""
                        } ${
                          columnState.pinned === "left" ? "left-0 z-10" : ""
                        } ${
                          columnState.pinned === "right" ? "right-0 z-10" : ""
                        }`}
                        style={{ width: column.width }}
                      >
                        <div className="flex items-center justify-between">
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
                              <FiFilter className="w-3 h-3 text-primary-500" />
                            )}
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {column.sortable !== false && (
                              <button
                                onClick={() => handleSort(column.field)}
                                className="p-1 rounded hover:bg-theme-accent"
                              >
                                <FiArrowUp
                                  className={`w-4 h-4 ${
                                    sortField === column.field &&
                                    sortDirection === "asc"
                                      ? "text-primary-500"
                                      : "text-text-muted"
                                  }`}
                                />
                              </button>
                            )}

                            {!disableColumnMenu && (
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
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      orderedColumns.filter((col) => visibleColumns[col.field])
                        .length
                    }
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      orderedColumns.filter((col) => visibleColumns[col.field])
                        .length
                    }
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                displayRows.map((row, rowIndex) => {
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-border-light hover:bg-theme-tertiary transition-colors ${
                        rowIndex % 2 === 0
                          ? "bg-theme-primary"
                          : "bg-theme-secondary"
                      }`}
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

                          if (column.field === "actions") {
                            return (
                              <td
                                key={column.field}
                                className={`px-4 py-3 text-center ${
                                  columnState?.pinned ? "sticky bg-inherit" : ""
                                } ${
                                  columnState?.pinned === "left"
                                    ? "left-0 z-10"
                                    : ""
                                } ${
                                  columnState?.pinned === "right"
                                    ? "right-0 z-10"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  {(editPath || onEditClick) && (
                                    <button
                                      onClick={() => handleEditClick(row.id)}
                                      className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
                                      title="Edit"
                                    >
                                      <FiEdit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {/* 
                                  {onDeleteRow && (
                                    <button
                                      onClick={() => handleDeleteClick(row.id)}
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  )} */}
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={column.field}
                              className={`${
                                columnState?.pinned ? "sticky bg-inherit" : ""
                              } ${
                                columnState?.pinned === "left"
                                  ? "left-0 z-10"
                                  : ""
                              } ${
                                columnState?.pinned === "right"
                                  ? "right-0 z-10"
                                  : ""
                              }`}
                            >
                              <TableCell
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
        )}
      </div>

      {/* Pagination */}
      {!allColumnsHidden && totalRows > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default DataTable;
