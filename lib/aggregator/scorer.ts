/**
 * Deal Scoring Algorithm
 * 
 * Scores listings based on how good a deal they are.
 * Factors:
 * - Price vs market average (lower = better)
 * - Seller rating (higher = better)
 * - Condition (mint > near mint > played)
 * - Listing freshness (newer = better)
 * - Completeness of listing (photos, description)
 */

export interface DealScoreParams {
  priceHKD: number;
  marketAverageHKD: number;
  sellerRating: number | null; // 0-5
  condition: string;
  daysSinceListed: number;
  hasPhoto: boolean;
  hasDescription: boolean;
}

const CONDITION_SCORES: Record<string, number> = {
  "mint": 1.0,
  "near mint": 0.9,
  "lightly played": 0.7,
  "played": 0.5,
  "heavily played": 0.3,
  "damaged": 0.1,
  "graded": 1.0,
  "psa 10": 1.0,
  "psa 9": 0.95,
  "psa 8": 0.85,
  "bgs 10": 1.0,
  "bgs 9.5": 0.95,
};

export function calculateDealScore(params: DealScoreParams): number {
  let score = 0;

  // Price ratio (40% weight) — lower price vs market = higher score
  if (params.marketAverageHKD > 0) {
    const priceRatio = params.priceHKD / params.marketAverageHKD;
    if (priceRatio <= 0.5) score += 40;
    else if (priceRatio <= 0.7) score += 35;
    else if (priceRatio <= 0.85) score += 28;
    else if (priceRatio <= 1.0) score += 20;
    else if (priceRatio <= 1.15) score += 10;
    else score += 5;
  } else {
    score += 20; // No market data, neutral
  }

  // Seller rating (20% weight)
  if (params.sellerRating !== null) {
    score += (params.sellerRating / 5) * 20;
  } else {
    score += 10; // Unknown seller, neutral
  }

  // Condition (20% weight)
  const conditionKey = params.condition.toLowerCase();
  const conditionScore = CONDITION_SCORES[conditionKey] ?? 0.5;
  score += conditionScore * 20;

  // Freshness (10% weight)
  if (params.daysSinceListed <= 1) score += 10;
  else if (params.daysSinceListed <= 3) score += 8;
  else if (params.daysSinceListed <= 7) score += 6;
  else if (params.daysSinceListed <= 14) score += 4;
  else if (params.daysSinceListed <= 30) score += 2;
  else score += 1;

  // Completeness (10% weight)
  if (params.hasPhoto) score += 5;
  if (params.hasDescription) score += 5;

  return Math.round(score);
}

export function getDealLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "🔥 Steal", color: "#ff2d2d" };
  if (score >= 70) return { label: "💎 Great Deal", color: "#4ade80" };
  if (score >= 55) return { label: "👍 Fair Price", color: "#fbbf24" };
  if (score >= 40) return { label: "📊 Market Price", color: "#60a5fa" };
  return { label: "⚠️ Above Market", color: "#94a3b8" };
}
