"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";

interface FilterSection {
  title: string;
  options: { label: string; value: string; count?: number }[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
}

interface Props {
  sections: FilterSection[];
  priceRange: { min: number; max: number };
  onPriceChange: (min: number, max: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const sortOptions = [
  { label: "Best Deals", value: "deal_score" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Most Popular", value: "popular" },
];

export default function FilterPanel({
  sections,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  onReset,
  isOpen,
  onToggle,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map((s) => s.title),
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const activeFilterCount = sections.reduce(
    (count, section) => count + section.selected.length,
    0,
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className='md:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full glass-strong border border-[rgba(255,45,45,0.3)] text-sm font-bold text-[#ff2d2d]'
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeFilterCount > 0 && (
          <span className='w-5 h-5 rounded-full bg-[#ff2d2d] text-white text-[10px] flex items-center justify-center'>
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-40 bg-black/60 md:hidden'
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen
            ? 0
            : typeof window !== "undefined" && window.innerWidth < 768
              ? "100%"
              : 0,
        }}
        className={`
          fixed md:relative top-0 right-0 z-50 md:z-auto
          w-80 md:w-full h-full md:h-auto
          glass-strong md:glass
          border-l md:border border-[rgba(245,245,220,0.08)]
          overflow-y-auto md:overflow-visible
          p-4 md:p-0
          transition-transform duration-300
        `}
      >
        {/* Mobile header */}
        <div className='flex items-center justify-between mb-4 md:hidden'>
          <h3 className='text-sm font-black text-[#f5f5dc]'>Filters</h3>
          <button onClick={onToggle}>
            <X size={18} className='text-[#f0ede6]/60' />
          </button>
        </div>

        {/* Sort dropdown */}
        <div className='mb-4'>
          <label className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-1.5 block'>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className='w-full px-3 py-2 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] outline-none focus:border-[rgba(255,45,45,0.4)]'
          >
            {sortOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className='bg-[#141418]'
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className='mb-4'>
          <label className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-1.5 block'>
            Price Range (HKD)
          </label>
          <div className='flex items-center gap-2'>
            <input
              type='number'
              placeholder='Min'
              value={priceRange.min || ""}
              onChange={(e) =>
                onPriceChange(Number(e.target.value), priceRange.max)
              }
              className='w-full px-3 py-2 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] outline-none focus:border-[rgba(255,45,45,0.4)]'
            />
            <span className='text-[#f0ede6]/20 text-xs'>-</span>
            <input
              type='number'
              placeholder='Max'
              value={priceRange.max || ""}
              onChange={(e) =>
                onPriceChange(priceRange.min, Number(e.target.value))
              }
              className='w-full px-3 py-2 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] outline-none focus:border-[rgba(255,45,45,0.4)]'
            />
          </div>
        </div>

        {/* Filter sections */}
        {sections.map((section) => (
          <div
            key={section.title}
            className='mb-3 border-b border-[rgba(245,245,220,0.04)] pb-3'
          >
            <button
              onClick={() => toggleSection(section.title)}
              className='flex items-center justify-between w-full py-1.5'
            >
              <span className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/40'>
                {section.title}
                {section.selected.length > 0 && (
                  <span className='ml-1.5 text-[#ff2d2d]'>
                    ({section.selected.length})
                  </span>
                )}
              </span>
              {expandedSections.includes(section.title) ? (
                <ChevronUp size={12} className='text-[#f0ede6]/30' />
              ) : (
                <ChevronDown size={12} className='text-[#f0ede6]/30' />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.includes(section.title) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className='overflow-hidden'
                >
                  <div className='flex flex-col gap-1 pt-1'>
                    {section.options.map((opt) => {
                      const isSelected = section.selected.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            if (section.multiSelect) {
                              const newSelected = isSelected
                                ? section.selected.filter(
                                    (v) => v !== opt.value,
                                  )
                                : [...section.selected, opt.value];
                              section.onChange(newSelected);
                            } else {
                              section.onChange(isSelected ? [] : [opt.value]);
                            }
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isSelected
                              ? "bg-[rgba(255,45,45,0.12)] text-[#ff2d2d]"
                              : "text-[#f0ede6]/50 hover:bg-[rgba(245,245,220,0.04)]"
                          }`}
                        >
                          <span className='flex items-center gap-2'>
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                isSelected
                                  ? "bg-[#ff2d2d] border-[#ff2d2d]"
                                  : "border-[rgba(245,245,220,0.2)]"
                              }`}
                            >
                              {isSelected && (
                                <span className='text-white text-[8px]'>✓</span>
                              )}
                            </span>
                            {opt.label}
                          </span>
                          {opt.count !== undefined && (
                            <span className='text-[9px] text-[#f0ede6]/25'>
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Reset button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className='w-full py-2 rounded-xl text-xs font-bold text-[#ff2d2d] border border-[rgba(255,45,45,0.2)] bg-[rgba(255,45,45,0.05)] hover:bg-[rgba(255,45,45,0.1)] transition-colors'
          >
            Reset All Filters ({activeFilterCount})
          </button>
        )}
      </motion.div>
    </>
  );
}
