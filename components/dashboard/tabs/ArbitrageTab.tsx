"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  ShoppingCart,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface ArbitrageOpportunity {
  id: string;
  card: { id: string; name: string; rarity: string; number: string };
  cardImage: string;
  cardSetName: string;
  source: string;
  listingTitle: string;
  listingPriceHkd: number;
  listingUrl: string;
  listingCondition: string;
  listingImage: string | null;
  referenceSource: string;
  referencePriceHkd: number;
  estimatedFeesHkd: number;
  estimatedShippingHkd: number;
  totalCostHkd: number;
  potentialProfitHkd: number;
  yieldPercent: number;
  dealScore: number;
  liquidityEstimate: "high" | "medium" | "low";
}

interface ScanResult {
  scanId: string;
  scannedAt: string;
  cardsScanned: number;
  opportunities: ArbitrageOpportunity[];
  stats: {
    totalOpportunities: number;
    avgYieldPercent: number;
    maxYieldPercent: number;
    totalPotentialProfitHkd: number;
    byMarketplace: Record<string, number>;
  };
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-HK", { hour: "2-digit", minute: "2-digit" });
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-slate-400";
}

function getYieldColor(pct: number): string {
  if (pct >= 50) return "text-emerald-400";
  if (pct >= 30) return "text-amber-400";
  return "text-sky-400";
}

