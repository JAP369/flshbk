// =============================================================================
// ARBITRAGE ENGINE — Core comparison logic
// =============================================================================

import {
  PokeCard,
  getBestMarketPrice,
  getCardmarketPriceHkd,
  usdToHkd,
} from "@/lib/api/pokemontcg";
import { EbayItem, calculateTotalCost } from "@/lib/api/ebay";
import { CarousellListing } from "@/lib/api/carousell";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type Marketplace = "ebay" | "carousell" | "cardmarket" | "tcgplayer";

export interface ArbitrageOpportunity {
  id: string;
  card: PokeCard;
  cardImage: string;
  cardSetName: string;
  source: Marketplace;
  listingTitle: string;
  listingPriceHkd: number;
  listingUrl: string;
  listingCondition: string;
  listingImage: string | null;
  referenceSource: string;
  referencePriceHkd: number;
  estimatedFeesHkd: number;
  estimatedShippingHkd: number;
  totalCostHkd: number;
  potentialProfitHkd: number;
  yieldPercent: number;
  dealScore: number;
  liquidityEstimate: "high" | "medium" | "low";
}

export interface ArbitrageScanResult {
  scanId: string;
  scannedAt: string;
  cardsScanned: number;
  opportunities: ArbitrageOpportunity[];
  stats: {
    totalOpportunities: number;
    avgYieldPercent: number;
    maxYieldPercent: number;
    totalPotentialProfitHkd: number;
    byMarketplace: Record<Marketplace, number>;
  };
}

export interface ArbitrageScanConfig {
  minYieldPercent: number;
  maxResults: number;
  includeMarketplaces: Marketplace[];
  conditionFilter?: string;
  excludeKeywords?: string[];
}

const DEFAULT_CONFIG: ArbitrageScanConfig = {
  minYieldPercent: 15,
  maxResults: 50,
  includeMarketplaces: ["ebay", "carousell", "cardmarket"],
};

// -----------------------------------------------------------------------------
// MAIN SCANNER
// -----------------------------------------------------------------------------

export async function runArbitrageScan(
  cards: PokeCard[],
  ebayListings: Map<string, EbayItem[]>,
  carousellListings: Map<string, CarousellListing[]>,
  config: Partial<ArbitrageScanConfig> = {},
): Promise<ArbitrageScanResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const opportunities: ArbitrageOpportunity[] = [];

  for (const card of cards) {
    const tcgMarketUsd = getBestMarketPrice(card);
    if (!tcgMarketUsd) continue;
    const tcgMarketHkd = usdToHkd(tcgMarketUsd);

    const cardmarketHkd = getCardmarketPriceHkd(card);
    const referencePrice = cardmarketHkd ?? tcgMarketHkd;
    const referenceSource = cardmarketHkd ? "Cardmarket → HKD" : "TCGPlayer Market";

    // --- eBay ---
    if (cfg.includeMarketplaces.includes("ebay")) {
      const ebayItems = ebayListings.get(card.id) ?? [];
      for (const item of ebayItems) {
        const cost = calculateTotalCost(item);
        const profit = referencePrice - cost.total;
        const yieldPct = (profit / cost.total) * 100;

        if (yieldPct >= cfg.minYieldPercent) {
          opportunities.push(buildOpportunity(
            card, item.title, item.itemWebUrl, cost.total,
            item.condition, item.image?.imageUrl ?? null,
            referencePrice, referenceSource, yieldPct, "ebay",
          ));
        }
      }
    }

    // --- Carousell ---
    if (cfg.includeMarketplaces.includes("carousell")) {
      const caroItems = carousellListings.get(card.id) ?? [];
      for (const item of caroItems) {
        const caroFee = item.price * 0.05;
        const total = item.price + caroFee;
        const profit = referencePrice - total;
        const yieldPct = (profit / total) * 100;

        if (yieldPct >= cfg.minYieldPercent) {
          opportunities.push(buildOpportunity(
            card, item.title, item.url, total,
            item.condition, item.imageUrl,
            referencePrice, referenceSource, yieldPct, "carousell",
          ));
        }
      }
    }
  }

  opportunities.sort((a, b) => b.yieldPercent - a.yieldPercent);
  const limited = opportunities.slice(0, cfg.maxResults);

  const stats = {
    totalOpportunities: limited.length,
    avgYieldPercent: limited.length > 0
      ? Math.round((limited.reduce((s, o) => s + o.yieldPercent, 0) / limited.length) * 100) / 100
      : 0,
    maxYieldPercent: limited.length > 0
      ? Math.max(...limited.map((o) => o.yieldPercent))
      : 0,
    totalPotentialProfitHkd: Math.round(limited.reduce((s, o) => s + o.potentialProfitHkd, 0) * 100) / 100,
    byMarketplace: {
      ebay: limited.filter((o) => o.source === "ebay").length,
      carousell: limited.filter((o) => o.source === "carousell").length,
      cardmarket: limited.filter((o) => o.source === "cardmarket").length,
      tcgplayer: limited.filter((o) => o.source === "tcgplayer").length,
    },
  };

  return {
    scanId: crypto.randomUUID(),
    scannedAt: new Date().toISOString(),
    cardsScanned: cards.length,
    opportunities: limited,
    stats,
  };
}

