// =============================================================================
// ARBITRAGE API ROUTE
// =============================================================================
// GET /api/arbitrage — Run an arbitrage scan and return opportunities.
// Uses demo mode (simulated marketplace data) when API keys aren't set.
// =============================================================================

import { NextResponse } from "next/server";
import { fetchCardCatalog } from "@/lib/tcg/arbitrage-service";
import { generateDemoScan } from "@/lib/tcg/arbitrage-service";
import type { ArbitrageScanResult } from "@/lib/tcg/arbitrage-engine";

// Cache results in memory (simple — use Redis in production)
let cachedResult: { data: ArbitrageScanResult; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    const minYield = parseInt(searchParams.get("minYield") ?? "15", 10);

    // Check cache
    if (!force && cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedResult.data);
    }

    // Fetch card catalog from pokemontcg.io (live — no key needed)
    const cards = await fetchCardCatalog();

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "No cards found", opportunities: [] },
        { status: 500 },
      );
    }

    // Check if we have API keys for live marketplace data
    const hasEbayKey = !!process.env.EBAY_CLIENT_ID && !!process.env.EBAY_CLIENT_SECRET;
    const hasCarousellKey = !!process.env.APIFY_API_KEY;

    let result: ArbitrageScanResult;

    if (hasEbayKey || hasCarousellKey) {
      // Live mode — fetch real marketplace data
      // This path is activated when API keys are set
      const { searchListings } = await import("@/lib/api/ebay");
      const { scrapeDirect } = await import("@/lib/api/carousell");

      const ebayListings = new Map();
      const carousellListings = new Map();

      if (hasEbayKey) {
        try {
          for (const card of cards.slice(0, 10)) {
            const resp = await searchListings({
              query: `${card.name} ${card.set.name} Pokemon TCG`,
              limit: 10,
            });
            if (resp.itemSummaries.length > 0) {
              ebayListings.set(card.id, resp.itemSummaries);
            }
          }
        } catch (err) {
          console.warn("eBay fetch failed, using demo mode:", err);
        }
      }

      if (hasCarousellKey) {
        try {
          for (const card of cards.slice(0, 10)) {
            const listings = await scrapeDirect({
              query: `${card.name} Pokemon card`,
              maxResults: 5,
            });
            if (listings.length > 0) {
              carousellListings.set(card.id, listings);
            }
          }
        } catch (err) {
          console.warn("Carousell fetch failed, using demo mode:", err);
        }
      }

      const { runArbitrageScan } = await import("@/lib/tcg/arbitrage-engine");
      result = await runArbitrageScan(cards, ebayListings, carousellListings, {
        minYieldPercent: minYield,
      });
    } else {
      // Demo mode — use pokemontcg.io pricing with simulated marketplace data
      result = await generateDemoScan(cards);
    }

    // Cache the result
    cachedResult = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Arbitrage scan failed:", error);
    return NextResponse.json(
      {
        error: "Arbitrage scan failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
