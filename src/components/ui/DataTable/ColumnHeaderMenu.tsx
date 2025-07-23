// src/components/ui/DataTable/ColumnHeaderMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  FiMoreVertical,
  FiArrowUp,
  FiArrowDown,
  FiEyeOff,
  FiColumns,
  FiFilter,
  FiMapPin,
} from "react-icons/fi";
import { Column, ColumnState } from "./types";

interface ColumnHeaderMenuProps {
  column: Column;
  columnState: ColumnState;
  onSort: (field: string, direction: "asc" | "desc" | null) => void;
  onPin: (field: string, position: "left" | "right" | null) => void;
  onHide: (field: string) => void;
  onOpenColumnManager: () => void;
  onOpenFilter: (field: string) => void;
  hasFilter: boolean;
}

const ColumnHeaderMenu: React.FC<ColumnHeaderMenuProps> = ({
  column,
  columnState,
  onSort,
  onPin,
  onHide,
  onOpenColumnManager,
  onOpenFilter,
  hasFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const getSortOptions = () => {
    const options = [];

    if (columnState.sortDirection === "asc") {
      options.push({
        label: "Sort by DESC",
        action: () => onSort(column.field, "desc"),
        icon: FiArrowDown,
      });
      options.push({
        label: "Unsort",
        action: () => onSort(column.field, null),
        icon: FiArrowUp,
      });
    } else if (columnState.sortDirection === "desc") {
      options.push({
        label: "Sort by ASC",
        action: () => onSort(column.field, "asc"),
        icon: FiArrowUp,
      });
      options.push({
        label: "Unsort",
        action: () => onSort(column.field, null),
        icon: FiArrowUp,
      });
    } else {
      options.push({
        label: "Sort by ASC",
        action: () => onSort(column.field, "asc"),
        icon: FiArrowUp,
      });
      options.push({
        label: "Sort by DESC",
        action: () => onSort(column.field, "desc"),
        icon: FiArrowDown,
      });
    }

    return options;
  };

  const getPinOptions = () => {
    const options = [];

    if (columnState.pinned === "left") {
      options.push({
        label: "Pin to right",
        action: () => onPin(column.field, "right"),
        icon: FiMapPin,
      });
      options.push({
        label: "Unpin",
        action: () => onPin(column.field, null),
        icon: FiMapPin,
      });
    } else if (columnState.pinned === "right") {
      options.push({
        label: "Pin to left",
        action: () => onPin(column.field, "left"),
        icon: FiMapPin,
      });
      options.push({
        label: "Unpin",
        action: () => onPin(column.field, null),
        icon: FiMapPin,
      });
    } else {
      options.push({
        label: "Pin to left",
        action: () => onPin(column.field, "left"),
        icon: FiMapPin,
      });
      options.push({
        label: "Pin to right",
        action: () => onPin(column.field, "right"),
        icon: FiMapPin,
      });
    }

    return options;
  };

  if (column.field === "actions") return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-theme-tertiary transition-colors"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="fixed w-48 bg-theme-primary border border-border-light rounded-lg shadow-xl"
          style={{
            top: `${menuRef.current?.getBoundingClientRect().bottom || 0}px`,
            left: `${
              (menuRef.current?.getBoundingClientRect().right || 0) - 192
            }px`,
            zIndex: 10001,
          }}
        >
          {" "}
          <div className="py-1">
            {/* Sort Options */}
            {column.sortable !== false &&
              getSortOptions().map((option, index) => (
                <button
                  key={`sort-${index}`}
                  onClick={() => handleMenuClick(option.action)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary text-text-primary flex items-center space-x-2"
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              ))}

            {column.sortable !== false && (
              <hr className="my-1 border-border-light" />
            )}

            {/* Pin Options */}
            {getPinOptions().map((option, index) => (
              <button
                key={`pin-${index}`}
                onClick={() => handleMenuClick(option.action)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary text-text-primary flex items-center space-x-2"
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}

            <hr className="my-1 border-border-light" />

            {/* Other Options */}
            <button
              onClick={() => handleMenuClick(() => onHide(column.field))}
              className="w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary text-text-primary flex items-center space-x-2"
            >
              <FiEyeOff className="w-4 h-4" />
              <span>Hide column</span>
            </button>

            <button
              onClick={() => handleMenuClick(onOpenColumnManager)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary text-text-primary flex items-center space-x-2"
            >
              <FiColumns className="w-4 h-4" />
              <span>Manage columns</span>
            </button>

            <button
              onClick={() => handleMenuClick(() => onOpenFilter(column.field))}
              className="w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary text-text-primary flex items-center space-x-2"
            >
              <FiFilter
                className={`w-4 h-4 ${hasFilter ? "text-primary-500" : ""}`}
              />
              <span>Filter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnHeaderMenu;
