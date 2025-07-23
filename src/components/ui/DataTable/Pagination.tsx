// src/components/ui/DataTable/Pagination.tsx - Updated Pagination Component
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "../Button";
import Select from "../Select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  totalRows,
  onPageChange,
  onPageSizeChange,
}) => {
  const actualPageSize = pageSize === 0 ? totalRows : pageSize;
  const startRow = totalRows > 0 ? (currentPage - 1) * actualPageSize + 1 : 0;
  const endRow =
    pageSize === 0
      ? totalRows
      : Math.min(currentPage * actualPageSize, totalRows);

  // const pageSizeSelectOptions:any = pageSizeOptions?.map((size:any) => ({
  //   value: size.toString(),
  //   label: size.toString(),
  // }));

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxPagesToShow / 2);
      let start = currentPage - half;
      let end = currentPage + half;

      if (start < 1) {
        start = 1;
        end = maxPagesToShow;
      }

      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxPagesToShow + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-theme-primary relative">
      {/* Left side - Rows per page */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-text-secondary">Rows per page:</span>
        <div className="w-20 relative z-50">
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="w-[70px] h-8 px-2 text-sm border border-border-light bg-theme-primary text-text-primary rounded-md focus:outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size === 0 ? "All" : size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side - Page info and navigation */}
      <div className="flex items-center space-x-4">
        {/* Row count info */}
        <span className="text-sm text-text-secondary">
          {totalRows > 0 ? `${startRow}-${endRow} of ${totalRows}` : "0 of 0"}
        </span>

        {/* Page navigation */}
        {pageSize !== 0 && (
          <div className="flex items-center space-x-1">
            {/* First page button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              className="p-2"
              title="First page"
            >
              <span className="text-xs">««</span>
            </Button>

            {/* Previous page button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2"
              title="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "primary" : "secondary"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="px-3 py-1 min-w-[32px]"
              >
                {pageNum}
              </Button>
            ))}

            {/* Next page button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2"
              title="Next page"
            >
              <FiChevronRight className="w-4 h-4" />
            </Button>

            {/* Last page button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-2"
              title="Last page"
            >
              <span className="text-xs">»»</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
