import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { CustomSearchProps } from "./Search.types";
import { debounceEventHandler } from "../../../hooks/useDebounce";

export interface SearchRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

export const CustomSearch = forwardRef<SearchRef, CustomSearchProps>(
  (
    {
      id = "search",
      placeholder = "Search for assets",
      value: controlledValue,
      onChange,
      onSearch,
      onClear,
      disabled = false,
      className = "",
      debounceMs = 300,
      autoFocus = false,
      maxLength,
      loading = false,
      size = "md",
      variant = "default",
      showSearchButton = true,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(controlledValue || "");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Use controlled or uncontrolled value
    const inputValue =
      controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = inputValue.length > 0;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => handleClear(),
      getValue: () => inputValue,
    }));

    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(event);
    };

    // Debounced search handler
    const debouncedSearch = debounceEventHandler(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearch?.(event.target.value);
      },
      debounceMs
    );

    // Combined change handler
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(event);
      debouncedSearch(event);
    };

    // Handle clear
    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue("");
      }

      // Create proper synthetic event
      const syntheticEvent = {
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(syntheticEvent);
      onClear?.(); // Remove the syntheticEvent parameter
      onSearch?.("");
      inputRef.current?.focus();
    };

    // Handle search button click
    const handleSearchClick = () => {
      onSearch?.(inputValue);
    };

    // Handle key press
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSearch?.(inputValue);
      }
    };

    // Size configurations
    const sizeConfig = {
      xs: {
        container: "h-8",
        input: "text-sm px-2",
        button: "w-4 h-4",
        icon: "w-2 h-2",
        clearIcon: "w-2 h-2",
      },
      sm: {
        container: "h-12",
        input: "text-sm px-4",
        button: "w-10 h-10",
        icon: "w-4 h-4",
        clearIcon: "w-3 h-3",
      },
      md: {
        container: "h-14",
        input: "text-base px-5",
        button: "w-12 h-12",
        icon: "w-[18px] h-[18px]",
        clearIcon: "w-[14px] h-[14px]",
      },
      lg: {
        container: "h-16",
        input: "text-lg px-6",
        button: "w-14 h-14",
        icon: "w-5 h-5",
        clearIcon: "w-4 h-4",
      },
    };

    const currentSize = sizeConfig[size];

    return (
      <div className={`relative ${className}`}>
        {/* Main Container */}
        <div
          className={`
          relative flex items-center w-full bg-white border border-[#4285F4] 
          rounded-full transition-all duration-200 overflow-hidden
          ${currentSize.container}
          ${
            isFocused
              ? "ring-2 ring-[#4285F4] ring-opacity-20 shadow-lg"
              : "shadow-sm"
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
          ${variant === "compact" ? "max-w-md" : "max-w-[586px]"}
        `}
          style={{
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {/* Input Field */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            maxLength={maxLength}
            className={`
    flex-1 border-0 outline-none bg-transparent font-medium
    placeholder-[#808080] text-gray-900 focus:outline-none focus:ring-0
    ${currentSize.input}
    ${disabled ? "cursor-not-allowed" : ""}
  `}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "100%",
              boxShadow: "none",
              outline: "none",
              border: "none",
            }}
          />

          {/* Right Side Icons */}
          <div className="flex items-center pr-1">
            {/* Show either Clear Button OR Search Button, not both */}
            {hasValue && !loading ? (
              // Clear Button when there's text
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className={`
        flex items-center justify-center rounded-full bg-[#1F3A8A] 
        hover:bg-[#1e3a8a] active:bg-[#1e40af] transition-colors duration-150
        ${currentSize.button}
        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer shadow-md hover:shadow-lg"
        }
      `}
                aria-label="Clear search"
              >
                <HiX
                  className={`${currentSize.icon} text-white`}
                  style={{ strokeWidth: 2 }}
                />
              </button>
            ) : loading ? (
              // Loading Spinner
              <div
                className={`
      flex items-center justify-center rounded-full bg-[#1F3A8A]
      ${currentSize.button}
    `}
              >
                <div
                  className={`animate-spin rounded-full border-2 border-white border-t-transparent ${currentSize.clearIcon}`}
                />
              </div>
            ) : showSearchButton ? (
              // Search Button when no text
              <button
                type="button"
                onClick={handleSearchClick}
                disabled={disabled || loading}
                className={`
        flex items-center justify-center rounded-full bg-[#1F3A8A] 
        hover:bg-[#1e3a8a] active:bg-[#1e40af] transition-colors duration-150
        ${currentSize.button}
        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer shadow-md hover:shadow-lg"
        }
      `}
                aria-label="Search"
              >
                <HiSearch
                  className={`${currentSize.icon} text-white`}
                  style={{ strokeWidth: 2 }}
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

CustomSearch.displayName = "CustomSearch";