function getLiquidityColor(liq: string): string {
  if (liq === "high")
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (liq === "medium")
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function ArbitrageTab() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minYield, setMinYield] = useState(15);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/arbitrage?minYield=${minYield}`);
      if (!resp.ok) throw new Error("Scan failed");
      const data: ScanResult = await resp.json();
      setResult(data);
      setLastRefresh(new Date().toLocaleTimeString("en-HK"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [minYield]);

  // Auto-scan on mount
  useEffect(() => {
    runScan();
  }, [runScan]);

  const filteredOpps =
    result?.opportunities.filter((o) => {
      if (selectedSource === "all") return true;
      return o.source === selectedSource;
    }) ?? [];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='font-serif text-xl text-foreground flex items-center gap-2'>
            <Zap className='w-5 h-5 text-amber-400' />
            Arbitrage Scanner
          </h2>
          <p className='text-xs text-slate-400 mt-1'>
            Compare live marketplace prices against TCGPlayer market
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {lastRefresh && (
            <span className='text-[10px] text-slate-500'>
              Last scan: {lastRefresh}
            </span>
          )}
          <button
            onClick={runScan}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/20 transition-colors disabled:opacity-50'
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <SlidersHorizontal className='w-4 h-4 text-slate-400' />
          <span className='text-xs text-slate-400'>Min Yield:</span>
          <select
            value={minYield}
            onChange={(e) => setMinYield(Number(e.target.value))}
            className='bg-surface-elevated border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50'
          >
            <option value={10}>10%+</option>
            <option value={15}>15%+</option>
            <option value={20}>20%+</option>
            <option value={30}>30%+</option>
            <option value={50}>50%+</option>
          </select>
        </div>

        <div className='flex items-center gap-1 p-1 bg-surface-elevated rounded-lg border border-border'>
          {["all", "ebay", "carousell"].map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                selectedSource === src
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              {src === "all" ? "All Sources" : src}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && !result && (
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-slate-400 text-sm'>Scanning marketplaces...</p>
            <p className='text-slate-500 text-xs mt-1'>
              Fetching TCGPlayer prices + live listings
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20'>
          <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0' />
          <div>
            <p className='text-sm text-red-400 font-medium'>Scan failed</p>
            <p className='text-xs text-red-400/70'>{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Stats */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            <StatCard
              icon={<BarChart3 className='w-4 h-4 text-accent' />}
              label='Opportunities'
              value={String(result.stats.totalOpportunities)}
            />
            <StatCard
              icon={<TrendingUp className='w-4 h-4 text-emerald-400' />}
              label='Avg Yield'
              value={`${result.stats.avgYieldPercent.toFixed(1)}%`}
            />
            <StatCard
              icon={<Zap className='w-4 h-4 text-amber-400' />}
              label='Max Yield'
              value={`${result.stats.maxYieldPercent.toFixed(1)}%`}
            />
            <StatCard
              icon={<DollarSign className='w-4 h-4 text-sky-400' />}
              label='Total Profit'
              value={formatHKD(result.stats.totalPotentialProfitHkd)}
            />
          </div>

          {/* Opportunities List */}
          <div className='space-y-3'>
            {filteredOpps.map((opp, idx) => (
              <OpportunityCard key={opp.id} opp={opp} index={idx} />
            ))}
          </div>

          {filteredOpps.length === 0 && (
            <div className='text-center py-12'>
              <CheckCircle2 className='w-12 h-12 text-slate-600 mx-auto mb-3' />
              <p className='text-slate-400'>
                {loading
                  ? "Scanning..."
                  : "No opportunities match your filters"}
              </p>
              <p className='text-slate-500 text-xs mt-1'>
                Try lowering the minimum yield threshold
              </p>
            </div>
          )}
        </>
      )}

      {/* API Keys Notice */}
      {!loading &&
        result &&
        result.opportunities[0]?.id.startsWith("demo-") && (
          <div className='flex items-start gap-3 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20'>
            <AlertCircle className='w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-xs text-sky-400 font-medium'>Demo Mode</p>
              <p className='text-xs text-slate-400 mt-0.5'>
                Showing simulated marketplace data. Set{" "}
                <code className='text-sky-300 bg-sky-500/10 px-1 rounded'>
                  EBAY_CLIENT_ID
                </code>{" "}
                and{" "}
                <code className='text-sky-300 bg-sky-500/10 px-1 rounded'>
                  APIFY_API_KEY
                </code>{" "}
                environment variables for live arbitrage scanning.
              </p>
              <a
                href='/guide'
                className='inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors mt-2'
              >
                <ExternalLink className='w-3 h-3' />
                View full API key setup guide
              </a>
            </div>
          </div>
        )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// STAT CARD
// -----------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass-card rounded-xl p-3 border border-border'
    >
      <div className='flex items-center gap-2 mb-1'>
        {icon}
        <span className='text-[10px] text-slate-400 uppercase tracking-wide'>
          {label}
        </span>
      </div>
      <p className='font-serif text-lg text-foreground'>{value}</p>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// OPPORTUNITY CARD
// -----------------------------------------------------------------------------

function OpportunityCard({
  opp,
  index,
}: {
  opp: ArbitrageOpportunity;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className='glass-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow'
    >
      <div className='flex flex-col sm:flex-row'>
        {/* Card Image */}
        <div className='w-full sm:w-28 h-32 sm:h-auto bg-surface-elevated flex-shrink-0 relative overflow-hidden'>
          {opp.cardImage ? (
            <img
              src={opp.cardImage}
              alt={opp.card.name}
              className='w-full h-full object-contain p-2'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <ShoppingCart className='w-6 h-6 text-slate-600' />
            </div>
          )}
          {/* Deal Score Badge */}
          <div
            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${getScoreColor(opp.dealScore)} bg-black/60`}
          >
            {opp.dealScore}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-3 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h4 className='text-sm font-medium text-foreground truncate'>
                  {opp.card.name}
                </h4>
                <span className='text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono'>
                  {opp.cardSetName} #{opp.card.number}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${getLiquidityColor(opp.liquidityEstimate)}`}
                >
                  {opp.liquidityEstimate} liquidity
                </span>
              </div>
              <p className='text-xs text-slate-400 truncate mt-0.5'>
                {opp.listingTitle}
              </p>
            </div>

            {/* Yield Badge */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-elevated flex-shrink-0 ${getYieldColor(opp.yieldPercent)}`}
            >
              <ArrowUpRight className='w-3 h-3' />
              <span className='text-sm font-bold'>
                {opp.yieldPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-border'>
            <div>
              <p className='text-[10px] text-slate-500'>List Price</p>
              <p className='text-xs font-medium text-foreground'>
                {formatHKD(opp.listingPriceHkd)}
              </p>
            </div>
            <div>
              <p className='text-[10px] text-slate-500'>Fees + Ship</p>
              <p className='text-xs font-medium text-slate-400'>
                +{formatHKD(opp.estimatedFeesHkd + opp.estimatedShippingHkd)}
              </p>
            </div>
            <div>
              <p className='text-[10px] text-slate-500'>Market Price</p>
              <p className='text-xs font-medium text-foreground'>
                {formatHKD(opp.referencePriceHkd)}
              </p>
            </div>
            <div>
              <p className='text-[10px] text-slate-500'>Profit</p>
              <p className='text-xs font-bold text-emerald-400'>
                +{formatHKD(opp.potentialProfitHkd)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between mt-2'>
            <div className='flex items-center gap-2'>
              <span className='text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 capitalize'>
                {opp.source}
              </span>
              <span className='text-[10px] text-slate-500'>
                {opp.listingCondition}
              </span>
              <span className='text-[10px] text-slate-500'>
                via {opp.referenceSource}
              </span>
            </div>
            <a
              href={opp.listingUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 transition-colors'
            >
              View Listing
              <ExternalLink className='w-3 h-3' />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
