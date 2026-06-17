import { useState } from "react";
import { Button } from "@heroui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setInputPage((currentPage - 1).toString());
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setInputPage((currentPage + 1).toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        className="min-w-[80px]"
        isDisabled={currentPage === 1}
        onPress={handlePrevious}
        size="sm"
        variant="bordered"
      >
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {startPage > 1 && (
          <Button
            className="px-3 py-2 min-w-[40px]"
            onPress={() => onPageChange(1)}
            size="sm"
            variant="light"
          >
            1
          </Button>
        )}
        {startPage > 2 && <span className="px-2 text-default-500">...</span>}

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i,
        ).map((page) => (
          <Button
            key={page}
            className="px-3 py-2 min-w-[40px]"
            color={page === currentPage ? "primary" : "default"}
            onPress={() => onPageChange(page)}
            size="sm"
            variant={page === currentPage ? "solid" : "light"}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages - 1 && (
          <span className="px-2 text-default-500">...</span>
        )}
        {endPage < totalPages && (
          <Button
            className="px-3 py-2 min-w-[40px]"
            onPress={() => onPageChange(totalPages)}
            size="sm"
            variant="light"
          >
            {totalPages}
          </Button>
        )}
      </div>

      <Button
        className="min-w-[80px]"
        isDisabled={currentPage === totalPages}
        onPress={handleNext}
        size="sm"
        variant="bordered"
      >
        Next
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-default-500">Page</span>
        <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
          <input
            type="number"
            value={inputPage}
            onChange={handleInputChange}
            min="1"
            max={totalPages}
            className="w-16 px-3 py-2 text-sm border border-default-200 rounded-lg bg-background text-foreground"
          />
          <span className="text-sm text-default-500">of {totalPages}</span>
        </form>
      </div>
    </div>
  );
}
