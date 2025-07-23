import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUser } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { userServices } from "./services/usersServices";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
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

const Users: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.USERS);
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "userId", headerName: "User ID", width: 120 },
    { field: "accountOrGroup", headerName: "Account/Group", width: 150 },
    { field: "username", headerName: "Username", width: 130 },
    { field: "firstName", headerName: "First Name", width: 120 },
    { field: "middleName", headerName: "Middle Name", width: 120 },
    { field: "lastName", headerName: "Last Name", width: 120 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "contactNo", headerName: "Contact No", width: 130 },
    {
      field: "userRole",
      headerName: "User Role",
      width: 130,
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
    { label: strings.USERS, isActive: true, icon: FiUser },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await userServices.search(search, page, limit)
        : await userServices.getAll(page, limit);

      setUsers(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    navigate(urls.addUserViewPath);
  };

  // Handle edit click from DataTable
  const handleEditUser = (id: string | number) => {
    const selectedUser = users.find((user) => user.id === id);
    navigate(`${urls.editUserViewPath}/${id}`, {
      state: { userData: selectedUser },
    });
  };

  const handleDeleteUser = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await userServices.inactivate(id);
      toast.success(result.message);
      await loadUsers(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating user:", error);
      toast.error(error.message);
      // Revert the rows on error
      setUsers(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadUsers(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadUsers(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.USERS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_USER}
        onAddClick={handleAddUser}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={users}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteUser}
          onEditClick={handleEditUser}
          pageSize={pageSize}
          pageSizeOptions={[10, 50, 100, 0]}
          // Server-side pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disableClientSidePagination={true}
          exportConfig={{
            modulePath: `${urls.usersViewPath}/export`,
            filename: "users",
          }}
        />
      </div>
    </div>
  );
};

export default Users;
