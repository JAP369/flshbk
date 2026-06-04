import type { AggregatorListing, ItemCategory } from "@/lib/types/database";
import { getMockAggregatorListings, getMockDeals, MOCK_AGGREGATOR_LISTINGS } from "@/lib/data/mockData";

export interface AggregatorFilters {
  category?: ItemCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  source?: string;
  dealsOnly?: boolean;
  sortBy?: "newest" | "price_asc" | "price_desc" | "deal_score";
  limit?: number;
  offset?: number;
}

type AggregatorApiResponse<T> = {
  data: T;
  fallback: boolean;
  fallbackReason?: string;
};

function buildQueryString(filters: AggregatorFilters) {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.source) params.set("source", filters.source);
  if (filters.dealsOnly) params.set("dealsOnly", "true");
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));

  return params.toString();
}

async function fetchAggregator<T>(queryParams: string) {
  const response = await fetch(`/api/aggregator?${queryParams}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Aggregator API request failed");
  }

  return (await response.json()) as AggregatorApiResponse<T>;
}

export async function getAggregatorListings(filters: AggregatorFilters = {}) {
  try {
    const query = buildQueryString(filters);
    return await fetchAggregator<AggregatorListing[]>(query);
  } catch {
    return {
      data: filterMockAggregatorListings(getMockAggregatorListings(filters.category), filters),
      fallback: true,
      fallbackReason: "client_fetch_error",
    };
  }
}

export async function getDeals(limit = 20) {
  try {
    const query = new URLSearchParams({
      dealsOnly: "true",
      limit: String(limit),
    }).toString();
    return await fetchAggregator<AggregatorListing[]>(query);
  } catch {
    return {
      data: getMockDeals(limit),
      fallback: true,
      fallbackReason: "client_fetch_error",
    };
  }
}

export async function getSources() {
  try {
    const response = await fetch(`/api/aggregator?sources=1`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Sources API request failed");
    return (await response.json()) as AggregatorApiResponse<string[]>;
  } catch {
    return {
      data: [...new Set(MOCK_AGGREGATOR_LISTINGS.map((d) => d.source))],
      fallback: true,
      fallbackReason: "client_fetch_error",
    };
  }
}

function filterMockAggregatorListings(listings: AggregatorListing[], filters: AggregatorFilters) {
  const filtered = listings.filter((listing) => {
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.source && listing.source !== filters.source) return false;
    if (filters.dealsOnly && !listing.is_deal) return false;
    if (filters.minPrice !== undefined && listing.price_hkd < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && listing.price_hkd > filters.maxPrice) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const title = listing.title.toLowerCase();
      const description = listing.description?.toLowerCase() ?? "";
      if (!title.includes(search) && !description.includes(search)) return false;
    }
    return true;
  });

  const sorted = [...filtered];

  switch (filters.sortBy) {
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
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  if (filters.limit !== undefined) {
    const offset = filters.offset || 0;
    return sorted.slice(offset, offset + filters.limit);
  }

  return sorted;
}
