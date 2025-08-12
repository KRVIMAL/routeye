// VehiclesPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiTruck } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { vehicleServices } from "./services/vehiclesServices";
import { transformVehiclesData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaTruck, FaWrench } from "react-icons/fa";
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
interface VehicleSummaryData {
  totalVehicles: number;
  vehicleTypes: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  brandNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.VEHICLES);

  // State management
  const [vehicles, setVehicles] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<VehicleSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("vehicles_filters");
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
      localStorage.setItem("vehicles_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("vehicles_filters");
    }
  }, [activeFilters]);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "vehcileId",
        headerName: "Vehicle ID",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "brandName",
        headerName: "Brand Name",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "modelName",
        headerName: "Model Name",
        width: 150,
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
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              params.value === "car"
                ? "bg-blue-100 text-blue-800"
                : params.value === "truck"
                ? "bg-green-100 text-green-800"
                : params.value === "bike"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {params.value?.toUpperCase()}
          </span>
        ),
      },
      {
        field: "icon",
        headerName: "Icon",
        width: 100,
        sortable: false,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <div className="flex items-center">
            {params.value ? (
              <img
                src={params.value}
                alt="Vehicle Icon"
                className="w-8 h-8 object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-icon.png"; // Fallback icon
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <FiTruck className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
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
    { label: strings.VEHICLES, isActive: true, icon: FiTruck },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await vehicleServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load vehicles method
  const loadVehicles = useCallback(
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
        const result = await vehicleServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setVehicles(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading vehicles:", error);
        toast.error(error.message || "Failed to fetch vehicles");
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
    loadVehicles();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformVehiclesData(summaryData, {
      totalIcon: React.createElement(FaTruck),
      maintenanceIcon: React.createElement(FaWrench),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("vehicles", {
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
      case "vehicle-types":
        // You could apply filters to the table or navigate to filtered view
        console.log("Navigate to vehicle types view");
        break;
      case "statuses":
        console.log("Navigate to status view");
        break;
      case "brand-names":
        console.log("Navigate to brands view");
        break;
      case "total-vehicles":
        console.log("Show all vehicles");
        break;
      case "maintenance-vehicles":
        // Apply maintenance filter to current table
        console.log("Show vehicles in maintenance");
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
      loadVehicles(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadVehicles(
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
      loadVehicles(
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
      loadVehicles(searchValue, page, pageSize);
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
        loadVehicles(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadVehicles(searchValue, 1, size);
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
      const selectedVehicle = vehicles.find((vehicle) => vehicle.id === rowId);

      switch (action) {
        case "view":
          console.log("View vehicle:", selectedVehicle);
          navigate(`${urls.vehiclesViewPath}/${rowId}`, {
            state: { vehicleData: selectedVehicle },
          });
          break;
        case "edit":
          navigate(`${urls.editVehicleViewPath}/${rowId}`, {
            state: { vehicleData: selectedVehicle },
          });
          break;
        case "delete":
          handleDeleteVehicle(rowId);
          break;
      }
    },
    [vehicles, navigate]
  );

  // Handle delete vehicle
  const handleDeleteVehicle = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this vehicle?")) {
        try {
          setLoading(true);
          const result = await vehicleServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadVehicles();
        } catch (error: any) {
          console.error("Error inactivating vehicle:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadVehicles]
  );

  // Handle add vehicle
  const handleAddVehicle = useCallback(() => {
    navigate(urls.addVehicleViewPath);
  }, [navigate]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await vehicleServices.export(activeFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vehicles_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Vehicles exported successfully");
    } catch (error: any) {
      console.error("Error exporting vehicles:", error);
      toast.error(error.message || "Failed to export vehicles");
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Handle import
  const handleImport = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const result = await vehicleServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload vehicles
        await loadVehicles();
      } catch (error: any) {
        console.error("Error importing vehicles:", error);
        toast.error(error.message || "Failed to import vehicles");
      } finally {
        setLoading(false);
      }
    },
    [loadVehicles]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await vehicleServices.getFilterOptions(field, searchText);
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
        title={strings.VEHICLES}
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
          rows={vehicles}
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
          onAdd={handleAddVehicle}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>
    </div>
  );
};

export default Vehicles;