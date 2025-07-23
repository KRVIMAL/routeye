import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { alertServices } from "./services/alerts.services";
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

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  tabTitle(strings.ALERTS);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "deviceType", headerName: "Device Type", width: 120 },
    { field: "deviceModel", headerName: "Device Model", width: 130 },
    { field: "accountName", headerName: "Account Name", width: 150 },
    { field: "groupName", headerName: "Group Name", width: 130 },
    {
      field: "category",
      headerName: "Category",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "fuel"
              ? "bg-blue-100 text-blue-800"
              : params.value === "load"
              ? "bg-green-100 text-green-800"
              : params.value === "elock"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: "totalConfigs",
      headerName: "Total Configs",
      width: 120,
      type: "number",
    },
    {
      field: "activeConfigs",
      headerName: "Active Configs",
      width: 120,
      type: "number",
    },
    {
      field: "highPriorityConfigs",
      headerName: "High Priority",
      width: 120,
      type: "number",
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === true
              ? "bg-success-100 text-success-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value === true ? "Active" : "Inactive"}
        </span>
      ),
    },
    { field: "createdTime", headerName: "Created", width: 120, type: "date" },
    { field: "updatedTime", headerName: "Updated", width: 120, type: "date" },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.ALERTS, isActive: true, icon: FiAlertTriangle },
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await alertServices.search(search, page, limit)
        : await alertServices.getAll(page, limit);

      setAlerts(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading alerts:", error);
      toast.error(error.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = () => {
    navigate(urls.addAlertViewPath);
  };

  // Handle edit click from DataTable
  const handleEditAlert = (id: string | number) => {
    const selectedAlert = alerts.find((alert) => alert.id === id);
    navigate(`${urls.editAlertViewPath}/${id}`, {
      state: { alertData: selectedAlert },
    });
  };

  const handleDeleteAlert = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      // Note: Alerts don't have inactivate endpoint based on API,
      // so this would need to be implemented or use update to set isActive: false
      //   toast.info("Delete functionality not implemented yet");
    } catch (error: any) {
      console.error("Error deleting alert:", error);
      toast.error(error.message);
      // Revert the rows on error
      setAlerts(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    console.log({ searchText });
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadAlerts(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAlerts(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadAlerts(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.ALERTS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_ALERT}
        onAddClick={handleAddAlert}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={alerts}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteAlert}
          onEditClick={handleEditAlert}
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
            modulePath: urls.alertsViewPath,
            filename: "alerts",
          }}
        />
      </div>
    </div>
  );
};

export default Alerts;
