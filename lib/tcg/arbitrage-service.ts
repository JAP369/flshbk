// =============================================================================
// ARBITRAGE SERVICE — High-level orchestrator
// =============================================================================
// Ties together the API clients, normalizer, and arbitrage engine.
// This is what the API route calls.
// =============================================================================

import { searchCards, type PokeCard } from "@/lib/api/pokemontcg";
import { searchListings, type EbayItem } from "@/lib/api/ebay";
import { scrapeDirect, type CarousellListing } from "@/lib/api/carousell";
import { extractCardIdentifiers, matchListingToCard } from "@/lib/api/normalizer";
import {
  runArbitrageScan,
  type ArbitrageScanConfig,
  type ArbitrageScanResult,
  type Marketplace,
} from "./arbitrage-engine";

// -----------------------------------------------------------------------------
// CARD CATALOG (subset to scan — high-volume cards)
// -----------------------------------------------------------------------------

const SCAN_QUERIES = [
  { name: "Charizard", set: "Base" },
  { name: "Pikachu", set: "151" },
  { name: "Mewtwo", set: "151" },
  { name: "Umbreon", set: "151" },
  { name: "Eevee", set: "151" },
  { name: "Rayquaza", set: "8" },
  { name: "Greninja", set: "XY" },
  { name: "Lugia", set: "XY" },
  { name: "Blastoise", set: "Base" },
  { name: "Gengar", set: "151" },
  { name: "Lucario", set: "Diamond Pearl" },
  { name: "Gardevoir", set: "XY" },
];

/**
 * Fetch the card catalog from pokemontcg.io based on SCAN_QUERIES.
 * Returns a deduplicated list of cards with market prices.
 */
