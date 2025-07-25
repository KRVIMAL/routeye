import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { useTheme } from "../../../hooks/useTheme";
import { SelectProps, SelectOption } from "./Select.types";

export interface SelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

// Hook for outside click detection
function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Select an option...",
      disabled = false,
      loading = false,
      error,
      helperText,
      label,
      required = false,
      searchable = false,
      multiSelect = false,
      clearable = false,
      size = "lg",
      maxHeight = 200,
      className = "",
      dropdownClassName = "",
      optionClassName = "",
      onSearch,
      renderOption,
      renderValue,
      asteriskPosition = "right",
      fullWidth = true,
      onBlur,
      validateOnBlur = false,
      variant = "floating",
    },
    ref
  ) => {
    const { theme } = useTheme();

    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Refs
    const selectRef = useRef<HTMLDivElement | any>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Outside click handler
    // Update the outside click handler:
    useOutsideClick(selectRef, () => {
      setIsOpen(false);
      setSearchTerm(""); // Clear search when closing
    });
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => triggerRef.current?.focus(),
      blur: () => triggerRef.current?.blur(),
      clear: () => handleClear(),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    // Filter options by search term
    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);

    // Get selected options
    const selectedOptions = useMemo(() => {
      if (!value) return [];
      const values = Array.isArray(value) ? value : [value];
      return options.filter((option) => values.includes(option.value));
    }, [value, options]);

    // Check if option is selected
    const isSelected = useCallback(
      (option: SelectOption) => {
        if (!value) return false;
        if (Array.isArray(value)) {
          return value.includes(option.value);
        }
        return value === option.value;
      },
      [value]
    );

    // Handle option selection
    const handleSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        if (multiSelect) {
          const currentValues = Array.isArray(value) ? value : [];
          const newValues = isSelected(option)
            ? currentValues.filter((v) => v !== option.value)
            : [...currentValues, option.value];
          onChange(newValues);
        } else {
          onChange(option.value);
          setIsOpen(false);
          setSearchTerm("");
        }
      },
      [multiSelect, value, isSelected, onChange]
    );

    // Handle clear
    const handleClear = useCallback(
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange(multiSelect ? [] : null);
        setSearchTerm("");
      },
      [multiSelect, onChange]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Don't handle keyboard events if search input is focused
        if (
          searchable &&
          isOpen &&
          document.activeElement?.tagName === "INPUT"
        ) {
          if (e.key === "Escape") {
            setIsOpen(false);
            setSearchTerm("");
            triggerRef.current?.focus();
          }
          return;
        }

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setFocusedIndex((prev) =>
                prev < filteredOptions.length - 1 ? prev + 1 : 0
              );
            }
            break;

          case "ArrowUp":
            e.preventDefault();
            if (isOpen) {
              setFocusedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredOptions.length - 1
              );
            }
            break;

          case "Enter":
            e.preventDefault();
            if (isOpen && focusedIndex >= 0) {
              handleSelect(filteredOptions[focusedIndex]);
            } else if (!isOpen) {
              setIsOpen(true);
            }
            break;

          case "Escape":
            setIsOpen(false);
            setSearchTerm("");
            triggerRef.current?.focus();
            break;

          case "Tab":
            setIsOpen(false);
            break;
        }
      },
      [isOpen, focusedIndex, filteredOptions, handleSelect, searchable]
    );
    const handleBlur = useCallback(() => {
      if (onBlur) {
        onBlur(value);
      }
    }, [onBlur, value]);

    // Size configurations
    const sizeConfig = {
      sm: {
        trigger: "h-8 px-3 text-sm",
        dropdown: "text-sm",
        option: "px-3 py-2 text-sm",
        iconSize: "w-4 h-4",
        labelLeft: "left-3",
      },
      md: {
        trigger: "h-10 px-3 text-base",
        dropdown: "text-base",
        option: "px-3 py-2.5 text-base",
        iconSize: "w-5 h-5",
        labelLeft: "left-3",
      },
      lg: {
        trigger: "h-12 px-3 text-base",
        dropdown: "text-base",
        option: "px-3 py-3 text-base",
        iconSize: "w-5 h-5",
        labelLeft: "left-3",
      },
    };

    const currentSize = sizeConfig[size];

    // Render selected value display
    // Replace the renderSelectedValue function:
    const renderSelectedValue = () => {
      if (selectedOptions.length === 0) {
        return <span className="text-text-secondary">{placeholder}</span>;
      }

      if (renderValue) {
        return renderValue(multiSelect ? selectedOptions : selectedOptions[0]);
      }

      if (multiSelect) {
        if (selectedOptions.length === 1) {
          return (
            <span className="text-text-primary">
              {selectedOptions[0].label}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <span className="text-text-primary">
              {selectedOptions[0].label}
            </span>
            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              +{selectedOptions.length - 1}
            </span>
          </div>
        );
      }

      return (
        <span className="text-text-primary">{selectedOptions[0].label}</span>
      );
    };

    // Render option item
    // Replace the renderOptionItem function:
    const renderOptionItem = (option: SelectOption, index: number) => {
      const selected = isSelected(option);
      const focused = index === focusedIndex;
      const isLast = index === filteredOptions.length - 1;

      return (
        <div
          key={option.value}
          role="option"
          aria-selected={selected}
          className={`
        flex items-center justify-between cursor-pointer transition-colors
        ${currentSize.option}
        ${!isLast ? "border-b border-[#F3F4F6]" : ""}
        ${focused ? "bg-surface-hover" : ""}
        ${selected ? "bg-primary-50 text-primary-700" : "text-text-primary"}
        ${
          option.disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-surface-hover"
        }
        ${optionClassName}
      `}
          onClick={() => !option.disabled && handleSelect(option)}
        >
          <div className="flex items-center flex-1">
            {multiSelect && (
              <div className="mr-3">
                <div
                  className={`
                w-5 h-5 border-2 rounded flex items-center justify-center
                ${
                  selected
                    ? "bg-primary-500 border-primary-500"
                    : "border-border-default"
                }
              `}
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {renderOption ? (
              renderOption(option, selected)
            ) : (
              <span>{option.label}</span>
            )}
          </div>
        </div>
      );
    };

    // Render dropdown content
    const renderDropdownContent = () => {
      // In renderDropdownContent, replace the loading section:
      if (loading) {
        return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-text-secondary">Loading options...</span>
          </div>
        );
      }

      if (filteredOptions.length === 0) {
        return (
          <div className="py-8 text-center text-text-secondary">
            {searchTerm ? "No options found" : "No options available"}
          </div>
        );
      }

      return (
        <div style={{ maxHeight, overflowY: "auto" }} className="py-2">
          {filteredOptions.map((option, index) =>
            renderOptionItem(option, index)
          )}
        </div>
      );
    };

    // Replace the entire return JSX with this updated version:
    return (
      <div
        className={`relative ${fullWidth ? "w-full" : ""} ${className}`}
        ref={selectRef}
      >
        {/* Label - Normal variant (top) */}
        {label && variant === "normal" && (
          <label className="block text-text-primary font-medium text-sm mb-2">
            {required && asteriskPosition === "left" && (
              <span className="text-red-500 mr-1">*</span>
            )}
            {label}
            {required && asteriskPosition === "right" && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        {/* Floating Label - Floating variant */}
        {label && variant === "floating" && (
          <label
            className={`absolute -top-3 ${currentSize.labelLeft} px-1 bg-background text-text-primary font-medium text-sm z-10`}
          >
            {required && asteriskPosition === "left" && (
              <span className="text-red-500 mr-1">*</span>
            )}
            {label}
            {required && asteriskPosition === "right" && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        {/* Select Trigger */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`
        w-full flex items-center justify-between rounded-lg border-2 transition-all outline-none
        ${currentSize.trigger}
        ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-border-default focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-surface-disabled"
            : "bg-background cursor-pointer hover:border-primary-400"
        }
        focus:outline-none
      `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${label}-label` : undefined}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${label}-error`
              : helperText
              ? `${label}-helper`
              : undefined
          }
        >
          <span className="flex-1 text-left truncate">
            {renderSelectedValue()}
          </span>

          <div className="flex items-center ml-2">
            {isOpen ? (
              <HiChevronUp
                className={`${currentSize.iconSize} text-text-secondary`}
              />
            ) : (
              <HiChevronDown
                className={`${currentSize.iconSize} text-text-secondary`}
              />
            )}
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={`
      absolute z-50 w-full mt-1 bg-background border border-[#DBDBDB] rounded-lg shadow-xl
      ${dropdownClassName}
    `}
            role="listbox"
            aria-multiselectable={multiSelect}
          >
            {/* Search Input - Add this section */}
            {searchable && (
              <div className="p-3 border-b border-[#F3F4F6]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border-default rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 bg-background text-text-primary placeholder-text-secondary"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Label in dropdown (for multiselect with selections) */}
            {multiSelect && selectedOptions.length > 0 && (
              <div className="px-3 py-2 border-b border-[#F3F4F6]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                      {selectedOptions[0].label}
                    </span>
                    {selectedOptions.length > 1 && (
                      <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                        +{selectedOptions.length - 1}
                      </span>
                    )}
                    <HiChevronUp className="w-4 h-4 text-text-secondary" />
                  </div>
                </div>
              </div>
            )}

            {renderDropdownContent()}
          </div>
        )}
        {/* Error/Helper Text */}
        {(error || helperText) && (
          <div className="mt-1 text-sm">
            {error && (
              <span id={`${label}-error`} className="text-red-600">
                {error}
              </span>
            )}
            {!error && helperText && (
              <span id={`${label}-helper`} className="text-text-secondary">
                {helperText}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
