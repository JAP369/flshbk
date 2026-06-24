// =============================================================================
// PORTFOLIO TYPES - Multi-TCG Collectible Tracking
// =============================================================================

// =============================================================================
// ENUMS
// =============================================================================

export type AllocationSide = "left" | "right";

export type AssetStatus = "active" | "vaulted" | "pending" | "sealed";

export type AssetType =
  | "stock"
  | "etf"
  | "crypto"
  | "sealed_box"
  | "premium_slab"
  | "cash"
  | "bond";

export type TimeRange = "1D" | "7D" | "1M" | "3M" | "6M" | "MAX";

// =============================================================================
// BARBELL DASHBOARD TYPES
// =============================================================================

export interface PortfolioAsset {
  id: string;
  user_id: string;
  name: string;
  ticker?: string;
  asset_type: AssetType;
  allocation_side: AllocationSide;
  status: AssetStatus;
  quantity: number;
  purchase_price_hkd: number;
  current_price_hkd: number;
  total_value_hkd: number;
  weight_percentage: number;
  unrealized_pnl_hkd: number;
  unrealized_pnl_percentage: number;
  last_updated: string;
  created_at: string;
}

export interface PortfolioSummary {
  total_portfolio_value_hkd: number;
  available_cash_hkd: number;
  left_side_deployed_hkd: number;
  left_side_target_hkd: number;
  left_side_percentage: number;
  right_side_deployed_hkd: number;
  right_side_target_hkd: number;
  right_side_percentage: number;
  total_unrealized_pnl_hkd: number;
  total_unrealized_pnl_percentage: number;
}

export interface AllocationAlert {
  type: "warning" | "danger" | "info";
  message: string;
  current_value: number;
  threshold: number;
}

export const MASTER_CAPITAL_POOL_HKD = 50000;

export const LEFT_SIDE_TARGET_PERCENTAGE = 20;
export const RIGHT_SIDE_TARGET_PERCENTAGE = 80;

export const LEFT_SIDE_ALERT_THRESHOLD = 30;

// =============================================================================
// COLLECTION GRID TYPES
// =============================================================================

export interface CollectionHolding {
  id: string;
  name: string;
  setName: string;
  setCode: string;
  cardNumber: string | null;
  rarity: string | null;
  imageUrl: string | null;
  grade: string;
  quantity: number;
  purchasePriceHkd: number;
  currentPriceHkd: number;
  priceChange30d: number;
  allocationSide: "left_velocity" | "right_vault";
}

export interface CollectionSummary {
  totalValueHkd: number;
  totalCostHkd: number;
  totalPnlHkd: number;
  pnlPercentage: number;
  change30dHkd: number;
  change30dPercent: number;
  topHoldings: CollectionHolding[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface TimeSeriesPoint {
  timestamp: number;
  date: string;
  value: number;
}
