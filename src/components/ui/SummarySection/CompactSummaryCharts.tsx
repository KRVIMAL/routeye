// src/components/dashboard/SummarySection/CompactSummaryCharts.tsx - New compact charts component
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface CompactSummaryChartsProps {
  deviceTypes: ChartData[];
  statusDistribution: ChartData[];
  loading?: boolean;
}

const CompactSummaryCharts: React.FC<CompactSummaryChartsProps> = ({
  deviceTypes,
  statusDistribution,
  loading = false
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 text-sm">{data.name}</p>
          <p className="text-xs text-gray-600">
            Value: <span className="font-medium">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-700">{entry.value}</span>
            <span className="text-xs text-gray-500">
              ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center space-x-8">
        <div className="animate-pulse">
          <div className="w-48 h-24 bg-gray-200 rounded-xl" />
        </div>
        <div className="animate-pulse">
          <div className="w-48 h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const deviceTypesWithTotal = deviceTypes.map(item => ({
    ...item,
    total: deviceTypes.reduce((sum, d) => sum + d.value, 0)
  }));

  const statusWithTotal = statusDistribution.map(item => ({
    ...item,
    total: statusDistribution.reduce((sum, d) => sum + d.value, 0)
  }));

  return (
    <div className="flex justify-center space-x-8">
      {/* Device Types Chart */}
      <div 
        className="bg-white rounded-xl border border-gray-200 p-3"
        style={{
          width: '192px',
          height: '95px',
          borderRadius: '12px'
        }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">Device Types</h3>
        <div style={{ height: '60px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceTypesWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={15}
                outerRadius={25}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={1}
              >
                {deviceTypesWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div 
        className="bg-white rounded-xl border border-gray-200 p-3"
        style={{
          width: '192px',
          height: '95px',
          borderRadius: '12px'
        }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">Status Distribution</h3>
        <div style={{ height: '60px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={15}
                outerRadius={25}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={1}
              >
                {statusWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompactSummaryCharts;