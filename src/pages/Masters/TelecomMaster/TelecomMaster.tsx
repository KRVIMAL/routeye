import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPhone } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { telecomMasterServices } from "./services/telecomMaster.services";
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

const TelecomMaster: React.FC = () => {
  const navigate = useNavigate();
  const [telecomMasters, setTelecomMasters] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  tabTitle(strings.TELECOM_MASTER);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "ccidNumber", headerName: "CCID Number", width: 150 },
    { field: "imsiNumber", headerName: "IMSI Number", width: 150 },
    {
      field: "telecomOperator",
      headerName: "Telecom Operator",
      width: 140,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "Jio"
              ? "bg-blue-100 text-blue-800"
              : params.value === "Airtel"
              ? "bg-red-100 text-red-800"
              : params.value === "Vodafone"
              ? "bg-purple-100 text-purple-800"
              : params.value === "BSNL"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "simType",
      headerName: "SIM Type",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "prepaid"
              ? "bg-orange-100 text-orange-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.value?.charAt(0).toUpperCase() + params.value?.slice(1)}
        </span>
      ),
    },
    {
      field: "noOfNetwork",
      headerName: "No of Network",
      width: 120,
      type: "number",
    },
    { field: "mobileNo1", headerName: "Mobile No 1", width: 130 },
    { field: "mobileNo2", headerName: "Mobile No 2", width: 130 },
    {
      field: "networkSupport",
      headerName: "Network Support",
      width: 130,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "5G"
              ? "bg-purple-100 text-purple-800"
              : params.value === "LTE"
              ? "bg-blue-100 text-blue-800"
              : params.value === "GSM"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    { field: "apn1", headerName: "APN 1", width: 120 },
    { field: "apn2", headerName: "APN 2", width: 120 },
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
    { label: strings.TELECOM_MASTER, isActive: true, icon: FiPhone },
  ];

  useEffect(() => {
    loadTelecomMasters();
  }, []);

  const loadTelecomMasters = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await telecomMasterServices.search(search, page, limit)
        : await telecomMasterServices.getAll(page, limit);

      setTelecomMasters(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading telecom masters:", error);
      toast.error(error.message || "Failed to fetch telecom masters");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTelecomMaster = () => {
    navigate(urls.addTelecomMasterViewPath);
  };

  // Handle edit click from DataTable
  const handleEditTelecomMaster = (id: string | number) => {
    const selectedTelecomMaster = telecomMasters.find(
      (telecom) => telecom.id === id
    );
    navigate(`${urls.editTelecomMasterViewPath}/${id}`, {
      state: { telecomData: selectedTelecomMaster },
    });
  };

  const handleDeleteTelecomMaster = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await telecomMasterServices.inactivate(id);
      toast.success(result.message);
      await loadTelecomMasters(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating telecom master:", error);
      toast.error(error.message);
      // Revert the rows on error
      setTelecomMasters(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    console.log({ searchText });
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadTelecomMasters(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadTelecomMasters(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadTelecomMasters(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.TELECOM_MASTER}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_TELECOM_MASTER}
        onAddClick={handleAddTelecomMaster}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={telecomMasters}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteTelecomMaster}
          onEditClick={handleEditTelecomMaster}
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
            modulePath: `${urls.telecomMasterViewPath}/export`,
            filename: "telecom-master",
          }}
        />
      </div>
    </div>
  );
};

export default TelecomMaster;
