// src/pages/DataTableDemo.tsx - Demo page with examples
import React, { useState, useEffect } from "react";
import DataTable from "../components/ui/DataTable/DataTable";
import { Column, Row } from "../components/ui/DataTable/types";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// Mock data service (similar to your seller.js)
const mockDataService: any = {
  rows: [
    {
      id: 1,
      login: "cycle-depot",
      title: "Cycle-Depot",
      desc: "Premium bicycle store",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 25000,
    },
    {
      id: 2,
      login: "toplowriderstore",
      title: "Top Lowrider",
      desc: "Custom lowrider bikes",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 18500,
    },
    {
      id: 3,
      login: "mountainbikes",
      title: "Mountain Bikes Pro",
      desc: "Professional mountain biking equipment",
      dateCreated: "2023-02-15",
      status: "Inactive",
      revenue: 32000,
    },
    {
      id: 4,
      login: "citycycles",
      title: "City Cycles",
      desc: "Urban commuter bicycles",
      dateCreated: "2023-01-20",
      status: "Active",
      revenue: 15750,
    },
    {
      id: 5,
      login: "cycle-depot 5",
      title: "Cycle-Depot",
      desc: "Premium bicycle store",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 25000,
    },
    {
      id: 6,
      login: "toplowriderstore 6",
      title: "Top Lowrider",
      desc: "Custom lowrider bikes",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 18500,
    },
    {
      id: 7,
      login: "mountainbikes 7",
      title: "Mountain Bikes Pro",
      desc: "Professional mountain biking equipment",
      dateCreated: "2023-02-15",
      status: "Inactive",
      revenue: 32000,
    },
    {
      id: 8,
      login: "citycycles 8",
      title: "City Cycles",
      desc: "Urban commuter bicycles",
      dateCreated: "2023-01-20",
      status: "Active",
      revenue: 15750,
    },
    {
      id: 9,
      login: "cycle-depot 9",
      title: "Cycle-Depot",
      desc: "Premium bicycle store",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 25000,
    },
    {
      id: 10,
      login: "toplowriderstore 10",
      title: "Top Lowrider",
      desc: "Custom lowrider bikes",
      dateCreated: "2023-03-09",
      status: "Active",
      revenue: 18500,
    },
    {
      id: 11,
      login: "mountainbikes 11",
      title: "Mountain Bikes Pro",
      desc: "Professional mountain biking equipment",
      dateCreated: "2023-02-15",
      status: "Inactive",
      revenue: 32000,
    },
    {
      id: 12,
      login: "citycycles 12",
      title: "City Cycles",
      desc: "Urban commuter bicycles",
      dateCreated: "2023-01-20",
      status: "Active",
      revenue: 15750,
    },
  ],

  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockDataService.rows });
      }, 1000);
    });
  },

  saveRow: (row: Row) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (row.isNew) {
          mockDataService.rows.push(row as any);
        } else {
          mockDataService.rows = mockDataService.rows.map((r: any) =>
            r.id === row.id ? { ...r, ...row } : r
          );
        }
        resolve({ data: row });
      }, 500);
    });
  },

  deleteRow: (rowId: string | number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deletedRow = mockDataService.rows.find(
          (r: any) => r.id === rowId
        );
        mockDataService.rows = mockDataService.rows.filter(
          (r: any) => r.id !== rowId
        );
        resolve({ data: deletedRow });
      }, 500);
    });
  },
};

