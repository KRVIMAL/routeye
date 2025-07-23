// src/modules/clients/pages/Clients.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import { clientServices } from "./services/clientsServices";
import strings from "../../../global/constants/StringConstants";
import urls from "../../../global/constants/UrlConstants";
import toast from "react-hot-toast";
import { tabTitle } from "../../../utils/tab-title";
import { store } from "../../../store";

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

const Clients: React.FC = () => {
  const navigate = useNavigate();
  tabTitle(strings.CLIENTS);
  const [clients, setClients] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "clientId", headerName: "Client Id", width: 120 },
    { field: "name", headerName: "Client Name", width: 150 },
    { field: "contactName", headerName: "Contact Name", width: 150 },
    { field: "email", headerName: "Email ID", width: 200 },
    { field: "contactNo", headerName: "Contact No", width: 130 },
    { field: "panNumber", headerName: "Pan Number", width: 120 },
    { field: "aadharNumber", headerName: "Aadhar Number", width: 130 },
    { field: "gstNumber", headerName: "GST Number", width: 130 },
    { field: "stateName", headerName: "State Name", width: 120 },
    { field: "cityName", headerName: "City Name", width: 120 },
    { field: "remark", headerName: "Remark", width: 150 },
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
    { label: strings.CLIENTS, isActive: true, icon: FiUsers },
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await clientServices.search(search, page, limit)
        : await clientServices.getAll(page, limit);

      setClients(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error(error.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    navigate(urls.addClientViewPath);
  };

  // Handle edit click from DataTable
  const handleEditClient = (id: string | number) => {
    const selectedClient = clients.find((client) => client.id === id);
    navigate(`${urls.editClientViewPath}/${id}`, {
      state: { clientData: selectedClient },
    });
  };

  const handleDeleteClient = async (
    id: string | number,
    deletedRow: Row,
    rows: Row[]
  ) => {
    try {
      const result = await clientServices.inactivate(id);
      toast.success(result.message);
      await loadClients(searchValue, currentPage, pageSize); // Reload current page
    } catch (error: any) {
      console.error("Error inactivating client:", error);
      toast.error(error.message);
      // Revert the rows on error
      setClients(rows);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadClients(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadClients(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadClients(searchValue, 1, size);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.CLIENTS}
        breadcrumbs={breadcrumbs}
        showAddButton
        addButtonText={strings.ADD_CLIENT}
        onAddClick={handleAddClient}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={clients}
          loading={loading}
          onSearch={handleSearch}
          onDeleteRow={handleDeleteClient}
          onEditClick={handleEditClient}
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
            modulePath: `${urls.clientsViewPath}/export`,
            filename: "clients",
          }}
        />
      </div>
    </div>
  );
};

export default Clients;
