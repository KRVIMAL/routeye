// / src/components/ui/DataTable/TableToolbar.tsx - Complete updated component
import React, { useState, useRef, useEffect } from "react";
import {
  FiPlus,
  FiDownload,
  FiColumns,
  FiFilter,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Button from "../Button";
import CustomInput from "../CustomInput";
import FilterComponent from "./FilterComponent";
import { Column, Row, FilterCondition } from "./types";
import * as XLSX from "xlsx";
import { exportService } from "../../../core-services/rest-api/apiHelpers";
import urls from "../../../global/constants/UrlConstants";
import { store } from "../../../store";

interface TableToolbarProps {
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

const TableToolbar: React.FC<TableToolbarProps> = ({
  columns,
  rows,
  setRows,
  setRowModesModel,
  createRowData,
  searchValue,
  onSearchChange,
  visibleColumns,
  onColumnVisibilityChange,
  showAddButton = true,
  filters,
  onFiltersChange,
  showColumnMenu,
  setShowColumnMenu,
  showFilterComponent,
  setShowFilterComponent,
  exportConfig,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef: any = useRef<HTMLDivElement>(null);

  // Handle click outside for column menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(event.target as Node)
      ) {
        setShowColumnMenu(false);
      }
    };

    if (showColumnMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnMenu, setShowColumnMenu]);

  // Handle click outside for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  const handleAddRow = () => {
    if (!createRowData) return;

    const newData = createRowData(rows);
    const newRow = {
      ...newData,
      id: newData.id || Date.now(),
      isNew: true,
    };

    setRows([...rows, newRow]);
    setRowModesModel((prev: any) => ({
      ...prev,
      [newRow.id]: {
        mode: "edit",
        fieldToFocus: columns.find((c) => c.editable)?.field,
      },
    }));
  };

  // const exportToCSV = () => {
  //   const visibleCols = columns.filter(
  //     (col) => visibleColumns[col.field] && col.field !== "actions"
  //   );
  //   const headers = visibleCols.map((col) => col.headerName);
  //   const csvData = rows.map((row) =>
  //     visibleCols.map((col) => row[col.field] || "")
  //   );

  //   const csvContent = [headers, ...csvData]
  //     .map((row) => row.map((cell) => `"${cell}"`).join(","))
  //     .join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "table-data.csv";
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   setShowExportMenu(false);
  // };

  // const exportToExcel = () => {
  //   const visibleCols = columns.filter(
  //     (col) => visibleColumns[col.field] && col.field !== "actions"
  //   );
  //   const worksheetData = rows.map((row) => {
  //     const rowData: any = {};
  //     visibleCols.forEach((col) => {
  //       rowData[col.headerName] = row[col.field] || "";
  //     });
  //     return rowData;
  //   });

  //   const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //   XLSX.writeFile(workbook, "table-data.xlsx");
  //   setShowExportMenu(false);
  // };

  const handleShowHideAll = () => {
    const nonActionColumns = columns.filter((col) => col.field !== "actions");
    const allVisible = nonActionColumns.every(
      (col) => visibleColumns[col.field]
    );
    const newVisibility: { [key: string]: boolean } = { ...visibleColumns };

    nonActionColumns.forEach((col) => {
      newVisibility[col.field] = !allVisible;
    });

    // Keep actions column visibility unchanged
    Object.keys(visibleColumns).forEach((field) => {
      if (field === "actions") {
        newVisibility[field] = visibleColumns[field];
      }
    });

    // Ensure at least one column is visible
    if (Object.values(newVisibility).every((v) => !v)) {
      const firstColumn = columns.find((col) => col.field !== "actions");
      if (firstColumn) {
        newVisibility[firstColumn.field] = true;
      }
    }

    Object.keys(newVisibility).forEach((field) => {
      onColumnVisibilityChange(field, newVisibility[field]);
    });
  };

  const resetColumnVisibility = () => {
    columns.forEach((col) => {
      onColumnVisibilityChange(col.field, !col.hide);
    });
  };

  // Update your TableToolbar.tsx - Add queryParams support to exportData function

  // Updated exportData function - Replace in your TableToolbar.tsx

  const exportData = async (format: "csv" | "xlsx" | "pdf") => {
    if (!exportConfig) {
      console.error("Export configuration not provided");
      return;
    }

    try {
      // Build URL with query parameters
      let exportUrl = `${exportConfig.modulePath}?format=${format}`;

      // Add additional query parameters if provided
      if (exportConfig.queryParams) {
        const queryString = new URLSearchParams(
          exportConfig.queryParams
        ).toString();
        exportUrl += `&${queryString}`;
      }

      // Get authorization token from store
      const state = store.getState().auth;
      const token = state.accessToken;
      const tokenType = state.tokenType || 'Bearer';

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `${tokenType} ${token}`;
      }

      // Make authenticated request
      const response = await fetch(`${urls.baseURL}${exportUrl}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${exportConfig.filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(downloadUrl);

      setShowExportMenu(false);
    } catch (error: any) {
      console.error("Export failed:", error.message);
      // You can add toast notification here
      // toast.error('Export failed. Please try again.');
    }
  };
  return (
    <div className="flex items-center justify-between p-4 border-b border-border-light bg-theme-primary">
      <div className="flex items-center space-x-4">
        {/* Add Button */}
        {showAddButton && (
          <Button
            variant="primary"
            onClick={handleAddRow}
            className="flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add</span>
          </Button>
        )}

        {/* Column Visibility */}
        <div className="relative" ref={columnMenuRef}>
          <Button
            variant="secondary"
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center space-x-2"
          >
            <FiColumns className="w-4 h-4" />
            <span>Columns</span>
          </Button>

          {showColumnMenu && (
            <div
              className="fixed top-auto left-auto mt-2 w-64 bg-theme-primary border border-border-light rounded-lg shadow-lg z-[9999]"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 9999,
              }}
            >
              {" "}
              {/* Search */}
              <div className="p-3 border-b border-border-light">
                <CustomInput
                  placeholder="Search columns..."
                  leftIcon={FiSearch}
                  size="sm"
                  value=""
                  onChange={() => { }}
                />
              </div>
              {/* Show/Hide All and Reset */}
              <div className="px-3 py-2 border-b border-border-light flex items-center justify-between">
                <button
                  onClick={handleShowHideAll}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  {columns.filter(
                    (col) =>
                      col.field !== "actions" && visibleColumns[col.field]
                  ).length ===
                    columns.filter((col) => col.field !== "actions").length
                    ? "Hide All"
                    : "Show All"}
                </button>
                <button
                  onClick={resetColumnVisibility}
                  className="text-sm text-text-muted hover:text-text-secondary"
                >
                  Reset
                </button>
              </div>
              {/* Column List */}
              <div className="p-2 max-h-64 overflow-y-auto">
                {columns
                  .filter((col) => col.field !== "actions")
                  .map((column) => (
                    <label
                      key={column.field}
                      className="flex items-center space-x-2 p-2 hover:bg-theme-tertiary rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.field]}
                        onChange={(e) =>
                          onColumnVisibilityChange(
                            column.field,
                            e.target.checked
                          )
                        }
                        className="form-checkbox h-4 w-4 text-primary-600 border-border-medium rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary">
                        {column.headerName}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="relative" ref={filterButtonRef}>
          <Button
            variant="secondary"
            onClick={() => setShowFilterComponent(!showFilterComponent)}
            className="flex items-center space-x-2"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
            {filters.length > 0 && (
              <span className="ml-1 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                {filters.length}
              </span>
            )}
          </Button>

          <FilterComponent
            columns={columns}
            filters={filters}
            onFiltersChange={onFiltersChange}
            isOpen={showFilterComponent}
            onClose={() => setShowFilterComponent(false)}
            anchorRef={filterButtonRef}
          />
        </div>

        {/* Export Menu */}
        <div className="relative" ref={exportMenuRef}>
          <Button
            variant="secondary"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-2"
            disabled={!exportConfig} // Disable if no export config
          >
            <FiDownload className="w-4 h-4" />
            <span>Export</span>
          </Button>

          {showExportMenu && exportConfig && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-theme-primary border border-border-light rounded-lg shadow-lg z-dropdown">
              <div className="p-1">
                <button
                  onClick={() => exportData("csv")}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-theme-tertiary rounded"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportData("xlsx")}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-theme-tertiary rounded"
                >
                  Excel
                </button>
                <button
                  onClick={() => exportData("pdf")}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-theme-tertiary rounded"
                >
                  PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="w-64">
        <CustomInput
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={FiSearch}
          size="sm"
          rightIcon={searchValue ? FiX : undefined}
          onRightIconClick={searchValue ? () => onSearchChange("") : undefined}
        />
      </div>
    </div>
  );
};

export default TableToolbar;