const DataTableDemo: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // Column definitions
  const columns: Column[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      type: "number",
      align: "center",
      editable: false,
    },
    {
      field: "login",
      headerName: "Login",
      width: 120,
      type: "string",
      align: "center",
      editable: true,
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
      type: "string",
      editable: true,
    },
    {
      field: "desc",
      headerName: "Description",
      width: 300,
      type: "string",
      editable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      type: "string",
      align: "center",
      editable: true,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Active"
              ? "bg-success-100 text-success-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "revenue",
      headerName: "Revenue",
      width: 120,
      type: "number",
      align: "right",
      editable: true,
      renderCell: (params) => (
        <span className="font-semibold text-success-600">
          ${params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: "dateCreated",
      headerName: "Date Created",
      width: 150,
      type: "date",
      align: "center",
      editable: false,
    },
  ];

  // Load data
  useEffect(() => {
    setLoading(true);
    mockDataService
      .getAll()
      .then((res: any) => {
        setRows(res.data.map((r: any, i: number) => ({ ...r, no: i + 1 })));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Event handlers
  const handleSaveRow = (
    id: string | number,
    updatedRow: Row,
    oldRow: Row,
    oldRows: Row[]
  ) => {
    mockDataService
      .saveRow(updatedRow)
      .then((res: any) => {
        const dbRow = res.data;
        setRows(
          oldRows.map((r) => (r.id === updatedRow.id ? { ...dbRow } : r))
        );
      })
      .catch((err: Int32ArrayConstructor) => {
        console.error("Error saving row:", err);
        setRows(oldRows); // Revert on error
      });
  };

  const handleDeleteRow = (
    id: string | number,
    oldRow: Row,
    oldRows: Row[]
  ) => {
    console.log("Deleting row:", id);

    mockDataService
      .deleteRow(id)
      .then((res: any) => {
        const dbRowId = res.data.id;
        setRows(oldRows.filter((r) => r.id !== dbRowId));
      })
      .catch((err: any) => {
        console.error("Error deleting row:", err);
        setRows(oldRows); // Revert on error
      });
  };

  const createRowData = (rows: Row[]) => {
    const newId = Math.max(...rows.map((r) => Number(r.id) || 0)) + 1;
    const newNo = Math.max(...rows.map((r) => Number(r.no) || 0)) + 1;
    return {
      id: newId,
      no: newNo,
      login: "",
      title: "",
      desc: "",
      status: "Active",
      revenue: 0,
      dateCreated: new Date().toISOString().split("T")[0],
      isNew: true,
    };
  };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-heading-1 text-text-primary mb-md">
          DataTable Demo
        </h1>
        <p className="text-body text-text-secondary">
          A comprehensive data table with CRUD operations, sorting, filtering,
          pagination, and export functionality.
        </p>
      </div>

      {/* Full Featured Table */}
      <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">
            Full Featured CRUD Table
          </h3>
          <p className="text-body-small text-text-secondary mt-1">
            Complete table with all features: Add, Edit, Delete, Search, Sort,
            Filter, Export
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            onSaveRow={handleSaveRow}
            onDeleteRow={handleDeleteRow}
            createRowData={createRowData}
            pageSize={10}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </Card.Body>
      </Card>

      {/* Read-Only Table */}
      {/* <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">Read-Only Table</h3>
          <p className="text-body-small text-text-secondary mt-1">
            Table without actions column - view only mode
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            noActionColumn={true}
            pageSize={5}
            pageSizeOptions={[5, 10]}
          />
        </Card.Body>
      </Card> */}

      {/* Custom Toolbar Table */}
      {/* <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">Custom Toolbar Example</h3>
          <p className="text-body-small text-text-secondary mt-1">
            Table with custom toolbar (no add button)
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            onSaveRow={handleSaveRow}
            onDeleteRow={handleDeleteRow}
            toolbar={CustomToolbar}
            pageSize={10}
          />
        </Card.Body>
      </Card> */}

      {/* Simple Table */}
      {/* <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">Simple Table</h3>
          <p className="text-body-small text-text-secondary mt-1">
            Basic table with minimal configuration
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={[
              { field: 'id', headerName: 'ID', width: 80 },
              { field: 'title', headerName: 'Title', width: 200 },
              { field: 'status', headerName: 'Status', width: 120 }
            ]}
            rows={rows.map(r => ({ id: r.id, title: r.title, status: r.status }))}
            loading={loading}
            noActionColumn={true}
            pageSize={5}
          />
        </Card.Body>
      </Card> */}

      {/* Usage Instructions */}
      {/* <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">Usage Instructions</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-md text-body-small text-text-secondary">
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Features Available:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>CRUD Operations:</strong> Add, Edit, Delete rows with inline editing</li>
                <li><strong>Search:</strong> Global search across all columns</li>
                <li><strong>Sorting:</strong> Click column headers to sort</li>
                <li><strong>Pagination:</strong> Navigate through pages with customizable page sizes</li>
                <li><strong>Column Management:</strong> Show/hide columns via toolbar</li>
                <li><strong>Export:</strong> Download data as CSV or Excel</li>
                <li><strong>Loading States:</strong> Built-in loading indicators</li>
                <li><strong>Custom Rendering:</strong> Custom cell renderers for complex data</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-2">How to Use:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Add:</strong> Click "Add" button in toolbar</li>
                <li><strong>Edit:</strong> Click edit icon or double-click cell (if editable)</li>
                <li><strong>Save:</strong> Click save icon or press Enter</li>
                <li><strong>Cancel:</strong> Click cancel icon or press Escape</li>
                <li><strong>Delete:</strong> Click delete icon (confirmation recommended)</li>
                <li><strong>Search:</strong> Type in search box for global filtering</li>
                <li><strong>Sort:</strong> Click column headers to sort ascending/descending</li>
                <li><strong>Export:</strong> Use Export dropdown for CSV/Excel download</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card> */}
    </div>
  );
};

// Custom toolbar example (matches your CustomToolbar from MUI)
const CustomToolbar: React.FC<any> = (props) => {
  const {
    searchValue,
    onSearchChange,
    visibleColumns,
    onColumnVisibilityChange,
    columns,
  } = props;

  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportToCSV = () => {
    // Export logic here
    console.log("Exporting to CSV");
  };

  const exportToExcel = () => {
    // Export logic here
    console.log("Exporting to Excel");
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border-light bg-theme-primary">
      <div className="flex items-center space-x-4">
        {/* Column Visibility */}
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center space-x-2"
          >
            <span>Columns</span>
          </Button>

          {showColumnMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-theme-primary border border-border-light rounded-lg shadow-lg z-dropdown">
              <div className="p-2">
                {columns
                  ?.filter((col: any) => col.field !== "actions")
                  .map((column: any) => (
                    <label
                      key={column.field}
                      className="flex items-center space-x-2 p-2 hover:bg-theme-tertiary rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns?.[column.field]}
                        onChange={(e) =>
                          onColumnVisibilityChange?.(
                            column.field,
                            e.target.checked
                          )
                        }
                      />
                      <span className="text-sm">{column.headerName}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            Export
          </Button>

          {showExportMenu && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-theme-primary border border-border-light rounded-lg shadow-lg z-dropdown">
              <div className="p-1">
                <button
                  onClick={exportToCSV}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-theme-tertiary rounded"
                >
                  CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-theme-tertiary rounded"
                >
                  Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search - Note: No Add button in custom toolbar */}
      <div className="w-64">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-border-light rounded-md bg-theme-primary text-text-primary"
        />
      </div>
    </div>
  );
};

export default DataTableDemo;
