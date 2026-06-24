"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
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
import { PORTFOLIO_HOLDINGS } from "@/data/portfolio-holdings";

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

  // Determine if change is positive
  const isPositive = periodChange.changeHkd >= 0;

  return (
    <div className='space-y-6'>
      {/* Value Banner */}
      <ValueBanner
        totalValue={summary.totalValueHkd}
        change30dHkd={periodChange.changeHkd}
        change30dPercent={periodChange.changePercent}
        isPositive={isPositive}
      />

      {/* Time Range Selector */}
      <TimeRangeSelector selected={selectedRange} onSelect={setSelectedRange} />

      {/* Chart */}
      <PortfolioChart data={chartData} isPositive={isPositive} />

      {/* Top Holdings Marquee */}
      <TopHoldingsMarquee holdings={summary.topHoldings} />
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
}: {
  totalValue: number;
  change30dHkd: number;
  change30dPercent: number;
  isPositive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass-card rounded-2xl p-6 border border-border'
    >
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-4 h-4 text-accent' />
        <span className='text-xs font-medium text-slate-400 uppercase tracking-wider'>
          Total Portfolio Value
        </span>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
        <div>
          <h2 className='text-3xl sm:text-4xl font-bold text-foreground tracking-tight'>
            {formatHKD(totalValue)}
          </h2>
          <p className='text-sm text-slate-400 mt-1'>
            Across {PORTFOLIO_HOLDINGS.length} assets
          </p>
        </div>

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
            <TrendingUp className='w-5 h-5 text-emerald-400' />
          ) : (
            <TrendingDown className='w-5 h-5 text-red-400' />
          )}
          <div className='flex flex-col'>
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
    <div className='flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border'>
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
              layoutId='timeRangeIndicator'
              className='absolute inset-0 bg-accent/10 border border-accent/30 rounded-lg'
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className='relative z-10'>{range.label}</span>
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
      className='glass-card rounded-2xl p-4 border border-border'
    >
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id='portfolioGradient'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop offset='0%' stopColor={gradientColor} stopOpacity={0.3} />
                <stop
                  offset='50%'
                  stopColor={gradientColor}
                  stopOpacity={0.1}
                />
                <stop offset='100%' stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey='date'
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval='preserveStartEnd'
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
              type='monotone'
              dataKey='value'
              stroke={strokeColor}
              strokeWidth={2}
              fill='url(#portfolioGradient)'
              animationDuration={1000}
              animationEasing='ease-out'
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

function TopHoldingsMarquee({ holdings }: { holdings: CollectionHolding[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='glass-card rounded-2xl p-4 border border-border'
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-semibold text-foreground flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-accent' />
          Most Valuable Assets
        </h3>
        <span className='text-xs text-slate-400'>
          Top {holdings.length} by value
        </span>
      </div>

      <div className='space-y-3'>
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
  holding: CollectionHolding;
  rank: number;
}) {
  const value = calculateHoldingValue(holding);
  const pnl = value - holding.quantity * holding.purchasePriceHkd;
  const pnlPercent =
    holding.purchasePriceHkd > 0
      ? (pnl / (holding.quantity * holding.purchasePriceHkd)) * 100
      : 0;
  const isProfit = pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + rank * 0.05 }}
      className='flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated transition-colors'
    >
      {/* Rank */}
      <div className='w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center'>
        <span className='text-xs font-bold text-accent'>{rank}</span>
      </div>

      {/* Image Placeholder */}
      <div className='w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center overflow-hidden'>
        {holding.imageUrl ? (
          <img
            src={holding.imageUrl}
            alt={holding.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center'>
            <span className='text-xs text-slate-500'>
              {holding.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium text-foreground truncate'>
            {holding.name}
          </p>
          <span className='text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono'>
            {holding.grade}
          </span>
        </div>
        <p className='text-xs text-slate-400 truncate'>
          {holding.setName} {holding.cardNumber && `· #${holding.cardNumber}`}
        </p>
      </div>

      {/* Value & P&L */}
      <div className='text-right'>
        <p className='text-sm font-semibold text-foreground'>
          {formatHKD(value)}
        </p>
        <div
          className={`flex items-center justify-end gap-0.5 text-xs ${
            isProfit ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isProfit ? (
            <ArrowUpRight className='w-3 h-3' />
          ) : (
            <ArrowDownRight className='w-3 h-3' />
          )}
          <span>{formatPercentage(pnlPercent)}</span>
        </div>
      </div>
    </motion.div>
  );
}
