// RolesPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiShield, FiEye } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable, {
  ExportFormat,
} from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { roleServices } from "./services/rolesServices";
import { transformRolesData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaUserShield } from "react-icons/fa";
import CustomSummary, {
  SummaryCard,
} from "../../../components/CustomSummary/CustomSummary";
import { getConfigPreset } from "../../../components/CustomSummary/utils/summaryConfigPresets";
import { store } from "../../../store";
import PermissionsModal from "../../../components/ui/Modal/PermissionsModal";
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
interface RoleSummaryData {
  totalRoles: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  modules: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  permissions: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  isSystemValues: Array<{
    count: number;
    value: boolean;
    label: string;
  }>;
}

const Roles: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.ROLES);

  // State management
  const [roles, setRoles] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<RoleSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Permissions modal state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<any>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("roles_filters");
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
      localStorage.setItem("roles_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("roles_filters");
    }
  }, [activeFilters]);

  // Handle view permissions
  const handleViewPermissions = useCallback((roleData: any) => {
    setSelectedRoleForModal(roleData);
    setIsPermissionsModalOpen(true);
  }, []);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "roleId",
        headerName: "Role ID",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "name",
        headerName: "Role Name",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "displayName",
        headerName: "Display Name",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "description",
        headerName: "Description",
        width: 200,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <div className="truncate" title={params.value}>
            {params.value}
          </div>
        ),
      },
      {
        field: "modulesList",
        headerName: "Modules",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <div className="flex items-center space-x-2 w-full">
            <div className="truncate flex-1 min-w-0" title={params.value}>
              {params.value}
            </div>
            {/* <button
              onClick={() => handleViewPermissions(params.row)}
              className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
              title="View Permissions"
            >
              <FiEye className="w-4 h-4" />
            </button> */}
          </div>
        ),
      },
      {
        field: "permissionsList",
        headerName: "Permissions",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <div className="flex items-center space-x-2 w-full">
            <div
              className="truncate flex-1 min-w-0 text-xs"
              title={params.value}
            >
              {params.value}
            </div>
            {/* <button
              onClick={() => handleViewPermissions(params.row)}
              className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
              title="View Permissions"
            >
              <FiEye className="w-4 h-4" />
            </button> */}
          </div>
        ),
      },
      {
        field: "isSystem",
        headerName: "System Role",
        width: 100,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              params.value
                ? "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {params.value ? "System" : "Custom"}
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
    [handleViewPermissions]
  );

  console.log(store, "state");
  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.ROLES, isActive: true, icon: FiShield },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await roleServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load roles method
  const loadRoles = useCallback(
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
        const result = await roleServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setRoles(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading roles:", error);
        toast.error(error.message || "Failed to fetch roles");
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
    loadRoles();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformRolesData(summaryData, {
      totalIcon: React.createElement(FaUserShield),
      inactiveIcon: React.createElement(FaUserShield),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("roles", {
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
      case "role-statuses":
        // You could apply filters to the table or navigate to filtered view
        console.log("Navigate to role statuses view");
        break;
      case "role-modules":
        console.log("Navigate to modules view");
        break;
      case "role-permissions":
        console.log("Navigate to permissions view");
        break;
      case "total-roles":
        console.log("Show all roles");
        break;
      case "inactive-roles":
        // Apply inactive filter to current table
        console.log("Show inactive roles");
        // You could call handleFilter here to filter the table
        break;
      case "system-roles":
        console.log("Show system roles");
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
      loadRoles(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadRoles(
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
      loadRoles(
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
      loadRoles(searchValue, page, pageSize);
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
        loadRoles(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadRoles(searchValue, 1, size);
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
      const selectedRole = roles.find((role) => role.id === rowId);

      switch (action) {
        case "view":
          console.log("View role:", selectedRole);
          handleViewPermissions(selectedRole);
          break;
        case "edit":
          navigate(`${urls.editRoleViewPath}/${rowId}`, {
            state: { roleData: selectedRole },
          });
          break;
        case "delete":
          handleDeleteRole(rowId);
          break;
      }
    },
    [roles, navigate, handleViewPermissions]
  );

  // Handle delete role
  const handleDeleteRole = useCallback(
    async (id: string | number) => {
      const roleToDelete = roles.find((role) => role.id === id);

      // Check if it's a system role
      if (roleToDelete?.isSystem) {
        toast.error("Cannot delete system roles");
        return;
      }

      if (window.confirm("Are you sure you want to inactivate this role?")) {
        try {
          setLoading(true);
          const result = await roleServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadRoles();
        } catch (error: any) {
          console.error("Error inactivating role:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadRoles, roles]
  );

  // Handle add role
  const handleAddRole = useCallback(() => {
    navigate(urls.addRoleViewPath);
  }, [navigate]);

  // Handle export

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    try {
      await exportService.exportData(
        `${urls.rolesViewPath}/export`,
        format,
        "roles"
      );

      toast.success(`Roles exported successfully as ${format.toUpperCase()}`);
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
        const result = await roleServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload roles
        await loadRoles();
      } catch (error: any) {
        console.error("Error importing roles:", error);
        toast.error(error.message || "Failed to import roles");
      } finally {
        setLoading(false);
      }
    },
    [loadRoles]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await roleServices.getFilterOptions(field, searchText);
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
        title={strings.ROLES}
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
          rows={roles}
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
          onAdd={handleAddRole}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>

      {/* Permissions Modal */}
      {selectedRoleForModal && (
        <PermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => {
            setIsPermissionsModalOpen(false);
            setSelectedRoleForModal(null);
          }}
          roleData={selectedRoleForModal}
        />
      )}
    </div>
  );
};

export default Roles;
