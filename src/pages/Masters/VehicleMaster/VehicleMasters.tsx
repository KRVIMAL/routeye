import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiTruck } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { vehicleMasterServices } from "./services/vehicleMasters";
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

const VehicleMasters: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleMasters, setVehicleMasters] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  tabTitle(strings.VEHICLE_MASTERS);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "vehcileMasterId", headerName: "Vehicle Master ID", width: 140 },
    { field: "vehicleNumber", headerName: "Vehicle Number", width: 140 },
    { field: "chassisNumber", headerName: "Chassis Number", width: 180 },
    { field: "engineNumber", headerName: "Engine Number", width: 180 },
    { field: "vehicleModelName", headerName: "Vehicle Model", width: 150 },
    { field: "driverName", headerName: "Driver Name", width: 140 },
    { field: "driverAdharNo", headerName: "Driver Aadhar", width: 150 },
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
    { label: strings.VEHICLE_MASTERS, isActive: true, icon: FiTruck },
  ];

  useEffect(() => {
    loadVehicleMasters();
  }, []);

  const loadVehicleMasters = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await vehicleMasterServices.search(search, page, limit)
        : await vehicleMasterServices.getAll(page, limit);

      setVehicleMasters(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading vehicle masters:", error);
      toast.error(error.message || "Failed to fetch vehicle masters");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicleMaster = () => {
    navigate(urls.addVehicleMasterViewPath);
  };

  // Handle edit click from DataTable
  const handleEditVehicleMaster = (id: string | number) => {
    const selectedVehicleMaster = vehicleMasters.find(
      (vehicleMaster) => vehicleMaster.id === id
    );
    navigate(`${urls.editVehicleMasterViewPath}/${id}`, {
      state: { vehicleMasterData: selectedVehicleMaster },
    });
  };

  const handleDeleteVehicleMaster = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await vehicleMasterServices.inactivate(id);
      toast.success(result.message);
      await loadVehicleMasters(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating vehicle master:", error);
      toast.error(error.message);
      // Revert the rows on error
      setVehicleMasters(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadVehicleMasters(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadVehicleMasters(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadVehicleMasters(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.VEHICLE_MASTERS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_VEHICLE_MASTER}
        onAddClick={handleAddVehicleMaster}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={vehicleMasters}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteVehicleMaster}
          onEditClick={handleEditVehicleMaster}
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
            modulePath: `${urls.vehicleMastersViewPath}/export`,
            filename: "vehicle-masters",
          }}
        />
      </div>
    </div>
  );
};

export default VehicleMasters;
