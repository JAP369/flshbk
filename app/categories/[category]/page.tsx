"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  Clock,
  Flame,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Star,
  TrendingUp,
  AlertTriangle,
  LayoutGrid,
  List,
  ArrowLeft,
  BarChart3,
  Sparkles,
  Eye,
  EyeOff,
  DollarSign,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import {
  getDeals,
  getAggregatorListings,
  getTcgSets,
  getCardPriceBreakdown,
  type AggregatorFilters,
  type CardPriceBreakdown,
  type TCGSet,
} from "@/lib/api/aggregator";
import { getMockAggregatorListings } from "@/lib/data/mockData";
import type { AggregatorListing, ItemCategory } from "@/lib/types/database";
import { getDealLabel } from "@/lib/aggregator/scorer";
import {
  getEnabledSources,
  MARKETPLACE_SOURCES,
} from "@/lib/aggregator/sources";
import { USD_TO_HKD } from "@/lib/aggregators/tcg";
import { ArbitragePortfolio } from "@/components/tcg/ArbitragePortfolio";

/* ─── Helpers ─── */
function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-HK");
  } catch {
    return "recently";
  }
}

function getCategoryPlaceholderImage(category: string) {
  const map: Record<string, string> = {
    pokemon_card:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23fbbf24' text-anchor='middle' dy='.3em'%3E🃏%3C/text%3E%3C/svg%3E",
    lego: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%2360a5fa' text-anchor='middle' dy='.3em'%3E🧱%3C/text%3E%3C/svg%3E",
    hot_toys:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23c084fc' text-anchor='middle' dy='.3em'%3E🎭%3C/text%3E%3C/svg%3E",
    pop_mart:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23ff2d2d' text-anchor='middle' dy='.3em'%3E🎪%3C/text%3E%3C/svg%3E",
    hot_wheels:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%234ade80' text-anchor='middle' dy='.3em'%3E🏎️%3C/text%3E%3C/svg%3E",
    funko:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23fbbf24' text-anchor='middle' dy='.3em'%3E🎨%3C/text%3E%3C/svg%3E",
  };
  return map[category] || map.pokemon_card;
}

function getSourceIcon(sourceId: string): string {
  const source = MARKETPLACE_SOURCES.find((s) => s.id === sourceId);
  return source?.icon || "🌐";
}

function getSourceName(sourceId: string): string {
  const source = MARKETPLACE_SOURCES.find((s) => s.id === sourceId);
  return source?.name || sourceId;
}

/* ─── Sparkline Component ─── */
function Sparkline({
  data,
  width = 60,
  height = 20,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const trend = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} className='shrink-0'>
      <polyline
        points={points}
        fill='none'
        stroke={trend ? "#10b981" : "#ef4444"}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/* ─── Price Display with Currency Toggle ─── */
function PriceDisplay({
  hkd,
  usd,
  currency,
  className = "",
  size = "normal",
}: {
  hkd: number;
  usd?: number;
  currency: "HKD" | "USD";
  className?: string;
  size?: "normal" | "small" | "large";
}) {
  const value =
    currency === "HKD" ? hkd : (usd ?? Math.round(hkd / USD_TO_HKD));
  const symbol = currency === "HKD" ? "HKD" : "USD";
  const sizeClass =
    size === "large"
      ? "text-sm sm:text-base"
      : size === "small"
        ? "text-[10px]"
        : "text-xs sm:text-sm";

  return (
    <span className={`font-black text-[#f5f5dc] ${sizeClass} ${className}`}>
      {symbol} {value.toLocaleString()}
    </span>
  );
}

/* ─── Watchlist Hook ─── */
function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("tcg-watchlist") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleWatch = useCallback((cardId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId];
      localStorage.setItem("tcg-watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const isWatched = useCallback(
    (cardId: string) => watchlist.includes(cardId),
    [watchlist],
  );

  return { watchlist, toggleWatch, isWatched };
}

/* ─── Main Page ─── */
export default function CategoryPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const categoryId = params.category as string;
  const normalizedCategoryId = categoryId === "pokemon" ? "tcg" : categoryId;
  const category = getCategory(normalizedCategoryId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <main className='flex flex-col min-h-screen items-center justify-center'>
        <div className='w-6 h-6 rounded-full border-2 border-[#ff2d2d] border-t-transparent animate-spin' />
      </main>
    );
  }

  if (!category) {
    return (
      <main className='flex flex-col min-h-screen items-center justify-center px-6'>
        <div className='text-5xl mb-4'>🔍</div>
        <h1 className='text-xl font-black text-[#f5f5dc] mb-2'>
          Category not found
        </h1>
        <p className='text-sm text-[#f0ede6]/40 mb-4'>
          This category does not exist.
        </p>
        <Link href='/'>
          <span className='text-sm text-[#ff2d2d] font-mono hover:underline'>
            ← Back to Dashboard
          </span>
        </Link>
      </main>
    );
  }

  return (
    <CategoryListings
      category={category}
      normalizedCategoryId={normalizedCategoryId}
    />
  );
}

