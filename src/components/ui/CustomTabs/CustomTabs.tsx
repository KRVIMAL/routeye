import React, { useState, useEffect, useRef } from "react";
import { CustomTabsProps, TabConfig } from "./Tabs.types";

export const CustomTabs: React.FC<CustomTabsProps> = ({
  tabConfig,
  selected,
  onChange,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  className = "",
  showCounts = true,
  allowDeselect = false,
  scrollable = false,
  centered = false,
}) => {
  const [activeTab, setActiveTab] = useState(selected);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(selected);
  }, [selected]);

  const handleTabClick = (tabLabel: string, disabled?: boolean) => {
    if (disabled) return;

    if (allowDeselect && activeTab === tabLabel) {
      setActiveTab("");
      onChange("");
    } else {
      setActiveTab(tabLabel);
      onChange(tabLabel);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      text: "text-xs",
      padding: "px-2 py-1",
      gap: "gap-1",
      borderRadius: "rounded-md",
      countSize: "w-4 h-4 text-xs",
    },
    md: {
      text: "text-xs",
      padding: "px-3 py-2",
      gap: "gap-2",
      borderRadius: "rounded-xl",
      countSize: "w-6 h-6 text-xs",
    },
    lg: {
      text: "text-sm",
      padding: "px-4 py-3",
      gap: "gap-3",
      borderRadius: "rounded-2xl",
      countSize: "w-7 h-7 text-sm",
    },
  };

  const currentSize = sizeConfig[size];

  // Get tab styling based on active state
  const getTabStyles = (isActive: boolean, disabled?: boolean) => {
    const isStacked = orientation === "vertical-stacked";

    const baseStyles = `
    ${
      isStacked
        ? "flex flex-col items-center justify-center text-center"
        : "inline-flex items-center"
    } 
    font-bold capitalize transition-all duration-200 cursor-pointer
    ${currentSize.text} ${currentSize.padding} ${
      isStacked ? "gap-2" : currentSize.gap
    } ${currentSize.borderRadius}
    tracking-wider leading-none w-fit
    ${isStacked ? "min-w-[80px] py-4" : ""}
  `;

    if (disabled) {
      return `${baseStyles} bg-gray-200 text-gray-400 cursor-not-allowed opacity-50`;
    }

    if (isActive) {
      return `${baseStyles} bg-[#1F3A8A] text-white shadow-lg`;
    }

    return `${baseStyles} bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200 `;
  };

  // Get count badge styling
  const getCountStyles = (isActive: boolean) => {
    const baseStyles = `
      inline-flex items-center justify-center font-bold rounded-full
      ${currentSize.countSize}
    `;

    if (isActive) {
      return `${baseStyles} bg-[#4D62A2] text-white`;
    }

    return `${baseStyles} bg-[#E5E7EB] text-[#4B5563]`;
  };

  // Container styles based on orientation
  const getContainerStyles = () => {
    const baseStyles = `
    ${
      orientation === "vertical" || orientation === "vertical-stacked"
        ? "flex flex-col space-y-2 items-start"
        : "flex flex-row space-x-2 items-center"
    }
    ${centered && orientation === "horizontal" ? "justify-center" : ""}
    ${scrollable && orientation === "horizontal" ? "overflow-x-auto" : ""}
    ${
      scrollable &&
      (orientation === "vertical" || orientation === "vertical-stacked")
        ? "overflow-y-auto max-h-96"
        : ""
    }
    ${className}
  `;

    return baseStyles;
  };

  return (
    <div className="w-full">
      <div
        ref={scrollContainerRef}
        className={getContainerStyles()}
        style={{ fontFamily: "Work Sans, sans-serif" }}
      >
        {tabConfig.map((tab: TabConfig, index: number) => {
          const isActive = activeTab === tab.label;

          return (
            // Inside the map function, replace the tab content:
            <div
              key={`${tab.label}-${index}`}
              className={getTabStyles(isActive, tab.disabled)}
              onClick={() => handleTabClick(tab.label, tab.disabled)}
              role="tab"
              tabIndex={tab.disabled ? -1 : 0}
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTabClick(tab.label, tab.disabled);
                }
              }}
            >
              {/* Stacked Layout */}
              {orientation === "vertical-stacked" ? (
                <>
                  {/* Tab Icon (if any) */}
                  {tab.icon && (
                    <span className="flex-shrink-0 mb-1">{tab.icon}</span>
                  )}

                  {/* Tab Label */}
                  <span className="flex-shrink-0 whitespace-nowrap">
                    {tab.label}
                  </span>

                  {/* Count Badge */}
                  {showCounts &&
                    tab.count !== null &&
                    tab.count !== undefined &&
                    tab.count !== 0 && (
                      <span className={getCountStyles(isActive)}>
                        {tab.count}
                      </span>
                    )}
                </>
              ) : (
                /* Horizontal/Regular Vertical Layout */
                <>
                  {/* Tab Icon */}
                  {tab.icon && (
                    <span className="flex-shrink-0">{tab.icon}</span>
                  )}

                  {/* Tab Label */}
                  <span className="flex-shrink-0 whitespace-nowrap">
                    {tab.label}
                  </span>

                  {/* Count Badge */}
                  {showCounts &&
                    tab.count !== null &&
                    tab.count !== undefined &&
                    tab.count !== 0 && (
                      <span className={getCountStyles(isActive)}>
                        {tab.count}
                      </span>
                    )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
