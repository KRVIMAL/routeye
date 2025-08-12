// src/components/ui/Breadcrumb/Breadcrumb.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
  maxItems?: number; // For responsive collapsing
  separator?: React.ComponentType<{ className?: string }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className = "",
  showHomeIcon = true,
  maxItems = 4,
  separator: CustomSeparator = FiChevronRight
}) => {
  // Handle responsive collapsing - show first, last, and collapse middle items if needed
  const getDisplayItems = () => {
    if (items.length <= maxItems) {
      return items;
    }

    const firstItem = items[0];
    const lastItems = items.slice(-2); // Show last 2 items
    const collapsedCount = items.length - 3;

    return [
      firstItem,
      { 
        label: `... (${collapsedCount} more)`, 
        href: undefined, 
        isCollapsed: true 
      } as BreadcrumbItem & { isCollapsed?: boolean },
      ...lastItems
    ];
  };

  const displayItems = getDisplayItems();

  return (
    <nav
      className={`flex items-center ${className}`}
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="flex items-center space-x-2 sm:space-x-3">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCollapsed = 'isCollapsed' in item && item.isCollapsed;
          
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <CustomSeparator 
                  className="w-4 h-4 mx-2 sm:mx-3 text-gray-400 flex-shrink-0" 
                  aria-hidden="true" 
                />
              )}

              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Icon */}
                {item.icon && index === 0 && showHomeIcon && (
                  <item.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                      item.isActive 
                        ? "text-black" 
                        : "text-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Label/Link */}
                {isCollapsed ? (
                  <span
                    className="breadcrumb-item collapsed text-gray-600 text-sm sm:text-base cursor-default"
                    aria-label={`${displayItems.length - 3} items collapsed`}
                    title="Click to see full path"
                  >
                    {item.label}
                  </span>
                ) : item.href && !item.isActive ? (
                  <Link
                    to={item.href}
                    className="breadcrumb-item link text-gray-600 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-0.5"
                    aria-current={isLast ? "page" : undefined}
                  >
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden truncate max-w-[100px]">
                      {item.label.length > 12 ? `${item.label.substring(0, 12)}...` : item.label}
                    </span>
                  </Link>
                ) : (
                  <span
                    className={`breadcrumb-item current ${
                      item.isActive
                        ? "text-black font-medium"
                        : "text-gray-600"
                    } cursor-default`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden truncate max-w-[120px]">
                      {item.label.length > 15 ? `${item.label.substring(0, 15)}...` : item.label}
                    </span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile: Show full path on hover/click */}
      <style>{`
        .breadcrumb-item {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-weight: 500;
          font-style: normal;
          font-size: 16px;
          line-height: 100%;
          letter-spacing: 0%;
        }
        
        .breadcrumb-item.current {
          color: #000000;
        }
        
        .breadcrumb-item.link {
          color: #4B5563;
        }
        
        .breadcrumb-item.collapsed {
          color: #4B5563;
          font-style: italic;
        }
        
        /* Responsive font sizing */
        @media (max-width: 640px) {
          .breadcrumb-item {
            font-size: 14px;
          }
        }
        
        /* Dark theme support */
        .dark .breadcrumb-item.current {
          color: #ffffff;
        }
        
        .dark .breadcrumb-item.link {
          color: #9CA3AF;
        }
        
        .dark .breadcrumb-item.link:hover {
          color: #ffffff;
        }
        
        .dark .breadcrumb-item.collapsed {
          color: #9CA3AF;
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumb;