// =============================================================================
// DUMMY PORTFOLIO DATA FOR SHOWCASE
// =============================================================================

import {
  PortfolioAsset,
  PortfolioSummary,
  AllocationSide,
  AssetStatus,
  AssetType,
  MASTER_CAPITAL_POOL_HKD,
  LEFT_SIDE_TARGET_PERCENTAGE,
  RIGHT_SIDE_TARGET_PERCENTAGE,
} from "@/types/portfolio";

// =============================================================================
// LEFT SIDE ASSETS (20% Target - Active Trading/High-Velocity Stock)
// =============================================================================

const LEFT_SIDE_ASSETS: PortfolioAsset[] = [
  {
    id: "asset-001",
    user_id: "user-001",
    name: "Tencent Holdings",
    ticker: "0700.HK",
    asset_type: "stock",
    allocation_side: "left" as AllocationSide,
    status: "active" as AssetStatus,
    quantity: 100,
    purchase_price_hkd: 380.0,
    current_price_hkd: 425.5,
    total_value_hkd: 42550,
    weight_percentage: 8.51,
    unrealized_pnl_hkd: 4550,
    unrealized_pnl_percentage: 11.97,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2024-01-15T09:00:00Z",
  },
  {
    id: "asset-002",
    user_id: "user-001",
    name: "Alibaba Group",
    ticker: "9988.HK",
    asset_type: "stock",
    allocation_side: "left" as AllocationSide,
    status: "active" as AssetStatus,
    quantity: 200,
    purchase_price_hkd: 75.0,
    current_price_hkd: 68.5,
    total_value_hkd: 13700,
    weight_percentage: 2.74,
    unrealized_pnl_hkd: -1300,
    unrealized_pnl_percentage: -8.67,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2024-02-01T09:00:00Z",
  },
  {
    id: "asset-003",
    user_id: "user-001",
    name: "Meituan",
    ticker: "3690.HK",
    asset_type: "stock",
    allocation_side: "left" as AllocationSide,
    status: "active" as AssetStatus,
    quantity: 150,
    purchase_price_hkd: 120.0,
    current_price_hkd: 135.0,
    total_value_hkd: 20250,
    weight_percentage: 4.05,
    unrealized_pnl_hkd: 2250,
    unrealized_pnl_percentage: 12.5,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2024-01-20T09:00:00Z",
  },
  {
    id: "asset-004",
    user_id: "user-001",
    name: "Hong Kong ETF",
    ticker: "2800.HK",
    asset_type: "etf",
    allocation_side: "left" as AllocationSide,
    status: "active" as AssetStatus,
    quantity: 500,
    purchase_price_hkd: 22.0,
    current_price_hkd: 23.8,
    total_value_hkd: 11900,
    weight_percentage: 2.38,
    unrealized_pnl_hkd: 900,
    unrealized_pnl_percentage: 8.18,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2024-02-10T09:00:00Z",
  },
];

// =============================================================================
// RIGHT SIDE ASSETS (80% Target - Premium Vaulted Slabs/Sealed Boxes)
// =============================================================================

const RIGHT_SIDE_ASSETS: PortfolioAsset[] = [
  {
    id: "asset-101",
    user_id: "user-001",
    name: "PAMP Suisse Gold Bar 1oz",
    ticker: "PAMP-GOLD-1OZ",
    asset_type: "premium_slab",
    allocation_side: "right" as AllocationSide,
    status: "vaulted" as AssetStatus,
    quantity: 50,
    purchase_price_hkd: 15500.0,
    current_price_hkd: 16800.0,
    total_value_hkd: 840000,
    weight_percentage: 56.0,
    unrealized_pnl_hkd: 65000,
    unrealized_pnl_percentage: 8.39,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2023-06-15T09:00:00Z",
  },
  {
    id: "asset-102",
    user_id: "user-001",
    name: "Sealed Pokemon Base Set Booster Box",
    ticker: "PKM-BASE-BOX",
    asset_type: "sealed_box",
    allocation_side: "right" as AllocationSide,
    status: "sealed" as AssetStatus,
    quantity: 2,
    purchase_price_hkd: 45000.0,
    current_price_hkd: 52000.0,
    total_value_hkd: 104000,
    weight_percentage: 6.93,
    unrealized_pnl_hkd: 14000,
    unrealized_pnl_percentage: 15.56,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2023-09-01T09:00:00Z",
  },
  {
    id: "asset-103",
    user_id: "user-001",
    name: "Canadian Maple Leaf Gold Coin 1oz",
    ticker: "GML-1OZ",
    asset_type: "premium_slab",
    allocation_side: "right" as AllocationSide,
    status: "vaulted" as AssetStatus,
    quantity: 100,
    purchase_price_hkd: 15200.0,
    current_price_hkd: 16500.0,
    total_value_hkd: 1650000,
    weight_percentage: 22.0,
    unrealized_pnl_hkd: 130000,
    unrealized_pnl_percentage: 8.55,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2023-04-20T09:00:00Z",
  },
  {
    id: "asset-104",
    user_id: "user-001",
    name: "Sealed MTG Modern Horizons 3 Box",
    ticker: "MTG-MH3-BOX",
    asset_type: "sealed_box",
    allocation_side: "right" as AllocationSide,
    status: "sealed" as AssetStatus,
    quantity: 5,
    purchase_price_hkd: 8500.0,
    current_price_hkd: 9200.0,
    total_value_hkd: 46000,
    weight_percentage: 3.07,
    unrealized_pnl_hkd: 3500,
    unrealized_pnl_percentage: 8.24,
    last_updated: "2024-03-22T10:30:00Z",
    created_at: "2024-02-15T09:00:00Z",
  },
];

