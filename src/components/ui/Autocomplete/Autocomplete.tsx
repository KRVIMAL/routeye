import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { HiChevronDown, HiX, HiCheck, HiSearch } from "react-icons/hi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import {
  AutocompleteProps,
  AutocompleteOption,
  AutocompleteRenderInputParams,
} from "./Autocomplete.types";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

// Default filter function
const defaultFilterOptions = (
  options: AutocompleteOption[],
  { inputValue }: { inputValue: string }
) => {
  const input = inputValue.toLowerCase();
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(input) ||
      option.value.toString().toLowerCase().includes(input)
  );
};

export interface AutocompleteRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export const Autocomplete = forwardRef<AutocompleteRef, AutocompleteProps>(
  (
    {
      id,
      options = [],
      value = null,
      onChange,
      onInputChange,
      placeholder = "Search...",
      label,
      errorMessage,
      helperText,
      disabled = false,
      loading = false,
      multiple = false,
      required = false,
      clearIcon = true,
      showCheckbox = false,
      size = "md",
      variant = "outlined",
      className = "",
      dropdownClassName = "",
      maxDisplayedOptions = 100,
      freeSolo = false,
      filterOptions = defaultFilterOptions,
      renderOption,
      renderInput,
      renderTags,
      noOptionsText = "No options",
      loadingText = "Loading...",
      limitTags = 1,
      fullWidth = true,
      autoHighlight = true,
      autoSelect = false,
      disableClearable = false,
      disableCloseOnSelect = false,
      groupBy,
      isOptionEqualToValue,
      getOptionLabel,
      getOptionDisabled,
    },
    ref
  ) => {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Refs
    const containerRef: any = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    // Outside click
    useOutsideClick(containerRef, () => setIsOpen(false));

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => handleClear(),
    }));

    // Helper functions
    const getOptionLabelFn =
      getOptionLabel || ((option: AutocompleteOption) => option.label);
    const isOptionEqualToValueFn =
      isOptionEqualToValue ||
      ((option: AutocompleteOption, value: AutocompleteOption) =>
        option.value === value.value);
    const getOptionDisabledFn =
      getOptionDisabled ||
      ((option: AutocompleteOption) => option.disabled || false);

    // Get selected values as array
    const selectedValues = useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    // Filter options
    const filteredOptions = useMemo(() => {
      const filtered = filterOptions(options, { inputValue });
      return filtered.slice(0, maxDisplayedOptions);
    }, [options, inputValue, filterOptions, maxDisplayedOptions]);

    // Group options if groupBy is provided
    const groupedOptions = useMemo(() => {
      if (!groupBy) return { "": filteredOptions };

      return filteredOptions.reduce(
        (
          groups: Record<string, AutocompleteOption[]>,
          option: AutocompleteOption
        ) => {
          const group = groupBy(option);
          if (!groups[group]) groups[group] = [];
          groups[group].push(option);
          return groups;
        },
        {} as Record<string, AutocompleteOption[]>
      );
    }, [filteredOptions, groupBy]);

    // Check if option is selected
    const isSelected = useCallback(
      (option: AutocompleteOption) => {
        return selectedValues.some((selected) =>
          isOptionEqualToValueFn(option, selected)
        );
      },
      [selectedValues, isOptionEqualToValueFn]
    );

    // Handle option selection
    const handleOptionSelect = useCallback(
      (option: AutocompleteOption) => {
        if (getOptionDisabledFn(option)) return;

        let newValue: AutocompleteOption | AutocompleteOption[] | null;

        if (multiple) {
          const currentValues = selectedValues;
          const isAlreadySelected = isSelected(option);

          if (isAlreadySelected) {
            newValue = currentValues.filter(
              (val) => !isOptionEqualToValueFn(option, val)
            );
          } else {
            newValue = [...currentValues, option];
          }
        } else {
          newValue = option;
          if (!disableCloseOnSelect) {
            setIsOpen(false);
          }
        }

        // Clear search text after selection
        setInputValue("");
        onChange({ target: { value: newValue } } as any, newValue);
      },
      [
        multiple,
        selectedValues,
        isSelected,
        onChange,
        disableCloseOnSelect,
        isOptionEqualToValueFn,
        getOptionDisabledFn,
      ]
    );

    // Handle input change
    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setHighlightedIndex(autoHighlight ? 0 : -1);

        if (!isOpen) setIsOpen(true);

        onInputChange?.(event, newValue, "input");
      },
      [isOpen, autoHighlight, onInputChange]
    );

    // Handle clear
    const handleClear = useCallback(
      (event?: React.MouseEvent) => {
        event?.stopPropagation();
        setInputValue("");
        setHighlightedIndex(-1);
        onChange({ target: { value: null } } as any, null);
        onInputChange?.({ target: { value: "" } } as any, "", "clear");
      },
      [onChange, onInputChange]
    );

    // Handle tag delete
    const handleTagDelete = useCallback(
      (indexToDelete: number) => {
        if (!multiple || !Array.isArray(value)) return;

        const newValue = (value as AutocompleteOption[]).filter(
          (_, index) => index !== indexToDelete
        );
        onChange({ target: { value: newValue } } as any, newValue);
      },
      [multiple, value, onChange]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setHighlightedIndex((prev) =>
                prev < filteredOptions.length - 1 ? prev + 1 : 0
              );
            }
            break;

          case "ArrowUp":
            event.preventDefault();
            if (isOpen) {
              setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredOptions.length - 1
              );
            }
            break;

          case "Enter":
            event.preventDefault();
            if (isOpen && highlightedIndex >= 0) {
              handleOptionSelect(filteredOptions[highlightedIndex]);
            } else if (!isOpen) {
              setIsOpen(true);
            }
            break;

          case "Escape":
            setIsOpen(false);
            setInputValue("");
            inputRef.current?.blur();
            break;

          case "Tab":
            if (autoSelect && isOpen && highlightedIndex >= 0) {
              handleOptionSelect(filteredOptions[highlightedIndex]);
            }
            setIsOpen(false);
            break;
        }
      },
      [
        isOpen,
        highlightedIndex,
        filteredOptions,
        handleOptionSelect,
        autoSelect,
      ]
    );

    // Size configurations
    const sizeConfig = {
      sm: {
        input: "h-8 text-sm",
        dropdown: "text-sm",
        option: "px-3 py-1.5 text-sm",
        tag: "px-2 py-0.5 text-xs",
        icon: "w-4 h-4",
        labelOffset: "ml-3",
      },
      md: {
        input: "h-10 text-base",
        dropdown: "text-base",
        option: "px-3 py-2 text-base",
        tag: "px-2 py-1 text-sm",
        icon: "w-5 h-5",
        labelOffset: "ml-3",
      },
      lg: {
        input: "h-12 text-lg",
        dropdown: "text-lg",
        option: "px-4 py-3 text-lg",
        tag: "px-3 py-1.5 text-base",
        icon: "w-6 h-6",
        labelOffset: "ml-4",
      },
    };

    const currentSize = sizeConfig[size];

    // Render selected tags
    const renderSelectedTags = () => {
      if (!multiple || selectedValues.length === 0) return null;

      if (renderTags) {
        return renderTags(selectedValues, (index: number) => ({
          key: index,
          className: `inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md ${currentSize.tag}`,
          onDelete: (event: React.SyntheticEvent) => {
            event.stopPropagation();
            handleTagDelete(index);
          },
        }));
      }

      const displayedTags = selectedValues.slice(0, limitTags);
      const remainingCount = selectedValues.length - limitTags;

      return (
        <div className="flex items-center gap-1 flex-wrap">
          {displayedTags?.map((option: AutocompleteOption, index: number) => (
            <span
              key={index}
              className={`inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md ${currentSize.tag}`}
            >
              {getOptionLabelFn(option)}
              {!disabled && !disableClearable && (
                <button
                  type="button"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleTagDelete(index);
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <HiX className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {remainingCount > 0 && (
            <span
              className={`inline-flex items-center gap-1 bg-gray-100 text-gray-600 rounded-md ${currentSize.tag}`}
            >
              +{remainingCount}
            </span>
          )}
        </div>
      );
    };

    // Render input value
    const getInputDisplayValue = () => {
      if (multiple) return inputValue;
      if (!value || Array.isArray(value)) return inputValue;
      return isOpen ? inputValue : getOptionLabelFn(value);
    };

    // Default input renderer
    const defaultRenderInput = (params: AutocompleteRenderInputParams) => (
      <div className="relative">
        {/* Normal Label - for outlined and filled variants */}
        {label && variant !== "floating" && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
            style={{ marginLeft: "12px" }} // Match pl-3 (12px)
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {/* Floating Label - for floating variant */}
        {label && variant === "floating" && (
          <label
            htmlFor={id}
            className="absolute -top-3 px-1 bg-white text-gray-700 font-medium text-sm z-10"
            style={{ left: "9px" }} // Exactly match pl-3 padding
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div
          className={`
    relative flex items-center border rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-200
    ${
      variant === "filled"
        ? "bg-gray-50"
        : variant === "floating"
        ? "bg-white"
        : "bg-white"
    }
    ${
      errorMessage
        ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-200"
        : "border-gray-300 focus-within:border-blue-500"
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
    ${fullWidth ? "w-full" : ""}
    ${currentSize.input}
  `}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          {/* Tags for multiple selection */}
          {multiple && selectedValues.length > 0 && (
            <div className="flex-1 min-w-0 pl-3">{renderSelectedTags()}</div>
          )}

          {/* Input field */}
          <input
            {...params.inputProps}
            ref={inputRef}
            id={id}
            type="text"
            value={getInputDisplayValue()}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={
              multiple && selectedValues.length > 0 ? "" : placeholder
            }
            disabled={disabled}
            className={`
    flex-1 min-w-0 border-0 outline-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent
    ${multiple && selectedValues.length > 0 ? "pl-1" : "pl-3"} pr-12
    ${disabled ? "cursor-not-allowed" : ""}
  `}
            style={{
              boxShadow: "none",
              outline: "none",
              border: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }}
          />

          {/* End adornments */}
          <div className="flex items-center gap-1 ml-2">
            {loading && (
              <div className="animate-spin rounded-full border-2 border-blue-500 border-t-transparent w-4 h-4" />
            )}

            {!disableClearable &&
              clearIcon &&
              (value || inputValue) &&
              !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="hover:bg-gray-100 rounded-full p-1"
                >
                  <HiX className={currentSize.icon} />
                </button>
              )}

            <HiChevronDown
              className={`${
                currentSize.icon
              } text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
    );

    // Render option
    const renderOptionItem = (option: AutocompleteOption, index: number) => {
      const isHighlighted = index === highlightedIndex;
      const isOptionSelected = isSelected(option);
      const isDisabled = getOptionDisabledFn(option);

      const defaultOptionProps: React.HTMLAttributes<HTMLLIElement> | any = {
        key: option.value.toString(),
        role: "option",
        "aria-selected": isOptionSelected,
        className: `
        flex items-center justify-between cursor-pointer transition-colors
        ${currentSize.option}
        ${isHighlighted ? "bg-blue-50" : ""}
        ${isOptionSelected ? "bg-blue-100 text-blue-900" : "text-gray-900"}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
      `,
        onClick: () => !isDisabled && handleOptionSelect(option),
      };

      if (renderOption) {
        return renderOption(defaultOptionProps, option);
      }

      return (
        <li {...defaultOptionProps}>
          <div className="flex items-center flex-1 min-w-0">
            {/* Checkbox - Show for multiple or when showCheckbox is true */}
            {(multiple || showCheckbox) && (
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`
                w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
                ${
                  isOptionSelected
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${isDisabled ? "opacity-50" : ""}
              `}
                >
                  {isOptionSelected && (
                    <HiCheck className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            )}

            {/* Option Icon */}
            {option.icon && (
              <span className="flex-shrink-0 mr-2">{option.icon}</span>
            )}

            {/* Option Content */}
            <div className="flex-1 min-w-0">
              <div className="truncate">{getOptionLabelFn(option)}</div>
              {option.description && (
                <div className="text-sm text-gray-500 truncate">
                  {option.description}
                </div>
              )}
            </div>
          </div>

          {/* Check mark for single selection without checkbox */}
          {!multiple && !showCheckbox && isOptionSelected && (
            <HiCheck
              className={`${currentSize.icon} text-blue-600 flex-shrink-0`}
            />
          )}
        </li>
      );
    };

    // Render dropdown content
    const renderDropdownContent = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className="ml-2 text-gray-500">{loadingText}</span>
          </div>
        );
      }

      if (filteredOptions.length === 0) {
        return (
          <div className="py-8 text-center text-gray-500">{noOptionsText}</div>
        );
      }

      if (groupBy) {
        return (
          <div className="max-h-60 overflow-auto">
            {Object.entries(groupedOptions)?.map(
              ([group, groupOptions]: [string, AutocompleteOption[]]) => (
                <div key={group}>
                  {group && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      {group}
                    </div>
                  )}
                  <ul role="listbox">
                    {groupOptions?.map(
                      (option: AutocompleteOption, index: number) =>
                        renderOptionItem(option, index)
                    )}
                  </ul>
                </div>
              )
            )}
          </div>
        );
      }

      return (
        <ul role="listbox" className="max-h-60 overflow-auto py-1">
          {filteredOptions?.map((option: AutocompleteOption, index: number) =>
            renderOptionItem(option, index)
          )}
        </ul>
      );
    };

    return (
      <div
        className={`relative ${fullWidth ? "w-full" : ""} ${className}`}
        ref={containerRef}
      >
        {renderInput
          ? renderInput({
              className: "",
              disabled,
              fullWidth,
              id,
              size,
              inputProps: {
                value: getInputDisplayValue(),
                onChange: handleInputChange,
                onKeyDown: handleKeyDown,
                onFocus: () => setIsOpen(true),
                placeholder:
                  multiple && selectedValues.length > 0 ? "" : placeholder,
                disabled,
              },
              InputLabelProps: {},
              InputProps: {
                ref: inputRef,
                className: "",
                startAdornment: multiple ? renderSelectedTags() : undefined,
                endAdornment: (
                  <div className="flex items-center gap-1">
                    {loading && (
                      <div className="animate-spin rounded-full border-2 border-blue-500 border-t-transparent w-4 h-4" />
                    )}
                    {!disableClearable &&
                      clearIcon &&
                      (value || inputValue) &&
                      !disabled && (
                        <button type="button" onClick={handleClear}>
                          <HiX className={currentSize.icon} />
                        </button>
                      )}
                    <HiChevronDown
                      className={`${currentSize.icon} transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                ),
              },
            })
          : defaultRenderInput({
              className: "",
              disabled,
              fullWidth,
              id,
              size,
              inputProps: {},
              InputLabelProps: {},
              InputProps: { ref: inputRef, className: "" },
            })}

        {/* Dropdown */}
        {isOpen && (
          <div
            className={`
            absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
            ${dropdownClassName}
          `}
          >
            {renderDropdownContent()}
          </div>
        )}

        {/* Error/Helper Text */}
        {(errorMessage || helperText) && (
          <div className="mt-1 text-sm">
            {errorMessage && (
              <span className="text-red-600">{errorMessage}</span>
            )}
            {!errorMessage && helperText && (
              <span className="text-gray-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = "Autocomplete";
