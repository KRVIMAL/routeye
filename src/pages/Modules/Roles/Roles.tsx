import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiHome, FiShield } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { roleServices } from "./services/rolesServices";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import PermissionsModal from "../../../components/ui/Modal/PermissionsModal";

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

const Roles: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.ROLES);
  const [roles, setRoles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "roleId", headerName: "Role Id", width: 120 },
    { field: "name", headerName: "Role Name", width: 120 },
    { field: "displayName", headerName: "Display Name", width: 150 },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    // Update the columns in Roles.tsx
    {
      field: "modulesList",
      headerName: "Modules",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 w-full">
          <div className="truncate flex-1 min-w-0" title={params.value}>
            {params.value}
          </div>
          <button
            onClick={() => handleViewPermissions(params.row)}
            className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
            title="View Permissions"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      field: "permissionsList",
      headerName: "Permissions",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 w-full">
          <div className="truncate flex-1 min-w-0 text-xs" title={params.value}>
            {params.value}
          </div>
          <button
            onClick={() => handleViewPermissions(params.row)}
            className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
            title="View Permissions"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      field: "isSystem",
      headerName: "System Role",
      width: 100,
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
    { label: strings.ROLES, isActive: true, icon: FiShield },
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await roleServices.search(search, page, limit)
        : await roleServices.getAll(page, limit);

      setRoles(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading roles:", error);
      toast.error(error.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPermissions = (roleData: any) => {
    setSelectedRoleForModal(roleData);
    setIsPermissionsModalOpen(true);
  };

  const handleAddRole = () => {
    navigate(urls.addRoleViewPath);
  };

  // Handle edit click from DataTable
  const handleEditRole = (id: string | number) => {
    const selectedRole = roles.find((role) => role.id === id);
    navigate(`${urls.editRoleViewPath}/${id}`, {
      state: { roleData: selectedRole },
    });
  };

  const handleDeleteRole = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      // Check if it's a system role
      if (deletedRow.isSystem) {
        toast.error("Cannot delete system roles");
        return;
      }

      const result = await roleServices.inactivate(id);
      toast.success(result.message);
      await loadRoles(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating role:", error);
      toast.error(error.message);
      // Revert the rows on error
      setRoles(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadRoles(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRoles(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadRoles(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.ROLES}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_ROLE}
        onAddClick={handleAddRole}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={roles}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteRole}
          onEditClick={handleEditRole}
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
            modulePath: `${urls.rolesViewPath}/export`,
            filename: "roles",
          }}
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
