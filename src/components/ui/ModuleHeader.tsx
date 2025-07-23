// src/components/ui/ModuleHeader.tsx - Custom header for modules
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import Button from "./Button";
import Breadcrumb, { BreadcrumbItem } from "./Breadcrumb";
import CustomInput from "./CustomInput";

interface ModuleHeaderTab {
  id: string;
  label: string;
  icon?: any;
  isActive?: boolean;
}

interface TabItem {
  key: string;
  label: string;
  count?: number;
  isActive?: boolean;
}

interface ModuleHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];

  // For list pages
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  tabs?: TabItem[];
  onTabChange?: (key: string) => void;

  // For detail pages
  showBackButton?: boolean;
  showCancelButton?: boolean;
  showSaveButton?: boolean;
  showNextButton?: boolean;
  onBackClick?: () => void;
  onCancelClick?: () => void;
  onSaveClick?: () => void;
  onNextClick?: () => void;
  cancelText?: string;
  saveText?: string;
  nextText?: string;

  // Custom actions
  customActions?: React.ReactNode;

  className?: string;

  headerTabs?: ModuleHeaderTab[];
  activeHeaderTab?: string;
  onHeaderTabChange?: (tabId: string) => void;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  breadcrumbs,

  // List page props
  showAddButton = false,
  addButtonText = "Add",
  onAddClick,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  tabs,
  onTabChange,

  // Detail page props
  showBackButton = false,
  showCancelButton = false,
  showSaveButton = false,
  showNextButton = false,
  onBackClick,
  onCancelClick,
  onSaveClick,
  onNextClick,
  cancelText = "Cancel",
  saveText = "Save",
  nextText = "Next",

  customActions,
  className = "",

  headerTabs,
  activeHeaderTab,
  onHeaderTabChange,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    if (onCancelClick) {
      onCancelClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`bg-theme-primary border-b border-border-light ${className}`}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="px-6 pt-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBack}
                className="p-2"
              >
                <FiArrowLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Title */}
            <h1 className="text-heading-1 text-text-primary">{title}</h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {showSearch && (
              <div className="w-80">
                <CustomInput
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  size="sm"
                  type="search"
                />
              </div>
            )}

            {/* Add Button */}
            {showAddButton && (
              <Button
                variant="primary"
                onClick={onAddClick}
                className="flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>{addButtonText}</span>
              </Button>
            )}

            {/* Detail Page Buttons */}
            {(showCancelButton || showSaveButton || showNextButton) && (
              <div className="flex items-center space-x-3">
                {showCancelButton && (
                  <Button variant="secondary" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                )}

                {showSaveButton && (
                  <Button variant="primary" onClick={onSaveClick}>
                    {saveText}
                  </Button>
                )}

                {showNextButton && (
                  <Button variant="primary" onClick={onNextClick}>
                    {nextText}
                  </Button>
                )}
              </div>
            )}

            {/* Custom Actions */}
            {customActions}
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="mt-4">
            <div className="flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  className={`pb-2 border-b-2 transition-colors ${
                    tab.isActive
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        tab.isActive
                          ? "bg-primary-100 text-primary-800"
                          : "bg-theme-tertiary text-text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {headerTabs && headerTabs.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex space-x-2">
            {headerTabs.map((tab) => {
              const isActive = tab.id === activeHeaderTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => onHeaderTabChange?.(tab.id)}
                  className={`
                    px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer
                    flex items-center space-x-2 text-sm
                    ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "text-text-secondary hover:text-text-primary hover:bg-theme-tertiary"
                    }
                  `}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleHeader;
