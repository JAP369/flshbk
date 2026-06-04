"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  MapPin,
  Star,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronDown,
  AlertTriangle,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import {
  getDeals,
  getAggregatorListings,
  type AggregatorFilters,
} from "@/lib/api/aggregator";
import { getMockAggregatorListings } from "@/lib/data/mockData";
import type { AggregatorListing, ItemCategory } from "@/lib/types/database";
import { getDealLabel } from "@/lib/aggregator/scorer";
import {
  getEnabledSources,
  MARKETPLACE_SOURCES,
  type MarketplaceSource,
} from "@/lib/aggregator/sources";

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
    pokemon_card: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23fbbf24' text-anchor='middle' dy='.3em'%3E🃏%3C/text%3E%3C/svg%3E",
    lego: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%2360a5fa' text-anchor='middle' dy='.3em'%3E🧱%3C/text%3E%3C/svg%3E",
    hot_toys: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23c084fc' text-anchor='middle' dy='.3em'%3E🎭%3C/text%3E%3C/svg%3E",
    pop_mart: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23ff2d2d' text-anchor='middle' dy='.3em'%3E🎪%3C/text%3E%3C/svg%3E",
    hot_wheels: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%234ade80' text-anchor='middle' dy='.3em'%3E🏎️%3C/text%3E%3C/svg%3E",
    funko: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a22' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23fbbf24' text-anchor='middle' dy='.3em'%3E🎨%3C/text%3E%3C/svg%3E",
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

/* ─── Main Page ─── */
export default function CategoryPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const categoryId = params.category as string;
  const normalizedCategoryId = categoryId === "pokemon" ? "tcg" : categoryId;
  const category = getCategory(normalizedCategoryId);

  // Redirect to home if not authenticated
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
        <h1 className='text-xl font-black text-[#f5f5dc] mb-2'>Category not found</h1>
        <p className='text-sm text-[#f0ede6]/40 mb-4'>This category does not exist.</p>
        <Link href='/'>
          <span className='text-sm text-[#ff2d2d] font-mono hover:underline'>← Back to Dashboard</span>
        </Link>
      </main>
    );
  }

  return <CategoryListings category={category} normalizedCategoryId={normalizedCategoryId} />;
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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDealsOnly, setShowDealsOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deal_score" | "price_asc" | "price_desc" | "newest">("deal_score");
  const [showFilters, setShowFilters] = useState(false);
  const [dataInfo, setDataInfo] = useState<{ source: string; liveCount?: number } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data fallback — memoized so it doesn't cause infinite re-renders
  const mockListings = useMemo(
    () => getMockAggregatorListings(normalizedCategoryId),
    [normalizedCategoryId],
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch listings
  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      setError(null);

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
          limit: 50,
        };

        let result;
        if (showDealsOnly && !debouncedSearch) {
          result = await getDeals(50);
        } else {
          result = await getAggregatorListings(filters);
        }

        if (cancelled) return;

        if (result.data.length > 0) {
          setListings(result.data);
          setDataInfo({
            source: (result as any).source || "aggregator",
            liveCount: (result as any).liveCount,
          });
        } else {
          setListings(mockListings);
          setDataInfo({ source: "mock" });
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[Category] Fetch failed:", err);
        setListings(mockListings);
        setDataInfo({ source: "mock" });
        setError("Could not fetch live data. Showing sample listings.");
      }

      if (!cancelled) setLoading(false);
    };

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, [normalizedCategoryId, debouncedSearch, selectedSource, showDealsOnly, sortBy, mockListings]);

  const hasActiveFilters = selectedSource !== "all" || showDealsOnly || debouncedSearch !== "";
  const displayListings = listings;
  const sources = getEnabledSources();

  const clearFilters = () => {
    setSelectedSource("all");
    setShowDealsOnly(false);
    setSortBy("deal_score");
    setSearch("");
  };

  return (
    <main className='flex flex-col min-h-screen'>
      {/* ── Hero Header ── */}
      <div
        className='relative px-4 pt-4 pb-4 overflow-hidden'
        style={{
          background: `linear-gradient(180deg, ${category.color}08 0%, transparent 100%)`,
        }}
      >
        <div className='flex items-center gap-3 mb-2'>
          <div
            className='w-12 h-12 rounded-2xl flex items-center justify-center'
            style={{ background: `${category.color}18`, border: `1px solid ${category.color}30` }}
          >
            <span className='text-2xl'>{category.emoji}</span>
          </div>
          <div className='flex-1'>
            <h1 className='text-xl font-black text-[#f5f5dc] leading-tight'>
              {category.name}
            </h1>
            <p className='text-[11px] text-[#f0ede6]/40 mt-0.5'>{category.description}</p>
          </div>
        </div>

        {/* Subcategories */}
        <div className='flex gap-1.5 mt-2 overflow-x-auto no-scrollbar'>
          {category.subcategories.map((sub) => (
            <span
              key={sub}
              className='shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)]'
            >
              {sub}
            </span>
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

      {/* ── Search ── */}
      <div className='px-4 pb-2'>
        <div className='relative'>
          <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30' />
          <input
            type='text'
            placeholder={`Search ${category?.name.toLowerCase() || 'items'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.08)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/25 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
          />
          <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
            {search && (
              <button onClick={() => setSearch('')} className='p-1.5 rounded-lg hover:bg-white/5'>
                <X size={14} className='text-[#f0ede6]/30' />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]' : 'hover:bg-white/5 text-[#f0ede6]/30'}`}
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
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-4 pb-3 space-y-3'>
              {/* Sort + Deals */}
              <div className='flex gap-2 flex-wrap'>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDealsOnly(!showDealsOnly)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    showDealsOnly
                      ? 'bg-[#ff2d2d] text-white shadow-[0_0_12px_rgba(255,45,45,0.3)]'
                      : 'bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50'
                  }`}
                >
                  <Flame size={12} /> Hot Deals
                </motion.button>

                {[
                  { label: "Best Deals", value: "deal_score" as const, icon: Star },
                  { label: "Low → High", value: "price_asc" as const, icon: ArrowUpDown },
                  { label: "High → Low", value: "price_desc" as const, icon: ArrowUpDown },
                  { label: "Newest", value: "newest" as const, icon: Clock },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      sortBy === opt.value
                        ? 'bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]'
                        : 'bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50'
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
                    onClick={() => setSelectedSource('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                      selectedSource === 'all'
                        ? 'bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.25)]'
                        : 'bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40'
                    }`}
                  >
                    All
                  </button>
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(selectedSource === source.id ? 'all' : source.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
                        selectedSource === source.id
                          ? 'text-white border'
                          : 'bg-[#141418] border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/40'
                      }`}
                      style={
                        selectedSource === source.id
                          ? { background: `${source.color}25`, borderColor: `${source.color}50`, color: source.color }
                          : {}
                      }
                    >
                      {source.icon} {source.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

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

      {/* ── Quick filter pills (always visible) ── */}
      {!showFilters && (
        <div className='px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar'>
          <button
            onClick={() => setShowDealsOnly(!showDealsOnly)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
              showDealsOnly
                ? 'bg-[#ff2d2d] text-white'
                : 'bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/40'
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
                  ? 'bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]'
                  : 'bg-[#141418] border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/40'
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

      {/* ── Data source info / error ── */}
      {(error || (dataInfo?.source === 'mock' && !loading)) && (
        <div className='px-4 pb-2'>
          <div className='rounded-xl bg-[rgba(255,200,0,0.06)] border border-[rgba(255,200,0,0.12)] p-2.5 flex items-start gap-2'>
            <AlertTriangle size={14} className='text-[#ffc800] shrink-0 mt-0.5' />
            <p className='text-[10px] text-[#f0ede6]/50 leading-relaxed'>
              {error || 'Showing sample listings. Connect Supabase to enable real-time aggregation from Facebook Marketplace, Carousell HK, and more.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Results count + view toggle ── */}
      <div className='px-4 pb-2 flex items-center justify-between'>
        <p className='text-[10px] font-mono text-[#f0ede6]/30 uppercase tracking-widest'>
          {loading ? 'Searching...' : `${displayListings.length} listings`}
        </p>
        <div className='flex items-center gap-2'>
          {dataInfo?.source === 'facebook_marketplace' && dataInfo.liveCount && (
            <span className='text-[9px] font-mono text-emerald-400 flex items-center gap-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
              {dataInfo.liveCount} live
            </span>
          )}
          <div className='flex items-center bg-[#141418] rounded-lg border border-[rgba(245,245,220,0.06)] p-0.5'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]'
                  : 'text-[#f0ede6]/30 hover:text-[#f0ede6]/50'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]'
                  : 'text-[#f0ede6]/30 hover:text-[#f0ede6]/50'
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
            <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-2' : 'space-y-2.5'}>
              {Array.from({ length: viewMode === 'grid' ? 12 : 5 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.04)] overflow-hidden'
                >
                  {viewMode === 'grid' ? (
                    <div>
                      <div className='aspect-square bg-[rgba(245,245,220,0.03)] animate-pulse' />
                      <div className='p-2 space-y-1.5'>
                        <div className='h-2.5 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-full' />
                        <div className='h-2.5 rounded bg-[rgba(245,245,220,0.03)] animate-pulse w-2/3' />
                        <div className='h-3 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-1/2 mt-1' />
                      </div>
                    </div>
                  ) : (
                    <div className='flex gap-3 p-3'>
                      <div className='w-20 h-20 rounded-xl bg-[rgba(245,245,220,0.03)] animate-pulse shrink-0' />
                      <div className='flex-1 space-y-2'>
                        <div className='h-3.5 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-3/4' />
                        <div className='h-3 rounded bg-[rgba(245,245,220,0.03)] animate-pulse w-1/2' />
                        <div className='flex gap-2 mt-2'>
                          <div className='h-4 w-14 rounded-full bg-[rgba(245,245,220,0.03)] animate-pulse' />
                          <div className='h-4 w-18 rounded-full bg-[rgba(245,245,220,0.03)] animate-pulse' />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : displayListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-16 gap-4'
            >
              <div className='text-5xl'>{category?.emoji || '🔍'}</div>
              <div className='text-center'>
                <p className='text-sm font-bold text-[#f5f5dc]'>No listings found</p>
                <p className='text-xs text-[#f0ede6]/40 mt-1 max-w-xs'>
                  Try adjusting your filters or search terms.
                </p>
              </div>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div className='grid grid-cols-4 gap-2'>
              {displayListings.map((listing, i) => (
                <GridCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          ) : (
            <div className='space-y-2.5'>
              {displayListings.map((listing, i) => (
                <ListCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ─── Grid Card ─── */
function GridCard({ listing, index }: { listing: AggregatorListing; index: number }) {
  const deal = getDealLabel(listing.deal_score);
  const discount = listing.original_price_hkd
    ? Math.round(((listing.original_price_hkd - listing.price_hkd) / listing.original_price_hkd) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      layout
    >
      <a
        href={listing.source_url}
        target='_blank'
        rel='noopener noreferrer'
        className='block group'
      >
        <div
          className={`rounded-xl border overflow-hidden transition-all group-hover:border-[rgba(255,45,45,0.2)] group-hover:bg-[rgba(255,45,45,0.02)] ${
            listing.is_deal
              ? 'bg-[#141418] border-[rgba(255,45,45,0.12)]'
              : 'bg-[#141418] border-[rgba(245,245,220,0.05)]'
          }`}
        >
          {/* Image */}
          <div className='p-1.5 pb-0'>
            <div
              className='aspect-square relative overflow-hidden rounded-lg'
              style={{ background: 'linear-gradient(135deg, #1a1a22, #0d0d0f)' }}
            >
              <img
                src={listing.image_url || getCategoryPlaceholderImage(listing.category)}
                alt={listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105 rounded-lg'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCategoryPlaceholderImage(listing.category);
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
              <div className='absolute top-1 right-1'>
                <span className='text-[7px] font-mono px-1 py-0.5 rounded-full bg-black/50 text-white/70 backdrop-blur-sm'>
                  {getSourceIcon(listing.source)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-1.5 pt-1'>
            <h3 className='text-[10px] font-semibold text-[#f5f5dc] leading-tight line-clamp-2 group-hover:text-white transition-colors min-h-[24px]'>
              {listing.title}
            </h3>
            <div className='flex items-center gap-1 mt-1'>
              <span className='text-[11px] font-black text-[#f5f5dc]'>
                HKD {listing.price_hkd.toLocaleString()}
              </span>
              {discount && (
                <span className='text-[7px] font-bold text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded'>
                  -{discount}%
                </span>
              )}
            </div>
            <div className='flex items-center gap-1 mt-1 flex-wrap'>
              {listing.condition && (
                <span className='text-[6px] px-1 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/40'>
                  {listing.condition}
                </span>
              )}
              <span className='text-[6px] text-[#f0ede6]/20 font-mono flex items-center gap-0.5 ml-auto'>
                <Clock size={6} />
                {formatTimeAgo(listing.last_seen)}
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

/* ─── List Card ─── */
function ListCard({ listing, index }: { listing: AggregatorListing; index: number }) {
  const deal = getDealLabel(listing.deal_score);
  const discount = listing.original_price_hkd
    ? Math.round(((listing.original_price_hkd - listing.price_hkd) / listing.original_price_hkd) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      layout
    >
      <a
        href={listing.source_url}
        target='_blank'
        rel='noopener noreferrer'
        className='block group'
      >
        <div
          className={`rounded-2xl p-3 border transition-all group-hover:border-[rgba(255,45,45,0.2)] group-hover:bg-[rgba(255,45,45,0.02)] ${
            listing.is_deal
              ? 'bg-[#141418] border-[rgba(255,45,45,0.12)]'
              : 'bg-[#141418] border-[rgba(245,245,220,0.05)]'
          }`}
        >
          <div className='flex gap-3'>
            {/* Image */}
            <div
              className='w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative'
              style={{ background: 'linear-gradient(135deg, #1a1a22, #0d0d0f)' }}
            >
              <img
                src={listing.image_url || getCategoryPlaceholderImage(listing.category)}
                alt={listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCategoryPlaceholderImage(listing.category);
                }}
              />
              {listing.is_deal && (
                <div className='absolute top-1 left-1'>
                  <span className='text-[7px] font-bold px-1 py-0.5 rounded-full backdrop-blur-sm'
                    style={{ background: `${deal.color}30`, color: deal.color, border: `1px solid ${deal.color}50` }}
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
                  <h3 className='text-[13px] font-semibold text-[#f5f5dc] leading-tight line-clamp-2 group-hover:text-white transition-colors'>
                    {listing.title}
                  </h3>
                  <ExternalLink size={12} className='text-[#f0ede6]/15 shrink-0 mt-0.5 group-hover:text-[#ff2d2d]/40 transition-colors' />
                </div>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-[15px] font-black text-[#f5f5dc]'>
                    HKD {listing.price_hkd.toLocaleString()}
                  </span>
                  {listing.original_price_hkd && listing.original_price_hkd > listing.price_hkd && (
                    <>
                      <span className='text-[11px] text-[#f0ede6]/30 line-through'>
                        HKD {listing.original_price_hkd.toLocaleString()}
                      </span>
                      {discount && (
                        <span className='text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded'>
                          -{discount}%
                        </span>
                      )}
                    </>
                  )}
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
                  {getSourceName(listing.source).split(' ')[0]}
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
                {listing.location || 'Hong Kong'}
              </span>
            </div>
          )}
        </div>
      </a>
    </motion.div>
  );
}

