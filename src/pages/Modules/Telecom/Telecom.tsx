// TelecomPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPhone } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable, {
  ExportFormat,
} from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { transformTelecomsData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaPhone, FaSimCard } from "react-icons/fa";
import CustomSummary, {
  SummaryCard,
} from "../../../components/CustomSummary/CustomSummary";
import { getConfigPreset } from "../../../components/CustomSummary/utils/summaryConfigPresets";
import { store } from "../../../store";
import { telecomServices } from "./services/telecomServices";
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
interface TelecomSummaryData {
  totalTelecoms: number;
  simTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  billingTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  telecomOperators: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  networkProfile1Generations: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  networkProfile2Generations: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  numberOfNetworkProfiles: Array<{
    count: number;
    value: number;
    label: number;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const Telecom: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.TELECOM);

  // State management
  const [telecoms, setTelecoms] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<TelecomSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("telecoms_filters");
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
      localStorage.setItem("telecoms_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("telecoms_filters");
    }
  }, [activeFilters]);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "telecomId",
        headerName: "Telecom ID",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "telecomOperator",
        headerName: "Operator",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {params.value}
          </span>
        ),
      },
      {
        field: "simType",
        headerName: "SIM Type",
        width: 100,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              params.value === "esim"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {params.value?.toUpperCase()}
          </span>
        ),
      },
      {
        field: "numberOfNetworkProfiles",
        headerName: "Network Profiles",
        width: 130,
        type: "number",
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {params.value} Profile{params.value > 1 ? "s" : ""}
          </span>
        ),
      },
      {
        field: "networkProfile1",
        headerName: "Network Profile 1",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "networkProfile2",
        headerName: "Network Profile 2",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "networkProfile1Generation",
        headerName: "Profile 1 Gen",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
            {params.value?.toUpperCase()}
          </span>
        ),
      },
      {
        field: "networkProfile2Generation",
        headerName: "Profile 2 Gen",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
            {params.value?.toUpperCase()}
          </span>
        ),
      },
      {
        field: "networkProfile1APN",
        headerName: "Profile 1 APN",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "networkProfile2APN",
        headerName: "Profile 2 APN",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "billingType",
        headerName: "Billing Type",
        width: 100,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              params.value === "postpaid"
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {params.value?.charAt(0).toUpperCase() + params.value?.slice(1)}
          </span>
        ),
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
        headerName: "Created At",
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
        headerName: "Updated At",
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
    { label: strings.TELECOM, isActive: true, icon: FiPhone },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await telecomServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load telecoms method
  const loadTelecoms = useCallback(
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
        const result = await telecomServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setTelecoms(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading telecoms:", error);
        toast.error(error.message || "Failed to fetch telecoms");
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
    loadTelecoms();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformTelecomsData(summaryData, {
      totalIcon: React.createElement(FaPhone),
      inactiveIcon: React.createElement(FaSimCard),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("telecoms", {
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
      case "sim-types":
        console.log("Navigate to SIM types view");
        break;
      case "billing-types":
        console.log("Navigate to billing types view");
        break;
      case "telecom-operators":
        console.log("Navigate to operators view");
        break;
      case "network-generations":
        console.log("Navigate to network generations view");
        break;
      case "total-telecoms":
        console.log("Show all telecoms");
        break;
      case "inactive-telecoms":
        console.log("Show inactive telecoms");
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
      loadTelecoms(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadTelecoms(
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
      loadTelecoms(
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
      loadTelecoms(searchValue, page, pageSize);
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
        loadTelecoms(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadTelecoms(searchValue, 1, size);
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
      const selectedTelecom = telecoms.find((telecom) => telecom.id === rowId);

      switch (action) {
        case "view":
          console.log("View telecom:", selectedTelecom);
          navigate(`${urls.telecomViewPath}/${rowId}`, {
            state: { telecomData: selectedTelecom },
          });
          break;
        case "edit":
          navigate(`${urls.editTelecomViewPath}/${rowId}`, {
            state: { telecomData: selectedTelecom },
          });
          break;
        case "delete":
          handleDeleteTelecom(rowId);
          break;
      }
    },
    [telecoms, navigate]
  );

  // Handle delete telecom
  const handleDeleteTelecom = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this telecom?")) {
        try {
          setLoading(true);
          const result = await telecomServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadTelecoms();
        } catch (error: any) {
          console.error("Error inactivating telecom:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadTelecoms]
  );

  // Handle add telecom
  const handleAddTelecom = useCallback(() => {
    navigate(urls.addTelecomViewPath);
  }, [navigate]);

  // Handle export

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    try {
      await exportService.exportData(
        `${urls.vehicleMastersViewPath}/export`,
        format,
        "vehicle-masters"
      );

      toast.success(
        `Vehicle Master exported successfully as ${format.toUpperCase()}`
      );
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
        const result = await telecomServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload telecoms
        await loadTelecoms();
      } catch (error: any) {
        console.error("Error importing telecoms:", error);
        toast.error(error.message || "Failed to import telecoms");
      } finally {
        setLoading(false);
      }
    },
    [loadTelecoms]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await telecomServices.getFilterOptions(field, searchText);
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
        title={strings.TELECOM}
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
          rows={telecoms}
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
          onAdd={handleAddTelecom}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>
    </div>
  );
};

export default Telecom;
