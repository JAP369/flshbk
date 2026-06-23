// =============================================================================
// PORTFOLIO ASSET TYPES
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
