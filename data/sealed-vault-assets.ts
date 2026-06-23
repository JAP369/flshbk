// =============================================================================
// DUMMY SEALED VAULT ASSETS FOR SHOWCASE
// =============================================================================

import {
  SealedAsset,
  AssetProjection,
  ProjectionPoint,
  VaultSummary,
  PREMIUM_CAGR,
  STANDARD_CAGR,
} from "@/types/sealed-vault";

// =============================================================================
// SEALED ASSETS DATA
// =============================================================================

export const DUMMY_SEALED_ASSETS: SealedAsset[] = [
  {
    id: "sealed-001",
    product_name: "Pokemon 151 Booster Box",
    category: "Premium",
    entry_cost: 4500,
    quantity: 3,
    cagr_estimate: PREMIUM_CAGR,
    vault_strategy: "Keep",
    certification: "PSA-2024-00123",
    purchase_date: "2024-01-15",
  },
  {
    id: "sealed-002",
    product_name: "Pokemon Shining Fates Box",
    category: "Premium",
    entry_cost: 3200,
    quantity: 2,
    cagr_estimate: PREMIUM_CAGR,
    vault_strategy: "Keep",
    purchase_date: "2024-02-01",
  },
  {
    id: "sealed-003",
    product_name: "LEGO Icons Eiffel Tower",
    category: "Standard",
    entry_cost: 2200,
    quantity: 2,
    cagr_estimate: STANDARD_CAGR,
    vault_strategy: "Flip",
    purchase_date: "2024-01-20",
  },
  {
    id: "sealed-004",
    product_name: "LEGO Star Wars UCS Venator",
    category: "Standard",
    entry_cost: 4800,
    quantity: 1,
    cagr_estimate: STANDARD_CAGR,
    vault_strategy: "Keep",
    purchase_date: "2024-03-01",
  },
  {
    id: "sealed-005",
    product_name: "MTG Modern Horizons 3 Box",
    category: "Premium",
    entry_cost: 8500,
    quantity: 2,
    cagr_estimate: PREMIUM_CAGR,
    vault_strategy: "Keep",
    purchase_date: "2024-02-15",
  },
  {
    id: "sealed-006",
    product_name: "Funko Pop Marvel Chase Bundle",
    category: "Standard",
    entry_cost: 1800,
    quantity: 5,
    cagr_estimate: STANDARD_CAGR,
    vault_strategy: "Flip",
    purchase_date: "2024-03-10",
  },
  {
    id: "sealed-007",
    product_name: "Hot Toys Mandalorian Season 3",
    category: "Standard",
    entry_cost: 2600,
    quantity: 2,
    cagr_estimate: STANDARD_CAGR,
    vault_strategy: "Flip",
    purchase_date: "2024-01-05",
  },
  {
    id: "sealed-008",
    product_name: "Pokemon Evolving Skies Box",
    category: "Premium",
    entry_cost: 5200,
    quantity: 2,
    cagr_estimate: PREMIUM_CAGR,
    vault_strategy: "Keep",
    certification: "BGS-2024-00456",
    purchase_date: "2024-02-20",
  },
];

// =============================================================================
// COMPOUND INTEREST CALCULATIONS
// =============================================================================

/**
 * Calculate Future Value using compound interest formula
 * FV = P * (1 + r)^n
 */
export function calculateFutureValue(
  principal: number,
  rate: number,
  years: number
): number {
  return principal * Math.pow(1 + rate, years);
}

/**
 * Calculate projections for a single asset
 */
export function calculateAssetProjection(
  asset: SealedAsset,
  holdTimeline: number
): AssetProjection {
  const totalEntryCost = asset.entry_cost * asset.quantity;
  const projections: ProjectionPoint[] = [];

  // Generate projection points for each year
  for (let year = 0; year <= holdTimeline; year++) {
    projections.push({
      year,
      value: calculateFutureValue(totalEntryCost, asset.cagr_estimate, year),
    });
  }

  return {
    asset,
    total_entry_cost: totalEntryCost,
    projections,
    year_1_value: calculateFutureValue(totalEntryCost, asset.cagr_estimate, 1),
    year_3_value: calculateFutureValue(totalEntryCost, asset.cagr_estimate, 3),
    year_5_value: calculateFutureValue(totalEntryCost, asset.cagr_estimate, 5),
    roi_percentage:
      ((calculateFutureValue(totalEntryCost, asset.cagr_estimate, holdTimeline) -
        totalEntryCost) /
        totalEntryCost) *
      100,
  };
}

/**
 * Calculate vault summary
 */
export function calculateVaultSummary(
  projections: AssetProjection[]
): VaultSummary {
  const totalInvested = projections.reduce(
    (sum, p) => sum + p.total_entry_cost,
    0
  );

  const projectedValueYear1 = projections.reduce(
    (sum, p) => sum + p.year_1_value,
    0
  );

  const projectedValueYear3 = projections.reduce(
    (sum, p) => sum + p.year_3_value,
    0
  );

  const projectedValueYear5 = projections.reduce(
    (sum, p) => sum + p.year_5_value,
    0
  );

  // Weighted average CAGR
  const weightedCagr = projections.reduce((sum, p) => {
    const weight = p.total_entry_cost / totalInvested;
    return sum + p.asset.cagr_estimate * weight;
  }, 0);

  const flipCount = projections.filter(
    (p) => p.asset.vault_strategy === "Flip"
  ).length;
  const keepCount = projections.filter(
    (p) => p.asset.vault_strategy === "Keep"
  ).length;

  return {
    total_invested: totalInvested,
    total_current_value: totalInvested, // Assuming current = invested for sealed
    projected_value_year_1: projectedValueYear1,
    projected_value_year_3: projectedValueYear3,
    projected_value_year_5: projectedValueYear5,
    weighted_avg_cagr: weightedCagr,
    flip_count: flipCount,
    keep_count: keepCount,
  };
}
