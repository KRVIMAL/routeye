import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiBarChart,
  FiDatabase,
  FiNavigation,
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiZap,
} from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import DateTimeRangePicker, {
  DateTimeRange,
} from "../../../components/ui/DateTimeRangePicker";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { reportsServices } from "./services/reports.services";
import strings from "../../../global/constants/StringConstants";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { tabTitle } from "../../../utils/tab-title";
import LoadSensorChartModal from "../../../components/ui/Modal/LoadSensorChartModal";

// Report Types
export type ReportType =
  | "deviceData"
  | "distance"
  | "ignition"
  | "overstoppage"
  | "geofence"
  | "loadSensor"
  | "overspeed"
  | "routeDeviation";

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

interface ImeiOption {
  value: string;
  label: string;
  vehicleNo?: string;
  accountName?: string;
}

interface AccountOption {
  value: string;
  label: string;
  accountId: string;
}

const Reports: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<ReportType>("deviceData");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableIMEIs, setAvailableIMEIs] = useState<string[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<AccountOption[]>(
    []
  );

  tabTitle("Reports");

  // Filter states
  const [selectedIMEI, setSelectedIMEI] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateTimeRange>({
    startDate: null,
    endDate: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [rawReportData, setRawReportData] = useState<any>(null);

  // Report columns configuration
  const getColumnsForTab = (tabId: ReportType): Column[] => {
    switch (tabId) {
      case "deviceData":
        return [
          {
            field: "timestamp",
            headerName: "Timestamp",
            width: 180,
            type: "date",
          },
          { field: "imei", headerName: "IMEI", width: 150 },
          { field: "vehicleNo", headerName: "Vehicle No", width: 120 },
          {
            field: "latitude",
            headerName: "Latitude",
            width: 120,
            type: "number",
          },
          {
            field: "longitude",
            headerName: "Longitude",
            width: 120,
            type: "number",
          },
          { field: "speed", headerName: "Speed", width: 80, type: "number" },
          {
            field: "altitude",
            headerName: "Altitude",
            width: 80,
            type: "number",
          },
          {
            field: "ignition",
            headerName: "Ignition",
            width: 100,
            renderCell: (params) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  params.value === 1 || params.value === "ON"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {params.value === 1 || params.value === "ON" ? "ON" : "OFF"}
              </span>
            ),
          },
          {
            field: "satelliteUsed",
            headerName: "Satellites",
            width: 100,
            type: "number",
          },
          {
            field: "signalStrength",
            headerName: "Signal",
            width: 100,
            type: "number",
          },
          {
            field: "batteryVoltage",
            headerName: "Battery",
            width: 100,
            type: "number",
          },
        ];

      case "distance":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "sessionType", headerName: "Session", width: 100 },
          { field: "startTime", headerName: "Start Time", width: 150 },
          { field: "endTime", headerName: "End Time", width: 150 },
          {
            field: "distance",
            headerName: "Distance (km)",
            width: 120,
            type: "number",
          },
          { field: "startLocation", headerName: "Start Location", width: 200 },
          { field: "endLocation", headerName: "End Location", width: 200 },
        ];

      case "ignition":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "sessionType", headerName: "Session Type", width: 150 },
          { field: "startTime", headerName: "Start Time", width: 150 },
          { field: "endTime", headerName: "End Time", width: 150 },
          { field: "duration", headerName: "Duration", width: 120 },
          { field: "startLocation", headerName: "Start Location", width: 200 },
          { field: "endLocation", headerName: "End Location", width: 200 },
          {
            field: "ignitionStatus",
            headerName: "Status",
            width: 100,
            renderCell: (params) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  params.value === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {params.value === 1 ? "ON" : "OFF"}
              </span>
            ),
          },
        ];

      case "overstoppage":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "sessionType", headerName: "Session Type", width: 150 },
          { field: "startTime", headerName: "Start Time", width: 150 },
          { field: "endTime", headerName: "End Time", width: 150 },
          { field: "duration", headerName: "Duration", width: 120 },
          { field: "location", headerName: "Location", width: 200 },
          { field: "engineStatus", headerName: "Engine Status", width: 150 },
          {
            field: "isOverstayage",
            headerName: "Overstayage",
            width: 120,
            renderCell: (params) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  params.value
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {params.value ? "YES" : "NO"}
              </span>
            ),
          },
        ];

      case "geofence":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "eventType", headerName: "Event Type", width: 150 },
          { field: "timestamp", headerName: "Timestamp", width: 180 },
          { field: "geofenceName", headerName: "Geofence Name", width: 150 },
          { field: "location", headerName: "Location", width: 200 },
          { field: "duration", headerName: "Duration", width: 120 },
        ];

      case "loadSensor":
        return [
          { field: "timestamp", headerName: "Timestamp", width: 180 },
          {
            field: "loadValue",
            headerName: "Load Value",
            width: 120,
            type: "number",
          },
          {
            field: "averageLoad",
            headerName: "Average Load",
            width: 130,
            type: "number",
          },
          {
            field: "maxLoad",
            headerName: "Max Load",
            width: 120,
            type: "number",
          },
          {
            field: "minLoad",
            headerName: "Min Load",
            width: 120,
            type: "number",
          },
          {
            field: "windowSize",
            headerName: "Window Size",
            width: 120,
            type: "number",
          },
        ];

      case "overspeed":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "startTime", headerName: "Start Time", width: 150 },
          { field: "endTime", headerName: "End Time", width: 150 },
          {
            field: "maxSpeed",
            headerName: "Max Speed",
            width: 120,
            type: "number",
          },
          {
            field: "speedLimit",
            headerName: "Speed Limit",
            width: 120,
            type: "number",
          },
          { field: "duration", headerName: "Duration", width: 120 },
          { field: "location", headerName: "Location", width: 200 },
        ];

      case "routeDeviation":
        return [
          { field: "date", headerName: "Date", width: 120 },
          { field: "timestamp", headerName: "Timestamp", width: 180 },
          { field: "routeName", headerName: "Route Name", width: 150 },
          {
            field: "deviationDistance",
            headerName: "Deviation (m)",
            width: 130,
            type: "number",
          },
          { field: "duration", headerName: "Duration", width: 120 },
          { field: "location", headerName: "Location", width: 200 },
        ];

      default:
        return [];
    }
  };

  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: "Reports", isActive: true, icon: FiBarChart },
  ];

  // Load available accounts and IMEIs on component mount
  useEffect(() => {
    loadAvailableAccounts();
    loadAvailableIMEIs(); // Load hardcoded IMEIs
  }, []);

  const loadAvailableAccounts = async () => {
    try {
      const accounts = await reportsServices.getAccountHierarchy();
      const accountOptions = extractAccountOptions(accounts);
      setAvailableAccounts(accountOptions);

      // Set default account if only one available
      if (accountOptions.length === 1) {
        setSelectedAccount(accountOptions[0].value);
      }
    } catch (error: any) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load available accounts");
    }
  };

  // Extract account options recursively
  const extractAccountOptions = (account: any): AccountOption[] => {
    const options: AccountOption[] = [];

    if (account.status === "active") {
      options.push({
        value: account._id,
        label: account.accountName,
        accountId: account.accountId,
      });
    }

    if (account.children && account.children.length > 0) {
      account.children.forEach((child: any) => {
        options.push(...extractAccountOptions(child));
      });
    }

    return options;
  };

  const loadAvailableIMEIs = async () => {
    try {
      const imeis = await reportsServices.getAvailableIMEIs();
      setAvailableIMEIs(imeis);
    } catch (error: any) {
      console.error("Error loading IMEIs:", error);
      toast.error("Failed to load available IMEIs");
    }
  };

  const loadData = async () => {
    if (
      !selectedIMEI ||
      !selectedAccount ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      toast.error("Please select account, IMEI and date range");
      return;
    }

    setLoading(true);
    try {
      const selectedAcc = availableAccounts.find(
        (acc) => acc.value === selectedAccount
      );
      if (!selectedAcc) {
        throw new Error("Selected account not found");
      }

      const startDate = dateRange.startDate.format("YYYY-MM-DD");
      const endDate = dateRange.endDate.format("YYYY-MM-DD");

      const result = await reportsServices.getReportData(
        activeTab,
        selectedIMEI,
        selectedAcc.accountId, // Send accountId
        startDate,
        endDate,
        currentPage,
        pageSize
      );

      setData(result.data);
      setRawReportData(result.rawData);
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
    if (
      selectedIMEI &&
      selectedAccount &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      setTimeout(() => loadData(), 0);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    // Auto-reload data when page size changes if filters are set
    if (
      selectedIMEI &&
      selectedAccount &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      setTimeout(() => loadData(), 0);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as ReportType);
    setData([]); // Clear current data
    setCurrentPage(1); // Reset pagination
    setTotalRows(0);
    setTotalPages(0);

    // Auto-reload data for new tab if filters are set
    if (
      selectedIMEI &&
      selectedAccount &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      setTimeout(() => {
        loadDataForTab(tabId as ReportType);
      }, 0);
    }
  };

  const loadDataForTab = async (tabId: ReportType) => {
    if (
      !selectedIMEI ||
      !selectedAccount ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      return;
    }

    setLoading(true);
    try {
      const selectedAcc = availableAccounts.find(
        (acc) => acc.value === selectedAccount
      );
      if (!selectedAcc) {
        throw new Error("Selected account not found");
      }

      const startDate = dateRange.startDate.format("YYYY-MM-DD");
      const endDate = dateRange.endDate.format("YYYY-MM-DD");

      const result = await reportsServices.getReportData(
        tabId,
        selectedIMEI,
        selectedAcc.accountId, // Send accountId
        startDate,
        endDate,
        1, // Reset to first page
        pageSize
      );

      setData(result.data);
      setRawReportData(result.rawData);
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

  const handleShowGraph = () => {
    if (activeTab !== "loadSensor") {
      toast.error("Graph is only available for Load Sensor reports");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("Please generate a report first to view the graph");
      return;
    }

    setIsChartModalOpen(true);
  };

  const getLoadSensorChartData = () => {
    if (activeTab !== "loadSensor" || !rawReportData) return [];

    const chartData: any[] = [];

    if (rawReportData.dayWiseData && rawReportData.dayWiseData.length > 0) {
      rawReportData.dayWiseData.forEach((dayData: any) => {
        if (dayData.readings && dayData.readings.length > 0) {
          dayData.readings.forEach((reading: any) => {
            chartData.push({
              timestamp: reading.timestamp,
              loadValue: reading.ain1Value,
              averageLoad: reading.averageLoad,
              maxLoad: dayData.maxLoad,
              minLoad: dayData.minLoad,
              windowSize: reading.windowSize,
            });
          });
        }
      });
    }

    return chartData;
  };

  // Create account options for dropdown
  const accountOptions = availableAccounts.map((account) => ({
    value: account.value,
    label: account.label,
  }));

  // Create IMEI options for dropdown
  const imeiOptions = availableIMEIs.map((imei) => ({
    value: imei,
    label: imei,
  }));

  // Get tab icon
  const getTabIcon = (tabId: ReportType) => {
    const icons = {
      deviceData: FiDatabase,
      distance: FiNavigation,
      ignition: FiZap,
      overstoppage: FiClock,
      geofence: FiMapPin,
      loadSensor: FiActivity,
      overspeed: FiTrendingUp,
      routeDeviation: FiNavigation,
    };
    return icons[tabId] || FiBarChart;
  };

  // Create header tabs
  const headerTabs = [
    {
      id: "deviceData",
      label: "Device Data",
      icon: FiDatabase,
      isActive: activeTab === "deviceData",
    },
    {
      id: "distance",
      label: "Distance",
      icon: FiNavigation,
      isActive: activeTab === "distance",
    },
    {
      id: "ignition",
      label: "Ignition",
      icon: FiZap,
      isActive: activeTab === "ignition",
    },
    {
      id: "overstoppage",
      label: "Over Stoppage",
      icon: FiClock,
      isActive: activeTab === "overstoppage",
    },
    {
      id: "geofence",
      label: "Geofence",
      icon: FiMapPin,
      isActive: activeTab === "geofence",
    },
    {
      id: "loadSensor",
      label: "Load Sensor",
      icon: FiActivity,
      isActive: activeTab === "loadSensor",
    },
    {
      id: "overspeed",
      label: "Overspeed",
      icon: FiTrendingUp,
      isActive: activeTab === "overspeed",
    },
    {
      id: "routeDeviation",
      label: "Route Deviation",
      icon: FiNavigation,
      isActive: activeTab === "routeDeviation",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title="Reports"
        breadcrumbs={breadcrumbs}
        headerTabs={headerTabs}
        activeHeaderTab={activeTab}
        onHeaderTabChange={handleTabChange}
      />

      <div className="p-6">
        {/* Filters Section */}
        <Card className="mb-6">
          <Card.Body className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-6 gap-4 items-end">
              {/* Account Selection */}
              <div>
                <Select
                  label={strings.ACCOUNT_NAME}
                  options={accountOptions}
                  value={selectedAccount}
                  onChange={(value) => setSelectedAccount(value as string)}
                  placeholder="Choose an Account"
                  required
                  disabled={loading || availableAccounts.length === 0}
                />
              </div>

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
                  showTime={false}
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
                    !selectedAccount ||
                    !dateRange.startDate ||
                    !dateRange.endDate
                  }
                  // isLoading={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
              {activeTab === "loadSensor" && (
                <div>
                  <Button
                    onClick={handleShowGraph}
                    disabled={loading || data.length === 0}
                    variant="secondary"
                    className="w-full flex items-center space-x-2"
                  >
                    <FiActivity className="w-4 h-4" />
                    <span>Show Graph</span>
                  </Button>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Data Table */}
        <DataTable
          key={activeTab}
          columns={getColumnsForTab(activeTab)}
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
            modulePath: `/track-data/${
              activeTab === "deviceData"
                ? "deviceData-report"
                : activeTab === "distance"
                ? "distance-report"
                : activeTab === "ignition"
                ? "ignition-report"
                : activeTab === "overstoppage"
                ? "overStop-report"
                : activeTab === "geofence"
                ? "geofence-report"
                : activeTab === "loadSensor"
                ? "loadSensor-report"
                : activeTab === "overspeed"
                ? "overspeed-report"
                : "route-deviation-report"
            }/csv`,
            filename: `${activeTab}-report-${selectedIMEI}-${dateRange.startDate?.format(
              "YYYY-MM-DD"
            )}-${dateRange.endDate?.format("YYYY-MM-DD")}`,
            // Add query parameters for export
            queryParams:
              selectedIMEI &&
              selectedAccount &&
              dateRange.startDate &&
              dateRange.endDate
                ? (() => {
                    const selectedAcc = availableAccounts.find(
                      (acc) => acc.value === selectedAccount
                    );
                    return selectedAcc
                      ? {
                          imei: selectedIMEI,
                          account: selectedAcc.accountId,
                          startDate: `${dateRange.startDate.format(
                            "YYYY-MM-DD"
                          )} 00:00:00`,
                          endDate: `${dateRange.endDate.format(
                            "YYYY-MM-DD"
                          )} 23:59:59`,
                          clientId: "fmb920",
                        }
                      : undefined;
                  })()
                : undefined,
          }}
        />
      </div>
      <LoadSensorChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        data={getLoadSensorChartData()}
        title="Load Sensor Chart"
        dateRange={
          dateRange.startDate && dateRange.endDate
            ? `${dateRange.startDate.format(
                "YYYY-MM-DD"
              )} to ${dateRange.endDate.format("YYYY-MM-DD")}`
            : undefined
        }
        imei={selectedIMEI}
      />
    </div>
  );
};

export default Reports;
