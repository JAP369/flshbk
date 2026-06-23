// =============================================================================
// SUPABASE CLIENT (MOCK FOR SHOWCASE)
// =============================================================================

import { DUMMY_PORTFOLIO_ASSETS, DUMMY_PORTFOLIO_SUMMARY } from "@/data/portfolio-assets";
import { PortfolioAsset, PortfolioSummary } from "@/types/portfolio";

/**
 * Mock Supabase client for showcase purposes.
 * Replace with actual Supabase client when connecting to backend.
 *
 * To use real Supabase:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Create lib/supabase.ts with createClient
 * 3. Replace mock functions with actual Supabase queries
 */

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all portfolio assets from Supabase
 * Equivalent to: supabase.from('portfolio_assets').select('*')
 */
export async function fetchPortfolioAssets(): Promise<PortfolioAsset[]> {
  await delay(800); // Simulate network latency
  return DUMMY_PORTFOLIO_ASSETS;
}

/**
 * Fetch portfolio summary with aggregated metrics
 * Equivalent to: supabase.rpc('get_portfolio_summary') or custom aggregation
 */
export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  await delay(600);
  return DUMMY_PORTFOLIO_SUMMARY;
}

/**
 * Fetch assets filtered by allocation side
 * Equivalent to: supabase.from('portfolio_assets').eq('allocation_side', side)
 */
export async function fetchAssetsBySide(
  side: "left" | "right"
): Promise<PortfolioAsset[]> {
  await delay(500);
  return DUMMY_PORTFOLIO_ASSETS.filter((a) => a.allocation_side === side);
}
