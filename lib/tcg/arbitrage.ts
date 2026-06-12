/**
 * TCG Arbitrage Engine
 *
 * Computes high-yield anomalies between secondary market pricing
 * and global baselines/retail ceilings for Hong Kong collectors.
 */

import type { AggregatorListing } from "@/lib/types/database";

export type PortfolioSegment = "velocity" | "sovereign";

export interface ArbitrageOpportunity {
  listing: AggregatorListing;
  arbitrage_type: "below_floor" | "below_wholesale" | "above_ceiling";
  yield_percentage: number;
  price_delta_hkd: number;
  reference_source: string;
}

export interface PortfolioStats {
  velocity_flips: {
    count: number;
    total_value_hkd: number;
    potential_yield_hkd: number;
    avg_arb_yield: number;
  };
  sovereign_holds: {
    count: number;
    total_value_hkd: number;
    projected_10y_hkd: number;
    avg_arb_yield: number;
  };
}

/**
 * Commission tier thresholds for gamified fee reduction
 */
const COMMISSION_TIERS: Record<string, { min_trades: number; rate: number }> = {
  seed: { min_trades: 0, rate: 12 },
  sprout: { min_trades: 10, rate: 11.5 },
  bloom: { min_trades: 50, rate: 10.5 },
  harvest: { min_trades: 100, rate: 9 },
  estate: { min_trades: 500, rate: 7.5 },
};

/**
 * Get commission rate based on user's verified trade count
 */
export function getCommissionRate(verifiedTrades: number): number {
  const tierEntries = Object.entries(COMMISSION_TIERS);
  let currentRate = COMMISSION_TIERS.seed.rate;

  for (const [, tier] of tierEntries) {
    if (verifiedTrades >= tier.min_trades) {
      currentRate = tier.rate;
    }
  }

  return currentRate;
}

/**
 * Get commission tier name based on verified trade count
 */
export function getCommissionTier(verifiedTrades: number): string {
  const tierEntries = Object.entries(COMMISSION_TIERS);

  for (let i = tierEntries.length - 1; i >= 0; i--) {
    const [, tier] = tierEntries[i];
    if (verifiedTrades >= tier.min_trades) {
      return tierEntries[i][0];
    }
  }

  return "seed";
}

/**
 * Calculate projected 10-year ROI for Japanese sealed vintage cases
 * Based on historical price appreciation patterns
 */
export function calculateSovereignProjection(
  estimatedWholesaleHKD: number,
  ageYears: number,
): number {
  // Japanese vintage cases appreciate ~15-25% annually long-term
  const annualAppreciation = 0.2;

  // Premium for ancient cards (pre-2010)
  let multiplier = 1;
  if (ageYears > 15) {
    multiplier = 1.8; // Vintage premium
  } else if (ageYears > 10) {
    multiplier = 1.4;
  } else if (ageYears > 5) {
    multiplier = 1.2;
  }

  return Math.round(estimatedWholesaleHKD * Math.pow(1 + annualAppreciation, 10) * multiplier);
}

/**
 * Detect arbitrage opportunities in a listing
 * Returns opportunities where price dips below known baselines
 */
export function detectArbitrage(
  listing: AggregatorListing,
  referencePrices: {
    wholesaleFloor?: number;
    streetCeiling?: number;
    carousellFloor?: number;
  },
): ArbitrageOpportunity | null {
  const listingPrice = listing.price_hkd;
  const opportunities: ArbitrageOpportunity | null = null;

  // Check against wholesale floor
  if (referencePrices.wholesaleFloor && listingPrice < referencePrices.wholesaleFloor) {
    const yieldPct = Math.round((1 - listingPrice / referencePrices.wholesaleFloor) * 100);
    return {
      listing,
      arbitrage_type: "below_wholesale",
      yield_percentage: Math.max(0, yieldPct),
      price_delta_hkd: referencePrices.wholesaleFloor - listingPrice,
      reference_source: "wholesale_floor",
    };
  }

  // Check against street ceiling (resale opportunity)
  if (referencePrices.streetCeiling && listingPrice < referencePrices.streetCeiling * 0.85) {
    const yieldPct = Math.round((referencePrices.streetCeiling * 0.85 - listingPrice) / (referencePrices.streetCeiling * 0.85) * 100);
    return {
      listing,
      arbitrage_type: "below_floor",
      yield_percentage: Math.max(0, yieldPct),
      price_delta_hkd: referencePrices.streetCeiling * 0.85 - listingPrice,
      reference_source: "street_ceiling",
    };
  }

  return opportunities;
}

/**
 * Calculate portfolio segmentation for user's listings
 * Velocity Flips: English short-term assets (modern, <2 years)
 * Sovereign Holds: Japanese sealed vintage (long-term, >5 years)
 */
export function calculatePortfolioSegments(
  listings: AggregatorListing[],
): PortfolioStats {
  const velocityFlips: AggregatorListing[] = [];
  const sovereignHolds: AggregatorListing[] = [];

  for (const listing of listings) {
    const raw = listing.raw_data as Record<string, unknown> | null;
    const yearsOld = raw?.years_old as number | undefined;
    const language = raw?.language as string | undefined;

    // Japanese sealed = sovereign hold
    if (language === "JP" && yearsOld && yearsOld > 5) {
      sovereignHolds.push(listing);
    } else {
      // English/modern = velocity flip
      velocityFlips.push(listing);
    }
  }

  return {
    velocity_flips: {
      count: velocityFlips.length,
      total_value_hkd: velocityFlips.reduce((sum, l) => sum + l.price_hkd, 0),
      potential_yield_hkd: velocityFlips.reduce((sum, l) => sum + (l.deal_score || 0) * l.price_hkd / 100, 0),
      avg_arb_yield: velocityFlips.length > 0
        ? Math.round(velocityFlips.reduce((sum, l) => sum + (l.deal_score || 0), 0) / velocityFlips.length)
        : 0,
    },
    sovereign_holds: {
      count: sovereignHolds.length,
      total_value_hkd: sovereignHolds.reduce((sum, l) => sum + l.price_hkd, 0),
      projected_10y_hkd: sovereignHolds.reduce((sum, l) => {
        const raw = l.raw_data as Record<string, unknown> | null;
        const yearsOld = raw?.years_old as number | undefined;
        const wholesale = l.original_price_hkd || l.price_hkd;
        return sum + calculateSovereignProjection(wholesale, yearsOld || 10);
      }, 0),
      avg_arb_yield: sovereignHolds.length > 0
        ? Math.round(sovereignHolds.reduce((sum, l) => sum + (l.deal_score || 0), 0) / sovereignHolds.length)
        : 0,
    },
  };
}

/**
 * Generate XP rewards based on arbitrage detection
 */
export function calculateArbitrageXP(opportunity: ArbitrageOpportunity): number {
  const baseXP = 10;
  const yieldBonus = Math.floor(opportunity.yield_percentage / 2);
  return baseXP + yieldBonus;
}