// -----------------------------------------------------------------------------
// OPPORTUNITY BUILDER
// -----------------------------------------------------------------------------

function buildOpportunity(
  card: PokeCard,
  listingTitle: string,
  listingUrl: string,
  listingPriceHkd: number,
  listingCondition: string,
  listingImage: string | null,
  referencePriceHkd: number,
  referenceSource: string,
  yieldPct: number,
  source: Marketplace,
): ArbitrageOpportunity {
  const estimatedFees = listingPriceHkd * 0.1325;
  const estimatedShipping = 40;
  const totalCost = listingPriceHkd + estimatedFees + estimatedShipping;
  const potentialProfit = referencePriceHkd - listingPriceHkd - estimatedFees - estimatedShipping;
  const dealScore = calculateDealScore(yieldPct, card);
  const liquidityEstimate = estimateLiquidity(card);

  return {
    id: `${card.id}-${source}-${crypto.randomUUID().slice(0, 8)}`,
    card,
    cardImage: card.images?.large ?? card.images?.small ?? "",
    cardSetName: card.set.name,
    source,
    listingTitle,
    listingPriceHkd: Math.round(listingPriceHkd * 100) / 100,
    listingUrl,
    listingCondition,
    listingImage,
    referenceSource,
    referencePriceHkd: Math.round(referencePriceHkd * 100) / 100,
    estimatedFeesHkd: Math.round(estimatedFees * 100) / 100,
    estimatedShippingHkd: estimatedShipping,
    totalCostHkd: Math.round(totalCost * 100) / 100,
    potentialProfitHkd: Math.round(potentialProfit * 100) / 100,
    yieldPercent: Math.round(yieldPct * 100) / 100,
    dealScore,
    liquidityEstimate,
  };
}

function calculateDealScore(yieldPct: number, card: PokeCard): number {
  const yieldScore = Math.min(yieldPct, 120) * 0.5;
  const rarityBonus: Record<string, number> = {
    "Rare Holo": 10, "Rare Ultra": 15, "Rare Secret": 20, "Rare": 8,
    "Uncommon": 3, "Common": 0,
  };
  const rarityScore = rarityBonus[card.rarity ?? ""] ?? 5;
  const popularCards = ["charizard", "pikachu", "mew", "mewtwo", "umbreon", "rayquaza", "eevee", "lugia"];
  const liquidityScore = popularCards.some((p) => card.name.toLowerCase().includes(p)) ? 20 : 10;
  return Math.min(Math.round(yieldScore + rarityScore + liquidityScore), 100);
}

function estimateLiquidity(card: PokeCard): "high" | "medium" | "low" {
  const popularNames = ["charizard", "pikachu", "mew", "mewtwo", "umbreon", "rayquaza"];
  if (popularNames.some((n) => card.name.toLowerCase().includes(n))) return "high";
  if (card.rarity?.toLowerCase().includes("rare")) return "medium";
  return "low";
}
