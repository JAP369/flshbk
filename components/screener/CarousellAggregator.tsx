"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  AlertCircle,
  ShoppingCart,
  Calculator,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  generateBundleOffer,
  calculateBundleFairValue,
  BundleItem,
  BundleCalculation,
} from "@/lib/bundle-offer-generator";

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

function generateCantoneseOfferScript(
  sellerName: string,
  itemTitle: string,
  askingPrice: number,
  marketPrice: number,
): string {
  const discount = (((marketPrice - askingPrice) / marketPrice) * 100).toFixed(
    0,
  );
  return `唔該好！我見到你嘅 "${itemTitle}" listing，開價 $${askingPrice.toLocaleString()}。

我查到市場價係 $${marketPrice.toLocaleString()}，你嘅價平咗大概 ${discount}%。

我係一個收藏家，想直接現金交易，唔使行平台。你嘅 item 有冇問題？包裝完好嗎？

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
  const [sortBy, setSortBy] = useState<
    "margin_desc" | "margin_asc" | "price_asc" | "price_desc" | "newest"
  >("margin_desc");
  const [showTargetsOnly, setShowTargetsOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bundle state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBundlePanel, setShowBundlePanel] = useState(false);
  const [bundleStation, setBundleStation] = useState("Mong Kok");
  const [bundleOfferResult, setBundleOfferResult] = useState<ReturnType<
    typeof generateBundleOffer
  > | null>(null);
  const [copiedBundleScript, setCopiedBundleScript] = useState(false);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("sortBy", sortBy);
      params.set("limit", "50");

      const response = await fetch(
        `/api/scraper/carousell?${params.toString()}`,
      );
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

  // Bundle logic
  const selectedItems = useMemo<BundleItem[]>(() => {
    return listings
      .filter((l) => selectedIds.has(l.id))
      .map((l) => ({
        id: l.id,
        title: l.title,
        asking_price_hkd: l.asking_price_hkd,
        market_price_hkd: l.market_price_hkd,
        condition: l.condition,
        market_grade: l.market_grade,
      }));
  }, [listings, selectedIds]);

  const bundleCalculation = useMemo<BundleCalculation | null>(() => {
    if (selectedItems.length < 2) return null;
    return calculateBundleFairValue(selectedItems);
  }, [selectedItems]);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setBundleOfferResult(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBundleOfferResult(null);
  }, []);

  const handleGenerateBundleOffer = useCallback(() => {
    if (selectedItems.length < 2) return;
    const result = generateBundleOffer(selectedItems, bundleStation);
    setBundleOfferResult(result);
    setShowBundlePanel(true);
  }, [selectedItems, bundleStation]);

  const handleCopyBundleScript = useCallback(async () => {
    if (!bundleOfferResult) return;
    try {
      await navigator.clipboard.writeText(bundleOfferResult.cantoneseScript);
      setCopiedBundleScript(true);
      setTimeout(() => setCopiedBundleScript(false), 3000);
    } catch (err) {
      console.error("Failed to copy bundle script:", err);
    }
  }, [bundleOfferResult]);

  const handleCopySingleScript = async (data: ArbitrageData) => {
    const script = generateCantoneseOfferScript(
      data.listing.seller_name,
      data.listing.title,
      data.listing.asking_price_hkd,
      data.listing.market_price_hkd,
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
  const avgMargin =
    arbitrageData.length > 0
      ? arbitrageData.reduce((sum, d) => sum + d.deltaPercent, 0) /
        arbitrageData.length
      : 0;

  return (
    <div className='space-y-6'>
      {/* Stats Header */}
      <div className='grid grid-cols-3 gap-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='glass-card rounded-xl p-4'
        >
          <p className='text-xs text-slate-400 uppercase tracking-wide mb-1'>
            Total Listings
          </p>
          <p className='font-serif text-2xl text-foreground'>
            {listings.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='glass-card rounded-xl p-4'
        >
          <p className='text-xs text-slate-400 uppercase tracking-wide mb-1'>
            Target Deals
          </p>
          <p className='font-serif text-2xl text-emerald-400'>{targetCount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='glass-card rounded-xl p-4'
        >
          <p className='text-xs text-slate-400 uppercase tracking-wide mb-1'>
            Avg Margin
          </p>
          <p
            className={`font-serif text-2xl ${avgMargin >= 15 ? "text-emerald-400" : "text-foreground"}`}
          >
            {avgMargin.toFixed(1)}%
          </p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search listings or sellers...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm'
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className='px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-accent/50'
        >
          <option value='margin_desc'>Highest Margin</option>
          <option value='margin_asc'>Lowest Margin</option>
          <option value='price_asc'>Price: Low to High</option>
          <option value='price_desc'>Price: High to Low</option>
          <option value='newest'>Newest First</option>
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
          <Flame className='w-4 h-4' />
          <span className='text-sm font-medium'>Targets Only</span>
        </button>

        {/* Refresh */}
        <button
          onClick={fetchListings}
          disabled={isLoading}
          className='p-2.5 rounded-xl bg-surface-elevated border border-border text-slate-400 hover:text-accent transition-colors disabled:opacity-50'
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Bundle Selection Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='glass-card rounded-xl p-4 border border-accent/30'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center'>
                <Layers className='w-5 h-5 text-accent' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>
                  {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}{" "}
                  selected
                </p>
                <p className='text-xs text-slate-400'>
                  Tap cards to add/remove. Generate offer when ready.
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={clearSelection}
                className='p-2 rounded-lg hover:bg-surface-elevated transition-colors text-slate-400 hover:text-foreground'
                title='Clear selection'
              >
                <X className='w-4 h-4' />
              </button>
              <button
                onClick={() => {
                  if (selectedItems.length >= 2) {
                    handleGenerateBundleOffer();
                  }
                }}
                disabled={selectedItems.length < 2}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
              >
                <Calculator className='w-4 h-4' />
                <span>Generate Bundle Offer</span>
                <ArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Quick sum preview */}
          {bundleCalculation && (
            <div className='mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3'>
              <div>
                <p className='text-[10px] text-slate-400 uppercase'>
                  Market Total
                </p>
                <p className='text-sm font-semibold text-slate-300'>
                  {formatHKD(bundleCalculation.fairValue)}
                </p>
              </div>
              <div>
                <p className='text-[10px] text-slate-400 uppercase'>
                  Negotiation (85%)
                </p>
                <p className='text-sm font-semibold text-accent'>
                  {formatHKD(bundleCalculation.negotiationPrice)}
                </p>
              </div>
              <div>
                <p className='text-[10px] text-slate-400 uppercase'>
                  Cash Premium
                </p>
                <p className='text-sm font-semibold text-emerald-400'>
                  -{formatHKD(bundleCalculation.premium)}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 text-accent animate-spin' />
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <AnimatePresence>
            {filteredData.map((data, index) => (
              <ListingCard
                key={data.listing.id}
                data={data}
                index={index}
                copiedId={copiedId}
                onCopyScript={handleCopySingleScript}
                isSelected={selectedIds.has(data.listing.id)}
                onToggleSelect={toggleItemSelection}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && (
        <div className='text-center py-12'>
          <AlertCircle className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>
            {showTargetsOnly ? "No target deals found" : "No listings found"}
          </p>
          <p className='text-sm text-slate-500 mt-1'>
            {showTargetsOnly
              ? "Try turning off the targets filter"
              : "Try a different search term"}
          </p>
        </div>
      )}

      {/* Bundle Offer Panel */}
      <AnimatePresence>
        {showBundlePanel && bundleOfferResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
            onClick={() => setShowBundlePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-border p-6'
            >
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <ShoppingCart className='w-6 h-6 text-accent' />
                  <h2 className='text-xl font-serif text-foreground'>
                    Bundle Offer Generator
                  </h2>
                </div>
                <button
                  onClick={() => setShowBundlePanel(false)}
                  className='p-2 rounded-lg hover:bg-surface-elevated transition-colors'
                >
                  <X className='w-5 h-5 text-slate-400' />
                </button>
              </div>

              {/* Bundle Summary */}
              <div className='glass-card rounded-xl p-4 mb-4'>
                <h3 className='text-sm font-semibold text-foreground mb-3 flex items-center gap-2'>
                  <Calculator className='w-4 h-4 text-accent' />
                  Bundle Analysis
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <p className='text-[10px] text-slate-400 uppercase'>
                      Items
                    </p>
                    <p className='text-lg font-bold text-foreground'>
                      {bundleOfferResult.calculation.itemCount}
                    </p>
                  </div>
                  <div>
                    <p className='text-[10px] text-slate-400 uppercase'>
                      Market Total
                    </p>
                    <p className='text-lg font-bold text-slate-300'>
                      {formatHKD(bundleOfferResult.calculation.fairValue)}
                    </p>
                  </div>
                  <div>
                    <p className='text-[10px] text-slate-400 uppercase'>
                      Negotiation (85%)
                    </p>
                    <p className='text-lg font-bold text-accent'>
                      {formatHKD(
                        bundleOfferResult.calculation.negotiationPrice,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className='text-[10px] text-slate-400 uppercase'>
                      You Save
                    </p>
                    <p className='text-lg font-bold text-emerald-400'>
                      {formatHKD(
                        bundleOfferResult.calculation.totalAsking -
                          bundleOfferResult.calculation.negotiationPrice,
                      )}
                    </p>
                  </div>
                </div>

                {/* Selected items list */}
                <div className='mt-4 pt-4 border-t border-border'>
                  <p className='text-xs text-slate-400 uppercase tracking-wide mb-2'>
                    Bundle Items
                  </p>
                  <div className='space-y-1'>
                    {bundleOfferResult.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-foreground truncate flex-1'>
                          {idx + 1}. {item.title}
                        </span>
                        <span className='text-slate-400 ml-2'>
                          {formatHKD(item.asking_price_hkd)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Station selector */}
              <div className='mb-4'>
                <label className='text-xs text-slate-400 uppercase tracking-wide mb-2 block'>
                  MTR Meetup Station
                </label>
                <div className='flex flex-wrap gap-2'>
                  {[
                    "Mong Kok",
                    "Causeway Bay",
                    "Tsim Sha Tsui",
                    "Central",
                    "Prince Edward",
                    "Admiralty",
                  ].map((station) => (
                    <button
                      key={station}
                      onClick={() => {
                        setBundleStation(station);
                        const result = generateBundleOffer(
                          selectedItems,
                          station,
                        );
                        setBundleOfferResult(result);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        bundleStation === station
                          ? "bg-accent text-background"
                          : "bg-surface-elevated text-slate-400 hover:text-foreground"
                      }`}
                    >
                      {station}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantonese script preview */}
              <div className='glass-card rounded-xl p-4 mb-4'>
                <p className='text-xs text-slate-400 uppercase tracking-wide mb-2'>
                  Cantonese Offer Script (Copy & Paste)
                </p>
                <pre className='text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto text-xs'>
                  {bundleOfferResult.cantoneseScript}
                </pre>
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                <button
                  onClick={handleCopyBundleScript}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    copiedBundleScript
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-accent text-background hover:bg-accent-hover"
                  }`}
                >
                  {copiedBundleScript ? (
                    <>
                      <Check className='w-5 h-5' />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className='w-5 h-5' />
                      <span>Copy Bundle Script</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  isSelected,
  onToggleSelect,
}: {
  data: ArbitrageData;
  index: number;
  copiedId: string | null;
  onCopyScript: (data: ArbitrageData) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const { listing, delta, deltaPercent, isTarget } = data;
  const isPositive = delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card rounded-xl overflow-hidden border transition-all cursor-pointer ${
        isSelected
          ? "border-accent/50 ring-2 ring-accent/20 shadow-lg shadow-accent/5"
          : isTarget
            ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5"
            : "border-border hover:border-border/80"
      }`}
      onClick={() => onToggleSelect(listing.id)}
    >
      {/* Selection checkbox */}
      <div
        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected
            ? "bg-accent border-accent"
            : "bg-surface-elevated/80 border-slate-500 hover:border-accent"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(listing.id);
        }}
      >
        {isSelected && <Check className='w-3.5 h-3.5 text-background' />}
      </div>

      {/* Target Badge */}
      {isTarget && !isSelected && (
        <div className='bg-gradient-to-r from-emerald-500/20 to-amber-500/20 px-4 py-2 border-b border-emerald-500/20'>
          <div className='flex items-center gap-2'>
            <Flame className='w-4 h-4 text-amber-400' />
            <span className='text-sm font-bold text-emerald-400'>
              🔥 Target Discrepancy Found
            </span>
            <span className='text-xs text-emerald-400/70 ml-auto'>
              {deltaPercent.toFixed(1)}% below market
            </span>
          </div>
        </div>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <div className='bg-accent/10 px-4 py-2 border-b border-accent/20'>
          <div className='flex items-center gap-2'>
            <ShoppingCart className='w-4 h-4 text-accent' />
            <span className='text-sm font-bold text-accent'>
              Selected for Bundle
            </span>
          </div>
        </div>
      )}

      <div className='p-4'>
        {/* Header */}
        <div className='flex gap-4'>
          {/* Image Placeholder */}
          <div className='w-20 h-20 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0'>
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className='w-full h-full object-cover rounded-lg'
              />
            ) : (
              <Package className='w-8 h-8 text-slate-600' />
            )}
          </div>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <h4 className='text-sm font-medium text-foreground line-clamp-2 pr-8'>
              {listing.title}
            </h4>

            {/* Seller Info */}
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs text-slate-400'>
                @{listing.seller_name}
              </span>
              {listing.seller_rating && (
                <div className='flex items-center gap-0.5'>
                  <Star className='w-3 h-3 text-amber-400 fill-amber-400' />
                  <span className='text-xs text-slate-400'>
                    {listing.seller_rating}
                  </span>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className='flex items-center gap-3 mt-1.5'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3 text-slate-500' />
                <span className='text-xs text-slate-500'>
                  {listing.listing_age}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <MapPin className='w-3 h-3 text-slate-500' />
                <span className='text-xs text-slate-500'>
                  {listing.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className='mt-4 p-3 rounded-lg bg-surface-elevated/50'>
          <div className='grid grid-cols-3 gap-3'>
            {/* Asking Price */}
            <div>
              <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
                Asking Price
              </p>
              <p className='text-lg font-bold text-foreground'>
                {formatHKD(listing.asking_price_hkd)}
              </p>
            </div>

            {/* Market Price */}
            <div>
              <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
                Market Price
              </p>
              <p className='text-lg font-bold text-slate-300'>
                {formatHKD(listing.market_price_hkd)}
              </p>
            </div>

            {/* Arbitrage Delta */}
            <div>
              <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
                Delta
              </p>
              <div className='flex items-center gap-1'>
                {isPositive ? (
                  <TrendingUp className='w-4 h-4 text-emerald-400' />
                ) : (
                  <TrendingDown className='w-4 h-4 text-red-400' />
                )}
                <p
                  className={`text-lg font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                >
                  {isPositive ? "+" : ""}
                  {formatHKD(delta)}
                </p>
              </div>
              <p
                className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}
              >
                {deltaPercent >= 0 ? "+" : ""}
                {deltaPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Condition Badge */}
        <div className='flex items-center gap-2 mt-3'>
          <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono'>
            {listing.condition}
          </span>
          <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono'>
            {listing.market_grade}
          </span>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 mt-4'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyScript(data);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              copiedId === listing.id
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-accent text-background hover:bg-accent-hover"
            }`}
          >
            {copiedId === listing.id ? (
              <>
                <Check className='w-4 h-4' />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className='w-4 h-4' />
                <span>Draft Bundle Offer Script</span>
              </>
            )}
          </button>
          <a
            href={listing.listing_url}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
            className='p-2.5 rounded-xl bg-surface-elevated border border-border text-slate-400 hover:text-foreground transition-colors'
            aria-label='View listing'
          >
            <ExternalLink className='w-4 h-4' />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
