// src/pages/Dashboard.tsx - Clean version without fullscreen functionality
import React, { useState, useRef, useEffect } from "react";
import {
  FiUsers,
  FiBarChart,
  FiAlertTriangle,
  FiWifi,
  FiWifiOff,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiMapPin,
  FiBattery,
  FiClock,
  FiActivity,
  FiSmartphone,
} from "react-icons/fi";
import {
  hasValidDevices,
  hasValidPerformance,
  hasValidPagination,
  hasValidDebug,
  getSafeSummaryData,
  getSafePerformanceData,
  getSafePaginationData,
  getSafeCacheData,
} from "../../../utils/dashboardUtils";
import { useMonitoring } from "../../../hooks/useMonitoring";
import { useGoogleMaps } from "../../../hooks/useGoogleMaps";
import { store } from "../../../store";
import { CloudCog } from "lucide-react";

interface StatCard {
  name: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
}

interface Device {
  id: string;
  imei: string;
  label: string;
  batteryPercentage: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastActive: string;
  isFavorite: boolean;
  type: "truck" | "lock" | "gps";
  deviceType: string;
  speed?: number;
  bearing?: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const accountId = store.getState()?.auth?.user?.account?._id;
  console.log(store,"store")
  const clientId = "fmb920";

  // Map related state
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const markerClustererRef = useRef<any>(null);
  const clustererLoadedRef = useRef(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const {
    data: monitoringData,
    loading,
    error,
    lastRefresh,
    refresh,
    clearError,
  } = useMonitoring({
    accountId,
    clientId,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const {
    google,
    map,
    isLoaded,
    error: mapError,
  }: any = useGoogleMaps(mapRef, { lat: 20.5937, lng: 78.9629 }, 5);

  const handleRefresh = () => {
    refresh(true);
  };

  // Transform monitoring data to Device format
  const getDevicesFromMonitoringData = (): Device[] => {
    if (!hasValidDevices(monitoringData)) {
      return [];
    }

    return monitoringData!.devices!.map((device: any) => {
      let type: "truck" | "lock" | "gps" = "gps";

      if (device.deviceImei?.includes("traqloc")) {
        type = "lock";
      } else if (device.deviceImei?.includes("truck")) {
        type = "truck";
      }

      return {
        id: device.deviceImei || "unknown",
        imei: device.deviceImei || "unknown",
        label: `Device ${device.deviceImei?.slice(-4) || "****"}`,
        batteryPercentage: device.batteryPercentage || 0,
        coordinates: {
          lat: device.location?.latitude || 0,
          lng: device.location?.longitude || 0,
        },
        lastActive: device.timeDifference || "Unknown",
        isFavorite: false,
        type,
        deviceType: device.deviceImei || "unknown",
        speed: device.speed || 0,
        bearing: 0,
        status: device.status || "unknown",
      };
    });
  };

  const devices = getDevicesFromMonitoringData();

  // Debug logging - Enhanced
  useEffect(() => {
    console.log("=== MAP DEBUG INFO ===");
    console.log("Map state:", {
      google: !!google,
      map: !!map,
      isLoaded,
      mapError: mapError?.message,
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Present" : "Missing",
      mapRef: mapRef.current ? "Element exists" : "Element missing",
    });
    console.log("Devices:", devices.length);
    console.log("Loading:", loading);
    console.log("======================");
  }, [google, map, isLoaded, mapError, devices, loading]);

  // Add markers to map
  useEffect(() => {
    if (!isLoaded || !map || !google || loading || devices.length === 0) return;

    console.log("Adding markers to map, devices count:", devices.length);

    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    }

    // Clear existing marker clusterer
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers?.();
      markerClustererRef.current = null;
    }

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();

    // Create markers
    const markers = devices
      .filter(
        (device) => device.coordinates.lat !== 0 && device.coordinates.lng !== 0
      )
      .map((device) => {
        // Determine pin color based on battery percentage and status
        let iconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";

        if (device.status === "offline") {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        } else if (device.batteryPercentage <= 20) {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        } else if (device.batteryPercentage <= 60) {
          iconUrl = "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        }

        // Create the marker
        const marker = new google.maps.Marker({
          position: device.coordinates,
          map: map,
          title: device.label,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(30, 30),
          },
        });

        // Create info window for the marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px; font-weight: bold;">${
                device.label
              }</h3>
              <p style="margin: 4px 0;"><strong>IMEI:</strong> ${
                device.imei
              }</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> ${
                device.status
              }</p>
              <p style="margin: 4px 0;"><strong>Battery:</strong> ${
                device.batteryPercentage
              }%</p>
              <p style="margin: 4px 0;"><strong>Last Active:</strong> ${
                device.lastActive
              }</p>           
              <p style="margin: 4px 0;"><strong>Type:</strong> ${
                device.type === "lock" ? "E Lock" : device.type
              }</p>
              ${
                device.speed !== undefined
                  ? `<p style="margin: 4px 0;"><strong>Speed:</strong> ${device.speed} km/h</p>`
                  : ""
              }
            </div>
          `,
        });

        // Add click event to show info window and select device
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
          setSelectedDeviceId(device.id);
        });

        // Extend bounds to include this marker
        bounds.extend(device.coordinates);

        return marker;
      });

    // Store the markers
    markersRef.current = markers;

    // Fit map to bounds if we have markers
    if (markers.length > 0) {
      map.fitBounds(bounds);

      // Don't zoom in too far
      google.maps.event.addListenerOnce(map, "idle", () => {
        if (map.getZoom() && map.getZoom() > 15) {
          map.setZoom(15);
        }
      });
    }

    // Load MarkerClusterer dynamically
    const loadMarkerClusterer = () => {
      if (clustererLoadedRef.current) {
        if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
          markerClustererRef.current =
            new window.markerClusterer.MarkerClusterer({
              markers,
              map,
            });
        }
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@googlemaps/markerclusterer@2.0.8/dist/index.min.js";
      script.async = true;

      script.onload = () => {
        clustererLoadedRef.current = true;
        if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
          markerClustererRef.current =
            new window.markerClusterer.MarkerClusterer({
              markers,
              map,
            });
        }
      };

      document.head.appendChild(script);
    };

    loadMarkerClusterer();
  }, [isLoaded, map, google, loading, devices]);

  // Trigger map resize when map becomes visible
  useEffect(() => {
    if (map && isLoaded) {
      setTimeout(() => {
        google.maps.event.trigger(map, "resize");
        console.log("Map resize triggered");
      }, 300);
    }
  }, [map, isLoaded, google]);
console.log(store.getState().auth,"state")
  const generateStatCards = (): StatCard[] => {
    const summaryData = getSafeSummaryData(monitoringData);
    const performanceData = getSafePerformanceData(monitoringData);

    return [
      {
        name: "Total Devices",
        value: summaryData.totalDevices,
        icon: FiSmartphone,
        color: "text-blue-600",
      },
      {
        name: "Online Devices",
        value: summaryData.onlineCount,
        icon: FiWifi,
        color: "text-green-600",
      },
      {
        name: "Offline Devices",
        value: summaryData.offlineCount,
        icon: FiWifiOff,
        color: "text-red-600",
      },
      {
        name: "In Motion",
        value: summaryData.motionCount,
        icon: FiPlay,
        color: "text-blue-600",
      },
      {
        name: "Idle Devices",
        value: summaryData.idleCount,
        icon: FiPause,
        color: "text-yellow-600",
      },
      {
        name: "Halt Count",
        value: summaryData.haltCount,
        icon: FiPause,
        color: "text-orange-600",
      },
      {
        name: "Never Connected",
        value: summaryData.neverConnectedCount,
        icon: FiAlertTriangle,
        color: "text-red-600",
      },
      {
        name: "Response Time",
        value: `${performanceData.responseTime}ms`,
        icon: FiActivity,
        color: "text-purple-600",
      },
    ];
  };

  const statCards = generateStatCards();

  // Loading state
  if (loading && !monitoringData) {
    return (
      <div className="fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <FiRefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            <span className="text-text-secondary">
              Loading dashboard data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiAlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-text-primary mb-2">
              Failed to load dashboard data
            </p>
            <p className="text-text-secondary text-sm mb-4">{error}</p>
            <div className="space-x-2">
              <button onClick={handleRefresh} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={clearError} className="btn btn-secondary">
                Clear Error
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe data extraction
  const performanceData = getSafePerformanceData(monitoringData);
  const paginationData = getSafePaginationData(monitoringData);
  const cacheData = getSafeCacheData(monitoringData);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h1 className="text-heading-1 text-text-primary">Monitoring</h1>
        <div className="flex items-center space-x-4">
          <span className="text-body-small text-text-muted">
            Last updated: {lastRefresh?.toLocaleTimeString() || "Never"}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-lg mb-xl">
        {statCards.map((stat) => (
          <div key={stat.name} className="card max-w-xs">
            <div className="card-body p-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className={`h-3 w-3 ${stat.color || "text-primary-600"}`}
                  />
                </div>
                <div className="ml-sm">
                  <p className="text-caption font-medium text-text-muted">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-heading-3 text-text-primary">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Device Details (1/4) + Map (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg mb-xl">
        {/* Device Status Details - Takes 1/4 of the space */}
        <div className="lg:col-span-1 card">
          <div className="card-header">
            <h3 className="text-heading-3 text-text-primary">Device Details</h3>
          </div>
          <div className="card-body">
            {hasValidDevices(monitoringData) ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {monitoringData!.devices!.map((device: any) => (
                  <div
                    key={device.deviceImei}
                    className={`border-b border-gray-200 pb-4 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                      selectedDeviceId === device.deviceImei
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDeviceId(device.deviceImei);
                      // Center map on device
                      if (map && device.location) {
                        map.setCenter({
                          lat: device.location.latitude,
                          lng: device.location.longitude,
                        });
                        map.setZoom(15);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex h-3 w-3">
                          <div
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              device.status === "online"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <div
                            className={`relative inline-flex rounded-full h-3 w-3 ${
                              device.status === "online"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                        <span className="font-medium text-text-primary text-sm">
                          {device.deviceImei || "Unknown IMEI"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            device.status === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {device.status || "unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="h-3 w-3 text-text-muted" />
                        <span className="text-text-secondary truncate">
                          {device.location
                            ? `${
                                device.location.latitude?.toFixed(4) || "0"
                              }, ${
                                device.location.longitude?.toFixed(4) || "0"
                              }`
                            : "Location unavailable"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiBattery className="h-3 w-3 text-text-muted" />
                        <span className="text-text-secondary">
                          {device.batteryPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="h-3 w-3 text-text-muted" />
                        <span className="text-text-secondary">
                          {device.timeDifference || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs text-text-muted">
                        Account: {device.accountName || "Unknown Account"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No devices found</p>
                <p className="text-text-muted text-sm mt-2">
                  {monitoringData
                    ? "No devices are currently available in the system."
                    : "Data is still loading..."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Device Locations Section - Takes 3/4 of the space */}
        <div className="lg:col-span-3 card">
          <div className="card-header">
            <h3 className="text-heading-3 text-text-primary">
              Device Locations
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                Live Map
              </span>
            </div>
          </div>
          <div className="card-body p-0 relative">
            {/* Map Container */}
            <div
              ref={mapRef}
              className="w-full h-[500px] rounded-lg overflow-hidden bg-gray-200"
              style={{ minHeight: "500px" }}
            />

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}

            {/* Map Error Overlay */}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 z-10">
                <div className="text-center p-4">
                  <FiAlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 text-sm font-medium">
                    Map loading failed
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    {mapError.message}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Map Not Loaded Overlay */}
            {!isLoaded && !loading && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center p-4">
                  <div className="animate-pulse text-gray-400 mb-2">
                    Initializing map...
                  </div>
                  <p className="text-xs text-gray-500">
                    Please wait while Google Maps loads
                  </p>
                </div>
              </div>
            )}

            {/* Device Count Badge */}
            {devices.length > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm font-medium text-gray-700">
                  {
                    devices.filter(
                      (d) => d.coordinates.lat !== 0 && d.coordinates.lng !== 0
                    ).length
                  }{" "}
                  devices on map
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Global type declaration for marker clusterer
declare global {
  interface Window {
    markerClusterer: {
      MarkerClusterer: any;
    };
  }
}

export default Dashboard;
