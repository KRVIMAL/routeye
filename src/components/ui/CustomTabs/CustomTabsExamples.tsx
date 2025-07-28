import { useState } from "react";
import { CustomTabs } from "./CustomTabs";
import { TabConfig } from "./Tabs.types";

export const CustomTabsExamples = () => {
  const [horizontalTab, setHorizontalTab] = useState("Online");
  const [verticalTab, setVerticalTab] = useState("Halt");
  const [compactTab, setCompactTab] = useState("Active");

  const statusTabs: TabConfig[] = [
    { label: "Online", count: 89 },
    { label: "Offline", count: 89 },
    { label: "Halt", count: 67 },
    { label: "Idle", count: 89 },
    { label: "Motion", count: 89 },
  ];

  const consultantTabs: TabConfig[] = [
    { label: "Active", count: 45 },
    { label: "Inactive", count: 12 },
  ];

  const categoryTabs: TabConfig[] = [
    { label: "All", count: 156 },
    { label: "Published", count: 120 },
    { label: "Draft", count: 25 },
    { label: "Archived", count: 11 },
    { label: "Pending", count: 0 }, // Won't show count
  ];

  const iconTabs: TabConfig[] = [
    {
      label: "Dashboard",
      count: 5,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      label: "Reports",
      count: 12,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      label: "Settings",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Custom Tabs Examples
      </h1>

      {/* Horizontal Tabs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Horizontal Status Tabs
        </h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <CustomTabs
            tabConfig={statusTabs}
            selected={horizontalTab}
            onChange={setHorizontalTab}
            orientation="horizontal"
            size="md"
          />
        </div>
        <p className="text-sm text-gray-600">
          Selected: <span className="font-semibold">{horizontalTab}</span>
        </p>
      </div>

      {/* Vertical Tabs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Vertical Status Tabs
        </h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-xs">
            <CustomTabs
              tabConfig={statusTabs}
              selected={verticalTab}
              onChange={setVerticalTab}
              orientation="vertical"
              size="md"
            />
            <CustomTabs
              tabConfig={statusTabs}
              selected={verticalTab}
              onChange={setVerticalTab}
              orientation="vertical-stacked"
              size="md"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Selected: <span className="font-semibold">{verticalTab}</span>
        </p>
      </div>

      {/* Different Sizes */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Different Sizes</h2>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Small Size</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <CustomTabs
              tabConfig={consultantTabs}
              selected={compactTab}
              onChange={setCompactTab}
              orientation="horizontal"
              size="sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">
            Medium Size (Default)
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <CustomTabs
              tabConfig={consultantTabs}
              selected={compactTab}
              onChange={setCompactTab}
              orientation="horizontal"
              size="md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Large Size</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <CustomTabs
              tabConfig={consultantTabs}
              selected={compactTab}
              onChange={setCompactTab}
              orientation="horizontal"
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs with Icons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Tabs with Icons</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <CustomTabs
            tabConfig={iconTabs}
            selected={horizontalTab}
            onChange={setHorizontalTab}
            orientation="horizontal"
            size="md"
          />
        </div>
      </div>

      {/* Scrollable Tabs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Scrollable Tabs</h2>
        <div className="p-6 bg-gray-50 rounded-lg max-w-md">
          <CustomTabs
            tabConfig={categoryTabs}
            selected={horizontalTab}
            onChange={setHorizontalTab}
            orientation="horizontal"
            size="md"
            scrollable={true}
          />
        </div>
      </div>

      {/* Centered Tabs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Centered Tabs</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <CustomTabs
            tabConfig={consultantTabs}
            selected={compactTab}
            onChange={setCompactTab}
            orientation="horizontal"
            size="md"
            centered={true}
          />
        </div>
      </div>

      {/* Tabs without Counts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Tabs without Counts
        </h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <CustomTabs
            tabConfig={consultantTabs}
            selected={compactTab}
            onChange={setCompactTab}
            orientation="horizontal"
            size="md"
            showCounts={false}
          />
        </div>
      </div>

      {/* Tabs with Disabled State */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Tabs with Disabled State
        </h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <CustomTabs
            tabConfig={[
              { label: "Available", count: 45 },
              { label: "Pending", count: 12 },
              { label: "Disabled", count: 0, disabled: true },
              { label: "Archived", count: 8 },
            ]}
            selected={compactTab}
            onChange={setCompactTab}
            orientation="horizontal"
            size="md"
          />
        </div>
      </div>

      {/* Real-world Usage Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Real-world Usage (Consultant Management)
        </h2>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Consultants</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Consultant
            </button>
          </div>

          <CustomTabs
            tabConfig={consultantTabs}
            selected={compactTab}
            onChange={setCompactTab}
            orientation="horizontal"
            size="md"
            className="mb-6"
          />

          <div className="text-sm text-gray-600">
            Showing {compactTab.toLowerCase()} consultants
          </div>
        </div>
      </div>
    </div>
  );
};

// Export components
export { CustomTabs } from "./CustomTabs";
export type { CustomTabsProps, TabConfig } from "./Tabs.types";