// =============================================================================
// CASH HOLDINGS
// =============================================================================

const CASH_HOLDINGS: PortfolioAsset = {
  id: "cash-001",
  user_id: "user-001",
  name: "HKD Cash Reserve",
  asset_type: "cash",
  allocation_side: "left" as AllocationSide,
  status: "active" as AssetStatus,
  quantity: 1,
  purchase_price_hkd: 1,
  current_price_hkd: 1,
  total_value_hkd: 8500,
  weight_percentage: 0.57,
  unrealized_pnl_hkd: 0,
  unrealized_pnl_percentage: 0,
  last_updated: "2024-03-22T10:30:00Z",
  created_at: "2024-01-01T09:00:00Z",
};

// =============================================================================
// ALL ASSETS COMBINED
// =============================================================================

export const DUMMY_PORTFOLIO_ASSETS: PortfolioAsset[] = [
  ...LEFT_SIDE_ASSETS,
  ...RIGHT_SIDE_ASSETS,
  CASH_HOLDINGS,
];

// =============================================================================
// CALCULATE PORTFOLIO SUMMARY
// =============================================================================

export function calculatePortfolioSummary(): PortfolioSummary {
  const leftSideAssets = DUMMY_PORTFOLIO_ASSETS.filter(
    (a) => a.allocation_side === "left" && a.asset_type !== "cash"
  );
  const rightSideAssets = DUMMY_PORTFOLIO_ASSETS.filter(
    (a) => a.allocation_side === "right"
  );
  const cashAsset = DUMMY_PORTFOLIO_ASSETS.find(
    (a) => a.asset_type === "cash"
  );

  const leftSideDeployed = leftSideAssets.reduce(
    (sum, a) => sum + a.total_value_hkd,
    0
  );
  const rightSideDeployed = rightSideAssets.reduce(
    (sum, a) => sum + a.total_value_hkd,
    0
  );
  const availableCash = cashAsset?.total_value_hkd || 0;

  const totalPortfolioValue = leftSideDeployed + rightSideDeployed + availableCash;

  const leftSideTarget =
    (MASTER_CAPITAL_POOL_HKD * LEFT_SIDE_TARGET_PERCENTAGE) / 100;
  const rightSideTarget =
    (MASTER_CAPITAL_POOL_HKD * RIGHT_SIDE_TARGET_PERCENTAGE) / 100;

  const totalUnrealizedPnl = DUMMY_PORTFOLIO_ASSETS.reduce(
    (sum, a) => sum + a.unrealized_pnl_hkd,
    0
  );

  return {
    total_portfolio_value_hkd: totalPortfolioValue,
    available_cash_hkd: availableCash,
    left_side_deployed_hkd: leftSideDeployed,
    left_side_target_hkd: leftSideTarget,
    left_side_percentage: (leftSideDeployed / totalPortfolioValue) * 100,
    right_side_deployed_hkd: rightSideDeployed,
    right_side_target_hkd: rightSideTarget,
    right_side_percentage: (rightSideDeployed / totalPortfolioValue) * 100,
    total_unrealized_pnl_hkd: totalUnrealizedPnl,
    total_unrealized_pnl_percentage:
      (totalUnrealizedPnl / totalPortfolioValue) * 100,
  };
}

export const DUMMY_PORTFOLIO_SUMMARY = calculatePortfolioSummary();
