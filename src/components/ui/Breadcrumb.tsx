// src/components/ui/Breadcrumb.tsx - Breadcrumb component with icons
import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <FiChevronRight className="w-4 h-4 text-text-muted" />}

          <div className="flex items-center space-x-1">
            {item.icon && (
              <item.icon
                className={`w-4 h-4 ${
                  item.isActive ? "text-text-primary" : "text-text-muted"
                }`}
              />
            )}

            {item.href && !item.isActive ? (
              <Link
                to={item.href}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`${
                  item.isActive
                    ? "text-text-primary font-medium"
                    : "text-text-muted"
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
