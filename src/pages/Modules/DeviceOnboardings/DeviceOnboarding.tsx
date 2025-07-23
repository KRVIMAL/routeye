import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiSmartphone } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { deviceOnboardingServices } from "./services/deviceOnboardingsServices";
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

const DeviceOnboarding: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.DEVICE_ONBOARDING);
  const [devices, setDevices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "accountName", headerName: "Account Name", width: 150 },
    { field: "deviceIMEI", headerName: "Device IMEI", width: 150 },
    { field: "deviceSerialNo", headerName: "Device Serial No", width: 150 },
    { field: "deviceModelName", headerName: "Device Model", width: 130 },
    {
      field: "deviceType",
      headerName: "Device Type",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "car"
              ? "bg-blue-100 text-blue-800"
              : params.value === "truck"
              ? "bg-green-100 text-green-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {params.value?.toUpperCase() || "N/A"}
        </span>
      ),
    },
    // { field: "simNo1", headerName: "SIM No 1", width: 120 },
    // { field: "simNo2", headerName: "SIM No 2", width: 120 },
    // { field: "simNo1Operator", headerName: "SIM 1 Operator", width: 130 },
    // { field: "simNo2Operator", headerName: "SIM 2 Operator", width: 130 },
    { field: "vehicleNo", headerName: "Vehicle No", width: 130 },
    { field: "vehicleType", headerName: "Vehicle Type", width: 120 },
    { field: "vehicleDescription", headerName: "Description", width: 150 },
    { field: "driverName", headerName: "Driver Name", width: 130 },
    { field: "driverNo", headerName: "Driver No", width: 130 },
    { field: "telecomMaster1", headerName: "Mobile No 1", width: 130 },
    { field: "telecomMaster2", headerName: "Mobile No 2", width: 130 },

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
    { label: strings.DEVICE_ONBOARDING, isActive: true, icon: FiSmartphone },
  ];

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await deviceOnboardingServices.search(search, page, limit)
        : await deviceOnboardingServices.getAll(page, limit);

      setDevices(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading devices:", error);
      toast.error(error.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    navigate(urls.addDeviceOnboardingViewPath);
  };

  // Handle edit click from DataTable
  const handleEditDevice = (id: string | number) => {
    const selectedDevice = devices.find((device) => device.id === id);
    navigate(`${urls.editDeviceOnboardingViewPath}/${id}`, {
      state: { deviceData: selectedDevice },
    });
  };

  const handleDeleteDevice = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await deviceOnboardingServices.inactivate(id);
      toast.success(result.message);
      await loadDevices(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating device:", error);
      toast.error(error.message);
      // Revert the rows on error
      setDevices(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadDevices(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDevices(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadDevices(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.DEVICE_ONBOARDING}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_DEVICE_ONBOARDING}
        onAddClick={handleAddDevice}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={devices}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteDevice}
          onEditClick={handleEditDevice}
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
            modulePath: `${urls.deviceOnboardingViewPath}/export`,
            filename: "device-onboarding",
          }}
        />
      </div>
    </div>
  );
};

export default DeviceOnboarding;
