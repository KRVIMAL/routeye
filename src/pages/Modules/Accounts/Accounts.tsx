// AccountsPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiEye } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable, { ExportFormat } from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { accountServices } from "./services/accountsServices";
import { transformAccountsData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaBuilding, FaUserTie } from "react-icons/fa";
import CustomSummary, {
  SummaryCard,
} from "../../../components/CustomSummary/CustomSummary";
import { getConfigPreset } from "../../../components/CustomSummary/utils/summaryConfigPresets";
import { store } from "../../../store";
import AccountHierarchyModal from "../../../components/ui/Modal/AccountHierarchyModal";
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
interface AccountSummaryData {
  totalAccounts: number;
  statuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  levels: Array<{
    count: number;
    value: number;
    label: number;
  }>;
  accountNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.ACCOUNTS);

  // State management
  const [accounts, setAccounts] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<AccountSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Hierarchy modal state
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [selectedAccountForHierarchy, setSelectedAccountForHierarchy] =
    useState<any>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("accounts_filters");
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
      localStorage.setItem("accounts_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("accounts_filters");
    }
  }, [activeFilters]);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "accountId",
        headerName: "Account ID",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "parentAccountName",
        headerName: "Parent Account",
        width: 150,
        sortable: true,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <div className="flex items-center space-x-2 w-full">
            <div className="truncate flex-1 min-w-0" title={params.value}>
              {params.value}
            </div>
            {/* <button
              onClick={() => handleViewHierarchy(params.row)}
              className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
              title="View Hierarchy"
            >
              <FiEye className="w-4 h-4" />
            </button> */}
          </div>
        ),
      },
      {
        field: "accountName",
        headerName: "Account Name",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "level",
        headerName: "Level",
        width: 80,
        type: "number",
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
            L{params.value}
          </span>
        ),
      },
      {
        field: "hierarchyPath",
        headerName: "Hierarchy Path",
        width: 120,
        sortable: true,
        filterable: false,
        resizable: true,
      },
      {
        field: "contactName",
        headerName: "Contact Name",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "email",
        headerName: "Email ID",
        width: 180,
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
        field: "stateName",
        headerName: "State Name",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "cityName",
        headerName: "City Name",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "childrenCount",
        headerName: "Sub Accounts",
        width: 120,
        type: "number",
        sortable: true,
        filterable: false,
        resizable: true,
        renderCell: (params) => (
          <span className="text-center text-sm font-medium">
            {params.value || 0}
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
    { label: strings.ACCOUNTS, isActive: true, icon: FiUsers },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await accountServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load accounts method - handles different API endpoints based on operation type
  const loadAccounts = useCallback(
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
        let result: any;

        // Determine which API to use based on operation type
        if (search && search.trim()) {
          // Use search API
          result = await accountServices.search(search.trim(), page, limit);
        } else if (filters && filters.length > 0) {
          // Use filter API
          result = await accountServices.filter(
            page,
            limit,
            sortField,
            sortDirection,
            filters
          );
        } else {
          // Use hierarchy-optimized API (default)
          result = await accountServices.getAll(page, limit);
        }

        setAccounts(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading accounts:", error);
        toast.error(error.message || "Failed to fetch accounts");
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
    loadAccounts();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformAccountsData(summaryData, {
      totalIcon: React.createElement(FaBuilding),
      inactiveIcon: React.createElement(FaUserTie),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("accounts", {
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
      case "account-statuses":
        console.log("Navigate to account statuses view");
        break;
      case "account-levels":
        console.log("Navigate to levels view");
        break;
      case "account-names":
        console.log("Navigate to account names view");
        break;
      case "total-accounts":
        console.log("Show all accounts");
        break;
      case "inactive-accounts":
        console.log("Show inactive accounts");
        break;
      default:
        break;
    }
  }, []);

  // Handle view hierarchy
  const handleViewHierarchy = async (accountData: any) => {
    try {
      // Fetch full hierarchy for the selected account
      const hierarchyData = await accountServices.getAccountHierarchy();
      setSelectedAccountForHierarchy(hierarchyData);
      setIsHierarchyModalOpen(true);
    } catch (error: any) {
      toast.error("Failed to load account hierarchy");
    }
  };

  // Handle search with pagination reset and clear filters
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);
      setCurrentPage(1);
      // Clear filters when searching since search and filter are separate operations
      setActiveFilters([]);
      loadAccounts(searchText, 1, pageSize, undefined, undefined, []);
    },
    [pageSize]
  );

  // Handle sorting - works with current operation type (search, filter, or default)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);

      // Maintain current operation type (search vs filter vs default)
      if (searchValue && searchValue.trim()) {
        // Currently in search mode - sorting not supported for search API
        toast(
          "Sorting is not available during search. Please clear search to use sorting."
        );
        return;
      } else if (activeFilters.length > 0) {
        // Currently in filter mode
        loadAccounts(
          "",
          currentPage,
          pageSize,
          field,
          direction || undefined,
          activeFilters
        );
      } else {
        // Default mode - hierarchy API doesn't support sorting
        toast("Sorting is not available for the default view.");
        return;
      }
    },
    [searchValue, currentPage, pageSize, activeFilters]
  );

  // Handle filtering with pagination reset and clear search
  const handleFilter = useCallback(
    (filters: Filter[]) => {
      setActiveFilters(filters);
      setCurrentPage(1);
      // Clear search when filtering since search and filter are separate operations
      setSearchValue("");
      loadAccounts(
        "",
        1,
        pageSize,
        sortConfig?.field,
        sortConfig?.direction,
        filters
      );
    },
    [pageSize, sortConfig]
  );

  // Handle pagination page change - maintains current operation type
  const handlePageChange = useCallback(
    (page: number) => {
      // Don't change pages when showing "All"
      if (pageSize === 0) return;

      setCurrentPage(page);
      // Maintain current operation type (search vs filter vs default)
      loadAccounts(
        searchValue,
        page,
        pageSize,
        sortConfig?.field,
        sortConfig?.direction,
        activeFilters
      );
    },
    [searchValue, pageSize, sortConfig, activeFilters]
  );

  // Handle pagination page size change - maintains current operation type
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);

      if (size === 0) {
        // Handle "All" option - load all data
        loadAccounts(
          searchValue,
          1,
          999999,
          sortConfig?.field,
          sortConfig?.direction,
          activeFilters
        );
      } else {
        loadAccounts(
          searchValue,
          1,
          size,
          sortConfig?.field,
          sortConfig?.direction,
          activeFilters
        );
      }
    },
    [searchValue, sortConfig, activeFilters]
  );

  // Handle row selection
  const handleRowSelect = useCallback((selectedRowIds: (string | number)[]) => {
    setSelectedRows(selectedRowIds);
    console.log("Selected rows:", selectedRowIds);
  }, []);

  // Handle row actions
  const handleRowAction = useCallback(
    (action: "view" | "edit" | "delete", rowId: string | number) => {
      const selectedAccount = accounts.find((account) => account.id === rowId);

      switch (action) {
        case "view":
          console.log("View account:", selectedAccount);
          navigate(`${urls.accountsViewPath}/${rowId}`, {
            state: { accountData: selectedAccount },
          });
          break;
        case "edit":
          navigate(`${urls.editAccountViewPath}/${rowId}`, {
            state: { accountData: selectedAccount },
          });
          break;
        case "delete":
          handleDeleteAccount(rowId);
          break;
      }
    },
    [accounts, navigate]
  );

  // Handle delete account
  const handleDeleteAccount = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this account?")) {
        try {
          setLoading(true);
          const result = await accountServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadAccounts();
        } catch (error: any) {
          console.error("Error inactivating account:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadAccounts]
  );

  // Handle add account
  const handleAddAccount = useCallback(() => {
    navigate(urls.addAccountViewPath);
  }, [navigate]);

  // Handle add client
  const handleAddClient = useCallback(() => {
    navigate(urls.addClientViewPath);
  }, [navigate]);

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    try {
      await exportService.exportData(
        `${urls.accountsViewPath}/export`,
        format,
        "accounts"
      );

      toast.success(`Accounts exported successfully as ${format.toUpperCase()}`);
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
        const result = await accountServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload accounts
        await loadAccounts();
      } catch (error: any) {
        console.error("Error importing accounts:", error);
        toast.error(error.message || "Failed to import accounts");
      } finally {
        setLoading(false);
      }
    },
    [loadAccounts]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await accountServices.getFilterOptions(field, searchText);
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
        title={strings.ACCOUNTS}
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
          rows={accounts}
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
          onAdd={handleAddAccount}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>

      {/* Hierarchy Modal */}
      {/* {selectedAccountForHierarchy && (
        <AccountHierarchyModal
          isOpen={isHierarchyModalOpen}
          onClose={() => {
            setIsHierarchyModalOpen(false);
            setSelectedAccountForHierarchy(null);
          }}
          hierarchyData={selectedAccountForHierarchy}
        />
      )} */}
    </div>
  );
};

export default Accounts;
