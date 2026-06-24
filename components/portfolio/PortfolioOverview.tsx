"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TimeRange,
  CollectionHolding,
  CollectionSummary,
} from "@/types/portfolio";
import {
  buildPortfolioSummary,
  generateTimeSeriesData,
  formatHKD,
  formatPercentage,
  calculatePeriodChange,
  calculateHoldingValue,
} from "@/lib/portfolio-calculations";
import {
  calculateHoldingVolatility,
  getVolatilityLevel,
} from "@/lib/volatility";
import { PORTFOLIO_HOLDINGS } from "@/data/portfolio-holdings";
import { SalesHistoryChart } from "./SalesHistoryChart";

// =============================================================================
// TIME RANGE OPTIONS
// =============================================================================

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "MAX", label: "MAX" },
];

// =============================================================================
// EXTENDED HOLDING WITH VOLATILITY
// =============================================================================

interface HoldingWithVolatility extends CollectionHolding {
  volatilityIndex: number;
  volatilityLevel: "low" | "moderate" | "high" | "extreme";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PortfolioOverview() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");

  // Build portfolio summary
  const summary: CollectionSummary = useMemo(
    () => buildPortfolioSummary(PORTFOLIO_HOLDINGS),
    [],
  );

  // Generate chart data
  const chartData = useMemo(
    () => generateTimeSeriesData(PORTFOLIO_HOLDINGS, selectedRange),
    [selectedRange],
  );

  // Calculate period change
  const periodChange = useMemo(
    () => calculatePeriodChange(PORTFOLIO_HOLDINGS, selectedRange),
    [selectedRange],
  );

  // Calculate portfolio-wide volatility
  const holdingsWithVolatility: HoldingWithVolatility[] = useMemo(() => {
    return PORTFOLIO_HOLDINGS.map((holding) => {
      const volatilityIndex = calculateHoldingVolatility(
        holding.currentPriceHkd,
        holding.purchasePriceHkd,
        holding.priceChange30d,
      );
      const volatilityLevel = getVolatilityLevel(volatilityIndex);
      return {
        ...holding,
        volatilityIndex,
        volatilityLevel,
      };
    });
  }, []);

  const portfolioVolatility = useMemo(() => {
    if (holdingsWithVolatility.length === 0) return 0;
    return (
      holdingsWithVolatility.reduce((sum, h) => sum + h.volatilityIndex, 0) /
      holdingsWithVolatility.length
    );
  }, [holdingsWithVolatility]);

  const highVolatilityCount = useMemo(
    () => holdingsWithVolatility.filter((h) => h.volatilityLevel === "high" || h.volatilityLevel === "extreme").length,
    [holdingsWithVolatility],
  );

  // Determine if change is positive
  const isPositive = periodChange.changeHkd >= 0;
  const isPortfolioVolatile = portfolioVolatility >= 25;

  return (
    <div className="space-y-6">
      {/* Value Banner */}
      <ValueBanner
        totalValue={summary.totalValueHkd}
        change30dHkd={periodChange.changeHkd}
        change30dPercent={periodChange.changePercent}
        isPositive={isPositive}
        portfolioVolatility={portfolioVolatility}
        isPortfolioVolatile={isPortfolioVolatile}
        highVolatilityCount={highVolatilityCount}
      />

      {/* Time Range Selector */}
      <TimeRangeSelector selected={selectedRange} onSelect={setSelectedRange} />

      {/* Chart */}
      <PortfolioChart data={chartData} isPositive={isPositive} />

      {/* Sales History Chart */}
      <SalesHistoryChart showHeader={true} itemName="Portfolio Aggregate" />

      {/* Top Holdings Marquee */}
      <TopHoldingsMarquee holdings={holdingsWithVolatility} />
    </div>
  );
}

// =============================================================================
// VALUE BANNER COMPONENT
// =============================================================================

