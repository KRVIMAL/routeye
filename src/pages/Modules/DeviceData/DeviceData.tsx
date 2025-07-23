import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiHardDrive,
  FiDatabase,
  FiNavigation,
  FiEye,
} from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import DateTimeRangePicker, {
  DateTimeRange,
} from "../../../components/ui/DateTimeRangePicker";
import Select from "../../../components/ui/Select";
import Tabs, { TabItem } from "../../../components/ui/Tabs";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { deviceDataServices } from "./services/deviceData.services";
import strings from "../../../global/constants/StringConstants";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import JsonViewerModal from "../../../components/ui/Modal/JsonViewerModal";
import { tabTitle } from "../../../utils/tab-title";

// Add interface for paginated response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const DeviceData: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState("hex-data");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableIMEIs, setAvailableIMEIs] = useState<string[]>([]);
  tabTitle(strings.DEVICE_DATA);
  // Filter states
  const [selectedIMEI, setSelectedIMEI] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateTimeRange>({
    startDate: null,
    endDate: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [selectedJsonData, setSelectedJsonData] = useState<any>(null);

  // Hex Data columns
  const hexDataColumns: Column[] = [
    { field: "topic", headerName: "Topic", width: 200 },
    { field: "response", headerName: "Response", width: 100, type: "number" },
    { field: "partition", headerName: "Partition", width: 100, type: "number" },
    { field: "offset", headerName: "Offset", width: 100, type: "number" },
    { field: "timestamp", headerName: "Timestamp", width: 180, type: "date" },
    { field: "created_at", headerName: "Created At", width: 180, type: "date" },
    { field: "imei", headerName: "IMEI", width: 150 },
    { field: "clientId", headerName: "CLIENT ID", width: 150 },
    {
      field: "rawHexData",
      headerName: "Raw Hex Data",
      width: 300,
      renderCell: (params) => (
        <div
          className="text-xs font-mono truncate cursor-pointer"
          title={params.value}
          style={{ maxWidth: "300px" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "viewJson",
      headerName: "View JSON",
      width: 120,
      renderCell: (params) => (
        <button
          onClick={() => handleViewJson(params.row)}
          className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
          title="View JSON Data"
        >
          <FiEye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  // Track Data columns
  const trackDataColumns: Column[] = [
    { field: "imei", headerName: "IMEI", width: 150 },
    { field: "vehicleNo", headerName: "Vehicle No", width: 120 },
    { field: "deviceType", headerName: "Device Type", width: 120 },
    { field: "dateTime", headerName: "Date Time", width: 180, type: "date" },
    { field: "latitude", headerName: "Latitude", width: 120, type: "number" },
    { field: "longitude", headerName: "Longitude", width: 120, type: "number" },
    { field: "speed", headerName: "Speed", width: 80, type: "number" },
    { field: "bearing", headerName: "Bearing", width: 80, type: "number" },
    { field: "altitude", headerName: "Altitude", width: 80, type: "number" },
    {
      field: "satellites",
      headerName: "Satellites",
      width: 100,
      type: "number",
    },
    {
      field: "ignition",
      headerName: "Ignition",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "Ignition On"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "motion",
      headerName: "Motion",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "Moving"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "gsmSignalStrength",
      headerName: "GSM Signal",
      width: 120,
      type: "number",
    },
    {
      field: "externalVoltage",
      headerName: "Voltage",
      width: 100,
      type: "number",
    },
    {
      field: "gpsValidStatus",
      headerName: "GPS Status",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "Valid"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "gnssFixStatus",
      headerName: "GNSS Fix",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "Fixed"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "totalOdometer",
      headerName: "Odometer",
      width: 120,
      type: "number",
    },
    { field: "packetType", headerName: "Packet Type", width: 100 },
    { field: "clientId", headerName: "CLIENT ID", width: 150 },
    {
      field: "viewJson",
      headerName: "View JSON",
      width: 120,
      renderCell: (params) => (
        <button
          onClick={() => handleViewJson(params.row)}
          className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
          title="View JSON Data"
        >
          <FiEye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleViewJson = (rowData: any) => {
    setSelectedJsonData(rowData);
    setIsJsonModalOpen(true);
  };

  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.DEVICE_DATA, isActive: true, icon: FiHardDrive },
  ];

  // Load available IMEIs on component mount
  useEffect(() => {
    loadAvailableIMEIs();
  }, []);

  const loadAvailableIMEIs = async () => {
    try {
      const imeis = await deviceDataServices.getAvailableIMEIs();
      setAvailableIMEIs(imeis);
    } catch (error: any) {
      console.error("Error loading IMEIs:", error);
      toast.error("Failed to load available IMEIs");
    }
  };

  const loadData = async () => {
    if (!selectedIMEI || !dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select IMEI and date range");
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange.startDate.format("YYYY-MM-DD");
      const endDate = dateRange.endDate.format("YYYY-MM-DD");

      let result: PaginatedResponse<Row>;

      if (activeTab === "hex-data") {
        result = await deviceDataServices.getHexData(
          selectedIMEI,
          startDate,
          endDate,
          currentPage,
          pageSize
        );
      } else {
        result = await deviceDataServices.getTrackData(
          selectedIMEI,
          startDate,
          endDate,
          currentPage,
          pageSize
        );
      }

      setData(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);

      if (result.data.length === 0) {
        toast("No data found for the selected criteria", { icon: "ℹ️" });
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to fetch data");
      setData([]);
      setTotalRows(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Auto-reload data when page changes if filters are set
    if (selectedIMEI && dateRange.startDate && dateRange.endDate) {
      setTimeout(() => loadData(), 0);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    // Auto-reload data when page size changes if filters are set
    if (selectedIMEI && dateRange.startDate && dateRange.endDate) {
      setTimeout(() => loadData(), 0);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setData([]); // Clear current data
    setCurrentPage(1); // Reset pagination
    setTotalRows(0);
    setTotalPages(0);

    // Auto-reload data for new tab if filters are set
    if (selectedIMEI && dateRange.startDate && dateRange.endDate) {
      setTimeout(() => {
        // Need to use the new tabId since state hasn't updated yet
        loadDataForTab(tabId);
      }, 0);
    }
  };

  const loadDataForTab = async (tabId: string) => {
    if (!selectedIMEI || !dateRange.startDate || !dateRange.endDate) {
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange.startDate.format("YYYY-MM-DD");
      const endDate = dateRange.endDate.format("YYYY-MM-DD");

      let result: PaginatedResponse<Row>;

      if (tabId === "hex-data") {
        result = await deviceDataServices.getHexData(
          selectedIMEI,
          startDate,
          endDate,
          1, // Reset to first page
          pageSize
        );
      } else {
        result = await deviceDataServices.getTrackData(
          selectedIMEI,
          startDate,
          endDate,
          1, // Reset to first page
          pageSize
        );
      }

      setData(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to fetch data");
      setData([]);
      setTotalRows(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Create IMEI options for dropdown
  const imeiOptions = availableIMEIs.map((imei) => ({
    value: imei,
    label: imei,
  }));

  // Create tabs for the module header
  const tabs: TabItem[] = [
    {
      id: "hex-data",
      label: "Hex Data",
      icon: FiDatabase,
      content: null, // Content will be rendered separately
    },
    {
      id: "track-data",
      label: "Track Data",
      icon: FiNavigation,
      content: null, // Content will be rendered separately
    },
  ];

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.DEVICE_DATA}
        breadcrumbs={breadcrumbs}
        headerTabs={[
          {
            id: "hex-data",
            label: "Hex Data",
            icon: FiDatabase,
            isActive: activeTab === "hex-data",
          },
          {
            id: "track-data",
            label: "Track Data",
            icon: FiNavigation,
            isActive: activeTab === "track-data",
          },
        ]}
        activeHeaderTab={activeTab}
        onHeaderTabChange={handleTabChange}
      />
      <div className="p-6">
        {/* Filters Section */}
        <Card className="mb-6">
          <Card.Body className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-6 gap-4 items-end">
              {/* IMEI Selection */}
              <div>
                <Select
                  label="Select IMEI"
                  options={imeiOptions}
                  value={selectedIMEI}
                  onChange={(value) => setSelectedIMEI(value as string)}
                  placeholder="Choose an IMEI"
                  required
                  disabled={loading || availableIMEIs.length === 0}
                />
              </div>

              {/* Date Range Selection */}
              <div>
                <DateTimeRangePicker
                  label="Date Range"
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select start and end date"
                  required
                  disabled={loading}
                  showTime={true} // Only date selection for this use case
                  format="YYYY-MM-DD"
                />
              </div>

              {/* Filter Button */}
              <div>
                <Button
                  onClick={loadData}
                  disabled={
                    loading ||
                    !selectedIMEI ||
                    !dateRange.startDate ||
                    !dateRange.endDate
                  }
                  isLoading={loading}
                  className="w-full"
                >
                  {loading ? "Loading..." : "Filter Data"}
                </Button>
              </div>
            </div>

            {/* Filter Summary */}
            {/* {selectedIMEI && dateRange.startDate && dateRange.endDate && (
              <div className="mt-4 p-3 bg-theme-tertiary rounded-md">
                <div className="text-sm text-text-secondary">
                  <strong>Current Filters:</strong> IMEI: {selectedIMEI} | Date
                  Range: {dateRange.startDate.format("YYYY-MM-DD")} to{" "}
                  {dateRange.endDate.format("YYYY-MM-DD")} | Tab:{" "}
                  {activeTab === "hex-data" ? "Hex Data" : "Track Data"}
                </div>
              </div>
            )} */}
          </Card.Body>
        </Card>

        {/* Data Table */}
        <DataTable
          key={activeTab}
          columns={activeTab === "hex-data" ? hexDataColumns : trackDataColumns}
          rows={data}
          loading={loading}
          pageSize={pageSize}
          pageSizeOptions={[10, 50, 100, 0]}
          // Server-side pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disableClientSidePagination={true}
          // Disable features not needed for this read-only data
          noActionColumn={true}
          checkboxSelection={false}
          // No search since we have custom filters
          onSearch={undefined}
          exportConfig={{
            modulePath: activeTab === "hex-data" ? "/hex-data" : "/track-data",
            filename: `${activeTab}-${selectedIMEI}-${dateRange.startDate?.format(
              "YYYY-MM-DD"
            )}-${dateRange.endDate?.format("YYYY-MM-DD")}`,
          }}
        />
      </div>
      {selectedJsonData && (
        <JsonViewerModal
          isOpen={isJsonModalOpen}
          onClose={() => {
            setIsJsonModalOpen(false);
            setSelectedJsonData(null);
          }}
          data={selectedJsonData}
          title={`${activeTab === "hex-data" ? "Hex" : "Track"} Data JSON`}
        />
      )}
    </div>
  );
};

export default DeviceData;
