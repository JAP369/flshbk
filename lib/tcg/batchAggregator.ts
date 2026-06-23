/**
 * TCG Multi-Source Batch Aggregator
 *
 * Orchestrates parallel ingestion from:
 * - Carousell HK (P2P Secondary Market)
 * - Local Retailers (Shopify endpoints)
 * - International Pricing (TCGplayer/PriceCharting)
 */

import { calculateDealScore } from "@/lib/aggregator/scorer";
import type { AggregatorListing, Json } from "@/lib/types/database";
import type { PriceMatrix, TCGRegion, TCGPackaging } from "@/lib/types/database";

const USD_TO_HKD = 7.8;

// Anti-investment markers in Carousell listings
const ANTI_INVESTMENT_MARKERS = [
  "no shrink wrap",
  "unsealed",
  "已拆膜",
  "無膜",
  "opened",
  "opened pack",
];

// Local Hong Kong retailer endpoints
const HK_RETAILERS = [
  {
    name: "yamacardo",
    endpoint: "https://yamacardo.com/api/products.json",
  },
  {
    name: "getthemall",
    endpoint: "https://getthemall.hk/api/products.json",
  },
  {
    name: "hobbyx",
    endpoint: "https://hobbyx.com.hk/api/products.json",
  },
];

interface CarousellListing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  url: string;
  location: string;
  condition: string;
}

interface RetailerProduct {
  id: string;
  title: string;
  variants: Array<{ price: number; sku: string }>;
  images: Array<{ src: string }>;
}

interface BatchSourceResult {
  listings: AggregatorListing[];
  source: string;
  error?: string;
}

/**
 * Check if a listing is factory-sealed (investment-grade)
 */
function isInvestmentGrade(title: string, condition?: string): boolean {
  const combined = `${title} ${condition || ""}`.toLowerCase();
  return !ANTI_INVESTMENT_MARKERS.some((marker) => combined.includes(marker));
}

/**
 * Fetch Carousell HK listings with price ascending sort
 */
async function fetchCarousellHK(
  query: string,
  limit: number = 30,
): Promise<CarousellListing[]> {
  try {
    const url = `https://www.carousell.com.hk/search?query=${encodeURIComponent(query)}&sort_by=3&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    // Carousell returns JSON with listings array
    const data = (await response.json()) as { listings?: CarousellListing[] };
    return (data.listings || []).filter((l) => isInvestmentGrade(l.title, l.condition));
  } catch (error) {
    console.error("[Batch Aggregator] Carousell fetch failed:", error);
    return [];
  }
}

/**
 * Fetch wholesale pricing from HK retailer endpoints
 */
async function fetchHKRetailers(
  query: string,
  limit: number = 30,
): Promise<RetailerProduct[]> {
  const allProducts: RetailerProduct[] = [];

  for (const retailer of HK_RETAILERS) {
    try {
      const url = `${retailer.endpoint}?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = (await response.json()) as { products?: RetailerProduct[] };
        if (data.products) {
          allProducts.push(...data.products);
        }
      }
    } catch {
      // Continue to next retailer on error
    }
  }

  return allProducts;
}

/**
 * Fetch international benchmark pricing (TCGplayer)
 */
