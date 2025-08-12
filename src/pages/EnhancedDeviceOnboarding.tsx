// src/pages/EnhancedDeviceOnboarding.tsx - Updated for fixed table scrolling
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronRight,
  FiChevronsDown,
  FiChevronUp,
} from "react-icons/fi";
import EnhancedDataTable from "../components/ui/DataTable/EnhancedDataTable";
import ImportModal from "../components/ui/ImportModal/ImportModal";
import { FileUtils } from "../utils/fileUtils";
import { Column, Row, FilterCondition } from "../components/ui/DataTable/types";
import toast from "react-hot-toast";
import { tabTitle } from "../utils/tab-title";
import { deviceServices } from "./Modules/Devices/services/devicesSevices";
import CompactSummaryCharts from "../components/ui/SummarySection/CompactSummaryCharts";

const EnhancedDeviceOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  tabTitle("Device Onboarding");

  const columns: Column[] = [
    {
      field: "accountName",
      headerName: "Account Name",
      width: 150,
      filterable: true,
    },
    {
      field: "deviceIMEI",
      headerName: "Device IMEI",
      width: 200,
      filterable: true,
    },
    {
      field: "deviceSerial",
      headerName: "Device Serial No",
      width: 180,
      filterable: true,
    },
    {
      field: "deviceModel",
      headerName: "Device Model",
      width: 130,
      filterable: true,
    },
    {
      field: "deviceType",
      headerName: "Device Type",
      width: 120,
      filterable: true,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "E-Lock"
              ? "bg-blue-100 text-blue-800"
              : params.value === "Tracker"
              ? "bg-green-100 text-green-800"
              : params.value === "RFID Card"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "vehicleNo",
      headerName: "Vehicle No",
      width: 120,
      filterable: true,
    },
    {
      field: "vehicleType",
      headerName: "Vehicle Type",
      width: 120,
      filterable: true,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Truck"
              ? "bg-blue-100 text-blue-800"
              : params.value === "Van"
              ? "bg-purple-100 text-purple-800"
              : params.value === "Car"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      filterable: true,
    },
    {
      field: "installationDate",
      headerName: "Installation Date",
      width: 150,
      filterable: true,
    },
    {
      field: "lastUpdated",
      headerName: "Last Updated",
      width: 150,
      filterable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      filterable: true,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Active"
              ? "bg-green-100 text-green-800"
              : params.value === "Inactive"
              ? "bg-red-100 text-red-800"
              : params.value === "Maintenance"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 130,
      filterable: true,
    },
    {
      field: "location",
      headerName: "Location",
      width: 150,
      filterable: true,
    },
    {
      field: "batteryLevel",
      headerName: "Battery Level",
      width: 120,
      filterable: true,
    },
    {
      field: "signalStrength",
      headerName: "Signal Strength",
      width: 130,
      filterable: true,
    },
  ];

  useEffect(() => {
    loadDevices();
  }, [searchValue, filters, pageSize]);

  const loadDevices = async (
    search: string = searchValue,
    page: number = currentPage,
    limit: number = pageSize,
    appliedFilters: FilterCondition[] = filters
  ) => {
    setLoading(true);
    try {
      const serverFilters = appliedFilters.map((filter) => ({
        field: filter.field || filter.column,
        operator: filter.operator,
        value: filter.value,
      }));

      const result = await deviceServices.getAll(
        page,
        limit,
        search || undefined,
        serverFilters.length > 0 ? serverFilters : undefined
      );

      setDevices(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading devices:", error);
      toast.error(error.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    navigate("/device-onboarding/add");
  };

  const handleEditDevice = (id: string | number) => {
    navigate(`/device-onboarding/edit/${id}`);
  };

  const handleDeleteDevice = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await deviceServices.inactivate(id);
      toast.success(result.message);
      await loadDevices();
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast.error(error.message);
      setDevices(rows);
    }
  };

  const handleImportDevices = async (file: File) => {
    try {
      if (!FileUtils.validateFileType(file, [".csv"])) {
        throw new Error("Please select a valid CSV file");
      }

      if (!FileUtils.validateFileSize(file, 10)) {
        throw new Error("File size must be less than 10MB");
      }

      const csvData = await FileUtils.parseCSVFile(file);

      const requiredColumns = [
        "accountName",
        "deviceIMEI",
        "deviceSerial",
        "deviceModel",
        "deviceType",
      ];
      const optionalColumns = ["vehicleNo", "vehicleType", "description"];

      if (csvData.length === 0) {
        throw new Error("CSV file is empty or contains no valid data");
      }

      const headers = Object.keys(csvData[0]);
      const validation = FileUtils.validateCSVHeaders(
        headers,
        requiredColumns,
        optionalColumns
      );

      if (!validation.valid) {
        throw new Error(
          `Missing required columns: ${validation.missing.join(", ")}`
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "devices");

      const response = await fetch("/api/devices/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Import failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Import failed");
      }

      toast.success(`Successfully imported ${result.imported_count} devices`);
      await loadDevices();
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  const handleDownloadTemplate = () => {
    const requiredColumns = [
      "accountName",
      "deviceIMEI",
      "deviceSerial",
      "deviceModel",
      "deviceType",
    ];
    const optionalColumns = ["vehicleNo", "vehicleType", "description"];

    const sampleData = [
      {
        accountName: "John Doe",
        deviceIMEI: "123456789012345",
        deviceSerial: "DEV001",
        deviceModel: "Model X",
        deviceType: "Tracker",
        vehicleNo: "VH001",
        vehicleType: "Truck",
        description: "Primary tracking device",
      },
    ];

    FileUtils.downloadTemplate(
      "device_import_template.csv",
      requiredColumns,
      optionalColumns,
      sampleData
    );
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDevices(searchValue, page, pageSize, filters);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="h-screen bg-gray-50 p-4 flex flex-col overflow-hidden">
      {/* Single Card Container - Full height with flex */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Page Title - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-900">
            Device Onboarding
          </h1>
        </div>

        {/* Collapsible Summary Section - Fixed */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-3 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setSummaryCollapsed(!summaryCollapsed)}
              className="p-1 rounded hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              {summaryCollapsed ? (
                <FiChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {!summaryCollapsed && (
            <div className="px-6 py-4">
              <CompactSummaryCharts
                deviceTypes={[
                  { name: "E-Lock", value: 45, color: "#3B82F6" },
                  { name: "RFID Card", value: 46, color: "#F59E0B" },
                  { name: "Tracker", value: 65, color: "#10B981" },
                ]}
                statusDistribution={[
                  { name: "Active", value: 89, color: "#10B981" },
                  { name: "Inactive", value: 33, color: "#EF4444" },
                  { name: "Maintenance", value: 34, color: "#F59E0B" },
                ]}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* Table Section - Takes remaining space and scrolls internally */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full w-full">
            <EnhancedDataTable
              columns={columns}
              rows={devices}
              loading={loading}
              onSearch={handleSearch}
              onDeleteRow={handleDeleteDevice}
              onEditClick={handleEditDevice}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={totalRows}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disableClientSidePagination={true}
              onFiltersChange={handleFiltersChange}
              serverSideFiltering={true}
              exportConfig={{
                modulePath: `/device-onboarding/export`,
                filename: "devices",
              }}
              onAddClick={handleAddDevice}
              onImportClick={() => setImportModalOpen(true)}
              onTemplateClick={handleDownloadTemplate}
              className="h-full border-none rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportDevices}
        title="Import Devices"
        subtitle="Upload a CSV file to import multiple device data at once."
        acceptedFileTypes={[".csv"]}
        maxFileSize={10}
        formatRequirements={[
          "First row should contain column headers",
          "Required columns: accountName, deviceIMEI, deviceSerial, deviceModel, deviceType",
          "Optional columns: vehicleNo, vehicleType, description",
          "Device IMEI must be 15 digits",
          "Use comma (,) as separator",
        ]}
      />
    </div>
  );
};

export default EnhancedDeviceOnboarding;