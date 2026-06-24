// =============================================================================
// PORTFOLIO CALCULATION UTILITIES
// =============================================================================

import {
  CollectionHolding,
  CollectionSummary,
  TimeSeriesPoint,
  TimeRange,
} from "@/types/portfolio";

// =============================================================================
// CORE CALCULATIONS
// =============================================================================

/**
 * Calculate total current value for a single holding (quantity * current price)
 */
export function calculateHoldingValue(holding: CollectionHolding): number {
  return holding.quantity * holding.currentPriceHkd;
}

/**
 * Calculate total cost basis for a single holding (quantity * purchase price)
 */
export function calculateHoldingCost(holding: CollectionHolding): number {
  return holding.quantity * holding.purchasePriceHkd;
}

/**
 * Calculate P&L for a single holding
 */
export function calculateHoldingPnl(holding: CollectionHolding): number {
  return calculateHoldingValue(holding) - calculateHoldingCost(holding);
}

/**
 * Calculate P&L percentage for a single holding
 */
export function calculateHoldingPnlPercent(holding: CollectionHolding): number {
  const cost = calculateHoldingCost(holding);
  if (cost === 0) return 0;
  return (calculateHoldingPnl(holding) / cost) * 100;
}

// =============================================================================
// PORTFOLIO AGGREGATION
// =============================================================================

/**
 * Calculate total portfolio value across all holdings
 */
export function calculateTotalValue(holdings: CollectionHolding[]): number {
  return holdings.reduce((sum, h) => sum + calculateHoldingValue(h), 0);
}

/**
 * Calculate total cost basis across all holdings
 */
export function calculateTotalCost(holdings: CollectionHolding[]): number {
  return holdings.reduce((sum, h) => sum + calculateHoldingCost(h), 0);
}

/**
 * Calculate total unrealized P&L
 */
export function calculateTotalPnl(holdings: CollectionHolding[]): number {
  return calculateTotalValue(holdings) - calculateTotalCost(holdings);
}

/**
 * Calculate total P&L percentage
 */
export function calculateTotalPnlPercent(holdings: CollectionHolding[]): number {
  const cost = calculateTotalCost(holdings);
  if (cost === 0) return 0;
  return (calculateTotalPnl(holdings) / cost) * 100;
}

// =============================================================================
// TOP HOLDINGS
// =============================================================================

/**
 * Get top N holdings sorted by current value (descending)
 */
export function getTopHoldings(
  holdings: CollectionHolding[],
  count: number = 4
): CollectionHolding[] {
  return [...holdings]
    .sort((a, b) => calculateHoldingValue(b) - calculateHoldingValue(a))
    .slice(0, count);
}

// =============================================================================
// TIME SERIES GENERATION
// =============================================================================

/**
 * Generate deterministic pseudo-random number from seed
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate time series data for portfolio valuation chart
 */
export function generateTimeSeriesData(
  holdings: CollectionHolding[],
  timeRange: TimeRange
): TimeSeriesPoint[] {
  const totalValue = calculateTotalValue(holdings);
  const points: TimeSeriesPoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let days: number;
  switch (timeRange) {
    case "1D":
      days = 1;
      break;
    case "7D":
      days = 7;
      break;
    case "1M":
      days = 30;
      break;
    case "3M":
      days = 90;
      break;
    case "6M":
      days = 180;
      break;
    case "MAX":
      days = 365;
      break;
    default:
      days = 30;
  }

  // Calculate historical volatility based on 30d price changes
  const avgVolatility =
    holdings.reduce((sum, h) => sum + Math.abs(h.priceChange30d), 0) /
    holdings.length /
    100;

  // Generate data points
  const intervals = Math.min(days, 30); // Max 30 data points for smooth curves
  const intervalMs = (days * dayMs) / intervals;

  for (let i = 0; i <= intervals; i++) {
    const timestamp = now - days * dayMs + i * intervalMs;
    const progress = i / intervals; // 0 to 1

    // Simulate price movement with trend and volatility
    const trendComponent = progress * 0.15; // 15% growth trend over period
    const volatilityComponent =
      Math.sin(i * 0.5) * avgVolatility * 0.3 +
      seededRandom(i * 13.37) * avgVolatility * 0.2;

    const valueMultiplier = 1 + trendComponent + volatilityComponent;
    const value = totalValue * valueMultiplier;

    const date = new Date(timestamp);
    const dateStr = formatDateForRange(date, timeRange);

    points.push({
      timestamp,
      date: dateStr,
      value: Math.round(value * 100) / 100,
    });
  }

  return points;
}

/**
 * Format date based on time range
 */
function formatDateForRange(date: Date, range: TimeRange): string {
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  switch (range) {
    case "1D":
      return `${hours}:${minutes}`;
    case "7D":
      return `${monthShort} ${day}`;
    case "1M":
      return `${monthShort} ${day}`;
    case "3M":
      return `${monthShort} ${day}`;
    case "6M":
      return `${monthShort} ${day}`;
    case "MAX":
      return `${monthShort} ${date.getFullYear()}`;
    default:
      return `${monthShort} ${day}`;
  }
}

// =============================================================================
// PERFORMANCE METRICS
// =============================================================================

/**
 * Calculate period change in value and percentage
 */
export function calculatePeriodChange(
  holdings: CollectionHolding[],
  timeRange: TimeRange
): { changeHkd: number; changePercent: number } {
  const currentValue = calculateTotalValue(holdings);
  const timeSeries = generateTimeSeriesData(holdings, timeRange);

  if (timeSeries.length === 0) {
    return { changeHkd: 0, changePercent: 0 };
  }

  const startValue = timeSeries[0].value;
  const changeHkd = currentValue - startValue;
  const changePercent = startValue > 0 ? (changeHkd / startValue) * 100 : 0;

  return {
    changeHkd: Math.round(changeHkd * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format HKD currency value
 */
export function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/**
 * Format change with currency and percentage
 */
export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatHKD(Math.abs(value)).replace("HKD", "").trim()}`;
}

// =============================================================================
// PORTFOLIO SUMMARY BUILDER
// =============================================================================

/**
 * Build complete portfolio summary from holdings
 */
export function buildPortfolioSummary(
  holdings: CollectionHolding[]
): CollectionSummary {
  const totalValue = calculateTotalValue(holdings);
  const totalCost = calculateTotalCost(holdings);
  const totalPnl = totalValue - totalCost;
  const pnlPercentage = calculateTotalPnlPercent(holdings);
  const topHoldings = getTopHoldings(holdings, 4);

  // Calculate 30-day change
  const change30d = calculatePeriodChange(holdings, "1M");

  return {
    totalValueHkd: Math.round(totalValue * 100) / 100,
    totalCostHkd: Math.round(totalCost * 100) / 100,
    totalPnlHkd: Math.round(totalPnl * 100) / 100,
    pnlPercentage: Math.round(pnlPercentage * 100) / 100,
    change30dHkd: change30d.changeHkd,
    change30dPercent: change30d.changePercent,
    topHoldings,
  };
}
