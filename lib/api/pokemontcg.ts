// =============================================================================
// POKEMON TCG API CLIENT (pokemontcg.io)
// =============================================================================
// Source of truth for card metadata, images, and TCGPlayer market pricing.
// Free tier: ~1000 req/day. With API key: higher limits.
// Docs: https://docs.pokemontcg.io/
// =============================================================================

const BASE = "https://api.pokemontcg.io/v2";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.POKEMON_TCG_API_KEY) {
    h["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
  }
  return h;
}

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PokeCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  number: string;
  rarity: string;
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
    images: { symbol: string; logo: string };
  };
  images: { small: string; large: string };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices: {
      normal?: PricePoints;
      holofoil?: PricePoints;
      reverseHolofoil?: PricePoints;
      "1stEditionHolofoil"?: PricePoints;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
  };
}

export interface PricePoints {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface PokeSearchResponse {
  data: PokeCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// -----------------------------------------------------------------------------
// RATE LIMITER (simple in-process)
// -----------------------------------------------------------------------------

let lastCall = 0;
const MIN_INTERVAL = 40; // ms — ~25 req/s max

async function rateLimited(url: string, init?: RequestInit) {
  const now = Date.now();
  const wait = lastCall + MIN_INTERVAL - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  return fetch(url, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
}

// -----------------------------------------------------------------------------
// API METHODS
// -----------------------------------------------------------------------------

/**
 * Search cards by name + optional set filter.
 * Uses the `q` query param for flexible search.
 */
export async function searchCards(
  opts: {
    name?: string;
    set?: string;
    rarity?: string;
    supertype?: string;
    subtypes?: string;
    page?: number;
    pageSize?: number;
    orderBy?: string;
  } = {},
): Promise<PokeSearchResponse> {
  const params = new URLSearchParams();
  const parts: string[] = [];

  if (opts.name) parts.push(`name:"*${opts.name}*"`);
  if (opts.set) parts.push(`set.name:"*${opts.set}*"`);
  if (opts.rarity) parts.push(`rarity:"${opts.rarity}"`);
  if (opts.supertype) parts.push(`supertype:"${opts.supertype}"`);
  if (opts.subtypes) parts.push(`subtypes:"${opts.subtypes}"`);

  if (parts.length > 0) params.set("q", parts.join(" "));
  params.set("page", String(opts.page ?? 1));
  params.set("pageSize", String(opts.pageSize ?? 20));
  if (opts.orderBy) params.set("orderBy", opts.orderBy);

  const resp = await rateLimited(`${BASE}/cards?${params}`);
  if (!resp.ok) throw new Error(`pokemontcg.io error: ${resp.status}`);
  return resp.json();
}

/**
 * Get a single card by its ID (e.g. "sv3pt5-183").
 */
export async function getCard(id: string): Promise<PokeCard | null> {
  const resp = await rateLimited(`${BASE}/cards/${id}`);
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.data ?? null;
}

/**
 * Get all cards in a set.
 */
export async function getSetCards(
  setId: string,
  page = 1,
  pageSize = 250,
): Promise<PokeSearchResponse> {
  return searchCards({ set: setId, page, pageSize });
}

/**
 * List all available sets.
 */
export async function getSets(page = 1, pageSize = 20): Promise<{
  data: Array<{ id: string; name: string; series: string; releaseDate: string; total: number }>;
  totalCount: number;
}> {
  const resp = await rateLimited(
    `${BASE}/sets?page=${page}&pageSize=${pageSize}&orderBy=-releaseDate`,
  );
  if (!resp.ok) throw new Error(`pokemontcg.io sets error: ${resp.status}`);
  return resp.json();
}

// -----------------------------------------------------------------------------
// PRICE HELPERS (USD → HKD)
// -----------------------------------------------------------------------------

const USD_TO_HKD = 7.83;

export function usdToHkd(usd: number): number {
  return Math.round(usd * USD_TO_HKD * 100) / 100;
}

/**
 * Get the best available market price from a card's TCGPlayer data.
 * Priority: holofoil market → normal market → mid → low.
 */
export function getBestMarketPrice(card: PokeCard): number | null {
  const prices = card.tcgplayer?.prices;
  if (!prices) return null;

  // Try holofoil first (most common for valuable cards)
  const sources = [prices.holofoil, prices.normal, prices.reverseHolofoil];
  for (const src of sources) {
    if (src?.market) return src.market;
  }
  // Fallback to mid price
  for (const src of sources) {
    if (src?.mid) return src.mid;
  }
  // Last resort: low price
  for (const src of sources) {
    if (src?.low) return src.low;
  }

  return null;
}

/**
 * Get the best Cardmarket price in EUR → HKD.
 */
export function getCardmarketPriceHkd(card: PokeCard): number | null {
  const p = card.cardmarket?.prices;
  if (!p) return null;
  const eur = p.averageSellPrice ?? p.trendPrice ?? p.lowPrice;
  if (!eur) return null;
  // EUR → HKD ≈ 8.5 (approximate)
  return Math.round(eur * 8.5 * 100) / 100;
}
