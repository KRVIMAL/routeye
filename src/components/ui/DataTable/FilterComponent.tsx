// src/components/ui/DataTable/FilterComponent.tsx - Enhanced with better UX
import React, { useState, useRef, useEffect } from "react";
import { FiX, FiPlus, FiFilter } from "react-icons/fi";
import Button from "../Button";
import CustomInput from "../CustomInput";
import Select from "../Select";
import { Column, FilterCondition } from "./types";

interface FilterComponentProps {
  columns: Column[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement> | any;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  columns,
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  anchorRef,
}) => {
  const filterRef = useRef<HTMLDivElement>(null);
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>(filters);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Filter operators with labels
  const operatorOptions = [
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Does not contain" },
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Does not equal" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "greaterThan", label: "Greater than" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThanOrEqual", label: "Greater than or equal" },
    { value: "lessThanOrEqual", label: "Less than or equal" },
    { value: "isEmpty", label: "Is empty" },
    { value: "isNotEmpty", label: "Is not empty" },
  ];

  // Get filterable columns
  const filterableColumns = columns.filter(
    (col) => col.filterable !== false && col.field !== "actions"
  );

  const columnOptions = filterableColumns.map((col) => ({
    value: col.field,
    label: col.headerName,
  }));

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: filterableColumns[0]?.field || "",
      operator: "contains",
      value: "",
    };
    const updatedFilters = [...localFilters, newFilter];
    setLocalFilters(updatedFilters);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = localFilters.filter((f) => f.id !== filterId);
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const updateFilter = (
    filterId: string,
    field: keyof FilterCondition,
    value: any
  ) => {
    const updatedFilters = localFilters.map((filter) =>
      filter.id === filterId ? { ...filter, [field]: value } : filter
    );
    setLocalFilters(updatedFilters);
  };

  const applyFilters = () => {
    // Only apply filters that have a value (except for isEmpty/isNotEmpty)
    const validFilters = localFilters.filter(
      (filter) =>
        filter.value.trim() !== "" ||
        filter.operator === "isEmpty" ||
        filter.operator === "isNotEmpty"
    );
    onFiltersChange(validFilters);
    onClose();
  };

  const clearAllFilters = () => {
    setLocalFilters([]);
    onFiltersChange([]);
  };

  const resetFilters = () => {
    setLocalFilters(filters);
  };

  // Get operator options based on column type
  const getOperatorOptions = (columnField: string) => {
    const column = columns.find((col) => col.field === columnField);
    const columnType = column?.type || "string";

    switch (columnType) {
      case "number":
        return operatorOptions.filter((op) =>
          [
            "equals",
            "notEquals",
            "greaterThan",
            "lessThan",
            "greaterThanOrEqual",
            "lessThanOrEqual",
            "isEmpty",
            "isNotEmpty",
          ].includes(op.value)
        );
      case "boolean":
        return operatorOptions.filter((op) =>
          ["equals", "notEquals", "isEmpty", "isNotEmpty"].includes(op.value)
        );
      case "date":
        return operatorOptions.filter((op) =>
          [
            "equals",
            "notEquals",
            "greaterThan",
            "lessThan",
            "greaterThanOrEqual",
            "lessThanOrEqual",
            "isEmpty",
            "isNotEmpty",
          ].includes(op.value)
        );
      default:
        return operatorOptions;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={filterRef}
      className="fixed bg-theme-primary border border-border-light rounded-lg shadow-xl w-96 z-[10000]"
      style={{
        top: `${
          (anchorRef.current?.getBoundingClientRect().bottom || 0) + 8
        }px`,
        left: `${anchorRef.current?.getBoundingClientRect().left || 0}px`,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="w-4 h-4 text-primary-500" />
            <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-theme-tertiary text-text-muted hover:text-text-primary"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Filters List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {localFilters.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FiFilter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No filters applied</p>
              <p className="text-sm">Click "Add Filter" to get started</p>
            </div>
          ) : (
            localFilters.map((filter, index) => (
              <div
                key={filter.id}
                className="p-3 border border-border-light rounded-lg bg-theme-secondary space-y-3"
              >
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">
                    Filter {index + 1}
                  </span>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-1 rounded hover:bg-theme-tertiary text-text-muted hover:text-red-500"
                    title="Remove filter"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>

                {/* Column Selection */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Column
                  </label>
                  <Select
                    options={columnOptions}
                    value={filter.column}
                    onChange={(value) =>
                      updateFilter(filter.id, "column", value as string)
                    }
                    placeholder="Select column"
                    size="sm"
                    searchable={false}
                    clearable={false}
                  />
                </div>

                {/* Operator Selection */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Operator
                  </label>
                  <Select
                    options={getOperatorOptions(filter.column)}
                    value={filter.operator}
                    onChange={(value) =>
                      updateFilter(filter.id, "operator", value as string)
                    }
                    placeholder="Select operator"
                    size="sm"
                    searchable={false}
                    clearable={false}
                  />
                </div>

                {/* Value Input (hide for isEmpty/isNotEmpty) */}
                {!["isEmpty", "isNotEmpty"].includes(filter.operator) && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Value
                    </label>
                    <CustomInput
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(filter.id, "value", e.target.value)
                      }
                      placeholder="Enter filter value"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-border-light">
          {/* Add Filter Button */}
          <Button
            variant="secondary"
            onClick={addFilter}
            className="flex items-center justify-center space-x-2 w-full"
            disabled={filterableColumns.length === 0}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Filter</span>
          </Button>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={resetFilters}
              className="flex-1"
              disabled={
                JSON.stringify(localFilters) === JSON.stringify(filters)
              }
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={clearAllFilters}
              className="flex-1"
              disabled={localFilters.length === 0}
            >
              Clear All
            </Button>
            <Button variant="primary" onClick={applyFilters} className="flex-1">
              Apply
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        {localFilters.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border-light">
            <p className="text-xs text-text-muted">
              {localFilters.length} filter{localFilters.length !== 1 ? "s" : ""}{" "}
              will be applied
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterComponent;