/* ─── Listings Component ─── */
function CategoryListings({
  category,
  normalizedCategoryId,
}: {
  category: NonNullable<ReturnType<typeof getCategory>>;
  normalizedCategoryId: string;
}) {
  const [listings, setListings] = useState<AggregatorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDealsOnly, setShowDealsOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "deal_score" | "price_asc" | "price_desc" | "newest"
  >("deal_score");
  const [showFilters, setShowFilters] = useState(false);
  const [dataInfo, setDataInfo] = useState<{
    source: string;
    liveCount?: number;
    totalCount?: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currency, setCurrency] = useState<"HKD" | "USD">("HKD");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // TCG-specific
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [sets, setSets] = useState<TCGSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [showSetBrowser, setShowSetBrowser] = useState(false);

  // Card detail modal
  const [selectedCard, setSelectedCard] = useState<AggregatorListing | null>(
    null,
  );
  const [cardBreakdown, setCardBreakdown] = useState<CardPriceBreakdown | null>(
    null,
  );
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  // Watchlist
  const { toggleWatch, isWatched } = useWatchlist();

  const PAGE_SIZE = 24;

  // Mock data fallback
  const mockListings = useMemo(
    () => getMockAggregatorListings(normalizedCategoryId),
    [normalizedCategoryId],
  );

  // Fetch sets on mount (for TCG)
  useEffect(() => {
    if (normalizedCategoryId === "tcg") {
      getTcgSets().then((res) => {
        if (res.data) setSets(res.data);
      });
    }
  }, [normalizedCategoryId]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch listings
  const fetchListings = useCallback(
    async (append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const categoryValue: ItemCategory =
          normalizedCategoryId === "tcg"
            ? "pokemon_card"
            : (normalizedCategoryId as ItemCategory);

        const filters: AggregatorFilters = {
          category: categoryValue,
          search: debouncedSearch || undefined,
          source: selectedSource === "all" ? undefined : selectedSource,
          dealsOnly: showDealsOnly,
          sortBy,
          limit: PAGE_SIZE,
          offset: append ? offset : 0,
        };

        let result;
        if (showDealsOnly && !debouncedSearch) {
          result = await getDeals(PAGE_SIZE);
        } else {
          result = await getAggregatorListings(filters);
        }

        if (result.data.length > 0) {
          setListings((prev) =>
            append ? [...prev, ...result.data] : result.data,
          );
          setDataInfo({
            source: result.source || "aggregator",
            liveCount: result.liveCount,
            totalCount: result.totalCount,
          });
          setHasMore(result.data.length >= PAGE_SIZE);
          if (!append) setOffset(PAGE_SIZE);
        } else if (!append) {
          setListings(mockListings);
          setDataInfo({ source: "mock" });
          setHasMore(false);
        }
      } catch (err) {
        console.error("[Category] Fetch failed:", err);
        if (!append) {
          setListings(mockListings);
          setDataInfo({ source: "mock" });
          setError("Could not fetch live data. Showing sample listings.");
        }
      }

      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    },
    [
      normalizedCategoryId,
      debouncedSearch,
      selectedSource,
      showDealsOnly,
      sortBy,
      offset,
      mockListings,
    ],
  );

  // Initial fetch on mount and when key dependencies change
  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchListings(false);
    }
  }, [fetchListings]);

  // Load more
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setOffset((prev) => prev + PAGE_SIZE);
      fetchListings(true);
    }
  }, [loadingMore, hasMore, fetchListings]);

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // Fetch card breakdown
  const openCardDetail = useCallback(async (listing: AggregatorListing) => {
    setSelectedCard(listing);
    setBreakdownLoading(true);
    setCardBreakdown(null);
    try {
      const raw = listing.raw_data as Record<string, string> | undefined;
      const cardName = raw?.card_name || listing.title.split(" — ")[0];
      const breakdown = await getCardPriceBreakdown(cardName);
      setCardBreakdown(breakdown);
    } catch {
      // ignore
    }
    setBreakdownLoading(false);
  }, []);

  const hasActiveFilters =
    selectedSource !== "all" ||
    showDealsOnly ||
    debouncedSearch !== "" ||
    selectedSubcategory !== null;
  const sources = getEnabledSources();

  // Computed stats
  const stats = useMemo(() => {
    if (listings.length === 0) return null;
    const dealCount = listings.filter((l) => l.is_deal).length;
    const prices = listings.map((l) => l.price_hkd);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { dealCount, minPrice, maxPrice };
  }, [listings]);

  // TCG filter options
  const tcgFilterOptions = useMemo(() => {
    if (normalizedCategoryId !== "tcg") return null;
    const rarities = new Set<string>();
    const conditions = new Set<string>();
    const grades = new Set<string>();
    listings.forEach((l) => {
      const raw = l.raw_data as Record<string, string> | undefined;
      if (raw?.rarity) rarities.add(raw.rarity);
      if (l.condition) conditions.add(l.condition);
      if (raw?.grade) grades.add(raw.grade);
    });
    return {
      rarities: Array.from(rarities).sort(),
      conditions: Array.from(conditions).sort(),
      grades: Array.from(grades).sort(),
    };
  }, [listings, normalizedCategoryId]);

  // Filter by subcategory
  const displayListings = useMemo(() => {
    if (!selectedSubcategory) return listings;
    const sub = selectedSubcategory.toLowerCase();
    return listings.filter((l) => l.title.toLowerCase().includes(sub));
  }, [listings, selectedSubcategory]);

  const clearFilters = () => {
    setSelectedSource("all");
    setShowDealsOnly(false);
    setSortBy("deal_score");
    setSearch("");
    setSelectedSubcategory(null);
    setSelectedRarity("all");
    setSelectedGrade("all");
    setSelectedSet(null);
    setOffset(0);
  };

  // Generate mock sparkline data for demo
  const getSparklineData = useCallback((seed: number) => {
    const data: number[] = [];
    let val = 50 + (seed % 30);
    for (let i = 0; i < 7; i++) {
      val += Math.sin(seed + i) * 10;
      data.push(Math.max(10, val));
    }
    return data;
  }, []);

  return (
    <main className='flex flex-col min-h-screen'>
      {/* ── Hero Header ── */}
      <div
        className='relative px-4 pt-3 pb-3 overflow-hidden'
        style={{
          background: `linear-gradient(180deg, ${category.color}10 0%, ${category.color}05 50%, transparent 100%)`,
        }}
      >
        <div className='flex items-center gap-3 mb-2'>
          <Link
            href='/'
            className='shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-[rgba(245,245,220,0.06)] border border-[rgba(245,245,220,0.08)] hover:border-[rgba(255,45,45,0.3)] transition-colors'
          >
            <ArrowLeft size={16} className='text-[#f0ede6]/50' />
          </Link>
          <div
            className='w-10 h-10 rounded-xl flex items-center justify-center'
            style={{
              background: `${category.color}20`,
              border: `1px solid ${category.color}35`,
            }}
          >
            <span className='text-xl'>{category.emoji}</span>
          </div>
          <div className='flex-1 min-w-0'>
            <h1 className='text-lg font-black text-[#f5f5dc] leading-tight'>
              {category.name}
            </h1>
            <p className='text-[10px] text-[#f0ede6]/35 mt-0.5 truncate'>
              {category.description}
            </p>
          </div>
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency((c) => (c === "HKD" ? "USD" : "HKD"))}
            className='shrink-0 px-2 py-1 rounded-lg bg-[rgba(245,245,220,0.06)] border border-[rgba(245,245,220,0.08)] text-[10px] font-mono font-bold text-[#f0ede6]/50 hover:text-[#f0ede6]/70 transition-colors flex items-center gap-1'
          >
            <DollarSign size={10} />
            {currency}
          </button>
        </div>

        {/* Stats bar */}
        {stats && !loading && (
          <div className='flex items-center gap-3 mt-2 mb-2 flex-wrap'>
            <div className='flex items-center gap-1.5'>
              <BarChart3 size={12} style={{ color: category.color }} />
              <span className='text-[10px] font-mono text-[#f0ede6]/50'>
                {listings.length} listings
              </span>
            </div>
            {stats.dealCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <Sparkles size={12} className='text-[#ff2d2d]' />
                <span className='text-[10px] font-mono text-[#ff2d2d]/80'>
                  {stats.dealCount} deals
                </span>
              </div>
            )}
            <div className='flex items-center gap-1.5'>
              <Tag size={12} className='text-[#f0ede6]/25' />
              <span className='text-[10px] font-mono text-[#f0ede6]/40'>
                {currency}{" "}
                {currency === "HKD"
                  ? `${stats.minPrice.toLocaleString()} – ${stats.maxPrice.toLocaleString()}`
                  : `${Math.round(stats.minPrice / USD_TO_HKD).toLocaleString()} – ${Math.round(stats.maxPrice / USD_TO_HKD).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Clickable Subcategories */}
        <div className='flex gap-1.5 mt-1 overflow-x-auto no-scrollbar'>
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full transition-all ${
              selectedSubcategory === null
                ? "font-bold text-white border"
                : "bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)] hover:border-[rgba(245,245,220,0.15)]"
            }`}
            style={
              selectedSubcategory === null
                ? {
                    background: `${category.color}25`,
                    borderColor: `${category.color}50`,
                    color: category.color,
                  }
                : {}
            }
          >
            All
          </button>
          {category.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() =>
                setSelectedSubcategory(selectedSubcategory === sub ? null : sub)
              }
              className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full transition-all ${
                selectedSubcategory === sub
                  ? "font-bold border"
                  : "bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)] hover:border-[rgba(245,245,220,0.15)]"
              }`}
              style={
                selectedSubcategory === sub
                  ? {
                      background: `${category.color}20`,
                      borderColor: `${category.color}40`,
                      color: category.color,
                    }
                  : {}
              }
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Marketplace sources */}
        <div className='flex gap-1.5 mt-2 overflow-x-auto no-scrollbar'>
          {sources.map((source) => (
            <span
              key={source.id}
              className='shrink-0 text-[9px] px-2 py-0.5 rounded-md font-mono'
              style={{
                background: `${source.color}12`,
                color: source.color,
                border: `1px solid ${source.color}25`,
              }}
            >
              {source.icon} {source.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Arbitrage Portfolio (TCG only) ── */}
      {normalizedCategoryId === "tcg" && listings.length > 0 && (
        <div className='px-4 pt-2 pb-3'>
          <ArbitragePortfolio listings={listings} verifiedTrades={0} />
        </div>
      )}

      {/* ── Set Browser (TCG only) ── */}
      {normalizedCategoryId === "tcg" && sets.length > 0 && (
        <div className='px-4 pt-2 pb-1'>
          <button
            onClick={() => setShowSetBrowser(!showSetBrowser)}
            className='flex items-center gap-1.5 text-[10px] font-mono text-[#f0ede6]/40 hover:text-[#f0ede6]/60 transition-colors'
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${showSetBrowser ? "rotate-180" : ""}`}
            />
            Browse by Set ({sets.length} sets)
          </button>
          <AnimatePresence>
            {showSetBrowser && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className='overflow-hidden'
              >
                <div className='flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1'>
                  <button
                    onClick={() => setSelectedSet(null)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all ${
                      selectedSet === null
                        ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.25)]"
                        : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                    }`}
                  >
                    All Sets
                  </button>
                  {sets.slice(0, 12).map((set) => (
                    <button
                      key={set.id}
                      onClick={() =>
                        setSelectedSet(selectedSet === set.id ? null : set.id)
                      }
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1.5 ${
                        selectedSet === set.id
                          ? "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]"
                          : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                      }`}
                    >
                      {set.logoUrl ? (
                        <img
                          src={set.logoUrl}
                          alt={set.name}
                          className='w-4 h-4 object-contain'
                        />
                      ) : (
                        <span>🃏</span>
                      )}
                      <span className='max-w-[80px] truncate'>{set.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Search ── */}
      <div className='px-4 pb-2'>
        <div className='relative'>
          <Search
            size={16}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30'
          />
          <input
            type='text'
            placeholder={`Search ${category?.name.toLowerCase() || "items"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.08)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/25 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
          />
          <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
            {search && (
              <button
                onClick={() => setSearch("")}
                className='p-1.5 rounded-lg hover:bg-white/5'
              >
                <X size={14} className='text-[#f0ede6]/30' />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]" : "hover:bg-white/5 text-[#f0ede6]/30"}`}
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable Filters Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-4 pb-3 space-y-3'>
              <div className='flex gap-2 flex-wrap'>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDealsOnly(!showDealsOnly)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    showDealsOnly
                      ? "bg-[#ff2d2d] text-white shadow-[0_0_12px_rgba(255,45,45,0.3)]"
                      : "bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
                  }`}
                >
                  <Flame size={12} /> Hot Deals
                </motion.button>

                {[
                  {
                    label: "Best Deals",
                    value: "deal_score" as const,
                    icon: Star,
                  },
                  {
                    label: "Low → High",
                    value: "price_asc" as const,
                    icon: ArrowUpDown,
                  },
                  {
                    label: "High → Low",
                    value: "price_desc" as const,
                    icon: ArrowUpDown,
                  },
                  { label: "Newest", value: "newest" as const, icon: Clock },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      sortBy === opt.value
                        ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                        : "bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
                    }`}
                  >
                    <opt.icon size={12} />
                    {opt.label}
                  </motion.button>
                ))}
              </div>

              {/* Source filters */}
              <div>
                <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20 mb-1.5'>
                  Marketplace
                </p>
                <div className='flex gap-1.5 flex-wrap'>
                  <button
                    onClick={() => setSelectedSource("all")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                      selectedSource === "all"
                        ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.25)]"
                        : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                    }`}
                  >
                    All
                  </button>
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() =>
                        setSelectedSource(
                          selectedSource === source.id ? "all" : source.id,
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
                        selectedSource === source.id
                          ? "text-white border"
                          : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                      }`}
                      style={
                        selectedSource === source.id
                          ? {
                              background: `${source.color}25`,
                              borderColor: `${source.color}50`,
                              color: source.color,
                            }
                          : {}
                      }
                    >
                      {source.icon} {source.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* TCG-specific filters */}
              {tcgFilterOptions && (
                <>
                  {tcgFilterOptions.rarities.length > 0 && (
                    <div>
                      <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20 mb-1.5'>
                        Rarity
                      </p>
                      <div className='flex gap-1.5 flex-wrap'>
                        <button
                          onClick={() => setSelectedRarity("all")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                            selectedRarity === "all"
                              ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.25)]"
                              : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                          }`}
                        >
                          All
                        </button>
                        {tcgFilterOptions.rarities.map((rarity) => (
                          <button
                            key={rarity}
                            onClick={() =>
                              setSelectedRarity(
                                selectedRarity === rarity ? "all" : rarity,
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                              selectedRarity === rarity
                                ? "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]"
                                : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                            }`}
                          >
                            {rarity}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tcgFilterOptions.grades.length > 0 && (
                    <div>
                      <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20 mb-1.5'>
                        Grade
                      </p>
                      <div className='flex gap-1.5 flex-wrap'>
                        <button
                          onClick={() => setSelectedGrade("all")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                            selectedGrade === "all"
                              ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.25)]"
                              : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                          }`}
                        >
                          All
                        </button>
                        {tcgFilterOptions.grades.map((grade) => (
                          <button
                            key={grade}
                            onClick={() =>
                              setSelectedGrade(
                                selectedGrade === grade ? "all" : grade,
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                              selectedGrade === grade
                                ? "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]"
                                : "bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40"
                            }`}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className='text-[10px] text-[#ff2d2d] font-mono hover:underline flex items-center gap-1'
                >
                  <X size={10} /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick filter pills ── */}
      {!showFilters && (
        <div className='px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar'>
          <button
            onClick={() => setShowDealsOnly(!showDealsOnly)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
              showDealsOnly
                ? "bg-[#ff2d2d] text-white"
                : "bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/40"
            }`}
          >
            <Flame size={10} /> Hot
          </button>
          {[
            { label: "Best", value: "deal_score" as const },
            { label: "↑Price", value: "price_asc" as const },
            { label: "↓Price", value: "price_desc" as const },
            { label: "New", value: "newest" as const },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                sortBy === opt.value
                  ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                  : "bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(true)}
            className='px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/40 flex items-center gap-1'
          >
            <SlidersHorizontal size={10} /> More
          </button>
        </div>
      )}

      {/* ── Live data indicator ── */}
      {dataInfo?.source === "pokemon_tcg_api" && !loading && (
        <div className='px-4 pb-2'>
          <div className='rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.12)] p-2.5 flex items-start gap-2'>
            <Sparkles size={14} className='text-emerald-400 shrink-0 mt-0.5' />
            <p className='text-[10px] text-[#f0ede6]/50 leading-relaxed'>
              Live prices from Pokémon TCG API — TCGPlayer & CardMarket market
              data. Prices in {currency}.
            </p>
          </div>
        </div>
      )}

      {/* ── Data source info / error ── */}
      {(error || (dataInfo?.source === "mock" && !loading)) && (
        <div className='px-4 pb-2'>
          <div className='rounded-xl bg-[rgba(255,200,0,0.06)] border border-[rgba(255,200,0,0.12)] p-2.5 flex items-start gap-2'>
            <AlertTriangle
              size={14}
              className='text-[#ffc800] shrink-0 mt-0.5'
            />
            <p className='text-[10px] text-[#f0ede6]/50 leading-relaxed'>
              {error ||
                "Showing sample listings. Connect Supabase to enable real-time aggregation from Facebook Marketplace, Carousell HK, and more."}
            </p>
          </div>
        </div>
      )}

      {/* ── Results count + view toggle ── */}
      <div className='px-4 pb-2 flex items-center justify-between'>
        <p className='text-[10px] font-mono text-[#f0ede6]/30 uppercase tracking-widest'>
          {loading
            ? "Searching..."
            : `${displayListings.length}${dataInfo?.totalCount ? ` of ${dataInfo.totalCount}` : ""} listings`}
        </p>
        <div className='flex items-center gap-2'>
          {dataInfo?.source === "facebook_marketplace" &&
            dataInfo.liveCount && (
              <span className='text-[9px] font-mono text-emerald-400 flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                {dataInfo.liveCount} live
              </span>
            )}
          <div className='flex items-center bg-[#141418] rounded-lg border border-[rgba(245,245,220,0.06)] p-0.5'>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]"
                  : "text-[#f0ede6]/30 hover:text-[#f0ede6]/50"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]"
                  : "text-[#f0ede6]/30 hover:text-[#f0ede6]/50"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Listings ── */}
      <div className='px-4 pb-8'>
        <AnimatePresence mode='popLayout'>
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
                  : "space-y-2.5"
              }
            >
              {Array.from({ length: viewMode === "grid" ? 12 : 5 }).map(
                (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.04)] overflow-hidden'
                  >
                    {viewMode === "grid" ? (
                      <div>
                        <div className='aspect-square bg-gradient-to-r from-[rgba(245,245,220,0.03)] via-[rgba(245,245,220,0.06)] to-[rgba(245,245,220,0.03)] animate-shimmer bg-[length:200%_100%]' />
                        <div className='p-2 space-y-1.5'>
                          <div className='h-2.5 rounded bg-gradient-to-r from-[rgba(245,245,220,0.04)] via-[rgba(245,245,220,0.07)] to-[rgba(245,245,220,0.04)] animate-shimmer bg-[length:200%_100%]' />
                          <div className='h-2.5 rounded bg-gradient-to-r from-[rgba(245,245,220,0.03)] via-[rgba(245,245,220,0.05)] to-[rgba(245,245,220,0.03)] animate-shimmer bg-[length:200%_100%] w-2/3' />
                          <div className='h-3 rounded bg-gradient-to-r from-[rgba(245,245,220,0.04)] via-[rgba(245,245,220,0.06)] to-[rgba(245,245,220,0.04)] animate-shimmer bg-[length:200%_100%] w-1/2 mt-1' />
                        </div>
                      </div>
                    ) : (
                      <div className='flex gap-3 p-3'>
                        <div className='w-20 h-20 rounded-xl bg-gradient-to-r from-[rgba(245,245,220,0.03)] via-[rgba(245,245,220,0.06)] to-[rgba(245,245,220,0.03)] animate-shimmer bg-[length:200%_100%] shrink-0' />
                        <div className='flex-1 space-y-2'>
                          <div className='h-3.5 rounded bg-gradient-to-r from-[rgba(245,245,220,0.04)] via-[rgba(245,245,220,0.07)] to-[rgba(245,245,220,0.04)] animate-shimmer bg-[length:200%_100%] w-3/4' />
                          <div className='h-3 rounded bg-gradient-to-r from-[rgba(245,245,220,0.03)] via-[rgba(245,245,220,0.05)] to-[rgba(245,245,220,0.03)] animate-shimmer bg-[length:200%_100%] w-1/2' />
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          ) : displayListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-16 gap-4'
            >
              <div className='text-5xl'>{category?.emoji || "🔍"}</div>
              <div className='text-center'>
                <p className='text-sm font-bold text-[#f5f5dc]'>
                  No listings found
                </p>
                <p className='text-xs text-[#f0ede6]/40 mt-1 max-w-xs'>
                  Try adjusting your filters or search terms.
                </p>
              </div>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'>
              {displayListings.map((listing, i) => (
                <GridCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  currency={currency}
                  isWatched={isWatched(listing.id)}
                  onToggleWatch={() => toggleWatch(listing.id)}
                  onOpenDetail={() => openCardDetail(listing)}
                  sparklineData={getSparklineData(i)}
                />
              ))}
            </div>
          ) : (
            <div className='space-y-2.5'>
              {displayListings.map((listing, i) => (
                <ListCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  currency={currency}
                  isWatched={isWatched(listing.id)}
                  onToggleWatch={() => toggleWatch(listing.id)}
                  onOpenDetail={() => openCardDetail(listing)}
                  sparklineData={getSparklineData(i)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* ── Load More / Infinite Scroll ── */}
        {hasMore && !loading && displayListings.length > 0 && (
          <div ref={loadMoreRef} className='flex justify-center pt-6 pb-4'>
            {loadingMore ? (
              <div className='flex items-center gap-2 text-[#f0ede6]/30'>
                <Loader2 size={16} className='animate-spin' />
                <span className='text-xs font-mono'>Loading more...</span>
              </div>
            ) : (
              <button
                onClick={loadMore}
                className='px-6 py-2.5 rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.08)] text-xs font-bold text-[#f0ede6]/50 hover:text-[#f0ede6]/70 hover:border-[rgba(255,45,45,0.2)] transition-all'
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Card Detail Modal ── */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            listing={selectedCard}
            breakdown={cardBreakdown}
            loading={breakdownLoading}
            currency={currency}
            onClose={() => {
              setSelectedCard(null);
              setCardBreakdown(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─── Grid Card ─── */
function GridCard({
  listing,
  index,
  currency,
  isWatched,
  onToggleWatch,
  onOpenDetail,
  sparklineData,
}: {
  listing: AggregatorListing;
  index: number;
  currency: "HKD" | "USD";
  isWatched: boolean;
  onToggleWatch: () => void;
  onOpenDetail: () => void;
  sparklineData: number[];
}) {
  const deal = getDealLabel(listing.deal_score);
  const discount = listing.original_price_hkd
    ? Math.round(
        ((listing.original_price_hkd - listing.price_hkd) /
          listing.original_price_hkd) *
          100,
      )
    : null;
  const usdPrice = Math.round(listing.price_hkd / USD_TO_HKD);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      layout
    >
      <div className='block group relative'>
        <div
          className={`rounded-xl border overflow-hidden transition-all group-hover:border-[rgba(255,45,45,0.2)] group-hover:bg-[rgba(255,45,45,0.02)] ${
            listing.is_deal
              ? "bg-[#141418] border-[rgba(255,45,45,0.12)]"
              : "bg-[#141418] border-[rgba(245,245,220,0.05)]"
          }`}
        >
          {/* Image */}
          <div className='p-1.5 pb-0'>
            <div
              className='aspect-square relative overflow-hidden rounded-lg cursor-pointer'
              style={{
                background: "linear-gradient(135deg, #1a1a22, #0d0d0f)",
              }}
              onClick={onOpenDetail}
            >
              <img
                src={
                  listing.image_url ||
                  getCategoryPlaceholderImage(listing.category)
                }
                alt={listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105 rounded-lg'
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    getCategoryPlaceholderImage(listing.category);
                }}
              />
              {listing.is_deal && (
                <div className='absolute top-1 left-1'>
                  <span
                    className='text-[7px] font-bold px-1 py-0.5 rounded-full backdrop-blur-sm'
                    style={{
                      background: `${deal.color}30`,
                      color: deal.color,
                      border: `1px solid ${deal.color}50`,
                    }}
                  >
                    🔥
                  </span>
                </div>
              )}
              <div className='absolute top-1 right-1 flex gap-1'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatch();
                  }}
                  className='p-1 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors'
                >
                  {isWatched ? (
                    <Eye size={10} className='text-[#fbbf24]' />
                  ) : (
                    <EyeOff size={10} className='text-white/50' />
                  )}
                </button>
                <span className='text-[7px] font-mono px-1 py-0.5 rounded-full bg-black/50 text-white/70 backdrop-blur-sm'>
                  {getSourceIcon(listing.source)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-2 pt-1.5'>
            <h3
              className='text-[11px] sm:text-xs font-semibold text-[#f5f5dc] leading-tight line-clamp-2 group-hover:text-white transition-colors min-h-[28px] cursor-pointer'
              onClick={onOpenDetail}
            >
              {listing.title}
            </h3>
            <div className='flex items-center gap-1 mt-1'>
              <PriceDisplay
                hkd={listing.price_hkd}
                usd={usdPrice}
                currency={currency}
                size='normal'
              />
              {discount && (
                <span className='text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded'>
                  -{discount}%
                </span>
              )}
            </div>
            {/* Sparkline */}
            <div className='mt-1.5'>
              <Sparkline data={sparklineData} width={50} height={16} />
            </div>
            <div className='flex items-center gap-1 mt-1 flex-wrap'>
              {listing.condition && (
                <span className='text-[7px] px-1 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/40'>
                  {listing.condition}
                </span>
              )}
              <span className='text-[7px] text-[#f0ede6]/20 font-mono flex items-center gap-0.5 ml-auto'>
                <Clock size={7} />
                {formatTimeAgo(listing.last_seen)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── List Card ─── */
function ListCard({
  listing,
  index,
  currency,
  isWatched,
  onToggleWatch,
  onOpenDetail,
  sparklineData,
}: {
  listing: AggregatorListing;
  index: number;
  currency: "HKD" | "USD";
  isWatched: boolean;
  onToggleWatch: () => void;
  onOpenDetail: () => void;
  sparklineData: number[];
}) {
  const deal = getDealLabel(listing.deal_score);
  const discount = listing.original_price_hkd
    ? Math.round(
        ((listing.original_price_hkd - listing.price_hkd) /
          listing.original_price_hkd) *
          100,
      )
    : null;
  const usdPrice = Math.round(listing.price_hkd / USD_TO_HKD);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      layout
    >
      <div className='block group'>
        <div
          className={`rounded-2xl p-3 border transition-all group-hover:border-[rgba(255,45,45,0.2)] group-hover:bg-[rgba(255,45,45,0.02)] ${
            listing.is_deal
              ? "bg-[#141418] border-[rgba(255,45,45,0.12)]"
              : "bg-[#141418] border-[rgba(245,245,220,0.05)]"
          }`}
        >
          <div className='flex gap-3'>
            {/* Image */}
            <div
              className='w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative cursor-pointer'
              style={{
                background: "linear-gradient(135deg, #1a1a22, #0d0d0f)",
              }}
              onClick={onOpenDetail}
            >
              <img
                src={
                  listing.image_url ||
                  getCategoryPlaceholderImage(listing.category)
                }
                alt={listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    getCategoryPlaceholderImage(listing.category);
                }}
              />
              {listing.is_deal && (
                <div className='absolute top-1 left-1'>
                  <span
                    className='text-[7px] font-bold px-1 py-0.5 rounded-full backdrop-blur-sm'
                    style={{
                      background: `${deal.color}30`,
                      color: deal.color,
                      border: `1px solid ${deal.color}50`,
                    }}
                  >
                    🔥
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0 flex flex-col justify-between'>
              <div>
                <div className='flex items-start justify-between gap-2'>
                  <h3
                    className='text-[13px] font-semibold text-[#f5f5dc] leading-tight line-clamp-2 group-hover:text-white transition-colors cursor-pointer'
                    onClick={onOpenDetail}
                  >
                    {listing.title}
                  </h3>
                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      onClick={onToggleWatch}
                      className='p-1 rounded-lg hover:bg-white/5 transition-colors'
                    >
                      {isWatched ? (
                        <Eye size={12} className='text-[#fbbf24]' />
                      ) : (
                        <EyeOff size={12} className='text-[#f0ede6]/20' />
                      )}
                    </button>
                    <ExternalLink
                      size={12}
                      className='text-[#f0ede6]/15 group-hover:text-[#ff2d2d]/40 transition-colors'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-2 mt-1'>
                  <PriceDisplay
                    hkd={listing.price_hkd}
                    usd={usdPrice}
                    currency={currency}
                    size='large'
                  />
                  {listing.original_price_hkd &&
                    listing.original_price_hkd > listing.price_hkd && (
                      <>
                        <span className='text-[11px] text-[#f0ede6]/30 line-through'>
                          {currency}{" "}
                          {currency === "HKD"
                            ? listing.original_price_hkd.toLocaleString()
                            : Math.round(
                                listing.original_price_hkd / USD_TO_HKD,
                              ).toLocaleString()}
                        </span>
                        {discount && (
                          <span className='text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded'>
                            -{discount}%
                          </span>
                        )}
                      </>
                    )}
                </div>
                {/* Sparkline */}
                <div className='mt-1'>
                  <Sparkline data={sparklineData} width={60} height={18} />
                </div>
              </div>

              <div className='flex items-center gap-1.5 flex-wrap mt-1.5'>
                {listing.is_deal && (
                  <span
                    className='text-[8px] font-bold px-1.5 py-0.5 rounded-full'
                    style={{
                      background: `${deal.color}20`,
                      color: deal.color,
                      border: `1px solid ${deal.color}40`,
                    }}
                  >
                    {deal.label}
                  </span>
                )}
                <span className='text-[8px] text-[#f0ede6]/35 font-mono flex items-center gap-1'>
                  {getSourceIcon(listing.source)}
                  {getSourceName(listing.source).split(" ")[0]}
                </span>
                {listing.condition && (
                  <span className='text-[8px] px-1.5 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/40 border border-[rgba(245,245,220,0.08)]'>
                    {listing.condition}
                  </span>
                )}
                {listing.seller_rating && (
                  <span className='text-[8px] text-[#fbbf24] flex items-center gap-0.5'>
                    <Star size={8} className='fill-[#fbbf24]' />
                    {listing.seller_rating.toFixed(1)}
                  </span>
                )}
                <span className='text-[8px] text-[#f0ede6]/20 font-mono flex items-center gap-0.5 ml-auto'>
                  <Clock size={8} />
                  {formatTimeAgo(listing.last_seen)}
                </span>
              </div>
            </div>
          </div>

          {/* Deal bar */}
          {listing.is_deal && discount && (
            <div className='mt-2.5 pt-2 border-t border-[rgba(245,245,220,0.04)] flex items-center justify-between'>
              <div className='flex items-center gap-1.5'>
                <TrendingUp size={10} className='text-emerald-400' />
                <span className='text-[9px] text-emerald-400 font-mono'>
                  {discount}% below market
                </span>
              </div>
              <span className='text-[8px] text-[#f0ede6]/15 font-mono'>
                {listing.location || "Hong Kong"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Card Detail Modal ─── */
function CardDetailModal({
  listing,
  breakdown,
  loading,
  currency,
  onClose,
}: {
  listing: AggregatorListing;
  breakdown: CardPriceBreakdown | null;
  loading: boolean;
  currency: "HKD" | "USD";
  onClose: () => void;
}) {
  const usdPrice = Math.round(listing.price_hkd / USD_TO_HKD);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'
      onClick={onClose}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className='relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[#0d0d0f] border border-[rgba(245,245,220,0.08)] rounded-t-2xl sm:rounded-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-[#0d0d0f] border-b border-[rgba(245,245,220,0.06)] p-4 flex items-start gap-3 z-10'>
          <div
            className='w-16 h-16 rounded-xl shrink-0 overflow-hidden'
            style={{
              background: "linear-gradient(135deg, #1a1a22, #0d0d0f)",
            }}
          >
            <img
              src={
                listing.image_url ||
                getCategoryPlaceholderImage(listing.category)
              }
              alt={listing.title}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-sm font-bold text-[#f5f5dc] leading-tight'>
              {listing.title}
            </h2>
            <div className='flex items-center gap-2 mt-1'>
              <PriceDisplay
                hkd={listing.price_hkd}
                usd={usdPrice}
                currency={currency}
                size='large'
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0'
          >
            <X size={18} className='text-[#f0ede6]/40' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4 space-y-4'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 size={24} className='animate-spin text-[#ff2d2d]' />
            </div>
          ) : breakdown ? (
            <>
              {/* Price Comparison Table */}
              <div>
                <h3 className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                  Price Comparison
                </h3>
                <div className='rounded-xl border border-[rgba(245,245,220,0.06)] overflow-hidden'>
                  <table className='w-full text-[10px]'>
                    <thead>
                      <tr className='bg-[rgba(245,245,220,0.03)]'>
                        <th className='text-left p-2 text-[#f0ede6]/40 font-mono'>
                          Variant
                        </th>
                        <th className='text-right p-2 text-[#f0ede6]/40 font-mono'>
                          TCGPlayer
                        </th>
                        <th className='text-right p-2 text-[#f0ede6]/40 font-mono'>
                          CardMarket
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.variants.map((v, i) => (
                        <tr
                          key={v.name}
                          className={
                            i % 2 === 0 ? "bg-[rgba(245,245,220,0.01)]" : ""
                          }
                        >
                          <td className='p-2 text-[#f0ede6]/60 font-mono'>
                            {v.name}
                          </td>
                          <td className='p-2 text-right'>
                            {v.tcgplayer ? (
                              <span className='text-[#f5f5dc]'>
                                {currency}{" "}
                                {currency === "HKD"
                                  ? Math.round(
                                      v.tcgplayer.market * USD_TO_HKD,
                                    ).toLocaleString()
                                  : v.tcgplayer.market.toFixed(2)}
                              </span>
                            ) : (
                              <span className='text-[#f0ede6]/20'>—</span>
                            )}
                          </td>
                          <td className='p-2 text-right'>
                            {v.cardmarket ? (
                              <span className='text-[#f5f5dc]'>
                                {currency}{" "}
                                {currency === "HKD"
                                  ? Math.round(
                                      v.cardmarket.avg * 8.4,
                                    ).toLocaleString()
                                  : v.cardmarket.avg.toFixed(2)}
                              </span>
                            ) : (
                              <span className='text-[#f0ede6]/20'>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Price */}
              <div className='rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.12)] p-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[9px] font-mono text-[#f0ede6]/40'>
                      Best Price
                    </p>
                    <p className='text-sm font-black text-emerald-400 mt-0.5'>
                      {currency}{" "}
                      {currency === "HKD"
                        ? breakdown.bestPriceHKD.toLocaleString()
                        : breakdown.bestPriceUSD.toFixed(2)}
                    </p>
                  </div>
                  <span className='text-[9px] font-mono text-[#f0ede6]/30'>
                    {breakdown.bestPriceSource}
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className='flex gap-2'>
                <a
                  href={breakdown.tcgplayerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 py-2 rounded-lg bg-[rgba(13,110,253,0.1)] border border-[rgba(13,110,253,0.2)] text-[10px] font-mono text-center text-[#0D6EFD] hover:bg-[rgba(13,110,253,0.15)] transition-colors'
                >
                  View on TCGPlayer →
                </a>
                <a
                  href={breakdown.cardmarketUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 py-2 rounded-lg bg-[rgba(255,102,0,0.1)] border border-[rgba(255,102,0,0.2)] text-[10px] font-mono text-center text-[#FF6600] hover:bg-[rgba(255,102,0,0.15)] transition-colors'
                >
                  View on CardMarket →
                </a>
              </div>
            </>
          ) : (
            <div className='text-center py-8'>
              <p className='text-xs text-[#f0ede6]/40'>
                No detailed pricing available
              </p>
              <a
                href={listing.source_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block mt-3 px-4 py-2 rounded-lg bg-[rgba(255,45,45,0.1)] border border-[rgba(255,45,45,0.2)] text-xs font-mono text-[#ff2d2d] hover:bg-[rgba(255,45,45,0.15)] transition-colors'
              >
                View Listing →
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
