"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20,
  totalItems,
}: Props) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems || currentPage * itemsPerPage,
  );

  return (
    <div className='flex flex-col items-center gap-3 py-4'>
      {/* Items count */}
      {totalItems && (
        <p className='text-[10px] text-[#f0ede6]/30 font-mono'>
          Showing {startItem}-{endItem} of {totalItems} items
        </p>
      )}

      {/* Page buttons */}
      <div className='flex items-center gap-1'>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#f0ede6]/50 hover:bg-[rgba(245,245,220,0.05)] disabled:opacity-20 disabled:cursor-not-allowed'
        >
          <ChevronLeft size={14} />
        </motion.button>

        {getPageNumbers().map((page, i) =>
          typeof page === "string" ? (
            <span
              key={`ellipsis-${i}`}
              className='w-8 h-8 flex items-center justify-center text-xs text-[#f0ede6]/20'
            >
              ...
            </span>
          ) : (
            <motion.button
              key={page}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                currentPage === page
                  ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                  : "text-[#f0ede6]/50 hover:bg-[rgba(245,245,220,0.05)]"
              }`}
            >
              {page}
            </motion.button>
          ),
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#f0ede6]/50 hover:bg-[rgba(245,245,220,0.05)] disabled:opacity-20 disabled:cursor-not-allowed'
        >
          <ChevronRight size={14} />
        </motion.button>
      </div>
    </div>
  );
}
