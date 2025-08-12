import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import Button from "../Button";
import CustomInput from "../CustomInput";
import Select from "../Select";

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  totalRows,
  onPageChange,
  onPageSizeChange,
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update page input when currentPage changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages);

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageSizeSelectOptions = pageSizeOptions.map(size => ({
    value: size.toString(),
    label: size === 0 ? 'All' : size.toString()
  }));

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between space-x-4 py-3">
      {/* Left side - Page size selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">Rows per page:</span>
        <div className="w-20">
          <Select
            options={pageSizeSelectOptions}
            value={pageSize.toString()}
            onChange={(value) => onPageSizeChange(parseInt(value as string))}
            size="sm"
            searchable={false}
            clearable={false}
          />
        </div>
      </div>

      {/* Center - Records info */}
      <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
        <span>
          Showing {startRecord.toLocaleString()} to {endRecord.toLocaleString()} of {totalRows.toLocaleString()} entries
        </span>
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Page input */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Page</span>
          <div className="w-16">
            <CustomInput
              value={pageInput}
              onChange={(e) => handlePageInputChange(e.target.value)}
              onBlur={handlePageInputSubmit}
              onKeyPress={handlePageInputKeyPress}
              size="sm"
              type="number"
              min="1"
              max={totalPages.toString()}
              className="text-center"
            />
          </div>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            of {totalPages.toLocaleString()}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            className="p-1.5"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-1.5"
          >
            <FiChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page numbers (desktop only) */}
          <div className="hidden lg:flex items-center space-x-1">
            {getVisiblePageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[32px] px-2 py-1"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5"
          >
            <FiChevronRight className="w-4 h-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
            className="p-1.5"
          >
            <FiChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPagination;