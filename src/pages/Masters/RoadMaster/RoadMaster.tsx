import React, { useState, useEffect } from "react";
import { FiHome, FiMap } from "react-icons/fi";
import ModuleHeader from "../../../components/ui/ModuleHeader";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { Column, Row } from "../../../components/ui/DataTable/types";
import strings from "../../../global/constants/StringConstants";
import { roadMasterServices } from "./services/roadMaster.services";
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

const RoadMaster: React.FC = () => {
  const [roadData, setRoadData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [exporting, setExporting] = useState(false);
  tabTitle(strings.ROAD_MASTER);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns: Column[] = [
    { field: "stateName", headerName: "State Name", width: 130 },
    { field: "districtName", headerName: "District Name", width: 130 },
    {
      field: "schemeType",
      headerName: "Scheme Type",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            params.value === "PMGSY-III"
              ? "bg-blue-100 text-blue-800"
              : params.value === "PMGSY-II"
              ? "bg-green-100 text-green-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    { field: "packageNo", headerName: "Package No", width: 120 },
    { field: "roadCode", headerName: "Road Code", width: 110 },
    {
      field: "roadName",
      headerName: "Road Name",
      width: 200,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "piuName",
      headerName: "PIU Name",
      width: 150,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "contractorName",
      headerName: "Contractor Name",
      width: 180,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "noOfDevices",
      headerName: "No. of Devices",
      width: 120,
      renderCell: (params) => (
        <span className="text-gray-500">{params.value}</span>
      ),
    },
    {
      field: "workStage",
      headerName: "Work Stage",
      width: 120,
      renderCell: (params) => (
        <span className="text-gray-500">{params.value}</span>
      ),
    },
    {
      field: "deviceInstallationStatus",
      headerName: "Device Installation Status",
      width: 180,
      renderCell: (params) => (
        <span className="text-gray-500">{params.value}</span>
      ),
    },
    {
      field: "kmlDataStatus",
      headerName: "KML Data Status",
      width: 130,
      renderCell: (params) => (
        <span className="text-gray-500">{params.value}</span>
      ),
    },
    { field: "sanctionDate", headerName: "Sanction Date", width: 120 },
    {
      field: "sanctionLength",
      headerName: "Sanction Length",
      width: 130,
      type: "number",
    },
    {
      field: "activityName",
      headerName: "Activity Name",
      width: 150,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "activityQuantity",
      headerName: "Activity Quantity",
      width: 130,
      type: "number",
    },
    {
      field: "activity",
      headerName: "Activity",
      width: 150,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "actualActivityStartDate",
      headerName: "Actual Activity Start Date",
      width: 180,
    },
    {
      field: "activityCompletionDate",
      headerName: "Activity Completion Date",
      width: 180,
    },
    {
      field: "actualActivityCompletionDate",
      headerName: "Actual Activity Completion Date",
      width: 200,
    },
    { field: "awardDate", headerName: "Award Date", width: 120 },
    {
      field: "completedRoadLength",
      headerName: "Completed Road Length",
      width: 160,
      type: "number",
    },
    { field: "completionDate", headerName: "Completion Date", width: 130 },
    {
      field: "executedQuantity",
      headerName: "Executed Quantity",
      width: 140,
      type: "number",
    },
    { field: "pmisFinalizeDate", headerName: "PIMS Finalize Date", width: 140 },
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
    { label: strings.ROAD_MASTER, isActive: true, icon: FiMap },
  ];

  useEffect(() => {
    loadRoadData();
  }, []);

  const loadRoadData = async (
    search: string = "",
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Row> = search
        ? await roadMasterServices.search(search, page, limit)
        : await roadMasterServices.getAll(page, limit);

      setRoadData(result.data);
      setTotalRows(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error: any) {
      console.error("Error loading road master data:", error);
      toast.error(error.message || "Failed to fetch road master data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchText: string) => {
    console.log({ searchText });
    setSearchValue(searchText);
    setCurrentPage(1); // Reset to first page on search
    loadRoadData(searchText, 1, pageSize);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRoadData(searchValue, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadRoadData(searchValue, 1, size);
  };

  const handleExport = async (format: "csv" | "pdf" | "excel") => {
    setExporting(true);
    try {
      const result = await roadMasterServices.exportData(format);
      toast.success(`Data exported successfully as ${format.toUpperCase()}`);

      // If CSV, you might want to handle the returned data differently
      if (format === "csv") {
        // For CSV, you could show the data or download it
        console.log("CSV Data:", result);
      }
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      <ModuleHeader
        title={strings.ROAD_MASTER}
        breadcrumbs={breadcrumbs}
        // showExportButton
        // onExportClick={() => handleExport("csv")}
        // exportText={exporting ? "Exporting..." : "Export CSV"}
      />

      <div className="p-6">
        <DataTable
          columns={columns}
          rows={roadData}
          loading={loading}
          onSearch={handleSearch}
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
            modulePath: urls.roadMasterExportPath,
            filename: "road-master-data",
          }}
          // Disable edit/delete for read-only module
          //   hideActions={true}
        />
      </div>

      {/* Export Options */}
      {/* <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
        <button
          onClick={() => handleExport("pdf")}
          disabled={exporting}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
        <button
          onClick={() => handleExport("excel")}
          disabled={exporting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export Excel"}
        </button>
      </div> */}
    </div>
  );
};

export default RoadMaster;
