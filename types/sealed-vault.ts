// =============================================================================
// SEALED VAULT PROJECTIONS TYPES
// =============================================================================

export type VaultStrategy = "Flip" | "Keep";

export interface SealedAsset {
  id: string;
  product_name: string;
  category: string;
  entry_cost: number;
  quantity: number;
  cagr_estimate: number; // Decimal (e.g., 0.14 for 14%)
  vault_strategy: VaultStrategy;
  image_url?: string;
  certification?: string;
  purchase_date: string;
}

export interface ProjectionPoint {
  year: number;
  value: number;
}

export interface AssetProjection {
  asset: SealedAsset;
  total_entry_cost: number;
  projections: ProjectionPoint[];
  year_1_value: number;
  year_3_value: number;
  year_5_value: number;
  roi_percentage: number;
}

export interface VaultSummary {
  total_invested: number;
  total_current_value: number;
  projected_value_year_1: number;
  projected_value_year_3: number;
  projected_value_year_5: number;
  weighted_avg_cagr: number;
  flip_count: number;
  keep_count: number;
}

export const PREMIUM_CAGR = 0.14; // 14% for premium items
export const STANDARD_CAGR = 0.12; // 12% for standard items

export const HOLD_TIMELINE_MIN = 1;
export const HOLD_TIMELINE_MAX = 10;
export const HOLD_TIMELINE_DEFAULT = 5;
