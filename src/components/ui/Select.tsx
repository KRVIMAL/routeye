// src/components/ui/Select.tsx - Custom Select Component
import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiX, FiSearch, FiCheck } from "react-icons/fi";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[] | any;
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  className?: string;
  maxHeight?: number;
  renderOption?: (option: SelectOption) => React.ReactNode;
  noOptionsMessage?: string;
  loadingMessage?: string;
  onSearchChange?: (searchTerm: string) => void;
  required?: boolean;
  size?: any;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
  helper,
  disabled = false,
  searchable = true,
  clearable = true,
  multiple = false,
  loading = false,
  className = "",
  maxHeight = 200,
  renderOption,
  noOptionsMessage = "No options found",
  loadingMessage = "Loading...",
  onSearchChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Handle search term changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if (onSearchChange) {
      onSearchChange(newSearchTerm);
    }
  };

  // Filter options based on search term (only if no external search handler)
  const filteredOptions = onSearchChange
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Get selected options
  // Get selected options - add null check
  const selectedOptions: any = multiple
    ? options.filter(
        (option) => Array.isArray(value) && value.includes(option.value)
      )
    : value
    ? options.find((option) => option.value === value)
    : null; // Add null fallback

  // Handle option selection
  const handleSelect = (selectedOption: SelectOption) => {
    if (selectedOption.disabled) return;

    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const isSelected = currentValue.includes(selectedOption.value);

      if (isSelected) {
        const newValue = currentValue.filter((v) => v !== selectedOption.value);
        onChange(newValue.length > 0 ? newValue : null);
      } else {
        onChange([...currentValue, selectedOption.value]);
      }
    } else {
      onChange(selectedOption.value);
      setIsOpen(false);
      handleSearchChange("");
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    handleSearchChange("");
  };

  // Handle remove single item in multiple mode
  const handleRemoveItem = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((v) => v !== optionValue);
      onChange(newValue.length > 0 ? newValue : null);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        handleSearchChange("");
        setHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case "Backspace":
        if (
          multiple &&
          Array.isArray(value) &&
          value.length > 0 &&
          searchTerm === ""
        ) {
          const newValue = value.slice(0, -1);
          onChange(newValue.length > 0 ? newValue : null);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        handleSearchChange("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-body-small font-medium text-text-primary mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}{" "}
          {/* Add this line */}
        </label>
      )}

      <div
        ref={selectRef}
        className={`relative ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {/* Main Select Button */}
        <div
          id={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          className={`
            input min-h-[42px] flex items-center justify-between
            ${error ? "border-error-500 focus:border-error-500" : ""}
            ${isOpen ? "border-primary-500 ring-2 ring-primary-100" : ""}
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex-1 flex items-center gap-1 flex-wrap min-h-[24px]">
            {/* Multiple selected items */}
            {multiple && Array.isArray(value) && value.length > 0 ? (
              selectedOptions.map((option: any) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(option.value, e)}
                    className="hover:text-primary-600 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : /* Single selected item */
            !multiple && selectedOptions && value ? (
              <span className="text-text-primary">{selectedOptions.label}</span>
            ) : (
              <span className="text-text-muted">{placeholder}</span>
            )}
          </div>
          {/* Right side buttons */}
          <div className="flex items-center gap-1 ml-2">
            {/* Loading spinner */}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
            )}

            {/* Clear button */}
            {clearable &&
              !loading &&
              (multiple ? Array.isArray(value) && value.length > 0 : value) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-text-muted hover:text-text-secondary transition-colors p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}

            {/* Dropdown arrow */}
            <FiChevronDown
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-dropdown w-full mt-1 bg-theme-primary border border-border-light rounded-lg shadow-lg">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-border-light">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    required
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      handleSearchChange(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    placeholder="Search options..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-theme-secondary border border-border-light rounded-md focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div
              ref={optionsRef}
              className="py-1 overflow-auto"
              style={{ maxHeight: `${maxHeight}px` }}
              role="listbox"
            >
              {loading ? (
                <div className="px-3 py-2 text-sm text-text-muted text-center">
                  {loadingMessage}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-muted text-center">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      className={`
                        px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between
                        ${isHighlighted ? "bg-primary-50 text-primary-900" : ""}
                        ${
                          isSelected
                            ? "bg-primary-100 text-primary-900"
                            : "text-text-primary"
                        }
                        ${
                          option.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-theme-tertiary"
                        }
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="flex-1">
                        {renderOption ? renderOption(option) : option.label}
                      </span>
                      {isSelected && (
                        <FiCheck className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-caption text-error-600">{error}</p>}

      {/* Helper text */}
      {helper && !error && (
        <p className="mt-1 text-caption text-text-muted">{helper}</p>
      )}
    </div>
  );
};

export default Select;
