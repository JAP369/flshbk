"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Package,
  Lock,
  Zap,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  SealedAsset,
  AssetProjection,
  VaultSummary,
  HOLD_TIMELINE_MIN,
  HOLD_TIMELINE_MAX,
  HOLD_TIMELINE_DEFAULT,
  PREMIUM_CAGR,
  STANDARD_CAGR,
} from "@/types/sealed-vault";
import {
  DUMMY_SEALED_ASSETS,
  calculateAssetProjection,
  calculateVaultSummary,
} from "@/data/sealed-vault-assets";
import { ProjectionChart } from "./ProjectionChart";

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

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SealedVaultProjections() {
  const [holdTimeline, setHoldTimeline] = useState(HOLD_TIMELINE_DEFAULT);

  // Calculate projections for all assets
  const assetProjections = useMemo<AssetProjection[]>(() => {
    return DUMMY_SEALED_ASSETS.map((asset) =>
      calculateAssetProjection(asset, holdTimeline)
    );
  }, [holdTimeline]);

  // Calculate vault summary
  const vaultSummary = useMemo<VaultSummary>(() => {
    return calculateVaultSummary(assetProjections);
  }, [assetProjections]);

  // Aggregate projection data for chart
  const chartData = useMemo(() => {
    const data = [];
    for (let year = 0; year <= holdTimeline; year++) {
      const totalValue = assetProjections.reduce((sum, p) => {
        const point = p.projections.find((proj) => proj.year === year);
        return sum + (point?.value || 0);
      }, 0);
      data.push({
        year,
        value: totalValue,
        invested: vaultSummary.total_invested,
      });
    }
    return data;
  }, [assetProjections, holdTimeline, vaultSummary.total_invested]);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
                Sealed Vault Projections
              </h1>
              <p className="text-silver mt-1">
                Compound growth modeling for sealed asset portfolio
              </p>
            </div>
          </div>
        </motion.header>

        {/* Summary Cards */}
        <SummaryCards summary={vaultSummary} holdTimeline={holdTimeline} />

        {/* Timeline Slider */}
        <TimelineSlider
          value={holdTimeline}
          onChange={setHoldTimeline}
          min={HOLD_TIMELINE_MIN}
          max={HOLD_TIMELINE_MAX}
        />

        {/* Projection Chart */}
        <ProjectionChart data={chartData} holdTimeline={holdTimeline} />

        {/* Assets Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-foreground">
              Asset Projections
            </h2>
            <span className="text-sm text-silver">
              {assetProjections.length} assets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assetProjections.map((projection, index) => (
              <AssetCard
                key={projection.asset.id}
                projection={projection}
                index={index}
                holdTimeline={holdTimeline}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUMMARY CARDS
// =============================================================================

function SummaryCards({
  summary,
  holdTimeline,
}: {
  summary: VaultSummary;
  holdTimeline: number;
}) {
  const projectedValue =
    holdTimeline <= 1
      ? summary.projected_value_year_1
      : holdTimeline <= 3
      ? summary.projected_value_year_3
      : summary.projected_value_year_5;

  const totalReturn = projectedValue - summary.total_invested;
  const returnPercentage = (totalReturn / summary.total_invested) * 100;

  const cards = [
    {
      label: "Total Invested",
      value: formatHKD(summary.total_invested),
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: `Projected Value (${holdTimeline}Y)`,
      value: formatHKD(projectedValue),
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Total Return",
      value: formatHKD(totalReturn),
      subValue: `+${returnPercentage.toFixed(1)}%`,
      icon: ArrowUpRight,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Weighted Avg CAGR",
      value: formatPercentage(summary.weighted_avg_cagr),
      icon: BarChart3,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center`}
            >
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className="text-xs text-silver font-medium uppercase tracking-wide">
              {card.label}
            </span>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-foreground">
            {card.value}
          </p>
          {card.subValue && (
            <p className="text-sm text-emerald-400 mt-1">{card.subValue}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// TIMELINE SLIDER
// =============================================================================

function TimelineSlider({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-5 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          <span className="font-medium text-foreground">Hold Timeline</span>
        </div>
        <span className="font-serif text-2xl text-accent">{value} Years</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-accent/30
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-0"
        />
        <div className="flex justify-between mt-2">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(
            (year) => (
              <button
                key={year}
                onClick={() => onChange(year)}
                className={`text-xs ${
                  year === value
                    ? "text-accent font-medium"
                    : "text-silver hover:text-foreground"
                }`}
              >
                {year}Y
              </button>
            )
          )}
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex gap-2 mt-4">
        {[1, 3, 5, 10].map((year) => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              year === value
                ? "bg-accent text-background"
                : "bg-surface-elevated text-silver hover:text-foreground"
            }`}
          >
            {year} Year{year > 1 ? "s" : ""}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// =============================================================================
// ASSET CARD
// =============================================================================

function AssetCard({
  projection,
  index,
  holdTimeline,
}: {
  projection: AssetProjection;
  index: number;
  holdTimeline: number;
}) {
  const { asset, total_entry_cost, year_1_value, year_3_value, year_5_value, roi_percentage } =
    projection;

  const isPremium = asset.cagr_estimate >= PREMIUM_CAGR;
  const isFlip = asset.vault_strategy === "Flip";

  // Get projected value based on hold timeline
  const projectedValue =
    holdTimeline <= 1
      ? year_1_value
      : holdTimeline <= 3
      ? year_3_value
      : year_5_value;

  const totalReturn = projectedValue - total_entry_cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.05 }}
      className={`glass-card rounded-xl overflow-hidden transition-all hover:border-accent/30 ${
        isPremium ? "border-amber-500/20" : ""
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {asset.product_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  isPremium
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-surface-elevated text-silver"
                }`}
              >
                {asset.category}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                  isFlip
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {isFlip ? (
                  <>
                    <Zap className="w-3 h-3" />
                    Flip
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    Keep
                  </>
                )}
              </span>
            </div>
          </div>
          {isPremium && (
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Entry Details */}
        <div className="flex justify-between text-sm">
          <span className="text-silver">Entry Cost</span>
          <span className="text-foreground">
            {formatHKD(asset.entry_cost)} × {asset.quantity}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-silver">Total Invested</span>
          <span className="text-foreground font-medium">
            {formatHKD(total_entry_cost)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-silver">CAGR</span>
          <span
            className={`font-medium ${
              isPremium ? "text-amber-400" : "text-silver"
            }`}
          >
            {formatPercentage(asset.cagr_estimate)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Projections */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-silver">Year 1</span>
            <span className="text-foreground">{formatHKD(year_1_value)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-silver">Year 3</span>
            <span className="text-foreground">{formatHKD(year_3_value)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-silver">Year 5</span>
            <span className="text-foreground">{formatHKD(year_5_value)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Projected Value */}
        <div className="p-3 rounded-lg bg-emerald-500/10">
          <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-400">
              {holdTimeline} Year Projection
            </span>
            <span className="font-serif text-lg text-emerald-400">
              {formatHKD(projectedValue)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-silver">Total Return</span>
            <span className="text-sm text-emerald-400">
              +{formatHKD(totalReturn)} ({roi_percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
