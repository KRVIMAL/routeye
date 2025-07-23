// src/modules/vehicles/pages/Vehicles.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiTruck } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { vehicleServices } from "./services/vehiclesServices";
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

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.VEHICLES);
  const [vehicles, setVehicles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "vehcileId", headerName: "Vehicle ID", width: 150 },
    { field: "brandName", headerName: "Brand Name", width: 150 },
    { field: "modelName", headerName: "Model Name", width: 150 },
    {
      field: "vehicleType",
      headerName: "Vehicle Type",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "car"
              ? "bg-blue-100 text-blue-800"
              : params.value === "truck"
              ? "bg-green-100 text-green-800"
              : params.value === "bike"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: "icon",
      headerName: "Icon",
      width: 100,
      renderCell: (params) => (
        <div className="flex items-center">
          {params.value ? (
            <img
              src={params.value}
              alt="Vehicle Icon"
              className="w-8 h-8 object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-icon.png"; // Fallback icon
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <FiTruck className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
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
    { label: strings.VEHICLES, isActive: true, icon: FiTruck },
  ];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await vehicleServices.search(search, page, limit)
        : await vehicleServices.getAll(page, limit);

      setVehicles(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading vehicles:", error);
      toast.error(error.message || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    navigate(urls.addVehicleViewPath);
  };

  // Handle edit click from DataTable
  const handleEditVehicle = (id: string | number) => {
    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === id);
    navigate(`${urls.editVehicleViewPath}/${id}`, {
      state: { vehicleData: selectedVehicle },
    });
  };

  const handleDeleteVehicle = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await vehicleServices.inactivate(id);
      toast.success(result.message);
      await loadVehicles(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating vehicle:", error);
      toast.error(error.message);
      // Revert the rows on error
      setVehicles(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadVehicles(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadVehicles(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadVehicles(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.VEHICLES}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_VEHICLE}
        onAddClick={handleAddVehicle}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={vehicles}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteVehicle}
          onEditClick={handleEditVehicle}
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
            modulePath: `${urls.vehiclesViewPath}/export`,
            filename: "vehicles",
          }}
        />
      </div>
    </div>
  );
};

export default Vehicles;
