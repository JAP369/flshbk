import { createClient } from "@/lib/supabase/client";
import type { Listing, ListingType, ItemCategory, Rarity } from "@/lib/types/database";

const supabase = createClient();

export interface ListingFilters {
  category?: ItemCategory;
  rarity?: Rarity;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  limit?: number;
  offset?: number;
}

export async function getListings(filters: ListingFilters = {}) {
  let query = supabase
    .from("listings")
    .select("*, profiles:seller_id(username, display_name, avatar_url, is_verified, level)")
    .eq("status", "active");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.rarity) query = query.eq("rarity", filters.rarity);
  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.minPrice !== undefined) query = query.gte("price_hkd", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_hkd", filters.maxPrice);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    );
  }

  switch (filters.sortBy) {
    case "price_asc":
      query = query.order("price_hkd", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_hkd", { ascending: false });
      break;
    case "popular":
      query = query.order("likes_count", { ascending: false });
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
  return data;
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles:seller_id(*)")
    .eq("id", id)
    .single();
  if (error) throw error;

  // Increment view count
  await supabase
    .from("listings")
    .update({ views_count: (data?.views_count || 0) + 1 })
    .eq("id", id);

  return data;
}

export async function createListing(listing: Omit<Listing, "id" | "created_at" | "updated_at" | "views_count" | "likes_count">) {
  const { data, error } = await supabase
    .from("listings")
    .insert(listing)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const { data, error } = await supabase
    .from("listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleLike(listingId: string, userId: string) {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    await supabase.rpc("decrement_listing_likes", { lid: listingId });
    return false;
  } else {
    await supabase.from("likes").insert({ user_id: userId, listing_id: listingId });
    await supabase.rpc("increment_listing_likes", { lid: listingId });
    return true;
  }
}
