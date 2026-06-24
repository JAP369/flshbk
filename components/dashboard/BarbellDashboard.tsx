"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  Shield,
  Zap,
  Lock,
  RefreshCw,
  Loader2,
  Scale,
} from "lucide-react";
import {
  PortfolioAsset,
  PortfolioSummary,
  LEFT_SIDE_TARGET_PERCENTAGE,
  RIGHT_SIDE_TARGET_PERCENTAGE,
  LEFT_SIDE_ALERT_THRESHOLD,
} from "@/types/portfolio";
import {
  fetchPortfolioAssets,
  fetchPortfolioSummary,
} from "@/lib/supabase-client";

// =============================================================================
// TYPES
// =============================================================================

interface AllocationAlert {
  type: "warning" | "danger";
  message: string;
  current_value: number;
  threshold: number;
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

function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BarbellDashboard() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assetsData, summaryData] = await Promise.all([
        fetchPortfolioAssets(),
        fetchPortfolioSummary(),
      ]);
      setAssets(assetsData);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load portfolio data. Please try again.");
      console.error("Error loading portfolio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute alerts
  const alerts = useMemo<AllocationAlert[]>(() => {
    if (!summary) return [];

    const alertsList: AllocationAlert[] = [];

    // Check if left side exceeds 30% threshold
    if (summary.left_side_percentage > LEFT_SIDE_ALERT_THRESHOLD) {
      alertsList.push({
        type: "danger",
        message: `Left side exposure at ${summary.left_side_percentage.toFixed(1)}% — exceeds ${LEFT_SIDE_ALERT_THRESHOLD}% threshold. Rebalance required.`,
        current_value: summary.left_side_percentage,
        threshold: LEFT_SIDE_ALERT_THRESHOLD,
      });
    } else if (summary.left_side_percentage > LEFT_SIDE_TARGET_PERCENTAGE + 5) {
      alertsList.push({
        type: "warning",
        message: `Left side at ${summary.left_side_percentage.toFixed(1)}% — approaching ${LEFT_SIDE_ALERT_THRESHOLD}% alert threshold.`,
        current_value: summary.left_side_percentage,
        threshold: LEFT_SIDE_ALERT_THRESHOLD,
      });
    }

    return alertsList;
  }, [summary]);

  // Filter assets by side
  const leftSideAssets = useMemo(
    () => assets.filter((a) => a.allocation_side === "left"),
    [assets],
  );
  const rightSideAssets = useMemo(
    () => assets.filter((a) => a.allocation_side === "right"),
    [assets],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!summary) {
    return <EmptyState />;
  }

  return (
    <div className='min-h-screen pt-20 pb-12 bg-background'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-serif text-3xl sm:text-4xl text-foreground'>
                Barbell Portfolio
              </h1>
              <p className='text-silver mt-1'>
                Dual-sided asset allocation strategy
              </p>
            </div>
            <button
              onClick={loadData}
              className='p-2 rounded-lg bg-surface-elevated text-silver hover:text-accent transition-colors'
              aria-label='Refresh data'
            >
              <RefreshCw className='w-5 h-5' />
            </button>
          </div>
        </motion.header>

        {/* Alert Banner */}
        <AnimatePresence>
          {alerts.length > 0 && <AlertBanner alerts={alerts} />}
        </AnimatePresence>

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Allocation Donut */}
        <AllocationDonut summary={summary} />

        {/* Dual-Side Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8'>
          {/* Left Side - Active Trading (20%) */}
          <div className='lg:col-span-2'>
            <SidePanel
              side='left'
              assets={leftSideAssets}
              deployed={summary.left_side_deployed_hkd}
              target={summary.left_side_target_hkd}
              percentage={summary.left_side_percentage}
              targetPercentage={LEFT_SIDE_TARGET_PERCENTAGE}
            />
          </div>

          {/* Right Side - Premium Vaulted (80%) */}
          <div className='lg:col-span-3'>
            <SidePanel
              side='right'
              assets={rightSideAssets}
              deployed={summary.right_side_deployed_hkd}
              target={summary.right_side_target_hkd}
              percentage={summary.right_side_percentage}
              targetPercentage={RIGHT_SIDE_TARGET_PERCENTAGE}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className='min-h-screen pt-20 flex items-center justify-center'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <Loader2 className='w-10 h-10 text-accent animate-spin mx-auto mb-4' />
          <p className='text-silver'>Loading portfolio data...</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className='min-h-screen pt-20 flex items-center justify-center'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-md mx-auto'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center'>
            <AlertTriangle className='w-8 h-8 text-red-500' />
          </div>
          <h2 className='font-serif text-xl text-foreground mb-2'>
            Something went wrong
          </h2>
          <p className='text-silver mb-6'>{message}</p>
          <button
            onClick={onRetry}
            className='px-6 py-2 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className='min-h-screen pt-20 flex items-center justify-center'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-md mx-auto'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center'>
            <Wallet className='w-8 h-8 text-silver' />
          </div>
          <h2 className='font-serif text-xl text-foreground mb-2'>
            No assets found
          </h2>
          <p className='text-silver'>
            Your portfolio is empty. Start by adding assets to begin tracking
            your allocation strategy.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ALERT BANNER
// =============================================================================

function AlertBanner({ alerts }: { alerts: AllocationAlert[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='mb-6'
    >
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            alert.type === "danger"
              ? "bg-red-500/10 border-red-500/20"
              : "bg-amber-500/10 border-amber-500/20"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              alert.type === "danger" ? "text-red-500" : "text-amber-500"
            }`}
          />
          <div className='flex-1'>
            <p
              className={`text-sm font-medium ${
                alert.type === "danger" ? "text-red-400" : "text-amber-400"
              }`}
            >
              {alert.message}
            </p>
            <p className='text-xs text-silver mt-1'>
              Current: {alert.current_value.toFixed(1)}% | Threshold:{" "}
              {alert.threshold}%
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// SUMMARY CARDS
// =============================================================================

function SummaryCards({ summary }: { summary: PortfolioSummary }) {
  const cards = [
    {
      label: "Total Portfolio",
      value: formatHKD(summary.total_portfolio_value_hkd),
      subValue: formatPercentage(summary.total_unrealized_pnl_percentage),
      icon: Wallet,
      color: "text-accent",
      bgColor: "bg-accent/10",
      subColor:
        summary.total_unrealized_pnl_hkd >= 0
          ? "text-emerald-400"
          : "text-red-400",
    },
    {
      label: "Available Cash",
      value: formatHKD(summary.available_cash_hkd),
      subValue: "Liquid",
      icon: Wallet,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      subColor: "text-blue-400",
    },
    {
      label: "Left Side",
      value: formatHKD(summary.left_side_deployed_hkd),
      subValue: `${summary.left_side_percentage.toFixed(1)}% deployed`,
      icon: Zap,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      subColor:
        summary.left_side_percentage > LEFT_SIDE_ALERT_THRESHOLD
          ? "text-red-400"
          : "text-emerald-400",
    },
    {
      label: "Right Side",
      value: formatHKD(summary.right_side_deployed_hkd),
      subValue: `${summary.right_side_percentage.toFixed(1)}% deployed`,
      icon: Shield,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      subColor: "text-amber-400",
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className='glass-card rounded-xl p-4 sm:p-5'
        >
          <div className='flex items-center gap-3 mb-3'>
            <div
              className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}
            >
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className='text-xs text-silver font-medium uppercase tracking-wide'>
              {card.label}
            </span>
          </div>
          <p className='font-serif text-xl sm:text-2xl text-foreground'>
            {card.value}
          </p>
          <p className={`text-sm mt-1 ${card.subColor}`}>{card.subValue}</p>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// ALLOCATION DONUT
// =============================================================================

function AllocationDonut({ summary }: { summary: PortfolioSummary }) {
  const leftPercentage = summary.left_side_percentage;
  const rightPercentage = summary.right_side_percentage;

  // SVG donut parameters
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const leftLength = (leftPercentage / 100) * circumference;
  const rightLength = (rightPercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className='glass-card rounded-xl p-6 mt-6'
    >
      <div className='flex flex-col sm:flex-row items-center gap-6'>
        {/* Donut Chart */}
        <div className='relative flex-shrink-0'>
          <svg width={size} height={size} className='-rotate-90'>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              className='text-surface-elevated'
            />
            {/* Left side (emerald) */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              strokeDasharray={`${leftLength} ${circumference - leftLength}`}
              strokeDashoffset={0}
              className='text-emerald-500'
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{
                strokeDasharray: `${leftLength} ${circumference - leftLength}`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Right side (amber) */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              strokeDasharray={`${rightLength} ${circumference - rightLength}`}
              strokeDashoffset={-leftLength}
              className='text-amber-500'
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{
                strokeDasharray: `${rightLength} ${circumference - rightLength}`,
              }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          {/* Center text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <Scale className='w-5 h-5 text-silver mb-1' />
            <p className='font-serif text-lg text-foreground'>20/80</p>
            <p className='text-xs text-silver'>Target</p>
          </div>
        </div>

        {/* Legend */}
        <div className='flex-1 w-full'>
          <h3 className='font-serif text-lg text-foreground mb-4'>
            Allocation Compliance
          </h3>

          {/* Left Side Progress */}
          <div className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-emerald-500' />
                <span className='text-sm text-foreground'>Active Trading</span>
              </div>
              <span className='text-sm text-silver'>
                {leftPercentage.toFixed(1)}%
              </span>
            </div>
            <div className='h-2 bg-surface-elevated rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(leftPercentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  leftPercentage > LEFT_SIDE_ALERT_THRESHOLD
                    ? "bg-red-500"
                    : "bg-emerald-500"
                }`}
              />
            </div>
            <div className='flex justify-between mt-1'>
              <span className='text-xs text-silver'>
                Target: {LEFT_SIDE_TARGET_PERCENTAGE}%
              </span>
              <span className='text-xs text-red-400'>
                Alert: {LEFT_SIDE_ALERT_THRESHOLD}%
              </span>
            </div>
          </div>

          {/* Right Side Progress */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-amber-500' />
                <span className='text-sm text-foreground'>Premium Vaulted</span>
              </div>
              <span className='text-sm text-silver'>
                {rightPercentage.toFixed(1)}%
              </span>
            </div>
            <div className='h-2 bg-surface-elevated rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(rightPercentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className='h-full rounded-full bg-amber-500'
              />
            </div>
            <div className='flex justify-between mt-1'>
              <span className='text-xs text-silver'>
                Target: {RIGHT_SIDE_TARGET_PERCENTAGE}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// SIDE PANEL
// =============================================================================

function SidePanel({
  side,
  assets,
  deployed,
  target,
  percentage,
  targetPercentage,
}: {
  side: "left" | "right";
  assets: PortfolioAsset[];
  deployed: number;
  target: number;
  percentage: number;
  targetPercentage: number;
}) {
  const isLeft = side === "left";
  const isOverallocated = isLeft && percentage > LEFT_SIDE_ALERT_THRESHOLD;

  const headerColor = isLeft ? "text-emerald-400" : "text-amber-400";
  const bgGradient = isLeft
    ? "from-emerald-500/5 to-transparent"
    : "from-amber-500/5 to-transparent";
  const borderColor = isLeft ? "border-emerald-500/20" : "border-amber-500/20";
  const iconBg = isLeft ? "bg-emerald-500/10" : "bg-amber-500/10";
  const Icon = isLeft ? Zap : Lock;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`glass-card rounded-xl overflow-hidden border ${borderColor}`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-b ${bgGradient} p-5 border-b border-border`}
      >
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${headerColor}`} />
            </div>
            <div>
              <h3 className='font-serif text-lg text-foreground'>
                {isLeft ? "Active Trading" : "Premium Vaulted"}
              </h3>
              <p className='text-xs text-silver'>
                {isLeft ? "High-velocity stocks" : "Sealed boxes & slabs"}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOverallocated
                ? "bg-red-500/10 text-red-400"
                : isLeft
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Deployment Bar */}
        <div className='mt-4'>
          <div className='flex justify-between text-sm mb-1'>
            <span className='text-silver'>Deployed</span>
            <span className='text-foreground'>{formatHKD(deployed)}</span>
          </div>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-silver'>Target ({targetPercentage}%)</span>
            <span className='text-silver'>{formatHKD(target)}</span>
          </div>
          <div className='h-2 bg-surface-elevated rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((deployed / target) * 100, 150)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isOverallocated
                  ? "bg-red-500"
                  : isLeft
                    ? "bg-emerald-500"
                    : "bg-amber-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-medium text-foreground'>Holdings</h4>
          <span className='text-xs text-silver'>{assets.length} assets</span>
        </div>

        <div className='space-y-3'>
          {assets.map((asset, index) => (
            <AssetRow key={asset.id} asset={asset} index={index} side={side} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// ASSET ROW
// =============================================================================

function AssetRow({
  asset,
  index,
}: {
  asset: PortfolioAsset;
  index: number;
  side: "left" | "right";
}) {
  const isPositive = asset.unrealized_pnl_hkd >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.05 }}
      className='p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors group'
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium text-foreground truncate'>
              {asset.name}
            </p>
            {asset.ticker && (
              <span className='text-xs text-silver bg-surface px-1.5 py-0.5 rounded'>
                {asset.ticker}
              </span>
            )}
          </div>
          <div className='flex items-center gap-3 mt-1'>
            <span className='text-xs text-silver'>
              {asset.quantity} units @ {formatHKD(asset.purchase_price_hkd)}
            </span>
            <span
              className={`text-xs font-medium flex items-center gap-0.5 ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className='w-3 h-3' />
              ) : (
                <TrendingDown className='w-3 h-3' />
              )}
              {formatPercentage(asset.unrealized_pnl_percentage)}
            </span>
          </div>
        </div>
        <div className='text-right ml-3'>
          <p className='text-sm font-medium text-foreground'>
            {formatHKD(asset.total_value_hkd)}
          </p>
          <p className='text-xs text-silver'>
            {asset.weight_percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
