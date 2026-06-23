// =============================================================================
// DUMMY ARBITRAGE DATA FOR SHOWCASE
// =============================================================================

import {
  ArbitrageEntry,
  ArbitrageSummary,
  BarbellCategory,
  ArbitrageStatus,
} from "@/types/arbitrage";

// =============================================================================
// DUMMY ARBITRAGE ENTRIES
// =============================================================================

export const DUMMY_ARBITRAGE_ENTRIES: ArbitrageEntry[] = [
  {
    id: "arb-001",
    asset_name: "Pokemon 151 Booster Box",
    certification_number: "PSA-2024-00123",
    barbell_category: "Category 1",
    listed_price: 4500,
    market_floor: 5200,
    variance: 700,
    target_bundle_offer: "Bundle with Charizard VMAX",
    status: "Secured",
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-22T14:30:00Z",
  },
  {
    id: "arb-002",
    asset_name: "Pokemon 151 Booster Box",
    certification_number: null,
    barbell_category: "Category 1",
    listed_price: 4800,
    market_floor: 5200,
    variance: 400,
    target_bundle_offer: "Bundle with Charizard VMAX",
    status: "Active Negotiation",
    created_at: "2024-03-21T09:00:00Z",
    updated_at: "2024-03-22T11:00:00Z",
  },
  {
    id: "arb-003",
    asset_name: "Pokemon 151 Booster Box",
    certification_number: "PSA-2024-00456",
    barbell_category: "Category 1",
    listed_price: 5500,
    market_floor: 5200,
    variance: -300,
    target_bundle_offer: "Bundle with Charizard VMAX",
    status: "Pass",
    created_at: "2024-03-19T15:00:00Z",
    updated_at: "2024-03-20T09:00:00Z",
  },
  {
    id: "arb-004",
    asset_name: "LEGO Icons Eiffel Tower",
    certification_number: null,
    barbell_category: "Category 2",
    listed_price: 2200,
    market_floor: 2800,
    variance: 600,
    target_bundle_offer: "Bundle with LEGO Star Wars",
    status: "Secured",
    created_at: "2024-03-18T12:00:00Z",
    updated_at: "2024-03-22T16:00:00Z",
  },
  {
    id: "arb-005",
    asset_name: "LEGO Icons Eiffel Tower",
    certification_number: "BGS-2024-00789",
    barbell_category: "Category 2",
    listed_price: 2500,
    market_floor: 2800,
    variance: 300,
    target_bundle_offer: "Bundle with LEGO Star Wars",
    status: "Vaulted",
    created_at: "2024-03-17T10:00:00Z",
    updated_at: "2024-03-21T14:00:00Z",
  },
  {
    id: "arb-006",
    asset_name: "Hot Toys Mandalorian",
    certification_number: null,
    barbell_category: "Category 3",
    listed_price: 3200,
    market_floor: 2900,
    variance: -300,
    target_bundle_offer: "Bundle with Hot Toys Darth Vader",
    status: "Active Negotiation",
    created_at: "2024-03-22T08:00:00Z",
    updated_at: "2024-03-22T10:00:00Z",
  },
  {
    id: "arb-007",
    asset_name: "Hot Toys Mandalorian",
    certification_number: "BGS-2024-00111",
    barbell_category: "Category 3",
    listed_price: 2600,
    market_floor: 2900,
    variance: 300,
    target_bundle_offer: "Bundle with Hot Toys Darth Vader",
    status: "Secured",
    created_at: "2024-03-21T11:00:00Z",
    updated_at: "2024-03-22T13:00:00Z",
  },
  {
    id: "arb-008",
    asset_name: "Funko Pop Marvel Bundle",
    certification_number: null,
    barbell_category: "Category 2",
    listed_price: 1800,
    market_floor: 2100,
    variance: 300,
    target_bundle_offer: "Bundle with Funko Pop DC",
    status: "Active Negotiation",
    created_at: "2024-03-22T07:00:00Z",
    updated_at: "2024-03-22T09:00:00Z",
  },
];

// =============================================================================
// CALCULATE ARBITRAGE SUMMARY
// =============================================================================

export function calculateArbitrageSummary(
  entries: ArbitrageEntry[]
): ArbitrageSummary {
  const total_secured_margin = entries
    .filter((e) => e.status === "Secured" && e.variance > 0)
    .reduce((sum, e) => sum + e.variance, 0);

  return {
    total_secured_margin,
    total_entries: entries.length,
    active_count: entries.filter((e) => e.status === "Active Negotiation").length,
    secured_count: entries.filter((e) => e.status === "Secured").length,
    vaulted_count: entries.filter((e) => e.status === "Vaulted").length,
    pass_count: entries.filter((e) => e.status === "Pass").length,
    buy_signal_count: entries.filter((e) => e.variance > 0).length,
  };
}

export const DUMMY_ARBITRAGE_SUMMARY = calculateArbitrageSummary(DUMMY_ARBITRAGE_ENTRIES);
