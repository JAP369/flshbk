"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, X } from "lucide-react";
import type { ItemCategory } from "@/lib/types/database";

export interface FilterState {
  search?: string;
  category?: ItemCategory;
  minPrice?: number;
  maxPrice?: number;
  dealsOnly?: boolean;
  source?: string;
}

const PRICE_PRESETS = [
  { label: "All", min: 0, max: Infinity },
  { label: "< HKD 500", min: 0, max: 500 },
  { label: "< HKD 1,500", min: 0, max: 1500 },
  { label: "< HKD 5,000", min: 0, max: 5000 },
  { label: "> HKD 5,000", min: 5000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "deal_score", label: "Deal Score" },
  { value: "newest", label: "Newest" },
] as const;

const FILTER_STORAGE_KEY = "flashbk-dashboard-filters";

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export interface FilterStateWithSort extends FilterState {
  sortBy?: SortOption;
}

interface Props {
  onFilter: (filters: FilterStateWithSort) => void;
  categories: Array<{ id: ItemCategory; name: string; emoji: string }>;
  sources?: string[];
  isLoading?: boolean;
}

export default function DashboardFilters({
  onFilter,
  categories,
  sources = [],
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | undefined>();
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });
  const [dealsOnly, setDealsOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("price_asc");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(FILTER_STORAGE_KEY) : null;
      if (!mounted || !stored) return;
      const parsed = JSON.parse(stored) as FilterStateWithSort;
      if (parsed.search) setSearch(parsed.search);
      if (parsed.category) setSelectedCategory(parsed.category);
      if (parsed.dealsOnly) setDealsOnly(true);
      if (parsed.source) setSelectedSource(parsed.source);
      if (parsed.sortBy) setSortBy(parsed.sortBy);
      if (typeof parsed.minPrice === "number" || typeof parsed.maxPrice === "number") {
        setPriceRange({
          min: typeof parsed.minPrice === "number" ? parsed.minPrice : 0,
          max: typeof parsed.maxPrice === "number" ? parsed.maxPrice : Infinity,
        });
      }
    } catch {
      // ignore
    }
    return () => {
      mounted = false;
    };
  }, []);

  const persistFilters = useCallback((filters: FilterStateWithSort) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
      }
    } catch {
      // ignore
    }
  }, []);

  const emitFilters = useCallback(
    (filters: FilterStateWithSort) => {
      onFilter(filters);
      persistFilters(filters);
    },
    [onFilter, persistFilters],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      emitFilters({
        search: value || undefined,
        category: selectedCategory,
        source: selectedSource,
        minPrice: priceRange.min,
        maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
        dealsOnly: dealsOnly || undefined,
        sortBy,
      });
    },
    [selectedCategory, selectedSource, priceRange, dealsOnly, sortBy, emitFilters],
  );

  const handleCategoryChange = useCallback(
    (cat: ItemCategory | undefined) => {
      setSelectedCategory(cat);
      emitFilters({
        search: search || undefined,
        category: cat,
        source: selectedSource,
        minPrice: priceRange.min,
        maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
        dealsOnly: dealsOnly || undefined,
        sortBy,
      });
    },
    [search, selectedSource, priceRange, dealsOnly, sortBy, emitFilters],
  );

  const handlePriceChange = useCallback(
    (min: number, max: number) => {
      setPriceRange({ min, max });
      emitFilters({
        search: search || undefined,
        category: selectedCategory,
        source: selectedSource,
        minPrice: min,
        maxPrice: max === Infinity ? undefined : max,
        dealsOnly: dealsOnly || undefined,
        sortBy,
      });
    },
    [search, selectedCategory, selectedSource, dealsOnly, sortBy, emitFilters],
  );

  const handleDealsOnlyChange = useCallback(
    (value: boolean) => {
      setDealsOnly(value);
      emitFilters({
        search: search || undefined,
        category: selectedCategory,
        source: selectedSource,
        minPrice: priceRange.min,
        maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
        dealsOnly: value || undefined,
        sortBy,
      });
    },
    [search, selectedCategory, selectedSource, priceRange, sortBy, emitFilters],
  );

  const handleSourceChange = useCallback(
    (source: string | undefined) => {
      setSelectedSource(source);
      emitFilters({
        search: search || undefined,
        category: selectedCategory,
        source,
        minPrice: priceRange.min,
        maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
        dealsOnly: dealsOnly || undefined,
        sortBy,
      });
    },
    [search, selectedCategory, priceRange, dealsOnly, sortBy, emitFilters],
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      emitFilters({
        search: search || undefined,
        category: selectedCategory,
        source: selectedSource,
        minPrice: priceRange.min,
        maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
        dealsOnly: dealsOnly || undefined,
        sortBy: value,
      });
    },
    [search, selectedCategory, selectedSource, priceRange, dealsOnly, emitFilters],
  );

  const hasActiveFilters =
    search ||
    selectedCategory ||
    dealsOnly ||
    priceRange.min > 0 ||
    priceRange.max < Infinity ||
    selectedSource ||
    sortBy !== "price_asc";

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory(undefined);
    setPriceRange({ min: 0, max: Infinity });
    setDealsOnly(false);
    setSelectedSource(undefined);
    setSortBy("price_asc");
    onFilter({});
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(FILTER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [onFilter]);

  return (
    <div className='w-full bg-[#141418] rounded-2xl border border-[rgba(245,245,220,0.06)] overflow-hidden'>
      <motion.div
        className='flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a1a22] transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-2'>
          <Search size={16} className='text-[#ff2d2d]' />
          <span className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/60'>
            Find Deals
          </span>
          {hasActiveFilters && (
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,45,45,0.15)] text-red-400 border border-red-400/30'>
              {
                [
                  search && "search",
                  selectedCategory && "category",
                  dealsOnly && "deals only",
                  priceRange.min > 0 && "price min",
                  priceRange.max < Infinity && "price max",
                  selectedSource && "source",
                ].filter(Boolean).length
              }{" "}
              active
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetFilters();
              }}
              className='text-[10px] text-[#ff2d2d] font-mono hover:text-red-300 transition-colors flex items-center gap-1'
            >
              <X size={12} /> Reset
            </button>
          )}
          <span className='text-[12px] text-[#f0ede6]/40'>
            {isExpanded ? "\u2212" : "+"}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className='overflow-hidden'
      >
        <div className='px-4 py-4 border-t border-[rgba(245,245,220,0.06)] space-y-4'>
          <div>
            <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/50 block mb-2'>
              Search
            </label>
            <div className='relative'>
              <Search
                size={14}
                className='absolute left-3 top-2.5 text-[#ff2d2d]'
              />
              <input
                type='text'
                placeholder='Charizard, LEGO, PSA...'
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isLoading}
                className='w-full pl-9 pr-3 py-2 bg-[#0d0d0f] border border-[rgba(245,245,220,0.1)] rounded-lg text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 focus:outline-none focus:border-[#ff2d2d] disabled:opacity-50'
              />
            </div>
          </div>

          <div>
            <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/50 block mb-2'>
              Category
            </label>
            <div className='flex gap-2 flex-wrap'>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    handleCategoryChange(
                      selectedCategory === cat.id ? undefined : cat.id,
                    )
                  }
                  disabled={isLoading}
                  className={`text-[12px] px-3 py-1.5 rounded-lg font-mono transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#ff2d2d] text-white border border-[#ff2d2d]"
                      : "bg-[#0d0d0f] text-[#f0ede6]/70 border border-[rgba(245,245,220,0.1)] hover:border-[#ff2d2d]/50"
                  } disabled:opacity-50`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {sources.length > 1 && (
            <div>
              <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/50 block mb-2'>
                Source
              </label>
              <div className='flex gap-2 flex-wrap'>
                <button
                  onClick={() => handleSourceChange(undefined)}
                  disabled={isLoading}
                  className={`text-[12px] px-3 py-1.5 rounded-lg font-mono transition-all ${
                    !selectedSource
                      ? "bg-[#ff2d2d] text-white border border-[#ff2d2d]"
                      : "bg-[#0d0d0f] text-[#f0ede6]/70 border border-[rgba(245,245,220,0.1)] hover:border-[#ff2d2d]/50"
                  } disabled:opacity-50`}
                >
                  All sources
                </button>
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() =>
                      handleSourceChange(
                        selectedSource === source ? undefined : source,
                      )
                    }
                    disabled={isLoading}
                    className={`text-[12px] px-3 py-1.5 rounded-lg font-mono transition-all ${
                      selectedSource === source
                        ? "bg-[#ff2d2d] text-white border border-[#ff2d2d]"
                        : "bg-[#0d0d0f] text-[#f0ede6]/70 border border-[rgba(245,245,220,0.1)] hover:border-[#ff2d2d]/50"
                    } disabled:opacity-50`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/50 block mb-2'>
              Price Range
            </label>
            <div className='grid grid-cols-5 gap-2'>
              {PRICE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePriceChange(preset.min, preset.max)}
                  disabled={isLoading}
                  className={`text-[11px] px-2 py-1.5 rounded-lg transition-all ${
                    priceRange.min === preset.min &&
                    priceRange.max === preset.max
                      ? "bg-[#ff2d2d] text-white border border-[#ff2d2d]"
                      : "bg-[#0d0d0f] text-[#f0ede6]/70 border border-[rgba(245,245,220,0.1)] hover:border-[#ff2d2d]/50"
                  } disabled:opacity-50`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/50 block mb-2'>
              Sort By
            </label>
            <div className='flex gap-2 flex-wrap'>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  disabled={isLoading}
                  className={`text-[12px] px-3 py-1.5 rounded-lg font-mono transition-all ${
                    sortBy === option.value
                      ? "bg-[#ff2d2d] text-white border border-[#ff2d2d]"
                      : "bg-[#0d0d0f] text-[#f0ede6]/70 border border-[rgba(245,245,220,0.1)] hover:border-[#ff2d2d]/50"
                  } disabled:opacity-50`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={() => handleDealsOnlyChange(!dealsOnly)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dealsOnly
                  ? "bg-[#ff2d2d]"
                  : "bg-[#0d0d0f] border border-[rgba(245,245,220,0.1)]"
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  dealsOnly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <label className='text-sm text-[#f5f5dc] cursor-pointer select-none'>
              <Zap size={16} className='inline text-[#ff2d2d] mr-2' />
              Hot Deals Only
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
