// src/components/dashboard/SummarySection/SummaryCard.tsx
import React from "react";
import { IconType } from "react-icons";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "red" | "purple" | "orange";
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  className = ""
}) => {
  const colorConfig = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-200"
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-200"
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-200"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-200"
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-200"
    }
  };

  const config = colorConfig[color];

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
