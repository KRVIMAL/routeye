// src/components/ui/Modal/LoadSensorChartModal.tsx
import React from "react";
import { FiX, FiActivity, FiTrendingUp } from "react-icons/fi";
import Button from "../Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LoadSensorData {
  timestamp: string;
  loadValue: number;
  averageLoad: number;
  maxLoad: number;
  minLoad: number;
  windowSize: number;
}

interface LoadSensorChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoadSensorData[];
  title?: string;
  dateRange?: string;
  imei?: string;
}

const LoadSensorChartModal: React.FC<LoadSensorChartModalProps> = ({
  isOpen,
  onClose,
  data,
  title = "Load Sensor Chart",
  dateRange,
  imei,
}) => {
  if (!isOpen) return null;

  // Format timestamp for better display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // Prepare chart data
  const chartData = data.map((item, index) => ({
    index: index + 1,
    timestamp: item.timestamp,
    displayTime: formatTimestamp(item.timestamp),
    averageLoad: Number(item.averageLoad?.toFixed(2)) || 0,
    loadValue: Number(item.loadValue?.toFixed(2)) || 0,
  }));

  // Calculate statistics
  const stats = {
    totalReadings: data.length,
    avgLoad:
      data.length > 0
        ? (
            data.reduce((sum, item) => sum + (item.averageLoad || 0), 0) /
            data.length
          ).toFixed(2)
        : "0",
    maxLoad:
      data.length > 0
        ? Math.max(...data.map((item) => item.averageLoad || 0)).toFixed(2)
        : "0",
    minLoad:
      data.length > 0
        ? Math.min(...data.map((item) => item.averageLoad || 0)).toFixed(2)
        : "0",
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">Time: {data.timestamp}</p>
          <p className="text-blue-600">
            Average Load:{" "}
            <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-green-600">
            Load Value:{" "}
            <span className="font-semibold">{payload[1].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative transform overflow-hidden rounded-lg shadow-xl transition-all w-full max-w-6xl"
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-light)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center space-x-3">
              <FiActivity className="w-6 h-6 text-primary-600" />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {imei && `IMEI: ${imei}`} {dateRange && `• ${dateRange}`}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={FiX}
              onClick={onClose}
              className="!p-2"
            >
              Close
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {data.length === 0 ? (
              <div
                className="text-center py-16"
                style={{ color: "var(--text-muted)" }}
              >
                <FiActivity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Load Sensor Data</p>
                <p>
                  No load sensor readings available for the selected period.
                </p>
              </div>
            ) : (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <FiTrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Total Readings
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.totalReadings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded"></div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Average Load
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.avgLoad}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded"></div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Max Load
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {stats.maxLoad}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-orange-500 rounded"></div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Min Load
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats.minLoad}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <h4
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Load Sensor Readings Over Time
                  </h4>

                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="index"
                        interval="preserveStartEnd"
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "Reading Number",
                          position: "insideBottom",
                          offset: -10,
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "Load Value",
                          angle: -90,
                          position: "insideLeft",
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="averageLoad"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        name="Average Load"
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="loadValue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                        name="Load Value"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-4 text-xs text-gray-500 text-center">
                    * Hover over data points for detailed information
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex justify-end p-6 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadSensorChartModal;
