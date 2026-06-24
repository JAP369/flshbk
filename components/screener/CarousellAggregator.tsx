"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  Flame,
  Clock,
  MapPin,
  Star,
  Package,
  ExternalLink,
  RefreshCw,
  Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface CarousellListing {
  id: string;
  title: string;
  seller_name: string;
  seller_rating: number | null;
  listing_age: string;
  asking_price_hkd: number;
  condition: string;
  image_url: string | null;
  listing_url: string;
  location: string;
  category: string;
  market_price_hkd: number;
  market_grade: string;
}

interface ArbitrageData {
  listing: CarousellListing;
  delta: number;
  deltaPercent: number;
  isTarget: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateArbitrage(listing: CarousellListing): ArbitrageData {
  const delta = listing.market_price_hkd - listing.asking_price_hkd;
  const deltaPercent = (delta / listing.market_price_hkd) * 100;
  const isTarget = deltaPercent >= 15;

  return {
    listing,
    delta,
    deltaPercent,
    isTarget,
  };
}

function generateCantoneseOfferScript(sellerName: string, itemTitle: string, askingPrice: number, marketPrice: number): string {
  const discount = ((marketPrice - askingPrice) / marketPrice * 100).toFixed(0);
  return `唔該好！我見到你嘅 "${itemTitle}" listing，開價 $${askingPrice.toLocaleString()}。

我查到市場價係 $${marketPrice.toLocaleString()}，你嘅價平咗大概 ${discount}%。

我係一個收藏家，想直接現金交易，唔使行平台。你嘅_item 有冇問題？包裝完好嗎？

如果你願意，我可以即刻交收，現金到手。方便約個時間地點嗎？

多謝你考慮！`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CarousellAggregator() {
  const [listings, setListings] = useState<CarousellListing[]>([]);
  const [arbitrageData, setArbitrageData] = useState<ArbitrageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"margin_desc" | "margin_asc" | "price_asc" | "price_desc" | "newest">("margin_desc");
  const [showTargetsOnly, setShowTargetsOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("sortBy", sortBy);
      params.set("limit", "50");

      const response = await fetch(`/api/scraper/carousell?${params.toString()}`);
      const result = await response.json();

      if (result.data) {
        setListings(result.data);
        const arbitrage = result.data.map(calculateArbitrage);
        setArbitrageData(arbitrage);
      }
    } catch (error) {
      console.error("Failed to fetch Carousell listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCopyScript = async (data: ArbitrageData) => {
    const script = generateCantoneseOfferScript(
      data.listing.seller_name,
      data.listing.title,
      data.listing.asking_price_hkd,
      data.listing.market_price_hkd
    );

    try {
      await navigator.clipboard.writeText(script);
      setCopiedId(data.listing.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const filteredData = showTargetsOnly
    ? arbitrageData.filter((d) => d.isTarget)
    : arbitrageData;

  const targetCount = arbitrageData.filter((d) => d.isTarget).length;
  const avgMargin = arbitrageData.length > 0
    ? arbitrageData.reduce((sum, d) => sum + d.deltaPercent, 0) / arbitrageData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Listings</p>
          <p className="font-serif text-2xl text-foreground">{listings.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Target Deals</p>
          <p className="font-serif text-2xl text-emerald-400">{targetCount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Avg Margin</p>
          <p className={`font-serif text-2xl ${avgMargin >= 15 ? "text-emerald-400" : "text-foreground"}`}>
            {avgMargin.toFixed(1)}%
          </p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-accent/50"
        >
          <option value="margin_desc">Highest Margin</option>
          <option value="margin_asc">Lowest Margin</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>

        {/* Targets Only Toggle */}
        <button
          onClick={() => setShowTargetsOnly(!showTargetsOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
            showTargetsOnly
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-surface-elevated border-border text-slate-400 hover:text-foreground"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">Targets Only</span>
        </button>

        {/* Refresh */}
        <button
          onClick={fetchListings}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-surface-elevated border border-border text-slate-400 hover:text-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredData.map((data, index) => (
              <ListingCard
                key={data.listing.id}
                data={data}
                index={index}
                copiedId={copiedId}
                onCopyScript={handleCopyScript}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {showTargetsOnly ? "No target deals found" : "No listings found"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {showTargetsOnly ? "Try turning off the targets filter" : "Try a different search term"}
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// LISTING CARD COMPONENT
// =============================================================================

function ListingCard({
  data,
  index,
  copiedId,
  onCopyScript,
}: {
  data: ArbitrageData;
  index: number;
  copiedId: string | null;
  onCopyScript: (data: ArbitrageData) => void;
}) {
  const { listing, delta, deltaPercent, isTarget } = data;
  const isPositive = delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card rounded-xl overflow-hidden border transition-all ${
        isTarget
          ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5"
          : "border-border"
      }`}
    >
      {/* Target Badge */}
      {isTarget && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-amber-500/20 px-4 py-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-emerald-400">🔥 Target Discrepancy Found</span>
            <span className="text-xs text-emerald-400/70 ml-auto">
              {deltaPercent.toFixed(1)}% below market
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex gap-4">
          {/* Image Placeholder */}
          <div className="w-20 h-20 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-8 h-8 text-slate-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground line-clamp-2">
              {listing.title}
            </h4>

            {/* Seller Info */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">@{listing.seller_name}</span>
              {listing.seller_rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-400">{listing.seller_rating}</span>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{listing.listing_age}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{listing.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-4 p-3 rounded-lg bg-surface-elevated/50">
          <div className="grid grid-cols-3 gap-3">
            {/* Asking Price */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Asking Price</p>
              <p className="text-lg font-bold text-foreground">
                {formatHKD(listing.asking_price_hkd)}
              </p>
            </div>

            {/* Market Price */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Market Price</p>
              <p className="text-lg font-bold text-slate-300">
                {formatHKD(listing.market_price_hkd)}
              </p>
            </div>

            {/* Arbitrage Delta */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Delta</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <p className={`text-lg font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{formatHKD(delta)}
                </p>
              </div>
              <p className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {deltaPercent >= 0 ? "+" : ""}{deltaPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Condition Badge */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
            {listing.condition}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
            {listing.market_grade}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onCopyScript(data)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              copiedId === listing.id
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-accent text-background hover:bg-accent-hover"
            }`}
          >
            {copiedId === listing.id ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Draft Bundle Offer Script</span>
              </>
            )}
          </button>
          <a
            href={listing.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-surface-elevated border border-border text-slate-400 hover:text-foreground transition-colors"
            aria-label="View listing"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