export async function fetchCardCatalog(): Promise<PokeCard[]> {
  const allCards: PokeCard[] = [];
  const seenIds = new Set<string>();

  for (const query of SCAN_QUERIES) {
    try {
      const response = await searchCards({
        name: query.name,
        set: query.set,
        pageSize: 10,
      });

      for (const card of response.data) {
        if (!seenIds.has(card.id) && card.tcgplayer?.prices) {
          seenIds.add(card.id);
          allCards.push(card);
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch ${query.name} (${query.set}):`, err);
      continue;
    }
  }

  return allCards;
}

/**
 * Fetch eBay listings for the given cards.
 * Returns a Map of card ID → eBay items.
 */
export async function fetchEbayListingsForCards(
  cards: PokeCard[],
): Promise<Map<string, EbayItem[]>> {
  const result = new Map<string, EbayItem[]>();

  // Build search queries from card data
  const queries = cards.map((card) => {
    const id = extractCardIdentifiers(`${card.name} #${card.number}`);
    return {
      cardId: card.id,
      query: `${card.name} ${card.set.name} #${card.number} Pokemon TCG`,
    };
  });

  // Batch queries (respect rate limits — eBay is ~5000 req/day for Browse API)
  // Process sequentially to avoid hitting limits
  for (const q of queries.slice(0, 20)) {
    try {
      const resp = await searchListings({ query: q.query, limit: 10 });
      if (resp.itemSummaries.length > 0) {
        // Normalize and match to cards
        const matched: EbayItem[] = [];
        for (const item of resp.itemSummaries) {
          // Verify this listing matches our card
          const identifiers = extractCardIdentifiers(item.title);
          const match = matchListingToCard(identifiers, cards);
          if (match) {
            matched.push(item);
          }
        }
        if (matched.length > 0) {
          result.set(q.cardId, matched);
        }
      }
    } catch (err) {
      console.warn(`eBay fetch failed for ${q.query}:`, err);
      continue;
    }
  }

  return result;
}

/**
 * Fetch Carousell listings for the given cards.
 */
export async function fetchCarousellListingsForCards(
  cards: PokeCard[],
): Promise<Map<string, CarousellListing[]>> {
  const result = new Map<string, CarousellListing[]>();

  for (const card of cards.slice(0, 15)) {
    try {
      const query = `${card.name} ${card.set.name} Pokemon card`;
      const listings = await scrapeDirect({ query, maxResults: 10 });
      if (listings.length > 0) {
        result.set(card.id, listings);
      }
    } catch (err) {
      console.warn(`Carousell fetch failed for ${card.name}:`, err);
      continue;
    }
  }

  return result;
}

// -----------------------------------------------------------------------------
// DEMO DATA GENERATOR (for development/display without API keys)
// -----------------------------------------------------------------------------

/**
 * Generate demo arbitrage opportunities using live pokemontcg.io data.
 * Uses simulated marketplace pricing to demonstrate the UI.
 * This runs in the browser/dev without any API keys.
 */
export async function generateDemoScan(
  cards: PokeCard[],
): Promise<ArbitrageScanResult> {
  const opportunities = [];

  for (const card of cards) {
    const marketPrice = card.tcgplayer?.prices?.holofoil?.market
      ?? card.tcgplayer?.prices?.normal?.market
      ?? null;

    if (!marketPrice) continue;

    const marketPriceHkd = Math.round(marketPrice * 7.83 * 100) / 100;

    // Simulate: eBay listing 15-40% below market (common for deals)
    const discountPcts = [0.55, 0.65, 0.72, 0.80, 0.85];
    for (const discount of discountPcts) {
      const listingPrice = Math.round(marketPriceHkd * discount * 100) / 100;
      const fees = Math.round(listingPrice * 0.1325 * 100) / 100;
      const shipping = 40;
      const total = listingPrice + fees + shipping;
      const profit = marketPriceHkd - total;
      const yieldPct = (profit / total) * 100;

      if (yieldPct < 10) continue;

      // Simulate conditions
      const conditions = ["Near Mint", "Excellent", "Lightly Played"];
      const cond = conditions[Math.floor(Math.random() * conditions.length)];

      opportunities.push({
        id: `demo-${card.id}-${discount}`,
        card,
        cardImage: card.images?.large ?? card.images?.small ?? "",
        cardSetName: card.set.name,
        source: "ebay" as Marketplace,
        listingTitle: `${card.name} ${cond} ${card.set.name} #${card.number}`,
        listingPriceHkd: listingPrice,
        listingUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${card.name} ${card.set.name}`)}`,
        listingCondition: cond,
        listingImage: card.images?.small ?? null,
        referenceSource: "TCGPlayer Market",
        referencePriceHkd: marketPriceHkd,
        estimatedFeesHkd: fees,
        estimatedShippingHkd: shipping,
        totalCostHkd: Math.round(total * 100) / 100,
        potentialProfitHkd: Math.round(profit * 100) / 100,
        yieldPercent: Math.round(yieldPct * 100) / 100,
        dealScore: Math.min(Math.round(yieldPct * 0.4 + 30), 100),
        liquidityEstimate: estimateLiquidity(card),
      });
    }
  }

  opportunities.sort((a, b) => b.yieldPercent - a.yieldPercent);
  const limited = opportunities.slice(0, 30);

  const stats = {
    totalOpportunities: limited.length,
    avgYieldPercent: limited.length > 0
      ? Math.round((limited.reduce((s, o) => s + o.yieldPercent, 0) / limited.length) * 100) / 100
      : 0,
    maxYieldPercent: limited.length > 0 ? Math.max(...limited.map((o) => o.yieldPercent)) : 0,
    totalPotentialProfitHkd: Math.round(limited.reduce((s, o) => s + o.potentialProfitHkd, 0) * 100) / 100,
    byMarketplace: {
      ebay: limited.length,
      carousell: 0,
      cardmarket: 0,
      tcgplayer: 0,
    },
  };

  return {
    scanId: `demo-${crypto.randomUUID().slice(0, 8)}`,
    scannedAt: new Date().toISOString(),
    cardsScanned: cards.length,
    opportunities: limited,
    stats,
  };
}

function estimateLiquidity(card: PokeCard): "high" | "medium" | "low" {
  const popular = ["charizard", "pikachu", "mew", "mewtwo", "umbreon", "rayquaza"];
  if (popular.some((n) => card.name.toLowerCase().includes(n))) return "high";
  if (card.rarity?.toLowerCase().includes("rare")) return "medium";
  return "low";
}
