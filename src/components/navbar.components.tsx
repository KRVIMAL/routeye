// src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectUserName } from "../store/slices/authSlice";
import { usePermissions } from "../hooks/usePermissions";
import { TabConfig } from "./ui/CustomTabs/Tabs.types";
import { CustomTabs } from "./ui/CustomTabs/CustomTabs";
import {
  FiMaximize2,
  FiMinimize2,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  BatteryPlus,
  BookUser,
  CardSim,
  CircleUser,
  Contact,
  Group,
  KeySquare,
  RadioReceiver,
  ShieldHalf,
  Signal,
  SquareUserRound,
  SunMoon,
  Truck,
  User,
  UserRoundPen,
  Users,
} from "lucide-react";

interface NavbarProps {
  className?: string;
}

// Router-aware Navbar component
const NavbarContent: React.FC<NavbarProps> = ({ className = "" }) => {
  const userName = useSelector(selectUserName);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState("All Device");
  const [showNotifications, setShowNotifications] = useState(false);

  // Scroll state management
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Tab configuration based on your Figma design
  const tabConfig: TabConfig[] = [
    { label: "All Device", count: 156 },
    { label: "Online", count: 89 },
    { label: "Offline", count: 33 },
    { label: "Motion", count: 45 },
    { label: "Halt", count: 67 },
    { label: "Idle", count: 12 },
    { label: "Option 6", count: 18 },
    { label: "Option 7", count: 15 },
  ];

  // Super Admin tab configuration
  const superAdminTabConfig: TabConfig[] = [
    { label: "Devices", icon: <RadioReceiver size={16} /> },
    { label: "Vehicles", icon: <Truck size={16} /> },
    { label: "Clients", icon: <BookUser size={16} /> },
    { label: "Groups", icon: <Users size={16} /> },
    { label: "Telecom", icon: <Signal size={16} /> },
  ];

  // Admin tab configuration
  const adminTabConfig: TabConfig[] = [
    { label: "Drivers", icon: <Contact size={16} /> },
    { label: "Vehicle Master", icon: <Truck size={16} /> },
    { label: "Group Master", icon: <Group size={16} /> },
    { label: "Users", icon: <CircleUser size={16} /> },
    { label: "Device onboarding", icon: <BatteryPlus size={16} /> },
    { label: "Telecom Master", icon: <CardSim size={16} /> },
  ];

  // Account Management tab configuration
  const accountManagementTabConfig: TabConfig[] = [
    { label: "Accounts", icon: <UserRoundPen size={16} /> }, //star-user
    { label: "Roles & Rights", icon: <ShieldHalf size={16} /> },
    { label: "Change Password", icon: <KeySquare size={16} /> },
    { label: "Appearance Setting", icon: <SunMoon size={16} /> },
  ];

  // Route detection logic - use generic routes with role-based content
  const isManagementRoute = location.pathname.includes("/management");
  const isAccountManagementRoute = location.pathname.includes(
    "/account-management"
  );

  // Determine current context based on role and route
  const isSuperAdminContext = isManagementRoute && isSuperAdmin();
  const isAdminContext = isManagementRoute && isAdmin();
  const isAccountContext = isAccountManagementRoute;

  // Conditional tab configuration
  const currentTabConfig = isSuperAdminContext
    ? superAdminTabConfig
    : isAdminContext
    ? adminTabConfig
    : isAccountContext
    ? accountManagementTabConfig
    : tabConfig;

  // Update activeTab based on current route and context
  useEffect(() => {
    if (isSuperAdminContext) {
      const pathSegment = location.pathname.split("/").pop();
      switch (pathSegment) {
        case "devices":
          setActiveTab("Devices");
          break;
        case "vehicles":
          setActiveTab("Vehicles");
          break;
        case "clients":
          setActiveTab("Clients");
          break;
        case "groups":
          setActiveTab("Groups");
          break;
        case "telecom":
          setActiveTab("Telecom");
          break;
        case "overview":
        default:
          setActiveTab("Devices");
      }
    } else if (isAdminContext) {
      const pathSegment = location.pathname.split("/").pop();
      switch (pathSegment) {
        case "drivers":
          setActiveTab("Drivers");
          break;
        case "vehicle-master":
          setActiveTab("Vehicle Master");
          break;
        case "group-master":
          setActiveTab("Group Master");
          break;
        case "users":
          setActiveTab("Users");
          break;
        case "device-onboarding":
          setActiveTab("Device onboarding");
          break;
        case "telecom-master":
          setActiveTab("Telecom Master");
          break;
        case "overview":
        default:
          setActiveTab("Drivers");
      }
    } else if (isAccountContext) {
      const pathSegment = location.pathname.split("/").pop();
      switch (pathSegment) {
        case "accounts":
          setActiveTab("Accounts");
          break;
        case "roles":
          setActiveTab("Roles & Rights");
          break;
        case "change-password":
          setActiveTab("Change Password");
          break;
        case "appearance-setting":
          setActiveTab("Appearance Setting");
          break;
        default:
          setActiveTab("Roles & Rights");
      }
    } else {
      setActiveTab("All Device");
    }
  }, [
    location.pathname,
    isSuperAdminContext,
    isAdminContext,
    isAccountContext,
  ]);

  // Check if scrolling is needed and update scroll button states
  const checkScrollState = () => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    // Check if content overflows (needs scroll)
    const hasOverflow = scrollWidth > clientWidth;
    setNeedsScroll(hasOverflow);

    // Check scroll positions
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding
  };

  // Add custom scrollbar styles to the document head
  useEffect(() => {
    const styleId = "navbar-scrollbar-styles";

    // Remove existing styles if they exist
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new styles
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      #navbar-tabs::-webkit-scrollbar {
        height: 4px;
      }
      #navbar-tabs::-webkit-scrollbar-track {
        background: transparent;
      }
      #navbar-tabs::-webkit-scrollbar-thumb {
        background-color: #D1D5DB;
        border-radius: 2px;
      }
      #navbar-tabs::-webkit-scrollbar-thumb:hover {
        background-color: #9CA3AF;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  // Check scroll state on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollState, 100); // Small delay to ensure DOM is updated
    };

    // Initial check
    setTimeout(checkScrollState, 100);

    // Add event listeners
    window.addEventListener("resize", handleResize);
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollState);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("scroll", checkScrollState);
      }
    };
  }, []);

  // Re-check when tabs change
  useEffect(() => {
    setTimeout(checkScrollState, 100);
  }, [currentTabConfig]);

  const handleMaximizeToggle = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const scrollLeft = () => {
    const container = tabsContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = tabsContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Tab change handler with navigation
  const handleTabChange = (tabLabel: string) => {
    setActiveTab(tabLabel);

    if (isSuperAdminContext) {
      // Super Admin routes - use generic management paths
      switch (tabLabel) {
        case "Devices":
          navigate("/management/devices");
          break;
        case "Vehicles":
          navigate("/management/vehicles");
          break;
        case "Clients":
          navigate("/management/clients");
          break;
        case "Groups":
          navigate("/management/groups");
          break;
        case "Telecom":
          navigate("/management/telecom");
          break;
        default:
          break;
      }
    } else if (isAdminContext) {
      // Admin routes - use generic management paths
      switch (tabLabel) {
        case "Drivers":
          navigate("/management/drivers");
          break;
        case "Vehicle Master":
          navigate("/management/vehicle-master");
          break;
        case "Group Master":
          navigate("/management/group-master");
          break;
        case "Users":
          navigate("/management/users");
          break;
        case "Device onboarding":
          navigate("/management/device-onboarding");
          break;
        case "Telecom Master":
          navigate("/management/telecom-master");
          break;
        default:
          break;
      }
    } else if (isAccountContext) {
      // Account Management routes
      switch (tabLabel) {
        case "Accounts":
          navigate("/account-management/accounts");
          break;
        case "Roles & Rights":
          navigate("/account-management/roles");
          break;
        case "Change Password":
          navigate("/account-management/change-password");
          break;
        case "Appearance Setting":
          navigate("/account-management/appearance-setting");
          break;
        default:
          break;
      }
    } else {
      // Regular device filtering - existing logic
      // Keep your existing device filtering logic here
      // This is where you would handle the device status filtering
    }
  };

  return (
    <nav
      className={`bg-white border-b border-gray-200 h-[53.93px] flex items-center ${className}`}
    >
      <div className="flex items-center justify-between w-full px-4">
        {/* Left Section: Company Logo Square */}
        <div className="flex items-center flex-shrink-0">
          {/* App Name */}
          <div className="mr-6 hidden sm:block">
            <div className="flex flex-col" style={{ width: "76px" }}>
              <h1
                className="font-bold capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "17.98px",
                  lineHeight: "100%",
                  letterSpacing: "3%",
                  color: "#1F3A8A",
                  height: "21px",
                }}
              >
                Routeye
              </h1>
              <span
                className="font-medium capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 500,
                  fontSize: "8.99px",
                  lineHeight: "100%",
                  letterSpacing: "1%",
                  color: "#1F3A8A",
                  height: "11px",
                  marginTop: "0.57px",
                }}
              >
                manage fleets
              </span>
            </div>
          </div>

          {/* Mobile App Name */}
          <div className="mr-4 sm:hidden">
            <div className="flex flex-col">
              <h1
                className="font-bold capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "100%",
                  color: "#1F3A8A",
                }}
              >
                Routeye
              </h1>
              <span
                className="font-medium capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 500,
                  fontSize: "8px",
                  lineHeight: "100%",
                  color: "#1F3A8A",
                }}
              >
                manage fleets
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Tab Navigation with Conditional Scroll Controls */}
        <div className="flex items-center flex-1 justify-center max-w-4xl mx-4">
          {/* Left Scroll Button - Only show if needed and can scroll left */}
          {needsScroll && canScrollLeft && (
            <button
              className="p-1 hover:bg-gray-50 rounded transition-colors mr-2 flex-shrink-0"
              onClick={scrollLeft}
              aria-label="Scroll tabs left"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Scrollable Tabs Container */}
          <div
            ref={tabsContainerRef}
            id="navbar-tabs"
            className="flex-1 overflow-x-auto max-w-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#D1D5DB transparent",
            }}
          >
            <div
              className={`flex space-x-1 py-1 ${
                needsScroll ? "justify-start" : "justify-center"
              }`}
            >
              <CustomTabs
                tabConfig={currentTabConfig}
                selected={activeTab}
                onChange={handleTabChange}
                orientation="horizontal"
                size={needsScroll ? "sm" : "sm"}
                scrollable={false}
                className="flex-nowrap"
              />
            </div>
          </div>

          {/* Right Scroll Button - Only show if needed and can scroll right */}
          {needsScroll && canScrollRight && (
            <button
              className="p-1 hover:bg-gray-50 rounded transition-colors ml-2 flex-shrink-0"
              onClick={scrollRight}
              aria-label="Scroll tabs right"
            >
              <FiChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
            >
              <FiBell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown (placeholder) */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Maximize/Minimize Toggle */}
          <button
            onClick={handleMaximizeToggle}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            title={isMaximized ? "Exit Full Screen" : "Full Screen"}
          >
            {isMaximized ? (
              <FiMinimize2 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            ) : (
              <FiMaximize2 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

// Main Navbar component with Router context safety
export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  // Fallback navbar when Router context is not available
  const FallbackNavbar = () => (
    <nav
      className={`bg-white border-b border-gray-200 h-[53.93px] flex items-center ${className}`}
    >
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center flex-shrink-0">
          <div className="mr-6 hidden sm:block">
            <div className="flex flex-col" style={{ width: "76px" }}>
              <h1
                className="font-bold capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "17.98px",
                  lineHeight: "100%",
                  letterSpacing: "3%",
                  color: "#1F3A8A",
                  height: "21px",
                }}
              >
                Routeye
              </h1>
              <span
                className="font-medium capitalize leading-none"
                style={{
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 500,
                  fontSize: "8.99px",
                  lineHeight: "100%",
                  letterSpacing: "1%",
                  color: "#1F3A8A",
                  height: "11px",
                  marginTop: "0.57px",
                }}
              >
                manage fleets
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    </nav>
  );

  try {
    return <NavbarContent className={className} />;
  } catch (error) {
    console.warn("Navbar: Router context not available, using fallback");
    return <FallbackNavbar />;
  }
};

export default Navbar;
