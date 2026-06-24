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
  Package,
  Shield,
  ChevronDown,
  ChevronUp,
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
  totalValue: number;
  totalCost: number;
  unrealizedPnl: number;
  pnlPercent: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PortfolioOverview() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");
  const [holdingsView, setHoldingsView] = useState<"table" | "cards">("table");
  const [isHoldingsExpanded, setIsHoldingsExpanded] = useState(true);
  const [sortKey, setSortKey] = useState<"value" | "pnl" | "name" | "qty">("value");
  const [sortAsc, setSortAsc] = useState(false);

  // Build portfolio summary
  const summary: CollectionSummary = useMemo(
    () => buildPortfolioSummary(PORTFOLIO_HOLDINGS),
    []
  );

  // Generate chart data
  const chartData = useMemo(
    () => generateTimeSeriesData(PORTFOLIO_HOLDINGS, selectedRange),
    [selectedRange]
  );

  // Calculate period change
  const periodChange = useMemo(
    () => calculatePeriodChange(PORTFOLIO_HOLDINGS, selectedRange),
    [selectedRange]
  );

  // Calculate portfolio-wide volatility
  const holdingsWithMeta: HoldingWithVolatility[] = useMemo(() => {
    return PORTFOLIO_HOLDINGS.map((holding) => {
      const volatilityIndex = calculateHoldingVolatility(
        holding.currentPriceHkd,
        holding.purchasePriceHkd,
        holding.priceChange30d
      );
      const volatilityLevel = getVolatilityLevel(volatilityIndex);
      const totalValue = holding.currentPriceHkd * holding.quantity;
      const totalCost = holding.purchasePriceHkd * holding.quantity;
      const unrealizedPnl = totalValue - totalCost;
      const pnlPercent = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

      return {
        ...holding,
        volatilityIndex,
        volatilityLevel,
        totalValue,
        totalCost,
        unrealizedPnl,
        pnlPercent,
      };
    });
  }, []);

  // Sort holdings
  const sortedHoldings = useMemo(() => {
    const sorted = [...holdingsWithMeta];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "value":
          cmp = a.totalValue - b.totalValue;
          break;
        case "pnl":
          cmp = a.unrealizedPnl - b.unrealizedPnl;
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "qty":
          cmp = a.quantity - b.quantity;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [holdingsWithMeta, sortKey, sortAsc]);

  const portfolioVolatility = useMemo(() => {
    if (holdingsWithMeta.length === 0) return 0;
    return (
      holdingsWithMeta.reduce((sum, h) => sum + h.volatilityIndex, 0) /
      holdingsWithMeta.length
    );
  }, [holdingsWithMeta]);

  const highVolatilityCount = useMemo(
    () =>
      holdingsWithMeta.filter(
        (h) => h.volatilityLevel === "high" || h.volatilityLevel === "extreme"
      ).length,
    [holdingsWithMeta]
  );

  // Determine if change is positive
  const isPositive = periodChange.changeHkd >= 0;
  const isPortfolioVolatile = portfolioVolatility >= 25;

  // Sort toggle
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  // Totals
  const totalValue = holdingsWithMeta.reduce((s, h) => s + h.totalValue, 0);
  const totalCost = holdingsWithMeta.reduce((s, h) => s + h.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

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

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Holdings Header */}
        <button
          onClick={() => setIsHoldingsExpanded(!isHoldingsExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              All Holdings ({PORTFOLIO_HOLDINGS.length})
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Value</p>
              <p className="text-sm font-bold text-foreground">{formatHKD(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total P&L</p>
              <p className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}{formatHKD(totalPnl)} ({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%)
              </p>
            </div>
            {isHoldingsExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isHoldingsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* View Toggle */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                <div className="flex items-center gap-1 p-1 bg-surface-rounded-lg">
                  <button
                    onClick={() => setHoldingsView("table")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      holdingsView === "table"
                        ? "bg-accent text-background"
                        : "text-slate-400 hover:text-foreground"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setHoldingsView("cards")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      holdingsView === "cards"
                        ? "bg-accent text-background"
                        : "text-slate-400 hover:text-foreground"
                    }`}
                  >
                    Cards
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {holdingsWithMeta.filter(h => h.grade === "Sealed").length} sealed · {holdingsWithMeta.filter(h => h.grade !== "Sealed").length} slabs
                </p>
              </div>

              {holdingsView === "table" ? (
                <HoldingsTable holdings={sortedHoldings} onSort={handleSort} sortKey={sortKey} sortAsc={sortAsc} />
              ) : (
                <HoldingsCards holdings={sortedHoldings} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Top Holdings Marquee */}
      <TopHoldingsMarquee holdings={holdingsWithMeta} />
    </div>
  );
}

// =============================================================================
// HOLDINGS TABLE COMPONENT
// =============================================================================

function HoldingsTable({
  holdings,
  onSort,
  sortKey,
  sortAsc,
}: {
  holdings: HoldingWithVolatility[];
  onSort: (key: "value" | "pnl" | "name" | "qty") => void;
  sortKey: string;
  sortAsc: boolean;
}) {
  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 text-slate-600" />;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 text-accent" />
    ) : (
      <ChevronDown className="w-3 h-3 text-accent" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
              <button onClick={() => onSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                Asset <SortIcon col="name" />
              </button>
            </th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-center">Type</th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-center">
              <button onClick={() => onSort("qty")} className="flex items-center gap-1 hover:text-foreground transition-colors mx-auto">
                Qty <SortIcon col="qty" />
              </button>
            </th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Cost</th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Current</th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">
              <button onClick={() => onSort("value")} className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                Value <SortIcon col="value" />
              </button>
            </th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">
              <button onClick={() => onSort("pnl")} className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                P&L <SortIcon col="pnl" />
              </button>
            </th>
            <th className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">30d</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, idx) => (
            <tr
              key={holding.id}
              className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
            >
              {/* Asset Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {holding.grade === "Sealed" ? (
                    <Package className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  ) : (
                    <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {holding.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{holding.setName}</p>
                  </div>
                </div>
              </td>

              {/* Type */}
              <td className="px-4 py-3 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  holding.grade === "Sealed"
                    ? "bg-violet-500/10 text-violet-400"
                    : "bg-sky-500/10 text-sky-400"
                }`}>
                  {holding.grade === "Sealed" ? "Sealed" : holding.grade}
                </span>
              </td>

              {/* Qty */}
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-foreground font-mono">{holding.quantity}</span>
              </td>

              {/* Cost (unit) */}
              <td className="px-4 py-3 text-right">
                <span className="text-xs text-slate-400">{formatHKD(holding.purchasePriceHkd)}</span>
              </td>

              {/* Current (unit) */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm text-slate-300">{formatHKD(holding.currentPriceHkd)}</span>
              </td>

              {/* Total Value */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-foreground">{formatHKD(holding.totalValue)}</span>
              </td>

              {/* P&L */}
              <td className="px-4 py-3 text-right">
                <div className={`flex items-center justify-end gap-0.5 ${holding.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {holding.unrealizedPnl >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span className="text-sm font-medium">
                    {holding.unrealizedPnl >= 0 ? "+" : ""}{formatHKD(holding.unrealizedPnl)}
                  </span>
                </div>
                <span className={`text-[10px] ${holding.unrealizedPnl >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                  {holding.pnlPercent >= 0 ? "+" : ""}{holding.pnlPercent.toFixed(1)}%
                </span>
              </td>

              {/* 30d Change */}
              <td className="px-4 py-3 text-right">
                <span className={`text-xs font-medium ${holding.priceChange30d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {holding.priceChange30d >= 0 ? "+" : ""}{holding.priceChange30d.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-surface-elevated/30">
            <td className="px-4 py-3" colSpan={2}>
              <span className="text-sm font-semibold text-foreground">TOTAL</span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="text-sm font-semibold text-foreground">
                {holdings.reduce((s, h) => s + h.quantity, 0)}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-xs text-slate-400">—</span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-xs text-slate-400">—</span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-sm font-bold text-foreground">{formatHKD(holdings.reduce((s, h) => s + h.totalValue, 0))}</span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className={`text-sm font-bold ${holdings.reduce((s, h) => s + h.unrealizedPnl, 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {holdings.reduce((s, h) => s + h.unrealizedPnl, 0) >= 0 ? "+" : ""}{formatHKD(holdings.reduce((s, h) => s + h.unrealizedPnl, 0))}
              </span>
            </td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// =============================================================================
// HOLDINGS CARDS COMPONENT
// =============================================================================

function HoldingsCards({ holdings }: { holdings: HoldingWithVolatility[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
      {holdings.map((holding) => (
        <motion.div
          key={holding.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-3 border border-border hover:border-border/80 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              holding.grade === "Sealed" ? "bg-violet-500/10" : "bg-sky-500/10"
            }`}>
              {holding.grade === "Sealed" ? (
                <Package className="w-5 h-5 text-violet-400" />
              ) : (
                <Shield className="w-5 h-5 text-sky-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{holding.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{holding.setName} · {holding.grade}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-slate-400">Qty</p>
              <p className="text-sm font-semibold text-foreground">{holding.quantity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Value</p>
              <p className="text-sm font-semibold text-foreground">{formatHKD(holding.totalValue)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">P&L</p>
              <p className={`text-sm font-semibold ${holding.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {holding.unrealizedPnl >= 0 ? "+" : ""}{formatHKD(holding.unrealizedPnl)}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
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
  const topHoldings = [...holdings]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

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
          Top 5 Most Valuable
        </h3>
        <span className="text-xs text-slate-400">
          By total value
        </span>
      </div>

      <div className="space-y-3">
        {topHoldings.map((holding, idx) => (
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

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        holding.grade === "Sealed" ? "bg-violet-500/10" : "bg-sky-500/10"
      }`}>
        {holding.grade === "Sealed" ? (
          <Package className="w-4 h-4 text-violet-400" />
        ) : (
          <Shield className="w-4 h-4 text-sky-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">
            {holding.name}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            holding.grade === "Sealed" ? "bg-violet-500/10 text-violet-400" : "bg-sky-500/10 text-sky-400"
          }`}>
            {holding.grade}
          </span>
          {isHighVolatility && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-2.5 h-2.5" />
              High Vol
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {holding.setName} {holding.cardNumber && `· #${holding.cardNumber}`} · Qty: {holding.quantity}
        </p>
      </div>

      {/* Value & P&L */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {formatHKD(holding.totalValue)}
        </p>
        <div
          className={`flex items-center justify-end gap-0.5 text-xs ${
            holding.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {holding.unrealizedPnl >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span>{holding.pnlPercent >= 0 ? "+" : ""}{holding.pnlPercent.toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
