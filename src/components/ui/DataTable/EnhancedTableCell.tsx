import React from "react";
import { CellParams, Column } from "./types";

interface EnhancedTableCellProps {
  params: CellParams;
  column: Column;
  isEditing: boolean;
  onStartEdit?: () => void;
}

const EnhancedTableCell: React.FC<EnhancedTableCellProps> = ({
  params,
  column,
  isEditing,
  onStartEdit,
}) => {
  const { value } = params;
  const align = column.align || "center";

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const formatValue = (val: any, type: string) => {
    if (val == null || val === "") return "";

    switch (type) {
      case "number":
        return typeof val === "number" ? val.toLocaleString() : val;
      case "boolean":
        return val ? "Yes" : "No";
      case "date":
        if (typeof val === "string") {
          const dateObj = new Date(val);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
          }
        } else if (val instanceof Date) {
          return val.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        }
        return val;
      default:
        return String(val);
    }
  };

  if (column.renderCell) {
    return (
      <div className="px-4 py-3">
        {column.renderCell(params)}
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-3 ${alignClasses[align]} ${
        column.editable && !isEditing
          ? "cursor-pointer hover:bg-gray-50"
          : ""
      }`}
      style={{
        // Table data typography as specified
        color: '#0E0E2C',
        fontFamily: 'Work Sans, sans-serif',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '100%',
        letterSpacing: '3%',
        textTransform: 'capitalize',
        verticalAlign: 'middle',
      }}
      onClick={column.editable && !isEditing ? onStartEdit : undefined}
    >
      {formatValue(value, column.type || "string")}
    </div>
  );
};

export default EnhancedTableCell;