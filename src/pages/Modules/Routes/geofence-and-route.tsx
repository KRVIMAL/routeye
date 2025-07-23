// App.tsx with Tailwind CSS
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import {
  createRoute,
  deleteRoute,
  fetchRoutes,
  searchRoutes,
  updateRoute,
} from "./services/routes.service";
import RouteEditor from "./RouteEditor";
import { Route } from "./types";
import RouteTable from "./component/RouteTable";
import Button from "../../../components/ui/Button";
import { store } from "../../../store";
import { tabTitle } from "../../../utils/tab-title";
import strings from "../../../global/constants/StringConstants";
const GeofenceAndRoute: React.FC = () => {
  tabTitle(strings.ROUTES);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  // const { primaryColor } = useColors();
  useEffect(() => {
    if (searchTerm.trim() === "") {
      loadRoutes(currentPage, limit);
    } else {
      handleSearch(searchTerm);
    }
  }, [currentPage, limit]);

  const loadRoutes = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response: any = await fetchRoutes(page, limit);
      setRoutes(response.routes || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error("Error loading routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to debounce the search
    const timeout = setTimeout(() => {
      if (term.trim() === "") {
        // If search term is empty, load regular routes
        loadRoutes(currentPage, limit);
      } else {
        // Execute search
        searchRoutesData(term, currentPage, limit);
      }
    }, 700); // Debounce by 700ms

    setSearchTimeout(timeout as unknown as any);
  };

  const searchRoutesData = async (
    term: string,
    page: number,
    itemLimit: number
  ) => {
    setLoading(true);
    try {
      const result = await searchRoutes(term, page, itemLimit);
      setRoutes(result.routes || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error("Error searching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleCreateRoute = () => {
    setCurrentRoute(null);
    setShowEditor(true);
  };

  const handleEditRoute = (route: Route) => {
    setCurrentRoute(route);
    setShowEditor(true);
  };

  const handleDeleteRoute = async (id: string) => {
    try {
      const response: any = await deleteRoute(id);
      toast.success(response?.message);
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route._id !== id));
    } catch (error: any) {
      toast.error(error?.message);
      console.error("Error deleting route:", error);
    }
  };

  const handleSaveRoute = async (routeData: Route) => {
    try {
      const userId = store.getState()?.auth?.user?.account?._id;
      const routeWithUserId = {
        ...routeData,
        userId: userId,
      };

      if (currentRoute && currentRoute._id) {
        const response: any = await updateRoute(
          currentRoute._id,
          routeWithUserId
        );
        setRoutes((prevRoutes) =>
          prevRoutes.map((route) =>
            route._id === currentRoute._id
              ? { ...routeWithUserId, _id: currentRoute._id }
              : route
          )
        );
        toast.success(response?.message);
      } else {
        const response: any = await createRoute(routeWithUserId);
        setRoutes((prevRoutes) => [...prevRoutes]);
        loadRoutes(currentPage, limit);
        toast.success(response?.message);
      }
      setShowEditor(false);
      setCurrentRoute(null);
    } catch (error: any) {
      toast.error(error?.message);
      console.error("Error saving route:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setCurrentRoute(null);
  };

  return (
    <div>
      <Toaster position="top-center" />

      <main className="min-h-[calc(100vh-150px)]">
        {showEditor ? (
          <RouteEditor
            initialRoute={currentRoute}
            onSave={handleSaveRoute}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-end items-center gap-4 mb-4">
              <div className="flex-grow"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ textIndent: "30px" }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
              </div>
              {/* <CustomButton
                text={"Create Route"}
                onClick={handleCreateRoute}
              /> */}
              <Button variant="primary" onClick={handleCreateRoute}>
                Create Route
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-600">
                Loading routes...
              </div>
            ) : (
              <RouteTable
                routes={routes}
                onEdit={handleEditRoute}
                onDelete={handleDeleteRoute}
                totalCount={totalCount}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                limit={limit}
                onLimitChange={handleLimitChange}
                loading={loading}
                onSearch={handleSearch}
                searchTerm={searchTerm}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default GeofenceAndRoute;
