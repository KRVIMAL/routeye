import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import {
  Column,
  Row,
  FilterCondition,
} from "../../../components/ui/DataTable/types";
import { driverServices } from "./services/driversService";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Drivers: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  tabTitle(strings.DRIVERS);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    {
      field: "driverId",
      headerName: "Driver ID",
      width: 150,
      filterable: true,
    },
    { field: "name", headerName: "Driver Name", width: 150, filterable: true },
    {
      field: "contactNo",
      headerName: "Contact No",
      width: 130,
      filterable: true,
    },
    { field: "email", headerName: "Email", width: 200, filterable: true },
    {
      field: "licenseNo",
      headerName: "License No",
      width: 130,
      filterable: true,
    },
    { field: "adharNo", headerName: "Aadhar No", width: 150, filterable: true },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      filterable: true,
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
    {
      field: "createdTime",
      headerName: "Created",
      width: 120,
      type: "date",
      filterable: true,
    },
    {
      field: "updatedTime",
      headerName: "Updated",
      width: 120,
      type: "date",
      filterable: true,
    },
    {
      field: "inactiveTime",
      headerName: "Inactive Time",
      width: 120,
      type: "date",
      filterable: true,
    },
  ];

  const breadcrumbs = [
    { label: strings.HOME, href: "/", icon: FiHome },
    { label: strings.DRIVERS, isActive: true, icon: FiUsers },
  ];

  useEffect(() => {
    loadDrivers();
  }, [searchValue, filters, pageSize]);

  const loadDrivers = async (
    search: string = searchValue,
    page: number = currentPage,
    limit: number = pageSize,
    appliedFilters: FilterCondition[] = filters
  ) => {
    setLoading(true);
    try {
      // Transform filters to server format
      const serverFilters = appliedFilters.map((filter) => ({
        field: filter.field || filter.column,
        operator: filter.operator,
        value: filter.value,
      }));

      const result: PaginatedResponse<Row> = await driverServices.getAll(
        page,
        limit,
        search || undefined,
        serverFilters.length > 0 ? serverFilters : undefined
      );

      setDrivers(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading drivers:", error);
      toast.error(error.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    navigate(urls.addDriverViewPath);
  };

  // Handle edit click from DataTable
  const handleEditDriver = (id: string | number) => {
    const selectedDriver = drivers.find((driver) => driver.id === id);
    navigate(`${urls.editDriverViewPath}/${id}`, {
      state: { driverData: selectedDriver },
    });
  };

  const handleDeleteDriver = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await driverServices.inactivate(id);
      toast.success(result.message);
      await loadDrivers(); // Reload current page with current filters
    } catch (error: any) {
      console.error("Error inactivating driver:", error);
      toast.error(error.message);
      // Revert the rows on error
      setDrivers(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    // loadDrivers(searchText, 1, pageSize, filters);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // loadDrivers(searchValue, page, pageSize, filters);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    // loadDrivers(searchValue, 1, size, filters);
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    console.log({ newFilters });
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    // await loadDrivers(searchValue, 1, pageSize, newFilters);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.DRIVERS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_DRIVER}
        onAddClick={handleAddDriver}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={drivers}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteDriver}
          onEditClick={handleEditDriver}
          pageSize={pageSize}
          pageSizeOptions={[10, 50, 100, 0]}
          // Server-side pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disableClientSidePagination={true}
          // Server-side filtering props
          onFiltersChange={handleFiltersChange}
          serverSideFiltering={true}
          exportConfig={{
            modulePath: `${urls.driversViewPath}/export`,
            filename: "drivers",
          }}
        />
      </div>
    </div>
  );
};

export default Drivers;
