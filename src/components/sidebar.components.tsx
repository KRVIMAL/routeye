import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiMenu,
  FiX,
  FiHardDrive,
  FiSmartphone,
  FiShield,
  FiTruck,
  FiHome,
  FiMap,
  FiBell,
  FiAlertTriangle,
  FiPhone,
  FiMapPin,
  FiNavigation,
  FiGrid,
  FiFileText,
} from "react-icons/fi";
const sidebarItems = [
  // { name: "Monitoring", href: "/", icon: FiHome },
  // { name: "Style Guide", href: "/styleguide", icon: FiUsers },
  // { name: "Select Demo", href: "/selectdemo", icon: FiFileText },
  { name: "Input Demo", href: "/inputdemo", icon: FiFileText },
    { name: "autocomplete Demo", href: "/autocompleteDemo", icon: FiFileText },
  
  { name: "Select Demo", href: "/selectdemo", icon: FiFileText },

  { name: "Button Demo", href: "/button-demo", icon: FiGrid },
  { name: "Logo", href: "/logo-loader", icon: FiGrid },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <div
      className={`bg-gray-900 text-white fixed left-0 top-16 bottom-0 z-50 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header with toggle button - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            {isCollapsed ? (
              <FiMenu className="h-5 w-5" />
            ) : (
              <FiX className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${isCollapsed ? "justify-center p-3" : "px-3 py-2"}`
              }
              title={isCollapsed ? item.name : ""}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`}
              />
              {!isCollapsed && (
                <span className="truncate transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
