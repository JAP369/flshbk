// =============================================================================
// ARBITRAGE TRACKER TYPES
// =============================================================================

export type BarbellCategory = "Category 1" | "Category 2" | "Category 3";

export type ArbitrageStatus =
  | "Active Negotiation"
  | "Secured"
  | "Vaulted"
  | "Pass";

export interface ArbitrageEntry {
  id: string;
  asset_name: string;
  certification_number: string | null;
  barbell_category: BarbellCategory;
  listed_price: number;
  market_floor: number;
  variance: number;
  target_bundle_offer: string;
  status: ArbitrageStatus;
  created_at: string;
  updated_at: string;
}

export interface ArbitrageSummary {
  total_secured_margin: number;
  total_entries: number;
  active_count: number;
  secured_count: number;
  vaulted_count: number;
  pass_count: number;
  buy_signal_count: number;
}

export const BARBELL_CATEGORIES: BarbellCategory[] = [
  "Category 1",
  "Category 2",
  "Category 3",
];

export const ARBITRAGE_STATUSES: ArbitrageStatus[] = [
  "Active Negotiation",
  "Secured",
  "Vaulted",
  "Pass",
];

export const STATUS_COLORS: Record<ArbitrageStatus, string> = {
  "Active Negotiation": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Secured: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Vaulted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Pass: "bg-red-500/10 text-red-400 border-red-500/20",
};
