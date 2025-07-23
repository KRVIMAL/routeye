import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiHome, FiUsers } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { accountServices } from "./services/accountsServices";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import AccountHierarchyModal from "../../../components/ui/Modal/AccountHierarchyModal";
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

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.ACCOUNTS);
  const [accounts, setAccounts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [totalRows, setTotalRows] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);

  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [selectedAccountForHierarchy, setSelectedAccountForHierarchy] =
    useState<any>(null);

  const [allAccounts, setAllAccounts] = useState<Row[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Row[]>([]);

  const columns: Column[] = [
    { field: "accountId", headerName: "Account ID", width: 120 },
    {
      field: "parentAccountName",
      headerName: "Parent Account",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 w-full">
          <div className="truncate flex-1 min-w-0" title={params.value}>
            {params.value}
          </div>
          <button
            onClick={() => handleViewHierarchy(params.row)}
            className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
            title="View Hierarchy"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    { field: "accountName", headerName: "Account Name", width: 150 },
    { field: "contactName", headerName: "Contact Name", width: 130 },
    { field: "email", headerName: "Email Id", width: 180 },
    { field: "contactNo", headerName: "Contact No", width: 130 },
    { field: "panNumber", headerName: "Pan Number", width: 130 },
    { field: "aadharNumber", headerName: "Aadhar Number", width: 150 },
    { field: "gstNumber", headerName: "GST Number", width: 150 },
    { field: "stateName", headerName: "State Name", width: 130 },
    { field: "cityName", headerName: "City Name", width: 130 },
    {
      field: "remark",
      headerName: "Remark",
      width: 150,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "totalDevices",
      headerName: "Total Devices",
      width: 120,
      type: "number",
      align: "center",
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "active"
              ? "bg-success-100 text-success-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    { field: "createdTime", headerName: "Created", width: 120, type: "date" },
    { field: "updatedTime", headerName: "Updated", width: 120, type: "date" },
    {
      field: "inactiveTime",
      headerName: "Inactive Time",
      width: 120,
      type: "date",
    },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.ACCOUNTS, isActive: true, icon: FiUsers },
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const result = await accountServices.getAll();
      // setAccounts(result);
      setAllAccounts(result);
      setFilteredAccounts(result);
    } catch (error: any) {
      console.error("Error loading accounts:", error);
      toast.error(error.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);

    if (!searchText.trim()) {
      setFilteredAccounts(allAccounts);
    } else {
      const filtered = allAccounts.filter((account) =>
        Object.values(account).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredAccounts(filtered);
    }
  };

  const handleAddAccount = () => {
    navigate(urls.addAccountViewPath);
  };

  // Handle edit click from DataTable
  const handleEditAccount = (id: string | number) => {
    const selectedAccount = accounts.find((account) => account.id === id);
    navigate(`${urls.editAccountViewPath}/${id}`, {
      state: { accountData: selectedAccount },
    });
  };

  const handleDeleteAccount = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await accountServices.inactivate(id);
      toast.success(result.message);
      // await loadAccounts(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating account:", error);
      toast.error(error.message);
      // Revert the rows on error
      setAccounts(rows);
    }
  };

  // const handleSearch = (searchText: string) => {
  //
  //   setSearchValue(searchText);
  //   setCurrentPage(1); // Reset to first page on search
  //   loadAccounts(searchText, 1, pageSize);
  // };

  // Pagination handlers
  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  //   loadAccounts(searchValue, page, pageSize);
  // };

  // const handlePageSizeChange = (size: number) => {
  //   setPageSize(size);
  //   setCurrentPage(1); // Reset to first page
  //   loadAccounts(searchValue, 1, size);
  // };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.ACCOUNTS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_ACCOUNT}
        onAddClick={handleAddAccount}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={filteredAccounts} // Use filtered accounts
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteAccount}
          onEditClick={handleEditAccount}
          // Remove pagination props since we're using static data
          exportConfig={{
            modulePath: `${urls.accountsViewPath}/export`,
            filename: "accounts",
          }}
        />
      </div>
      {selectedAccountForHierarchy && (
        <AccountHierarchyModal
          isOpen={isHierarchyModalOpen}
          onClose={() => {
            setIsHierarchyModalOpen(false);
            setSelectedAccountForHierarchy(null);
          }}
          hierarchyData={selectedAccountForHierarchy}
        />
      )}
    </div>
  );
};

export default Accounts;