function ValueBanner({
  totalValue,
  change30dHkd,
  change30dPercent,
  isPositive,
  portfolioVolatility,
  isPortfolioVolatile,
  highVolatilityCount,
}: {
  totalValue: number;
  change30dHkd: number;
  change30dPercent: number;
  isPositive: boolean;
  portfolioVolatility: number;
  isPortfolioVolatile: boolean;
  highVolatilityCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-border"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Total Portfolio Value
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {formatHKD(totalValue)}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Across {PORTFOLIO_HOLDINGS.length} assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Volatility Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              isPortfolioVolatile
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-slate-500/10 border border-slate-500/20"
            }`}
          >
            <Activity className={`w-4 h-4 ${isPortfolioVolatile ? "text-amber-400" : "text-slate-400"}`} />
            <div className="flex flex-col">
              <span className={`text-xs font-medium ${isPortfolioVolatile ? "text-amber-400" : "text-slate-400"}`}>
                Volatility: {portfolioVolatility.toFixed(1)}%
              </span>
              {highVolatilityCount > 0 && (
                <span className="text-[10px] text-amber-400/70">
                  {highVolatilityCount} high-vol assets
                </span>
              )}
            </div>
          </motion.div>

          {/* 30-Day Change */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isPositive
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatHKD(Math.abs(change30dHkd))}
              </span>
              <span
                className={`text-xs ${
                  isPositive ? "text-emerald-400/70" : "text-red-400/70"
                }`}
              >
                {formatPercentage(change30dPercent)} in last 30 days
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// TIME RANGE SELECTOR COMPONENT
// =============================================================================

function TimeRangeSelector({
  selected,
  onSelect,
}: {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onSelect(range.value)}
          className={`relative flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selected === range.value
              ? "text-foreground"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          {selected === range.value && (
            <motion.div
              layoutId="timeRangeIndicator"
              className="absolute inset-0 bg-accent/10 border border-accent/30 rounded-lg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{range.label}</span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// PORTFOLIO CHART COMPONENT
// =============================================================================

function PortfolioChart({
  data,
  isPositive,
}: {
  data: { date: string; value: number }[];
  isPositive: boolean;
}) {
  const gradientColor = isPositive ? "#10b981" : "#ef4444";
  const strokeColor = isPositive ? "#34d399" : "#f87171";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-4 border border-border"
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="portfolioGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="50%" stopColor={gradientColor} stopOpacity={0.1} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 15, 20, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              }}
              labelStyle={{ color: "#94a3b8", fontSize: 12 }}
              formatter={(value) => [formatHKD(Number(value)), "Value"]}
              cursor={{
                stroke: "#64748b",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// =============================================================================
// TOP HOLDINGS MARQUEE COMPONENT
// =============================================================================

function TopHoldingsMarquee({ holdings }: { holdings: HoldingWithVolatility[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          Most Valuable Assets
        </h3>
        <span className="text-xs text-slate-400">
          Top {holdings.length} by value
        </span>
      </div>

      <div className="space-y-3">
        {holdings.map((holding, idx) => (
          <TopHoldingRow key={holding.id} holding={holding} rank={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function TopHoldingRow({
  holding,
  rank,
}: {
  holding: HoldingWithVolatility;
  rank: number;
}) {
  const value = calculateHoldingValue(holding);
  const pnl = value - holding.quantity * holding.purchasePriceHkd;
  const pnlPercent =
    holding.purchasePriceHkd > 0
      ? (pnl / (holding.quantity * holding.purchasePriceHkd)) * 100
      : 0;
  const isProfit = pnl >= 0;

  // Determine if this is a high volatility asset
  const isHighVolatility = holding.volatilityLevel === "high" || holding.volatilityLevel === "extreme";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + rank * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isHighVolatility
          ? "bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10"
          : "bg-surface-elevated/50 hover:bg-surface-elevated"
      }`}
    >
      {/* Rank */}
      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-accent">{rank}</span>
      </div>

      {/* Image Placeholder */}
      <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center overflow-hidden flex-shrink-0">
        {holding.imageUrl ? (
          <img
            src={holding.imageUrl}
            alt={holding.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-xs text-slate-500">
              {holding.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">
            {holding.name}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
            {holding.grade}
          </span>
          {/* High Volatility Tag */}
          {isHighVolatility && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-2.5 h-2.5" />
              High Volatility
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {holding.setName} {holding.cardNumber && `· #${holding.cardNumber}`}
        </p>
      </div>

      {/* Value & P&L */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {formatHKD(value)}
        </p>
        <div
          className={`flex items-center justify-end gap-0.5 text-xs ${
            isProfit ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isProfit ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span>{formatPercentage(pnlPercent)}</span>
        </div>
        {/* Volatility Index */}
        <p className={`text-[10px] mt-0.5 ${
          isHighVolatility ? "text-amber-400" : "text-slate-500"
        }`}>
          Vol: {holding.volatilityIndex.toFixed(1)}%
        </p>
      </div>
    </motion.div>
  );
}