async function fetchInternationalBenchmark(
  query: string,
  limit: number = 30,
): Promise<Array<{ name: string; price_usd: number; market_usd: number }>> {
  try {
    const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}&pageSize=${limit}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      data: Array<{
        name: string;
        tcgplayer?: { prices?: { holofoil?: { market?: number } } };
      }>;
    };

    return data.data.map((card) => ({
      name: card.name,
      price_usd: 0, // Market price used as both
      market_usd: card.tcgplayer?.prices?.holofoil?.market || 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Build price matrix from multi-source data
 */
function buildPriceMatrix(
  carousellPrice?: number,
  wholesalePrice?: number,
  internationalPrice?: number,
): PriceMatrix {
  const now = new Date().toISOString();

  return {
    estimated_wholesale_floor_hkd: wholesalePrice ? Math.round(wholesalePrice * USD_TO_HKD) : 0,
    sino_centre_street_ceiling_hkd: internationalPrice
      ? Math.round(internationalPrice * USD_TO_HKD * 1.3)
      : 0,
    live_carousell_floor_hkd: carousellPrice ? Math.round(carousellPrice) : 0,
    last_updated: now,
  };
}

/**
 * Normalize Carousell listing to AggregatorListing
 */
function normalizeCarousellListing(
  listing: CarousellListing,
): AggregatorListing {
  const now = new Date().toISOString();
  const dealScore = calculateDealScore({
    priceHKD: listing.price,
    marketAverageHKD: listing.price * 1.1,
    sellerRating: 4.0,
    condition: listing.condition || "New",
    daysSinceListed: 0,
    hasPhoto: true,
    hasDescription: true,
  });

  return {
    id: `carousell-${listing.id}`,
    source: "carousell",
    source_url: listing.url,
    source_id: listing.id,
    title: listing.title,
    description: `${listing.title} - listed on Carousell HK`,
    category: "pokemon_card",
    price_hkd: listing.price,
    original_price_hkd: null,
    condition: listing.condition,
    seller_name: "Carousell HK",
    seller_rating: 4.0,
    image_url: listing.imageUrl,
    location: listing.location || "Hong Kong",
    is_deal: dealScore > 50,
    deal_score: dealScore,
    raw_data: { source: "carousell_hk" } as unknown as Json,
    last_seen: now,
    created_at: now,
  };
}

/**
 * Execute batch ingestion across all sources
 */
export async function executeTCGBatchAggregation(
  query: string,
  limit: number = 30,
): Promise<BatchSourceResult[]> {
  const results: BatchSourceResult[] = [];

  // Execute all fetches in parallel
  const [carousellListings, retailerProducts, internationalPrices] = await Promise.all([
    fetchCarousellHK(query, limit),
    fetchHKRetailers(query, limit),
    fetchInternationalBenchmark(query, limit),
  ]);

  // Normalize Carousell results
  if (carousellListings.length > 0) {
    results.push({
      listings: carousellListings.map(normalizeCarousellListing),
      source: "carousell_hk",
    });
  }

  // Build enriched listings from HK retailers + international benchmarks
  const enrichedListings: AggregatorListing[] = [];
  for (const product of retailerProducts) {
    const match = internationalPrices.find((p) =>
      p.name.toLowerCase().includes(product.title.toLowerCase().split(" ")[0] || ""),
    );

    const priceMatrix = buildPriceMatrix(
      undefined,
      product.variants[0]?.price,
      match?.market_usd,
    );

    const dealScore = calculateDealScore({
      priceHKD: priceMatrix.estimated_wholesale_floor_hkd || 1000,
      marketAverageHKD: priceMatrix.sino_centre_street_ceiling_hkd,
      sellerRating: 4.5,
      condition: "Factory Sealed",
      daysSinceListed: 0,
      hasPhoto: product.images.length > 0,
      hasDescription: true,
    });

    enrichedListings.push({
      id: `hkretailer-${product.id}`,
      source: "yamacardo",
      source_url: `https://yamacardo.com/products/${product.id}`,
      source_id: product.id,
      title: product.title,
      description: `HK retailer: ${product.title}`,
      category: "pokemon_card",
      price_hkd: priceMatrix.estimated_wholesale_floor_hkd,
      original_price_hkd: priceMatrix.sino_centre_street_ceiling_hkd,
      condition: "Factory Sealed",
      seller_name: "HK Retailer",
      seller_rating: 4.5,
      image_url: product.images[0]?.src || null,
      location: "Hong Kong",
      is_deal: dealScore > 50,
      deal_score: dealScore,
      raw_data: {
        price_matrix: priceMatrix,
        source: "hk_retailer",
      } as unknown as Json,
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  }

  if (enrichedListings.length > 0) {
    results.push({
      listings: enrichedListings,
      source: "hk_retailers",
    });
  }

  return results;
}