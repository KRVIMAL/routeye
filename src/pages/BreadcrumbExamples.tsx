// src/components/ui/Breadcrumb/BreadcrumbExamples.tsx
import React from "react";
import { FiHome, FiSettings, FiUser, FiTruck, FiUsers, FiGrid } from "react-icons/fi";
import Breadcrumb, { BreadcrumbItem } from "../components/ui/Breadcrumb";
// import Breadcrumb, { BreadcrumbItem } from "./Breadcrumb";

const BreadcrumbExamples: React.FC = () => {
  // Example 1: Simple breadcrumb
  const simpleBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: FiHome },
    { label: "Settings", href: "/settings", icon: FiSettings },
    { label: "User personalization", isActive: true, icon: FiUser },
  ];

  // Example 2: Deep navigation breadcrumb
  const deepBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: FiHome },
    { label: "Fleet Management", href: "/fleet" },
    { label: "Vehicles", href: "/fleet/vehicles", icon: FiTruck },
    { label: "Vehicle Details", href: "/fleet/vehicles/123" },
    { label: "Maintenance Records", href: "/fleet/vehicles/123/maintenance" },
    { label: "Service History", isActive: true },
  ];

  // Example 3: Dashboard breadcrumb
  const dashboardBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: FiHome },
    { label: "Dashboard", isActive: true, icon: FiGrid },
  ];

  // Example 4: Long labels breadcrumb
  const longLabelsBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: FiHome },
    { label: "Driver Management System", href: "/drivers" },
    { label: "Driver Performance Analytics", href: "/drivers/analytics" },
    { label: "Monthly Performance Report for John Doe", isActive: true, icon: FiUsers },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Breadcrumb Component Examples
        </h1>

        {/* Example 1: Simple Navigation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            1. Simple Navigation
          </h2>
          <Breadcrumb items={simpleBreadcrumbs} />
        </div>

        {/* Example 2: Deep Navigation with Collapsing */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            2. Deep Navigation (Auto-collapse on small screens)
          </h2>
          <Breadcrumb items={deepBreadcrumbs} maxItems={4} />
        </div>

        {/* Example 3: Dashboard/Root Level */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            3. Dashboard/Root Level
          </h2>
          <Breadcrumb items={dashboardBreadcrumbs} />
        </div>

        {/* Example 4: Long Labels */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            4. Long Labels (Responsive truncation)
          </h2>
          <Breadcrumb items={longLabelsBreadcrumbs} maxItems={3} />
        </div>

        {/* Example 5: Without Home Icon */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            5. Without Home Icon
          </h2>
          <Breadcrumb items={simpleBreadcrumbs} showHomeIcon={false} />
        </div>

        {/* Example 6: Custom Styling */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            6. Custom Container Styling
          </h2>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <Breadcrumb 
              items={simpleBreadcrumbs} 
              className="bg-white p-3 rounded shadow-sm"
            />
          </div>
        </div>

        {/* Responsive Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            7. Responsive Behavior Test
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Resize your browser window to see responsive behavior:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 mb-2">Desktop View:</p>
              <Breadcrumb items={deepBreadcrumbs} />
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 mb-2">Mobile View Simulation:</p>
              <div className="max-w-xs">
                <Breadcrumb items={deepBreadcrumbs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbExamples;