"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  Star,
  MapPin,
  Clock,
  Flame,
  X,
  TrendingUp,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES, getCategory } from "@/lib/data/categories";
import {
  getDeals,
  getAggregatorListings,
  type AggregatorFilters,
} from "@/lib/api/aggregator";
import type { AggregatorListing } from "@/lib/types/database";
import { getDealLabel } from "@/lib/aggregator/scorer";
import {
  getEnabledSources,
  type MarketplaceSource,
} from "@/lib/aggregator/sources";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategory(categoryId);
  const [listings, setListings] = useState<AggregatorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDealsOnly, setShowDealsOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "deal_score" | "price_asc" | "price_desc" | "newest"
  >("deal_score");
  const [sources] = useState<MarketplaceSource[]>(getEnabledSources());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchListings = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const filters: AggregatorFilters = {
        category:
          categoryId === "pokemon" ? "pokemon_card" : (categoryId as any),
        search: debouncedSearch || undefined,
        source: selectedSource === "all" ? undefined : selectedSource,
        dealsOnly: showDealsOnly,
        sortBy,
        limit: 50,
      };

      if (showDealsOnly && !debouncedSearch) {
        const deals = await getDeals(30);
        setListings(deals);
      } else {
        const data = await getAggregatorListings(filters);
        setListings(data);
      }
    } catch {
      setListings([]);
    }
    setLoading(false);
  }, [
    category,
    categoryId,
    debouncedSearch,
    selectedSource,
    showDealsOnly,
    sortBy,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Category not found
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

  const hasActiveFilters = selectedSource !== "all" || showDealsOnly;

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Category header */}
      <div className='px-4 pt-4 pb-2'>
        <div className='flex items-center gap-3 mb-1'>
          <span className='text-3xl'>{category.emoji}</span>
          <div>
            <h1 className='text-xl font-black text-[#f5f5dc]'>
              {category.name}
            </h1>
            <p className='text-xs text-[#f0ede6]/40'>{category.description}</p>
          </div>
        </div>

        {/* Subcategory pills */}
        <div className='flex gap-1.5 mt-3 overflow-x-auto pb-1'>
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
        <div className='flex gap-1.5 mt-2 overflow-x-auto pb-1'>
          {category.marketplaces.map((mp) => (
            <span
              key={mp}
              className='shrink-0 text-[9px] px-2 py-0.5 rounded bg-[rgba(255,45,45,0.08)] text-[#ff2d2d]/70 border border-[rgba(255,45,45,0.15)]'
            >
              {mp}
            </span>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className='px-4 pb-2'>
        <div className='relative'>
          <Search
            size={16}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30'
          />
          <input
            type='text'
            placeholder={`Search ${category.name.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30'
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Quick filters */}
      <div className='px-4 pb-3 flex gap-2 overflow-x-auto'>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowDealsOnly(!showDealsOnly)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            showDealsOnly
              ? "bg-[#ff2d2d] text-white"
              : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
          }`}
        >
          <Flame size={12} /> Hot Deals
        </motion.button>

        {[
          { label: "Best Deals", value: "deal_score" as const },
          { label: "Price Asc", value: "price_asc" as const },
          { label: "Price Desc", value: "price_desc" as const },
          { label: "Newest", value: "newest" as const },
        ].map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSortBy(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              sortBy === opt.value
                ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
            }`}
          >
            {opt.label}
          </motion.button>
        ))}

        {sources.map((source) => (
          <motion.button
            key={source.id}
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              setSelectedSource(
                selectedSource === source.id ? "all" : source.id,
              )
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSource === source.id
                ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
            }`}
          >
            {source.icon} {source.name.split(" ")[0]}
          </motion.button>
        ))}
      </div>

      {/* Results count */}
      <div className='px-4 pb-1 flex items-center justify-between'>
        <p className='text-[10px] font-mono text-[#f0ede6]/30 uppercase tracking-widest'>
          {loading ? "Searching..." : `${listings.length} listings found`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedSource("all");
              setShowDealsOnly(false);
              setSortBy("deal_score");
            }}
            className='text-[10px] text-[#ff2d2d] font-mono hover:underline'
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Listings */}
      <div className='px-4 py-2 flex flex-col gap-3 pb-8'>
        <AnimatePresence mode='popLayout'>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'
              >
                <div className='flex gap-3'>
                  <div className='w-20 h-20 rounded-xl bg-[rgba(245,245,220,0.05)] animate-pulse' />
                  <div className='flex-1 flex flex-col gap-2'>
                    <div className='h-4 rounded bg-[rgba(245,245,220,0.05)] animate-pulse w-3/4' />
                    <div className='h-3 rounded bg-[rgba(245,245,220,0.05)] animate-pulse w-1/2' />
                  </div>
                </div>
              </motion.div>
            ))
          ) : listings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-16 gap-4'
            >
              <div className='text-5xl'>{category.emoji}</div>
              <div className='text-center'>
                <p className='text-sm font-bold text-[#f5f5dc]'>
                  No listings found
                </p>
                <p className='text-xs text-[#f0ede6]/40 mt-1 max-w-xs'>
                  {categoryId === "pokemon"
                    ? "Connect your Supabase project to start aggregating real listings from Hong Kong marketplaces."
                    : `Aggregation for ${category.name} is coming soon. Connect Supabase to enable real-time data.`}
                </p>
              </div>
              <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)] max-w-xs w-full'>
                <p className='text-[10px] font-mono text-[#ff2d2d] uppercase tracking-widest mb-2'>
                  Coming Soon
                </p>
                <ul className='text-xs text-[#f0ede6]/50 space-y-1 list-disc list-inside'>
                  <li>Real-time price aggregation</li>
                  <li>Deal scoring algorithm</li>
                  <li>Multi-marketplace search</li>
                  <li>Price alerts</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            listings.map((listing, i) => {
              const deal = getDealLabel(listing.deal_score);
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <a
                    href={listing.source_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block'
                  >
                    <div
                      className={`glass rounded-2xl p-3 border transition-all hover:border-[rgba(255,45,45,0.2)] cursor-pointer ${listing.is_deal ? "border-[rgba(255,45,45,0.15)]" : "border-[rgba(245,245,220,0.06)]"}`}
                    >
                      <div className='flex gap-3'>
                        <div
                          className='w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden'
                          style={{
                            background:
                              "linear-gradient(135deg, #1a1a22, #0d0d0f)",
                          }}
                        >
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='text-3xl'>{category.emoji}</span>
                          )}
                        </div>
                        <div className='flex-1 min-w-0 flex flex-col justify-between'>
                          <div>
                            <div className='flex items-start justify-between gap-2'>
                              <h3 className='text-sm font-semibold text-[#f5f5dc] leading-tight line-clamp-2'>
                                {listing.title}
                              </h3>
                              <ExternalLink
                                size={12}
                                className='text-[#f0ede6]/20 shrink-0 mt-1'
                              />
                            </div>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-base font-black text-[#f5f5dc]'>
                                HKD {listing.price_hkd.toLocaleString()}
                              </span>
                              {listing.original_price_hkd &&
                                listing.original_price_hkd >
                                  listing.price_hkd && (
                                  <span className='text-xs text-[#f0ede6]/30 line-through'>
                                    HKD{" "}
                                    {listing.original_price_hkd.toLocaleString()}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 flex-wrap mt-1.5'>
                            {listing.is_deal && (
                              <span
                                className='text-[9px] font-bold px-1.5 py-0.5 rounded-full'
                                style={{
                                  background: `${deal.color}20`,
                                  color: deal.color,
                                  border: `1px solid ${deal.color}40`,
                                }}
                              >
                                {deal.label}
                              </span>
                            )}
                            <span className='text-[9px] text-[#f0ede6]/40 font-mono flex items-center gap-1'>
                              {sources.find((s) => s.id === listing.source)
                                ?.icon || "🌐"}
                              {sources.find((s) => s.id === listing.source)
                                ?.name || listing.source}
                            </span>
                            {listing.condition && (
                              <span className='text-[9px] px-1.5 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)]'>
                                {listing.condition}
                              </span>
                            )}
                            <span className='text-[9px] text-[#f0ede6]/20 font-mono flex items-center gap-1 ml-auto'>
                              <Clock size={8} />
                              {formatTimeAgo(listing.last_seen)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function formatTimeAgo(dateStr: string): string {
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
}
