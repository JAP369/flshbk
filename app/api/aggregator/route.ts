import { NextResponse, type NextRequest } from "next/server";
import type { AggregatorListing } from "@/lib/types/database";
import {
  getMockAggregatorListings,
  MOCK_AGGREGATOR_LISTINGS,
} from "@/lib/data/mockData";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { searchFacebookMarketplace, mapToAggregatorListing } from "@/lib/aggregators/facebook";
import { fetchTcgPrices, fetchSets, fetchCardPriceBreakdown } from "@/lib/aggregators/tcg";
import { fetchLegoPrices } from "@/lib/aggregators/lego";
import { fetchHotToysPrices } from "@/lib/aggregators/hottoys";
import { fetchPopMartPrices } from "@/lib/aggregators/popmart";
import { fetchHotWheelsPrices } from "@/lib/aggregators/hotwheels";

type CacheEntry = {
  data: AggregatorListing[];
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000;
const cacheStore = new Map<string, CacheEntry>();

function getCacheKey(params: URLSearchParams): string {
  return params.toString();
}

function getCachedData(key: string): AggregatorListing[] | null {
  const entry = cacheStore.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  cacheStore.delete(key);
  return null;
}

function setCachedData(key: string, data: AggregatorListing[]) {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

function parseBool(value: string | null) {
  return value === "true";
}

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategory(category?: string) {
  if (!category) return category;
  const categoryMap: Record<string, string> = {
    tcg: "pokemon_card",
    pokemon: "pokemon_card",
    pokemon_card: "pokemon_card",
    lego: "lego",
    hot_toys: "hot_toys",
    hottoys: "hot_toys",
    pop_mart: "pop_mart",
    popmart: "pop_mart",
    hot_wheels: "hot_wheels",
    hotwheels: "hot_wheels",
  };
  return categoryMap[category] || category;
}

function filterMockAggregatorListings(
  listings: AggregatorListing[],
  params: {
    category?: string;
    source?: string;
    dealsOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  },
) {
  const filtered = listings.filter((listing) => {
    if (params.category && listing.category !== params.category) return false;
    if (params.source && listing.source !== params.source) return false;
    if (params.dealsOnly && !listing.is_deal) return false;
    if (params.minPrice !== undefined && listing.price_hkd < params.minPrice) return false;
    if (params.maxPrice !== undefined && listing.price_hkd > params.maxPrice) return false;
    if (params.search) {
      const search = params.search.toLowerCase();
      const title = listing.title.toLowerCase();
      const description = listing.description?.toLowerCase() ?? "";
      if (!title.includes(search) && !description.includes(search)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (params.sortBy) {
    case "price_asc":
      sorted.sort((a, b) => (a.price_hkd ?? 0) - (b.price_hkd ?? 0));
      break;
    case "price_desc":
      sorted.sort((a, b) => (b.price_hkd ?? 0) - (a.price_hkd ?? 0));
      break;
    case "deal_score":
      sorted.sort((a, b) => (b.deal_score ?? 0) - (a.deal_score ?? 0));
      break;
    default:
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  if (params.limit !== undefined) {
    const offset = params.offset || 0;
    return sorted.slice(offset, offset + params.limit);
  }
  return sorted;
}

/**
 * Map Facebook category to our internal category
 */
function mapFBCategoryToInternal(category?: string): string | undefined {
  if (!category) return undefined;
  const map: Record<string, string> = {
    "pokemon_card": "pokemon_card",
    "pokemon": "pokemon_card",
    "tcg": "pokemon_card",
    "lego": "lego",
    "hot_toys": "hot_toys",
    "hottoys": "hot_toys",
    "pop_mart": "pop_mart",
    "popmart": "pop_mart",
    "hot_wheels": "hot_wheels",
    "hotwheels": "hot_wheels",
    "funko": "funko",
    "other": "other",
  };
  return map[category] || category;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const cacheKey = getCacheKey(params);

  const category = params.get("category") || undefined;
  const source = params.get("source") || undefined;
  const search = params.get("search") || undefined;
  const dealsOnly = parseBool(params.get("dealsOnly"));
  const minPrice = params.has("minPrice") ? parseNumber(params.get("minPrice"), 0) : undefined;
  const maxPrice = params.has("maxPrice") ? parseNumber(params.get("maxPrice"), 0) : undefined;
  const sortBy = params.get("sortBy") || undefined;
  const limit = parseNumber(params.get("limit"), 50);
  const offset = parseNumber(params.get("offset"), 0);
  const listSources = params.get("sources") === "1";
  const listSets = params.get("sets") === "1";
  const cardBreakdown = params.get("card") || null;

  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return NextResponse.json({ data: cachedData, fallback: true, source: "cache" });
  }

  const supabase = await createSupabaseServerClient();
  const useMock = !supabase;

  // ── Card Price Breakdown endpoint ──
  if (cardBreakdown) {
    try {
      const breakdown = await fetchCardPriceBreakdown(cardBreakdown);
      return NextResponse.json({ data: breakdown, fallback: !breakdown });
    } catch (err) {
      console.error("[Aggregator] Card breakdown failed:", err);
      return NextResponse.json({ data: null, fallback: true, fallbackReason: "api_error" });
    }
  }

  // ── Sets endpoint (for TCG set browser) ──
  if (listSets) {
    try {
      const sets = await fetchSets();
      return NextResponse.json({ data: sets, fallback: false, source: "pokemon_tcg_api" });
    } catch (err) {
      console.error("[Aggregator] Sets fetch failed:", err);
      return NextResponse.json({ data: [], fallback: true, fallbackReason: "api_error" });
    }
  }

  // ── Sources endpoint ──
  if (listSources) {
    if (useMock) {
      return NextResponse.json({
        data: [...new Set(MOCK_AGGREGATOR_LISTINGS.map((l) => l.source))],
        fallback: true,
        fallbackReason: "supabase_unavailable",
      });
    }
    const sourcesResult = await supabase.from("aggregator_listings").select("source").order("source");
    const sources = sourcesResult.data
      ? [...new Set(sourcesResult.data.map((row: { source: string }) => row.source))]
      : undefined;
    if (sourcesResult.error || !sources) {
      return NextResponse.json({
        data: [...new Set(MOCK_AGGREGATOR_LISTINGS.map((l) => l.source))],
        fallback: true,
        fallbackReason: "database_error",
      });
    }
    return NextResponse.json({ data: sources, fallback: false });
  }

  const normalizedCategory = normalizeCategory(category);

  // ── Try TCG Price Aggregation for pokemon_card category ──
  if (normalizedCategory === "pokemon_card" && (!source || source === "tcgplayer" || source === "cardmarket")) {
    try {
      const tcgResult = await fetchTcgPrices(search, limit, offset);

      if (tcgResult.listings.length > 0) {
        let mapped = tcgResult.listings;

        // Apply additional filters
        mapped = filterMockAggregatorListings(mapped, {
          category: normalizedCategory,
          source,
          dealsOnly,
          minPrice,
          maxPrice,
          search,
          sortBy,
          limit,
          offset: 0,
        });

        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped,
          fallback: false,
          source: "pokemon_tcg_api",
          liveCount: mapped.length,
          totalCount: tcgResult.totalCount,
        });
      }
    } catch (err) {
      console.error("[Aggregator] TCG price fetch failed:", err);
    }
  }

  // ── Try LEGO Price Aggregation ──
  if (normalizedCategory === "lego" && (!source || source === "bricklink" || source === "brickowl")) {
    try {
      const legoResult = await fetchLegoPrices(search, limit, offset);
      if (legoResult.listings.length > 0) {
        const mapped = filterMockAggregatorListings(legoResult.listings, {
          category: normalizedCategory, source, dealsOnly, minPrice, maxPrice, search, sortBy, limit, offset: 0,
        });
        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped, fallback: false, source: "bricklink",
          liveCount: mapped.length, totalCount: legoResult.totalCount,
        });
      }
    } catch (err) {
      console.error("[Aggregator] LEGO price fetch failed:", err);
    }
  }

  // ── Try Hot Toys Price Aggregation ──
  if (normalizedCategory === "hot_toys" && (!source || source === "sideshow" || source === "bigbadtoystore")) {
    try {
      const htResult = await fetchHotToysPrices(search, limit, offset);
      if (htResult.listings.length > 0) {
        const mapped = filterMockAggregatorListings(htResult.listings, {
          category: normalizedCategory, source, dealsOnly, minPrice, maxPrice, search, sortBy, limit, offset: 0,
        });
        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped, fallback: false, source: "sideshow",
          liveCount: mapped.length, totalCount: htResult.totalCount,
        });
      }
    } catch (err) {
      console.error("[Aggregator] Hot Toys price fetch failed:", err);
    }
  }

  // ── Try Pop Mart Price Aggregation ──
  if (normalizedCategory === "pop_mart" && (!source || source === "popmart" || source === "carousell")) {
    try {
      const pmResult = await fetchPopMartPrices(search, limit, offset);
      if (pmResult.listings.length > 0) {
        const mapped = filterMockAggregatorListings(pmResult.listings, {
          category: normalizedCategory, source, dealsOnly, minPrice, maxPrice, search, sortBy, limit, offset: 0,
        });
        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped, fallback: false, source: "popmart",
          liveCount: mapped.length, totalCount: pmResult.totalCount,
        });
      }
    } catch (err) {
      console.error("[Aggregator] Pop Mart price fetch failed:", err);
    }
  }

  // ── Try Hot Wheels Price Aggregation ──
  if (normalizedCategory === "hot_wheels" && (!source || source === "mattel" || source === "ebay")) {
    try {
      const hwResult = await fetchHotWheelsPrices(search, limit, offset);
      if (hwResult.listings.length > 0) {
        const mapped = filterMockAggregatorListings(hwResult.listings, {
          category: normalizedCategory, source, dealsOnly, minPrice, maxPrice, search, sortBy, limit, offset: 0,
        });
        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped, fallback: false, source: "mattel",
          liveCount: mapped.length, totalCount: hwResult.totalCount,
        });
      }
    } catch (err) {
      console.error("[Aggregator] Hot Wheels price fetch failed:", err);
    }
  }

  // ── Try Facebook Marketplace live scrape first ──
  // Only scrape when no specific source is requested (or source is facebook)
  const shouldScrape = !source || source === "facebook_marketplace" || source === "facebook";

  if (shouldScrape) {
    try {
      const fbCategory = mapFBCategoryToInternal(normalizedCategory);
      const fbListings = await searchFacebookMarketplace(
        search || fbCategory || "collectibles",
        fbCategory,
      );

      if (fbListings.length > 0) {
        let mapped = fbListings.map(mapToAggregatorListing);

        // Apply filters
        mapped = filterMockAggregatorListings(mapped, {
          category: normalizedCategory,
          source,
          dealsOnly,
          minPrice,
          maxPrice,
          search,
          sortBy,
          limit,
          offset,
        });

        setCachedData(cacheKey, mapped);
        return NextResponse.json({
          data: mapped,
          fallback: false,
          source: "facebook_marketplace",
          liveCount: mapped.length,
        });
      }
    } catch (err) {
      console.error("[Aggregator] FB scrape failed:", err);
    }
  }

  // ── Try Supabase ──
  if (!useMock) {
    try {
      let queryBuilder = supabase.from("aggregator_listings").select("*");

      if (normalizedCategory) queryBuilder = queryBuilder.eq("category", normalizedCategory);
      if (source) queryBuilder = queryBuilder.eq("source", source);
      if (dealsOnly) queryBuilder = queryBuilder.eq("is_deal", true);
      if (minPrice !== undefined) queryBuilder = queryBuilder.gte("price_hkd", minPrice);
      if (maxPrice !== undefined) queryBuilder = queryBuilder.lte("price_hkd", maxPrice);
      if (search) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      switch (sortBy) {
        case "price_asc":
          queryBuilder = queryBuilder.order("price_hkd", { ascending: true });
          break;
        case "price_desc":
          queryBuilder = queryBuilder.order("price_hkd", { ascending: false });
          break;
        case "deal_score":
          queryBuilder = queryBuilder.order("deal_score", { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error } = await queryBuilder;
      if (!error && data) {
        setCachedData(cacheKey, data as AggregatorListing[]);
        return NextResponse.json({ data: data as AggregatorListing[], fallback: false });
      }
    } catch (err) {
      console.error("[Aggregator] Supabase query failed:", err);
    }
  }

  // ── Fallback to mock data ──
  const mockResult = filterMockAggregatorListings(getMockAggregatorListings(normalizedCategory), {
    category: normalizedCategory,
    source,
    dealsOnly,
    minPrice,
    maxPrice,
    search,
    sortBy,
    limit,
    offset,
  });
  setCachedData(cacheKey, mockResult);
  return NextResponse.json({
    data: mockResult,
    fallback: true,
    fallbackReason: useMock ? "supabase_unavailable" : "query_error",
  });
}
