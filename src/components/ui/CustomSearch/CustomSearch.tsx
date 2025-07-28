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
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      responsive = true,
      fullWidth = false,
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

    // Update size configurations for responsive design
    const sizeConfig = {
      sm: {
        container: "h-10", // Default height
        input: "text-sm px-3 sm:px-4",
        button: "w-8 h-8 sm:w-10 sm:h-10",
        icon: "w-3 h-3 sm:w-4 sm:h-4",
        clearIcon: "w-2 h-2 sm:w-3 sm:h-3",
      },
      md: {
        container: "h-12 sm:h-14", // Responsive height
        input: "text-sm sm:text-base px-4 sm:px-5",
        button: "w-10 h-10 sm:w-12 sm:h-12",
        icon: "w-4 h-4 sm:w-[18px] sm:h-[18px]",
        clearIcon: "w-3 h-3 sm:w-[14px] sm:h-[14px]",
      },
      lg: {
        container: "h-14 sm:h-16",
        input: "text-base sm:text-lg px-5 sm:px-6",
        button: "w-12 h-12 sm:w-14 sm:h-14",
        icon: "w-4 h-4 sm:w-5 sm:h-5",
        clearIcon: "w-3 h-3 sm:w-4 sm:h-4",
      },
    };

    const currentSize = sizeConfig[size];

    // Generate custom styles for dimensions
    const customStyles: React.CSSProperties = {
      fontFamily: "Poppins, sans-serif",
      ...(width && { width: typeof width === "number" ? `${width}px` : width }),
      ...(height && {
        height: typeof height === "number" ? `${height}px` : height,
      }),
      ...(minWidth && {
        minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
      }),
      ...(maxWidth && {
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      }),
      ...(minHeight && {
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      }),
      ...(maxHeight && {
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      }),
    };

    // Get responsive classes
    const getResponsiveClasses = () => {
      let classes = `
      relative flex items-center bg-white border border-[#4285F4] 
      rounded-full transition-all duration-200 overflow-hidden
      ${responsive ? currentSize.container : height ? "" : "h-14"}
      ${
        isFocused
          ? "ring-2 ring-[#4285F4] ring-opacity-20 shadow-lg"
          : "shadow-sm"
      }
      ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
      ${className}
    `;

      // Width classes
      if (fullWidth) {
        classes += " w-full";
      } else if (!width) {
        if (variant === "compact") {
          classes += " w-full max-w-md";
        } else {
          classes += " w-full max-w-[586px]";
        }
      }

      // Responsive adjustments
      if (responsive) {
        classes += " min-w-[200px] sm:min-w-[300px]";
      }

      return classes;
    };

    return (
      <div className={`relative ${fullWidth ? "w-full" : ""}`}>
        {/* Main Container */}
        <div className={getResponsiveClasses()} style={customStyles}>
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
            ${responsive ? currentSize.input : "text-base px-5"}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: responsive
                ? "clamp(14px, 2.5vw, 16px)" // Responsive font size
                : "16px",
              lineHeight: "100%",
              boxShadow: "none",
              outline: "none",
              border: "none",
            }}
          />

          {/* Right Side Icons */}
          <div className="flex items-center pr-1">
            {hasValue && !loading ? (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className={`
                flex items-center justify-center rounded-full bg-[#1F3A8A] 
                hover:bg-[#1e3a8a] active:bg-[#1e40af] transition-colors duration-150
                ${responsive ? currentSize.button : "w-12 h-12"}
                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer shadow-md hover:shadow-lg"
                }
              `}
                aria-label="Clear search"
              >
                <HiX
                  className={`${
                    responsive ? currentSize.icon : "w-[18px] h-[18px]"
                  } text-white`}
                  style={{ strokeWidth: 2 }}
                />
              </button>
            ) : loading ? (
              <div
                className={`
              flex items-center justify-center rounded-full bg-[#1F3A8A]
              ${responsive ? currentSize.button : "w-12 h-12"}
            `}
              >
                <div
                  className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
                    responsive ? currentSize.clearIcon : "w-[14px] h-[14px]"
                  }`}
                />
              </div>
            ) : showSearchButton ? (
              <button
                type="button"
                onClick={handleSearchClick}
                disabled={disabled || loading}
                className={`
                flex items-center justify-center rounded-full bg-[#1F3A8A] 
                hover:bg-[#1e3a8a] active:bg-[#1e40af] transition-colors duration-150
                ${responsive ? currentSize.button : "w-12 h-12"}
                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer shadow-md hover:shadow-lg"
                }
              `}
                aria-label="Search"
              >
                <HiSearch
                  className={`${
                    responsive ? currentSize.icon : "w-[18px] h-[18px]"
                  } text-white`}
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
