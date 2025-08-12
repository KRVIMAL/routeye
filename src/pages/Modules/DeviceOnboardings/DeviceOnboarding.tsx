// DeviceOnboardingPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiSmartphone } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { deviceOnboardingServices } from "./services/deviceOnboardingsServices";
import { transformDeviceOnboardingData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaTabletAlt, FaCar } from "react-icons/fa";
import CustomSummary, {
  SummaryCard,
} from "../../../components/CustomSummary/CustomSummary";
import { getConfigPreset } from "../../../components/CustomSummary/utils/summaryConfigPresets";
import { store } from "../../../store";

// Types
interface Column {
  field: string;
  headerName: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  type?: "string" | "number" | "date" | "boolean";
  renderCell?: (params: { value: any; row: Row }) => React.ReactNode;
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

// Summary data interface (from your API)
interface DeviceOnboardingSummaryData {
  totalDevices: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  accountNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  vehicleNumbers: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  driverNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  deviceTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  telecomOperators: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  mobileNumbers: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const DeviceOnboarding: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.DEVICE_ONBOARDING);

  // State management
  const [devices, setDevices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Summary-specific state
  const [summaryData, setSummaryData] = useState<DeviceOnboardingSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("device_onboarding_filters");
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setActiveFilters(filters);
      } catch (error) {
        console.error("Failed to parse saved filters:", error);
      }
    }
  }, []);

  // Save filters to localStorage when they change (optional)
  useEffect(() => {
    if (activeFilters.length > 0) {
      localStorage.setItem("device_onboarding_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("device_onboarding_filters");
    }
  }, [activeFilters]);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "accountName",
        headerName: "Account Name",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "deviceIMEI",
        headerName: "Device IMEI",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "deviceSerialNo",
        headerName: "Device Serial No",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "deviceModelName",
        headerName: "Device Model",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "deviceType",
        headerName: "Device Type",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              params.value === "car"
                ? "bg-blue-100 text-blue-800"
                : params.value === "truck"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {params.value?.toUpperCase() || "N/A"}
          </span>
        ),
      },
      {
        field: "vehicleNo",
        headerName: "Vehicle No",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "vehicleType",
        headerName: "Vehicle Type",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "vehicleDescription",
        headerName: "Description",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "driverName",
        headerName: "Driver Name",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "driverNo",
        headerName: "Driver No",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "telecomMaster1",
        headerName: "Mobile No 1",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "telecomMaster2",
        headerName: "Mobile No 2",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              params.value === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {params.value === "active" ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        field: "createdTime",
        headerName: "Created",
        width: 120,
        type: "date",
        sortable: true,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <span>{new Date(params.value).toLocaleDateString()}</span>
        ),
      },
      {
        field: "updatedTime",
        headerName: "Updated",
        width: 120,
        type: "date",
        sortable: true,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <span>{new Date(params.value).toLocaleDateString()}</span>
        ),
      },
    ],
    []
  );

  console.log(store, "state");
  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.DEVICE_ONBOARDING, isActive: true, icon: FiSmartphone },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await deviceOnboardingServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load devices method
  const loadDevices = useCallback(
    async (
      search: string = searchValue,
      page: number = currentPage,
      limit: number = pageSize,
      sortField?: string,
      sortDirection?: "asc" | "desc",
      filters: Filter[] = activeFilters
    ) => {
      setLoading(true);
      try {
        // Always use getAll - it now uses filter API internally
        const result = await deviceOnboardingServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setDevices(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading devices:", error);
        toast.error(error.message || "Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    },
    [searchValue, currentPage, pageSize, sortConfig, activeFilters]
  );

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Initial load
  useEffect(() => {
    loadDevices();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformDeviceOnboardingData(summaryData, {
      totalIcon: React.createElement(FaTabletAlt),
      inactiveIcon: React.createElement(FaCar),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("device-onboarding", {
      title: "Summary", // Custom title
      // You can override any other config here
      // onCardClick: undefined, // Will be passed as prop instead
    });
  }, []);

  // Handle summary card click
  const handleSummaryCardClick = useCallback((card: SummaryCard) => {
    console.log("Summary card clicked:", card);

    // Navigate based on card type
    switch (card.id) {
      case "device-types":
        console.log("Navigate to device types view");
        break;
      case "account-names":
        console.log("Navigate to accounts view");
        break;
      case "vehicle-numbers":
        console.log("Navigate to vehicles view");
        break;
      case "driver-names":
        console.log("Navigate to drivers view");
        break;
      case "telecom-operators":
        console.log("Navigate to operators view");
        break;
      case "total-devices":
        console.log("Show all devices");
        break;
      case "inactive-devices":
        console.log("Show inactive devices");
        break;
      default:
        break;
    }
  }, []);

  // Handle search with pagination reset
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);
      setCurrentPage(1);
      loadDevices(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadDevices(
        searchValue,
        currentPage,
        pageSize,
        field,
        direction || undefined
      );
    },
    [searchValue, currentPage, pageSize]
  );

  // Handle filtering with pagination reset
  const handleFilter = useCallback(
    (filters: Filter[]) => {
      setActiveFilters(filters);
      setCurrentPage(1);
      loadDevices(
        searchValue,
        1,
        pageSize,
        sortConfig?.field,
        sortConfig?.direction,
        filters
      );
    },
    [searchValue, pageSize, sortConfig]
  );

  // Handle pagination page change
  const handlePageChange = useCallback(
    (page: number) => {
      // Don't change pages when showing "All"
      if (pageSize === 0) return;

      setCurrentPage(page);
      loadDevices(searchValue, page, pageSize);
    },
    [searchValue, pageSize]
  );

  // Handle pagination page size change
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);

      if (size === 0) {
        // Handle "All" option - load all data
        loadDevices(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadDevices(searchValue, 1, size);
      }
    },
    [searchValue]
  );

  // Handle row selection
  const handleRowSelect = useCallback((selectedRowIds: (string | number)[]) => {
    setSelectedRows(selectedRowIds);
    console.log("Selected rows:", selectedRowIds);
  }, []);

  // Handle row actions
  const handleRowAction = useCallback(
    (action: "view" | "edit" | "delete", rowId: string | number) => {
      const selectedDevice = devices.find((device) => device.id === rowId);

      switch (action) {
        case "view":
          console.log("View device:", selectedDevice);
          navigate(`${urls.deviceOnboardingViewPath}/${rowId}`, {
            state: { deviceData: selectedDevice },
          });
          break;
        case "edit":
          navigate(`${urls.editDeviceOnboardingViewPath}/${rowId}`, {
            state: { deviceData: selectedDevice },
          });
          break;
        case "delete":
          handleDeleteDevice(rowId);
          break;
      }
    },
    [devices, navigate]
  );

  // Handle delete device
  const handleDeleteDevice = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this device?")) {
        try {
          setLoading(true);
          const result = await deviceOnboardingServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadDevices();
        } catch (error: any) {
          console.error("Error inactivating device:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadDevices]
  );

  // Handle add device
  const handleAddDevice = useCallback(() => {
    navigate(urls.addDeviceOnboardingViewPath);
  }, [navigate]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await deviceOnboardingServices.export(activeFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `device_onboarding_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Device onboarding exported successfully");
    } catch (error: any) {
      console.error("Error exporting devices:", error);
      toast.error(error.message || "Failed to export devices");
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Handle import
  const handleImport = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const result = await deviceOnboardingServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload devices
        await loadDevices();
      } catch (error: any) {
        console.error("Error importing devices:", error);
        toast.error(error.message || "Failed to import devices");
      } finally {
        setLoading(false);
      }
    },
    [loadDevices]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await deviceOnboardingServices.getFilterOptions(field, searchText);
      } catch (error: any) {
        console.error("Error fetching filter options:", error);
        toast.error(error.message || "Failed to fetch filter options");
        return [];
      }
    },
    []
  );

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
      }}
    >
      <ModuleHeader
        title={strings.DEVICE_ONBOARDING}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
      />
      {/* Pure CustomSummary Component */}
      <div
        className="mt-2 w-full mx-auto"
        style={{
          maxWidth: "calc(100vw - 6.8rem)", // Match the table container width
        }}
      >
        <CustomSummary
          cards={summaryCards}
          loading={summaryLoading}
          error={summaryError}
          config={summaryConfig}
          onCardClick={handleSummaryCardClick}
          onRefresh={loadSummaryData}
        />
      </div>
      <div className="mt-6">
        <CustomTable
          columns={columns}
          rows={devices}
          loading={loading}
          height={650}
          pagination={{
            page: currentPage,
            pageSize: pageSize,
            total: totalRows,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          onSearch={handleSearch}
          onSort={handleSort}
          onFilter={handleFilter}
          onRowSelect={handleRowSelect}
          onRowAction={handleRowAction}
          onExport={handleExport}
          onImport={handleImport}
          onAdd={handleAddDevice}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>
    </div>
  );
};

export default DeviceOnboarding;