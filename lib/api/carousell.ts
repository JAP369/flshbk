// =============================================================================
// CAROUSELL SCRAPER INTERFACE
// =============================================================================
// Carousell has no public API. Data is fetched via:
// 1. Apify pre-built scraper (recommended)
// 2. Direct HTTP scraping with rate limiting
// 3. Google Sheets bridge (for manual CSV imports)
//
// This module provides the interface. Real implementation requires
// Apify API key or a headless browser service.
// =============================================================================

const CAROUSELL_BASE = "https://www.carousell.com.hk";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface CarousellListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  description: string;
  imageUrl: string;
  seller: { name: string; rating: number | null };
  url: string;
  category: string;
  postedAt: string;
}

// -----------------------------------------------------------------------------
// APIFY SCRAPER INTERFACE
// =============================================================================

/**
 * Trigger an Apify scrape run for Pokemon TCG listings on Carousell.
 * Requires: APIFY_API_KEY env var
 */
export async function scrapeViaApify(opts: {
  query: string;
  maxResults?: number;
  country?: "hk" | "sg" | "tw";
}): Promise<CarousellListing[]> {
  const apifyKey = process.env.APIFY_API_KEY;
  if (!apifyKey) {
    console.warn("APIFY_API_KEY not set — returning empty Carousell results");
    return [];
  }

  const actorId = process.env.APIFY_ACTOR_ID ?? "your-carousell-actor-id";

  const runResp = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: opts.query,
        maxItems: opts.maxResults ?? 50,
        country: opts.country ?? "hk",
      }),
    },
  );

  if (!runResp.ok) {
    console.error("Apify run failed:", runResp.status);
    return [];
  }

  const runData = await runResp.json();
  const runId = runData.data?.id;
  if (!runId) return [];

  // Poll for completion (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusResp = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apifyKey}`,
    );
    const statusData = await statusResp.json();
    if (statusData.data?.status === "SUCCEEDED") {
      const datasetResp = await fetch(
        `https://api.apify.com/v2/datasets/${statusData.data.defaultDatasetId}/items?token=${apifyKey}`,
      );
      const items = await datasetResp.json();
      return (items ?? []).map(mapApifyResult);
    }
    if (statusData.data?.status === "FAILED") {
      console.error("Apify run failed");
      return [];
    }
  }

  return [];
}

function mapApifyResult(raw: Record<string, unknown>): CarousellListing {
  return {
    id: String(raw.id ?? raw.listingId ?? crypto.randomUUID()),
    title: String(raw.title ?? raw.name ?? ""),
    price: Number(raw.price ?? 0),
    condition: String(raw.condition ?? ""),
    description: String(raw.description ?? ""),
    imageUrl: String(raw.imageUrl ?? raw.image ?? ""),
    seller: {
      name: String(raw.sellerName ?? raw.seller ?? ""),
      rating: Number(raw.sellerRating ?? null),
    },
    url: String(raw.url ?? raw.listingUrl ?? ""),
    category: String(raw.category ?? "pokemon_card"),
    postedAt: String(raw.postedAt ?? raw.date ?? new Date().toISOString()),
  };
}

// -----------------------------------------------------------------------------
// DIRECT SCRAPING (fallback)
// =============================================================================

/**
 * Direct HTTP scrape of Carousell search results.
 * WARNING: Fragile — use only for prototyping.
 */
export async function scrapeDirect(opts: {
  query: string;
  maxResults?: number;
}): Promise<CarousellListing[]> {
  const url = `${CAROUSELL_BASE}/search/${encodeURIComponent(opts.query)}`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!resp.ok) return [];

    const html = await resp.text();
    const nextDataMatch = html.match(
      /window\.__NEXT_DATA__\s*=\s*({[\s\S]*?});?\s*<\/script>/,
    );
    if (!nextDataMatch) return [];

    const nextData = JSON.parse(nextDataMatch[1]);
    const listings =
      nextData?.props?.pageProps?.listings ??
      nextData?.props?.pageProps?.searchData?.listings ??
      [];

    return listings
      .slice(0, opts.maxResults ?? 20)
      .map((l: Record<string, unknown>) => ({
        id: String(l.id ?? crypto.randomUUID()),
        title: String(l.title ?? l.name ?? ""),
        price: Number(l.price ?? l.price_cents ?? 0) / 100,
        condition: String(l.condition ?? ""),
        description: String(l.description ?? ""),
        imageUrl: String(l.image ?? (l.photo as Record<string, unknown>)?.url ?? ""),
        seller: {
          name: String((l.seller as Record<string, unknown>)?.name ?? l.seller_name ?? ""),
          rating: Number((l.seller as Record<string, unknown>)?.rating ?? null),
        },
        url: `${CAROUSELL_BASE}/p/${l.id ?? l.slug ?? ""}`,
        category: "pokemon_card",
        postedAt: String(l.created_at ?? new Date().toISOString()),
      }));
  } catch (err) {
    console.error("Carousell direct scrape failed:", err);
    return [];
  }
}
