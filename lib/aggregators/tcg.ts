/**
 * TCG Price Aggregator — Pokémon TCG API
 *
 * Fetches real card prices from the Pokémon TCG API (api.pokemontcg.io).
 * This is a free, public API that provides card data with TCGPlayer market prices.
 *
 * No API key required (rate limited to ~1000 requests/day without key).
 * With an API key (POKEMON_TCG_API_KEY env var), rate limit is higher.
 *
 * API docs: https://docs.pokemontcg.io/
 */

import { calculateDealScore } from "@/lib/aggregator/scorer";
import type { AggregatorListing, Json } from "@/lib/types/database";

const POKEMON_TCG_API_BASE = "https://api.pokemontcg.io/v2";

// USD to HKD conversion rate (approximate)
export const USD_TO_HKD = 7.8;

/**
 * Popular Pokémon cards to search for — ensures we get interesting results
 */
const FEATURED_SEARCHES = [
  "charizard",
  "pikachu v",
  "umbreon vmax",
  "rayquaza",
  "mewtwo",
  "lugia",
  "blastoise",
  "greninja",
  "eevee",
  "gengar",
];

/**
 * Build the API key header if available
 */
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.POKEMON_TCG_API_KEY) {
    headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
  }
  return headers;
}

/**
 * Pokémon TCG API card response shape
 */
export interface TCGApiCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  set: {
    id: string;
    name: string;
    code?: string;
    releaseDate?: string;
    images?: {
      symbol?: string;
      logo?: string;
    };
  };
  number?: string;
  rarity?: string;
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      normal?: { market?: number; low?: number; mid?: number; high?: number };
      holofoil?: { market?: number; low?: number; mid?: number; high?: number };
      reverseHolofoil?: { market?: number; low?: number; mid?: number; high?: number };
      firstEditionHolofoil?: { market?: number; low?: number; mid?: number; high?: number };
      firstEditionNormal?: { market?: number; low?: number; mid?: number; high?: number };
    };
  };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
  };
}

