import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { groupsMasterServices } from "./services/groupsMaster.services";
import urls from "../../../global/constants/UrlConstants";
import strings from "../../../global/constants/StringConstants";
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

const GroupsMaster: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.GROUPS_MASTER)
  const [groupsMaster, setGroupsMaster] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "groupId", headerName: "Group ID", width: 120 },
    { field: "groupName", headerName: "Group Name", width: 150 },
    {
      field: "groupType",
      headerName: "Group Type",
      width: 150,
      renderCell: (params) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {params.value}
        </span>
      ),
    },
    {
      field: "imeiDisplay",
      headerName: "Assets/IMEI",
      width: 200,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
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
    { field: "contactNo", headerName: "Contact No", width: 130 },
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
    { label: strings.GROUPS_MASTER, isActive: true, icon: FiUsers },
  ];

  useEffect(() => {
    loadGroupsMaster();
  }, []);

  const loadGroupsMaster = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await groupsMasterServices.search(search, page, limit)
        : await groupsMasterServices.getAll(page, limit);

      setGroupsMaster(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading groups master:", error);
      toast.error(error.message || "Failed to fetch groups master");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroupsMaster = () => {
    navigate(urls.addGroupsMasterViewPath);
  };

  // Handle edit click from DataTable
  const handleEditGroupsMaster = (id: string | number) => {
    const selectedGroupsMaster = groupsMaster.find(
      (groupMaster) => groupMaster.id === id
    );
    navigate(`${urls.editGroupsMasterViewPath}/${id}`, {
      state: { groupsMasterData: selectedGroupsMaster },
    });
  };

  const handleDeleteGroupsMaster = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await groupsMasterServices.inactivate(id);
      toast.success(result.message);
      await loadGroupsMaster(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating groups master:", error);
      toast.error(error.message);
      // Revert the rows on error
      setGroupsMaster(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    console.log({ searchText });
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadGroupsMaster(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadGroupsMaster(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadGroupsMaster(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.GROUPS_MASTER}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_GROUPS_MASTER}
        onAddClick={handleAddGroupsMaster}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={groupsMaster}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteGroupsMaster}
          onEditClick={handleEditGroupsMaster}
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
            modulePath: `${urls.groupMasterViewPath}/export`,
            filename: "groups-master",
          }}
        />
      </div>
    </div>
  );
};

export default GroupsMaster;
