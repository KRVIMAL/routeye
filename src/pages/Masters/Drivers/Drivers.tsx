// DriversPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable, {
  ExportFormat,
} from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { driverServices } from "./services/driversService";
import { transformDriversData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaUserTie, FaUserSlash } from "react-icons/fa";
import CustomSummary, {
  SummaryCard,
} from "../../../components/CustomSummary/CustomSummary";
import { getConfigPreset } from "../../../components/CustomSummary/utils/summaryConfigPresets";
import { store } from "../../../store";
import { exportService } from "../../../core-services/rest-api/apiHelpers";

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

// Updated Filter interface to support date filters
interface DateFilter {
  dateField: string;
  dateFilterType: string;
  fromDate?: string;
  toDate?: string;
  customValue?: number;
  selectedDates?: Date[];
  isPickAnyDate?: boolean;
}

interface Filter {
  field: string;
  value: any[];
  label?: string;
  type?: "regular" | "date";
  dateFilter?: DateFilter;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Summary data interface (from your API)
interface DriverSummaryData {
  totalDrivers: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  licenseTypes?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  experienceLevels?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  locations?: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const Drivers: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.DRIVERS);

  // State management
  const [drivers, setDrivers] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<DriverSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("drivers_filters");
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
      localStorage.setItem("drivers_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("drivers_filters");
    }
  }, [activeFilters]);

  // Column definitions - Updated with date type for date columns
  const columns: Column[] = useMemo(
    () => [
      {
        field: "driverId",
        headerName: "Driver ID",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "name",
        headerName: "Driver Name",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "contactNo",
        headerName: "Contact No",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "email",
        headerName: "Email",
        width: 200,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "licenseNo",
        headerName: "License No",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "adharNo",
        headerName: "Aadhar No",
        width: 150,
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
        field: "createdAt",
        headerName: "Created",
        width: 120,
        type: "date",
        sortable: true,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <span>{new Date(params.value).toLocaleString()}</span>
        ),
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 120,
        type: "date",
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span>{new Date(params.value).toLocaleString()}</span>
        ),
      },
      {
        field: "updatedAt",
        headerName: "Inactive",
        width: 120,
        type: "date",
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span>{new Date(params.value).toLocaleString()}</span>
        ),
      },
    ],
    []
  );

  console.log(store, "state");
  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.DRIVERS, isActive: true, icon: FiUsers },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await driverServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load drivers method
  const loadDrivers = useCallback(
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
        const result = await driverServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setDrivers(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading drivers:", error);
        toast.error(error.message || "Failed to fetch drivers");
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
    loadDrivers();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformDriversData(summaryData, {
      totalIcon: React.createElement(FaUserTie),
      onLeaveIcon: React.createElement(FaUserSlash),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("drivers", {
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
      case "license-types":
        // You could apply filters to the table or navigate to filtered view
        console.log("Navigate to license types view");
        break;
      case "statuses":
        console.log("Navigate to status view");
        break;
      case "experience-levels":
        console.log("Navigate to experience levels view");
        break;
      case "total-drivers":
        console.log("Show all drivers");
        break;
      case "on-leave-drivers":
        // Apply on leave filter to current table
        console.log("Show drivers on leave");
        // You could call handleFilter here to filter the table
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
      loadDrivers(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadDrivers(
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
      loadDrivers(
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
      loadDrivers(searchValue, page, pageSize);
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
        loadDrivers(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadDrivers(searchValue, 1, size);
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
      const selectedDriver = drivers.find((driver) => driver.id === rowId);

      switch (action) {
        case "view":
          console.log("View driver:", selectedDriver);
          navigate(`${urls.driversViewPath}/${rowId}`, {
            state: { driverData: selectedDriver },
          });
          break;
        case "edit":
          navigate(`${urls.editDriverViewPath}/${rowId}`, {
            state: { driverData: selectedDriver },
          });
          break;
        case "delete":
          handleDeleteDriver(rowId);
          break;
      }
    },
    [drivers, navigate]
  );

  // Handle delete driver
  const handleDeleteDriver = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this driver?")) {
        try {
          setLoading(true);
          const result = await driverServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadDrivers();
        } catch (error: any) {
          console.error("Error inactivating driver:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadDrivers]
  );

  // Handle add driver
  const handleAddDriver = useCallback(() => {
    navigate(urls.addDriverViewPath);
  }, [navigate]);

  const handleExport = async (format: ExportFormat) => {
    try {
      await exportService.exportData(
        `${urls.driversViewPath}/export`,
        format,
        "drivers"
      );

      toast.success(`Drivers exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error("Export failed:", error.message);
      toast.error("Export failed. Please try again.");
    }
  };

  // Handle import
  const handleImport = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const result = await driverServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload drivers
        await loadDrivers();
      } catch (error: any) {
        console.error("Error importing drivers:", error);
        toast.error(error.message || "Failed to import drivers");
      } finally {
        setLoading(false);
      }
    },
    [loadDrivers]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await driverServices.getFilterOptions(field, searchText);
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
        // position:"fixed",
        height: "100%",
      }}
    >
      <ModuleHeader
        title={strings.DRIVERS}
        breadcrumbs={breadcrumbs}
        className="rounded-t-[24px]"
        style="px-4"
        titleClassName="module-title-custom"
      />
      {/* Pure CustomSummary Component */}
      <div
        className="mt-2 w-full px-4"
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
          rows={drivers}
          loading={loading}
          height={600}
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
          onAdd={handleAddDriver}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>
    </div>
  );
};

export default Drivers;