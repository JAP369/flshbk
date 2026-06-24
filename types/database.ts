// =============================================================================
// DATABASE TYPES - Matching Supabase Schema
// =============================================================================

export type ItemType = 'singles' | 'sealed_box' | 'booster_bundle';
export type AllocationSide = 'left_velocity' | 'right_vault';
export type Grade = 'PSA 10' | 'PSA 9' | 'PSA 8' | 'BGS 10' | 'BGS 9.5' | 'BGS 9' | 'CGC 10' | 'CGC 9.5' | 'SGC 10' | 'Raw' | 'Sealed' | 'Ungraded';
export type PriceSource = 'ebay' | 'tcgplayer' | 'cardmarket' | 'psa' | 'beckett' | 'manual' | 'aggregator' | 'api';

export interface TCGCategories {
  id: string; name: string; slug: string; description: string | null; icon_url: string | null;
  is_active: boolean; sort_order: number; created_at: string; updated_at: string;
}

export interface CatalogItem {
  id: string; tcg_category_id: string; name: string; set_name: string; set_code: string;
  card_number: string | null; rarity: string; item_type: ItemType; image_url: string | null;
  description: string | null; release_date: string | null; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface MarketPrice {
  id: string; catalog_item_id: string; grade: Grade; price_hkd: number; price_usd: number | null;
  price_source: PriceSource; condition_notes: string | null; listing_url: string | null;
  is_current: boolean; recorded_at: string; updated_at: string;
}

export interface UserPortfolio {
  id: string; user_id: string; catalog_item_id: string; quantity: number;
  purchase_price_hkd: number; current_value_hkd: number | null; condition_grade: Grade;
  allocation_side: AllocationSide; storage_location: string | null; notes: string | null;
  is_favorite: boolean; created_at: string; updated_at: string;
}

export interface PriceHistory {
  id: string; catalog_item_id: string; grade: Grade; price_hkd: number; price_usd: number | null;
  price_source: PriceSource; volume: number | null; recorded_date: string; created_at: string;
}

export interface Watchlist {
  id: string; user_id: string; catalog_item_id: string; target_price_hkd: number | null;
  alert_on_drop: boolean; alert_on_rise: boolean; notes: string | null; created_at: string;
}

export interface PortfolioTransaction {
  id: string; user_id: string; catalog_item_id: string; transaction_type: 'buy' | 'sell' | 'trade';
  quantity: number; price_per_unit_hkd: number; total_price_hkd: number;
  counterparty_username: string | null; notes: string | null; transaction_date: string; created_at: string;
}

export interface CurrentPriceView {
  id: string; catalog_item_id: string; item_name: string; set_name: string; set_code: string;
  card_number: string | null; rarity: string; item_type: ItemType; tcg_category: string;
  grade: Grade; price_hkd: number; price_usd: number | null; price_source: PriceSource; recorded_at: string;
}

export interface UserPortfolioView {
  portfolio_id: string; user_id: string; catalog_item_id: string; item_name: string;
  set_name: string; set_code: string; card_number: string | null; rarity: string;
  item_type: ItemType; image_url: string | null; tcg_category: string; quantity: number;
  purchase_price_hkd: number; current_value_hkd: number | null; unrealized_pnl_hkd: number;
  pnl_pct: number; condition_grade: Grade; allocation_side: AllocationSide;
  storage_location: string | null; is_favorite: boolean; created_at: string;
}

export interface PortfolioSummary {
  total_items: number; total_quantity: number; total_invested_hkd: number;
  total_current_value_hkd: number; total_unrealized_pnl_hkd: number; pnl_pct: number;
  left_velocity_items: number; right_vault_items: number;
  left_velocity_value: number; right_vault_value: number;
}