export interface TCGApiResponse {
  data: TCGApiCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

/**
 * Full price breakdown for a card across all variants
 */
export interface CardPriceBreakdown {
  cardId: string;
  cardName: string;
  setName: string;
  setCode: string;
  rarity: string;
  imageUrl: string | null;
  tcgplayerUrl: string;
  cardmarketUrl: string;
  lastUpdated: string;
  variants: {
    name: string;
    tcgplayer?: { low: number; mid: number; market: number; high: number };
    cardmarket?: { low: number; trend: number; avg: number };
  }[];
  bestPriceHKD: number;
  bestPriceUSD: number;
  bestPriceSource: string;
  dealScore: number;
  isDeal: boolean;
}

/**
 * Extract the best available price from TCGPlayer pricing data
 */
function extractBestPrice(
  card: TCGApiCard,
): { priceUSD: number; marketUSD: number; variant: string } | null {
  const prices = card.tcgplayer?.prices;
  if (!prices) {
    const cm = card.cardmarket?.prices;
    if (cm?.averageSellPrice) {
      const priceUSD = cm.averageSellPrice * 1.08;
      return { priceUSD, marketUSD: priceUSD, variant: "CardMarket" };
    }
    return null;
  }

  const variants = [
    "firstEditionHolofoil",
    "holofoil",
    "reverseHolofoil",
    "normal",
    "firstEditionNormal",
  ] as const;

  for (const variant of variants) {
    const variantPrices = prices[variant];
    if (variantPrices?.market && variantPrices.market > 0) {
      return {
        priceUSD: variantPrices.low ?? variantPrices.market,
        marketUSD: variantPrices.market,
        variant,
      };
    }
  }

  return null;
}

/**
 * Get full price breakdown for a card (all variants, both marketplaces)
 */
export function getCardPriceBreakdown(card: TCGApiCard): CardPriceBreakdown | null {
  const tcgPrices = card.tcgplayer?.prices;
  const cmPrices = card.cardmarket?.prices;

  if (!tcgPrices && !cmPrices) return null;

  const variantNames = [
    "Normal",
    "Holofoil",
    "Reverse Holofoil",
    "1st Edition Holofoil",
    "1st Edition Normal",
  ] as const;
  const variantKeys = [
    "normal",
    "holofoil",
    "reverseHolofoil",
    "firstEditionHolofoil",
    "firstEditionNormal",
  ] as const;

  const variants: CardPriceBreakdown["variants"] = [];

  for (let i = 0; i < variantNames.length; i++) {
    const vKey = variantKeys[i];
    const vName = variantNames[i];
    const tcg = tcgPrices?.[vKey];
    const entry: CardPriceBreakdown["variants"][number] = { name: vName };

    if (tcg && tcg.market && tcg.market > 0) {
      entry.tcgplayer = {
        low: tcg.low ?? 0,
        mid: tcg.mid ?? 0,
        market: tcg.market,
        high: tcg.high ?? 0,
      };
    }
    if (cmPrices && cmPrices.averageSellPrice && cmPrices.averageSellPrice > 0) {
      entry.cardmarket = {
        low: cmPrices.lowPrice ?? 0,
        trend: cmPrices.trendPrice ?? 0,
        avg: cmPrices.averageSellPrice,
      };
    }

    if (entry.tcgplayer || entry.cardmarket) {
      variants.push(entry);
    }
  }

  if (variants.length === 0) return null;

  // Find best price across all variants
  let bestPriceUSD = Infinity;
  let bestSource = "TCGPlayer";
  for (const v of variants) {
    if (v.tcgplayer && v.tcgplayer.low > 0 && v.tcgplayer.low < bestPriceUSD) {
      bestPriceUSD = v.tcgplayer.low;
      bestSource = `TCGPlayer (${v.name})`;
    }
    if (v.cardmarket && v.cardmarket.low > 0 && v.cardmarket.low * 1.08 < bestPriceUSD) {
      bestPriceUSD = v.cardmarket.low * 1.08;
      bestSource = `CardMarket (${v.name})`;
    }
  }

  if (bestPriceUSD === Infinity) return null;

  const bestPriceHKD = Math.round(bestPriceUSD * USD_TO_HKD);
  const marketHKD = Math.round(
    (variants[0]?.tcgplayer?.market ?? bestPriceUSD) * USD_TO_HKD,
  );

  const dealScore = calculateDealScore({
    priceHKD: bestPriceHKD,
    marketAverageHKD: marketHKD,
    sellerRating: 4.5,
    condition: "Near Mint",
    daysSinceListed: 0,
    hasPhoto: !!card.images?.large,
    hasDescription: true,
  });

  return {
    cardId: card.id,
    cardName: card.name,
    setName: card.set.name,
    setCode: card.set.id,
    rarity: card.rarity || "Unknown",
    imageUrl: card.images?.large || card.images?.small || null,
    tcgplayerUrl:
      card.tcgplayer?.url ||
      `https://shop.tcgplayer.com/product/find?q=${encodeURIComponent(card.name)}`,
    cardmarketUrl:
      card.cardmarket?.url ||
      `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(card.name)}`,
    lastUpdated: card.tcgplayer?.updatedAt || new Date().toISOString(),
    variants,
    bestPriceHKD,
    bestPriceUSD: Math.round(bestPriceUSD * 100) / 100,
    bestPriceSource: bestSource,
    dealScore,
    isDeal: dealScore >= 70,
  };
}

/**
 * Determine condition from rarity and variant
 */
function getCondition(rarity?: string, variant?: string): string {
  if (variant?.includes("firstEdition")) return "1st Edition";
  if (rarity?.includes("Secret")) return "Secret Rare";
  if (rarity?.includes("Ultra")) return "Ultra Rare";
  if (rarity?.includes("Rare")) return "Rare";
  if (rarity?.includes("Uncommon")) return "Uncommon";
  if (rarity?.includes("Common")) return "Common";
  return "Near Mint";
}

/**
 * Convert a TCG API card to our AggregatorListing format
 */
function mapCardToAggregatorListing(
  card: TCGApiCard,
  sourceType: "tcgplayer" | "cardmarket",
): AggregatorListing | null {
  const priceData = extractBestPrice(card);
  if (!priceData) return null;

  const priceHKD = Math.round(priceData.priceUSD * USD_TO_HKD);
  const marketHKD = Math.round(priceData.marketUSD * USD_TO_HKD);

  const isDeal = priceHKD < marketHKD;
  const originalPriceHKD = isDeal ? marketHKD : null;

  const condition = getCondition(card.rarity, priceData.variant);

  const dealScore = calculateDealScore({
    priceHKD,
    marketAverageHKD: marketHKD,
    sellerRating: 4.5,
    condition,
    daysSinceListed: 0,
    hasPhoto: !!card.images?.large,
    hasDescription: true,
  });

  const now = new Date().toISOString();

  const rawData: Record<string, string | number | boolean> = {
    card_name: card.name,
    set_name: card.set.name,
    set_code: card.set.id,
    rarity: card.rarity || "Unknown",
    variant: priceData.variant,
    card_number: card.number || "",
    price_usd: priceData.priceUSD,
    market_usd: priceData.marketUSD,
    grade: variantToGrade(priceData.variant),
    tcgplayer_url: card.tcgplayer?.url || "",
    cardmarket_url: card.cardmarket?.url || "",
    tcgplayer_updated: card.tcgplayer?.updatedAt || "",
    cardmarket_updated: card.cardmarket?.updatedAt || "",
    // Arbitrage price matrix
    estimated_wholesale_floor_hkd: priceHKD,
    sino_centre_street_ceiling_hkd: Math.round(marketHKD * 1.2),
    language: "EN",
  };

  return {
    id: `tcg-${card.id}`,
    source: sourceType,
    source_url:
      sourceType === "tcgplayer"
        ? card.tcgplayer?.url ||
          `https://shop.tcgplayer.com/product/find?q=${encodeURIComponent(card.name)}`
        : card.cardmarket?.url ||
          `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(card.name)}`,
    source_id: card.id,
    title: `${card.name} — ${card.set.name}`,
    description: `${card.name} from ${card.set.name}. ${card.rarity || "Standard"} rarity. ${priceData.variant} variant. Price from ${sourceType === "tcgplayer" ? "TCGPlayer" : "CardMarket"}.`,
    category: "pokemon_card",
    price_hkd: priceHKD,
    original_price_hkd: originalPriceHKD,
    condition,
    seller_name: sourceType === "tcgplayer" ? "TCGPlayer Market" : "CardMarket",
    seller_rating: 4.5,
    image_url: card.images?.large || card.images?.small || null,
    location: sourceType === "tcgplayer" ? "US/Global" : "EU/Global",
    is_deal: isDeal || dealScore >= 70,
    deal_score: dealScore,
    raw_data: rawData as unknown as Json,
    last_seen: now,
    created_at: now,
  };
}

function variantToGrade(variant: string): string {
  if (variant.includes("firstEdition")) return "1st Ed";
  return "Ungraded";
}

/**
 * Search the Pokémon TCG API for cards
 */
export async function searchPokemonTcgApi(
  query: string,
  pageSize: number = 12,
  page: number = 1,
): Promise<TCGApiResponse> {
  const url = `${POKEMON_TCG_API_BASE}/cards?q=${encodeURIComponent(query)}&pageSize=${pageSize}&page=${page}&orderBy=-tcgplayer.prices.holofoil.market`;

  try {
    const response = await fetch(url, {
      headers: getApiHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(
        `[TCG Aggregator] API error ${response.status}: ${response.statusText}`,
      );
      return { data: [], page: 1, pageSize, count: 0, totalCount: 0 };
    }

    const json: TCGApiResponse = await response.json();
    return json;
  } catch (error) {
    console.error("[TCG Aggregator] Fetch error:", error);
    return { data: [], page: 1, pageSize, count: 0, totalCount: 0 };
  }
}

/**
 * Fetch all available sets from the Pokémon TCG API
 */
export interface TCGSet {
  id: string;
  name: string;
  code: string;
  releaseDate: string;
  symbolUrl: string;
  logoUrl: string;
  printedTotal: number;
  total: number;
}

export async function fetchSets(): Promise<TCGSet[]> {
  const url = `${POKEMON_TCG_API_BASE}/sets?orderBy=-releaseDate&pageSize=50`;

  try {
    const response = await fetch(url, {
      headers: getApiHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const json = (await response.json()) as {
      data: Array<{
        id: string;
        name: string;
        series: string;
        printedTotal: number;
        total: number;
        releaseDate: string;
        images: { symbol: string; logo: string };
      }>;
    };

    return json.data.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.series,
      releaseDate: s.releaseDate,
      symbolUrl: s.images.symbol,
      logoUrl: s.images.logo,
      printedTotal: s.printedTotal,
      total: s.total,
    }));
  } catch (error) {
    console.error("[TCG Aggregator] Fetch sets error:", error);
    return [];
  }
}

/**
 * Main export: Fetch real TCG prices from the Pokémon TCG API
 *
 * Searches for popular cards across multiple queries and deduplicates.
 * Returns AggregatorListing objects with HKD prices.
 */
export async function fetchTcgPrices(
  searchQuery?: string,
  limit: number = 30,
  offset: number = 0,
): Promise<{ listings: AggregatorListing[]; totalCount: number }> {
  const allListings: AggregatorListing[] = [];
  const seenIds = new Set<string>();

  // If a specific search query is provided, use it
  if (searchQuery) {
    const result = await searchPokemonTcgApi(
      `name:"${searchQuery}" supertype:Pokémon`,
      Math.min(limit + offset, 25),
    );

    for (const card of result.data) {
      const listing = mapCardToAggregatorListing(card, "tcgplayer");
      if (listing && !seenIds.has(listing.id)) {
        seenIds.add(listing.id);
        allListings.push(listing);
      }

      if (card.cardmarket?.prices?.averageSellPrice) {
        const cmListing = mapCardToAggregatorListing(card, "cardmarket");
        if (cmListing && !seenIds.has(cmListing.id)) {
          seenIds.add(cmListing.id);
          allListings.push(cmListing);
        }
      }
    }

    // Sort and paginate
    allListings.sort((a, b) => (b.deal_score ?? 0) - (a.deal_score ?? 0));
    return {
      listings: allListings.slice(offset, offset + limit),
      totalCount: result.totalCount,
    };
  }

  // Always fetch featured/popular cards to populate the page
  const searchesToUse = FEATURED_SEARCHES.slice(
    0,
    Math.ceil(limit / 3),
  );

  for (const search of searchesToUse) {
    const result = await searchPokemonTcgApi(
      `name:"${search}" supertype:Pokémon subtypes:VMAX OR subtypes:V-UNION OR subtypes:GX OR subtypes:EX OR rarity:Secret Rare`,
      4,
    );

    for (const card of result.data) {
      const listing = mapCardToAggregatorListing(card, "tcgplayer");
      if (listing && !seenIds.has(listing.id)) {
        seenIds.add(listing.id);
        allListings.push(listing);
      }

      if (card.cardmarket?.prices?.averageSellPrice) {
        const cmListing = mapCardToAggregatorListing(card, "cardmarket");
        if (cmListing && !seenIds.has(cmListing.id)) {
          seenIds.add(cmListing.id);
          allListings.push(cmListing);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  allListings.sort((a, b) => (b.deal_score ?? 0) - (a.deal_score ?? 0));

  return {
    listings: allListings.slice(offset, offset + limit),
    totalCount: allListings.length,
  };
}

/**
 * Fetch prices for a specific Pokémon card by exact name
 */
export async function fetchCardPrice(
  cardName: string,
): Promise<AggregatorListing[]> {
  const result = await searchPokemonTcgApi(
    `name:"${cardName}" supertype:Pokémon`,
    10,
  );

  const listings: AggregatorListing[] = [];
  const seenIds = new Set<string>();

  for (const card of result.data) {
    const listing = mapCardToAggregatorListing(card, "tcgplayer");
    if (listing && !seenIds.has(listing.id)) {
      seenIds.add(listing.id);
      listings.push(listing);
    }
  }

  return listings;
}

/**
 * Fetch full price breakdown for a specific card
 */
export async function fetchCardPriceBreakdown(
  cardName: string,
): Promise<CardPriceBreakdown | null> {
  const result = await searchPokemonTcgApi(
    `name:"${cardName}" supertype:Pokémon`,
    5,
  );

  if (result.data.length === 0) return null;

  // Return the breakdown for the first card with pricing data
  for (const card of result.data) {
    const breakdown = getCardPriceBreakdown(card);
    if (breakdown) return breakdown;
  }

  return null;
}