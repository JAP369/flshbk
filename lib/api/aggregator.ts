import type { AggregatorListing, ItemCategory } from "@/lib/types/database";

async function getSupabase() {
  const mod = await import("@/lib/supabase/client");
  return mod.createClient();
}

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

export async function getAggregatorListings(filters: AggregatorFilters = {}) {
  const supabase = await getSupabase();
  let query = supabase.from("aggregator_listings").select("*");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.dealsOnly) query = query.eq("is_deal", true);
  if (filters.minPrice !== undefined) query = query.gte("price_hkd", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_hkd", filters.maxPrice);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  switch (filters.sortBy) {
    case "price_asc":
      query = query.order("price_hkd", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_hkd", { ascending: false });
      break;
    case "deal_score":
      query = query.order("deal_score", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (filters.limit) {
    const offset = filters.offset || 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AggregatorListing[];
}

export async function getDeals(limit = 20) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("aggregator_listings")
    .select("*")
    .eq("is_deal", true)
    .order("deal_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as AggregatorListing[];
}

export async function getSources() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("aggregator_listings")
    .select("source")
    .order("source");
  if (error) throw error;
  return [...new Set(data.map((d) => d.source))];
}
