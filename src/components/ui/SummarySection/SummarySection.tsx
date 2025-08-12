import React from "react";
import { FiTrendingUp, FiTrendingDown, FiActivity, FiUsers } from "react-icons/fi";
import SummaryCard from "./SummaryCard";
import SummaryCharts from "./SummaryCharts";


interface SummaryData {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  recentlyAdded: number;
  deviceTypes: { name: string; value: number; color: string }[];
  statusDistribution: { name: string; value: number; color: string }[];
}

interface SummarySectionProps {
  data?: SummaryData;
  loading?: boolean;
  className?: string;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  data,
  loading = false,
  className = ""
}) => {
  // Default/mock data for demonstration
  const defaultData: SummaryData = {
    totalDevices: 156,
    activeDevices: 89,
    inactiveDevices: 67,
    recentlyAdded: 12,
    deviceTypes: [
      { name: "IoT", value: 65, color: "#3B82F6" },
      { name: "Lock", value: 45, color: "#10B981" },
      { name: "Sensor", value: 46, color: "#F59E0B" },
    ],
    statusDistribution: [
      { name: "Active", value: 89, color: "#10B981" },
      { name: "Inactive", value: 33, color: "#EF4444" },
      { name: "Maintenance", value: 34, color: "#F59E0B" },
    ]
  };

  const summaryData = data || defaultData;

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Summary</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Devices"
          value={summaryData.totalDevices}
          icon={FiActivity}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <SummaryCard
          title="Active Devices"
          value={summaryData.activeDevices}
          icon={FiTrendingUp}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <SummaryCard
          title="Inactive Devices"
          value={summaryData.inactiveDevices}
          icon={FiTrendingDown}
          trend={{ value: 3, isPositive: false }}
          color="red"
        />
        <SummaryCard
          title="Recently Added"
          value={summaryData.recentlyAdded}
          icon={FiUsers}
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCharts
          title="Device Types"
          data={summaryData.deviceTypes}
          type="pie"
        />
        <SummaryCharts
          title="Status Distribution"
          data={summaryData.statusDistribution}
          type="donut"
        />
      </div>
    </div>
  );
};

export default SummarySection;