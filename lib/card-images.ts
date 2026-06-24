// =============================================================================
// CARD IMAGE RESOLVER — Fetches real card images from pokemontcg.io
// =============================================================================

const API_BASE = "https://api.pokemontcg.io/v2";
const IMG_BASE = "https://images.pokemontcg.io";

// In-memory cache for resolved image URLs
const imageCache: Record<string, string | null> = {};

// Rate limiting: max 20 requests per second (API is generous but be polite)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 50; // ms

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: { "User-Agent": "FlashBK/1.0 (Portfolio Tracker)" },
  });
}

// =============================================================================
// SET ID MAPPING — Our internal set codes → pokemontcg.io set IDs
// =============================================================================

const SET_ID_MAP: Record<string, string> = {
  // Scarlet & Violet era
  sv151: "sv3pt5",
  "sv151-jp": "sv3pt5",
  "promo-corocoro": "sv3pt5",
  "25th": "sv3pt5",
  "sv-promo": "sv3pt5",
  starter: "sv3pt5",
  "star-birth": "sv3pt5",
  rof: "sv3pt5",
  tr: "sv3pt5",
  sm: "sv3pt5",
  ah: "sv3pt5",
  "ah-mega": "sv3pt5",
  "fp-s1": "sv3pt5",
  "fp-s2": "sv3pt5",
  cr: "sv3pt5",
  pday2026: "sv3pt5",
  // Sword & Shield era (international sets)
  ssv: "swsh4",
  hig: "swsh4",
  tg: "swsh3",
  // XY / Mega era
  mega: "xy1",
  "mega-dream": "xy1",
  // One Piece (not on pokemontcg.io)
  op01: "",
  // Japanese-only sets not on pokemontcg.io
  "vmax-climax": "",
};

// =============================================================================
// CARD NAME NORMALIZATION — Match our names to API names
// =============================================================================

function normalizeCardName(name: string): string {
  // Remove common suffixes/prefixes that differ between our data and the API
  return name
    .replace(/\s*\(.*?\)\s*/g, " ")  // Remove parentheticals like (002), (Parallel)
    .replace(/\s+/g, " ")
    .trim();
}

// =============================================================================
// IMAGE URL RESOLVER — Tries multiple strategies to find the card image
// =============================================================================

export async function resolveCardImage(
  cardName: string,
  setCode: string,
  cardNumber: string | null,
): Promise<string | null> {
  const cacheKey = `${setCode}:${cardNumber ?? ""}:${cardName}`;
  if (cacheKey in imageCache) {
    return imageCache[cacheKey];
  }

  // Strategy 1: Direct URL if we know the set ID and card number
  const apiSetId = SET_ID_MAP[setCode];
  if (apiSetId && cardNumber) {
    const num = cardNumber.split("/")[0].replace(/^0+/, "") || "0";
    const url = `${IMG_BASE}/${apiSetId}/${num}.png`;
    try {
      const resp = await rateLimitedFetch(url);
      if (resp.ok) {
        imageCache[cacheKey] = url;
        return url;
      }
    } catch {
      // continue to next strategy
    }
  }

  // Strategy 2: Search API by card name
  const normalizedName = normalizeCardName(cardName);
  try {
    const query = encodeURIComponent(`name:"${normalizedName}"`);
    const resp = await rateLimitedFetch(
      `${API_BASE}/cards?q=${query}&pageSize=5`,
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data.data && data.data.length > 0) {
        // Try to find the best match (prefer the set we want)
        const best = data.data.find(
          (c: { set: { id: string } }) => c.set.id === apiSetId,
        ) ?? data.data[0];
        const url = best.images?.large ?? best.images?.small;
        if (url) {
          imageCache[cacheKey] = url;
          return url;
        }
      }
    }
  } catch {
    // fall through
  }

  // Strategy 3: No image found
  imageCache[cacheKey] = null;
  return null;
}

// =============================================================================
// BATCH RESOLVER — Resolve multiple cards at once
// =============================================================================

export interface CardImageRequest {
  id: string;
  name: string;
  setCode: string;
  cardNumber: string | null;
}

export async function resolveCardImages(
  requests: CardImageRequest[],
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Process in batches of 5 to respect rate limits
  for (let i = 0; i < requests.length; i += 5) {
    const batch = requests.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map((req) =>
        resolveCardImage(req.name, req.setCode, req.cardNumber),
      ),
    );
    batch.forEach((req, idx) => {
      results[req.id] = batchResults[idx];
    });
  }

  return results;
}

// =============================================================================
// SYNCHRONOUS FALLBACK — Returns a known good URL without API call
// =============================================================================

export function getKnownImageUrl(
  setCode: string,
  cardNumber: string | null,
): string | null {
  const apiSetId = SET_ID_MAP[setCode];
  if (!apiSetId) return null;
  if (!cardNumber) return `${IMG_BASE}/${apiSetId}/logo.png`;

  const num = cardNumber.split("/")[0].replace(/^0+/, "") || "0";
  return `${IMG_BASE}/${apiSetId}/${num}.png`;
}
