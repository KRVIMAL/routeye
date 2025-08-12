// UsersPage.tsx - Complete Implementation
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUser } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import CustomTable from "../../../components/ui/CustomTable/CustomTable";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { userServices } from "./services/usersServices";
import { transformUsersData } from "../../../components/CustomSummary/utils/summaryDataTransformers";
import { FaUsers, FaUserShield, FaUserTimes } from "react-icons/fa";
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
interface UserSummaryData {
  totalUsers: number;
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
  groupNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  roleNames: Array<{
    count: number;
    value: string;
    label: string;
  }>;
  twoFAStatuses: Array<{
    count: number;
    value: string;
    label: string;
  }>;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.USERS);

  // State management
  const [users, setUsers] = useState<Row[]>([]);
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
  const [summaryData, setSummaryData] = useState<UserSummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load saved filters on mount (optional)
  useEffect(() => {
    const savedFilters = localStorage.getItem("users_filters");
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
      localStorage.setItem("users_filters", JSON.stringify(activeFilters));
    } else {
      localStorage.removeItem("users_filters");
    }
  }, [activeFilters]);

  // Column definitions
  const columns: Column[] = useMemo(
    () => [
      {
        field: "userId",
        headerName: "User ID",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "accountOrGroup",
        headerName: "Account/Group",
        width: 150,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "username",
        headerName: "Username",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "firstName",
        headerName: "First Name",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "middleName",
        headerName: "Middle Name",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "lastName",
        headerName: "Last Name",
        width: 120,
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
        field: "contactNo",
        headerName: "Contact No",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "userRole",
        headerName: "User Role",
        width: 130,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              params.value === "Superadmin"
                ? "bg-red-100 text-red-800"
                : params.value === "Admin"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {params.value || "User"}
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
    { label: strings.USERS, isActive: true, icon: FiUser },
  ];

  // Load summary data from API
  const loadSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await userServices.getFilterSummary();
      setSummaryData(data);
    } catch (error: any) {
      console.error("Error loading summary data:", error);
      setSummaryError(error.message || "Failed to load summary data");
      toast.error(error.message || "Failed to load summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Load users method
  const loadUsers = useCallback(
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
        const result = await userServices.getAll(
          page,
          limit,
          search,
          sortField,
          sortDirection,
          filters
        );

        setUsers(result.data);
        setTotalRows(result.total);
        setCurrentPage(result.page);
      } catch (error: any) {
        console.error("Error loading users:", error);
        toast.error(error.message || "Failed to fetch users");
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
    loadUsers();
  }, []);

  // Transform API data to summary cards
  const summaryCards = useMemo((): SummaryCard[] => {
    if (!summaryData) return [];

    return transformUsersData(summaryData, {
      totalIcon: React.createElement(FaUsers),
      inactiveIcon: React.createElement(FaUserTimes),
      adminIcon: React.createElement(FaUserShield),
    });
  }, [summaryData]);

  // Summary configuration
  const summaryConfig = useMemo(() => {
    return getConfigPreset("users", {
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
      case "user-statuses":
        console.log("Navigate to user statuses view");
        break;
      case "account-names":
        console.log("Navigate to accounts view");
        break;
      case "role-names":
        console.log("Navigate to roles view");
        break;
      case "two-fa-statuses":
        console.log("Navigate to 2FA view");
        break;
      case "total-users":
        console.log("Show all users");
        break;
      case "inactive-users":
        console.log("Show inactive users");
        break;
      case "admin-users":
        console.log("Show admin users");
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
      loadUsers(searchText, 1, pageSize);
    },
    [pageSize]
  );

  // Handle sorting (for server compatibility, but client-side sorting takes precedence)
  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      const newSortConfig = direction ? { field, direction } : null;
      setSortConfig(newSortConfig);
      loadUsers(
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
      loadUsers(
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
      loadUsers(searchValue, page, pageSize);
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
        loadUsers(searchValue, 1, 999999); // Large number to get all records
      } else {
        loadUsers(searchValue, 1, size);
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
      const selectedUser = users.find((user) => user.id === rowId);

      switch (action) {
        case "view":
          console.log("View user:", selectedUser);
          navigate(`${urls.usersViewPath}/${rowId}`, {
            state: { userData: selectedUser },
          });
          break;
        case "edit":
          navigate(`${urls.editUserViewPath}/${rowId}`, {
            state: { userData: selectedUser },
          });
          break;
        case "delete":
          handleDeleteUser(rowId);
          break;
      }
    },
    [users, navigate]
  );

  // Handle delete user
  const handleDeleteUser = useCallback(
    async (id: string | number) => {
      if (window.confirm("Are you sure you want to inactivate this user?")) {
        try {
          setLoading(true);
          const result = await userServices.inactivate(id);
          toast.success(result.message);
          // Reload current page
          await loadUsers();
        } catch (error: any) {
          console.error("Error inactivating user:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [loadUsers]
  );

  // Handle add user
  const handleAddUser = useCallback(() => {
    navigate(urls.addUserViewPath);
  }, [navigate]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await userServices.export(activeFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Users exported successfully");
    } catch (error: any) {
      console.error("Error exporting users:", error);
      toast.error(error.message || "Failed to export users");
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Handle import
  const handleImport = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const result = await userServices.import(file);

        if (result.errors && result.errors.length > 0) {
          toast.error(`Import completed with ${result.errors.length} errors`);
          console.warn("Import errors:", result.errors);
        } else {
          toast.success(result.message);
        }

        // Reload users
        await loadUsers();
      } catch (error: any) {
        console.error("Error importing users:", error);
        toast.error(error.message || "Failed to import users");
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  // Handle get filter options
  const handleGetFilterOptions = useCallback(
    async (field: string, searchText?: string): Promise<FilterOption[]> => {
      try {
        return await userServices.getFilterOptions(field, searchText);
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
        title={strings.USERS}
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
          rows={users}
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
          onAdd={handleAddUser}
          onGetFilterOptions={handleGetFilterOptions}
        />
      </div>
    </div>
  );
};

export default Users;