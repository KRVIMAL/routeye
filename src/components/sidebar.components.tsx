// src/components/layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserName } from "../store/slices/authSlice";
import { useTheme } from "../hooks/useTheme";
import { usePermissions } from "../hooks/usePermissions";
import {
  FiHome,
  FiGrid,
  FiSmartphone,
  FiTruck,
  FiUsers,
  FiMapPin,
  FiSettings,
  FiMap,
  FiAlertTriangle,
  FiFileText,
  FiUser,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { Crown } from "lucide-react";

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

// Simplified sidebar configuration
const sidebarConfig: SidebarItem[] = [
  {
    id: "admin",
    name: "ADMIN",
    icon: FiSettings,
    href: "/management/overview",
  },
  {
    id: "superadmin",
    name: "SUPER ADMIN", 
    icon: Crown,
    href: "/management/overview",
  },
  {
    id: "account-management",
    name: "ACCOUNT MANAGEMENT",
    icon: FiUser,
    href: "/account-management/roles",
  },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const userName = useSelector(selectUserName);
  const { mode, toggleTheme } = useTheme();
  const { isAdmin, isSuperAdmin, hasPermission } = usePermissions();

  // Determine which sidebar items to show based on role and permissions
  const hasAccess = (itemId: string): boolean => {
    switch (itemId) {
      case "admin":
        // Show admin menu only for admin role users with proper permissions
        return isAdmin() && hasPermission('USER', 'VIEW'); // Check if user has at least some admin permissions
      case "superadmin":
        // Show superadmin menu only for superadmin role users
        return isSuperAdmin();
      case "account-management":
        // Account management available to all authenticated users
        return true;
      default:
        return false;
    }
  };

  // Filter sidebar items based on role-based access
  const visibleSidebarItems = sidebarConfig.filter((item) => hasAccess(item.id));

  return (
    <div
      className={`w-[69px] h-screen bg-[#2C4FA0] flex flex-col ${className}`}
    >
      {/* Company Logo Section */}
      <div className="h-[53.93px] flex items-center justify-center border-b border-white/20">
        <div className="w-10 h-10 flex items-center justify-center">
          {/* Route/Location Pin Logo - you can replace this with your actual logo */}
          <div className="relative">
            <FiMapPin className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-[#2C4FA0]">
              <div className="w-full h-full rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thumb-blue py-[4.88px]"
        style={{
          gap: "3px",
        }}
      >
        <div className="space-y-[3px]">
          {visibleSidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `group flex flex-col items-center justify-center transition-all duration-200 border-r-[1.63px] ${
                  isActive
                    ? "bg-white/10 border-r-[#60A5FA] text-white"
                    : "border-r-transparent text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
              style={{
                width: "69.0625px",
                height: "42.5px",
                paddingTop: "4.88px",
                paddingBottom: "4.88px",
                gap: "3.25px",
              }}
              title={item.name}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 mb-1 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-[8px] font-medium text-center leading-tight px-1 ${
                      isActive
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                    style={{
                      wordBreak: "break-word",
                      hyphens: "auto",
                      lineHeight: "10px",
                    }}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Section: Theme Toggle and Profile */}
      <div className="border-t border-white/20 py-2 space-y-1 flex-shrink-0">
        {/* Theme Toggle */}
        {/* <button
          onClick={toggleTheme}
          className="w-full flex flex-col items-center justify-center h-[42.5px] px-2 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        >
          {mode === "light" ? (
            <FiMoon className="w-4 h-4 mb-1 group-hover:text-white" />
          ) : (
            <FiSun className="w-4 h-4 mb-1 group-hover:text-white" />
          )}
          <span className="text-[8px] font-medium text-center leading-tight">
            {mode === "light" ? "DARK MODE" : "DAY MODE"}
          </span>
        </button> */}

        {/* Profile */}
        <button
          className="w-full flex flex-col items-center justify-center h-[42.5px] px-2 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          title={`Profile - ${userName || "User"}`}
        >
          <div className="w-4 h-4 mb-1 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30">
            <FiUser className="w-3 h-3 group-hover:text-white" />
          </div>
          <span className="text-[8px] font-medium text-center leading-tight">
            PROFILE
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;