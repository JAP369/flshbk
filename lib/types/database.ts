export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Rarity = "common" | "uncommon" | "rare" | "secret" | "chase" | "ultra";
export type ItemCategory = "pokemon_card" | "pop_mart" | "lego" | "hot_toys" | "hot_wheels" | "funko" | "other";
export type ListingType = "sell" | "buy" | "swap";
export type ListingStatus = "active" | "sold" | "expired" | "cancelled";
export type TradeStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
export type AchievementRarity = "bronze" | "silver" | "gold" | "platinum" | "diamond";

// TCG-specific types
export type TCGRegion = "EN" | "JP" | "ZHT";
export type TCGPackaging = "ETB" | "Booster Box" | "Boaler Bundle" | "Sealed Case";

export interface PokemonMetadata {
  set_code: string;
  has_masterball_holos: boolean;
  major_mascot_characters: string[];
}

export interface PriceMatrix {
  estimated_wholesale_floor_hkd: number;
  sino_centre_street_ceiling_hkd: number;
  live_carousell_floor_hkd: number;
  last_updated: string;
}

export interface CollectibleListing<T = PokemonMetadata> {
  id: string;
  product_name: string;
  language: TCGRegion;
  packaging_type: TCGPackaging;
  condition: "Factory Sealed" | "Unsealed" | "Damaged Wrap";
  is_pokemon_center_exclusive: boolean;
  metadata: T;
  pricing_metrics: PriceMatrix;
  arbitrage_yield_percentage: number;
}

// Commission tier based on transaction volume
export type CommissionTier = "seed" | "sprout" | "bloom" | "harvest" | "estate";

export interface CommissionModifier {
  tier: CommissionTier;
  rate: number; // percentage (e.g., 12 means 12%)
  min_transactions: number;
  xp_threshold: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          level: number;
          xp: number;
          nexus_tokens: number;
          verified_trades: number;
          is_verified: boolean;
          streak_count: number;
          last_active: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          level?: number;
          xp?: number;
          nexus_tokens?: number;
          verified_trades?: number;
          is_verified?: boolean;
          streak_count?: number;
          last_active?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          level?: number;
          xp?: number;
          nexus_tokens?: number;
          verified_trades?: number;
          is_verified?: boolean;
          streak_count?: number;
          last_active?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string | null;
          category: ItemCategory;
          rarity: Rarity;
          condition: string;
          price_hkd: number | null;
          original_price_hkd: number | null;
          currency: string;
          listing_type: ListingType;
          status: ListingStatus;
          images: string[];
          tags: string[];
          views_count: number;
          likes_count: number;
          swap_preferences: string[] | null;
          location: string | null;
          is_featured: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description?: string | null;
          category: ItemCategory;
          rarity: Rarity;
          condition: string;
          price_hkd?: number | null;
          original_price_hkd?: number | null;
          currency?: string;
          listing_type: ListingType;
          status?: ListingStatus;
          images?: string[];
          tags?: string[];
          views_count?: number;
          likes_count?: number;
          swap_preferences?: string[] | null;
          location?: string | null;
          is_featured?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string | null;
          category?: ItemCategory;
          rarity?: Rarity;
          condition?: string;
          price_hkd?: number | null;
          original_price_hkd?: number | null;
          currency?: string;
          listing_type?: ListingType;
          status?: ListingStatus;
          images?: string[];
          tags?: string[];
          views_count?: number;
          likes_count?: number;
          swap_preferences?: string[] | null;
          location?: string | null;
          is_featured?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          initiator_id: string;
          receiver_id: string;
          initiator_listing_id: string | null;
          receiver_listing_id: string | null;
          initiator_cash_topup_hkd: number;
          receiver_cash_topup_hkd: number;
          status: TradeStatus;
          safe_zone_id: string | null;
          handshake_code: string | null;
          commission_hkd: number;
          nexus_earned: number;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initiator_id: string;
          receiver_id: string;
          initiator_listing_id?: string | null;
          receiver_listing_id?: string | null;
          initiator_cash_topup_hkd?: number;
          receiver_cash_topup_hkd?: number;
          status?: TradeStatus;
          safe_zone_id?: string | null;
          handshake_code?: string | null;
          commission_hkd?: number;
          nexus_earned?: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          initiator_id?: string;
          receiver_id?: string;
          initiator_listing_id?: string | null;
          receiver_listing_id?: string | null;
          initiator_cash_topup_hkd?: number;
          receiver_cash_topup_hkd?: number;
          status?: TradeStatus;
          safe_zone_id?: string | null;
          handshake_code?: string | null;
          commission_hkd?: number;
          nexus_earned?: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          trade_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          rarity: AchievementRarity;
          xp_reward: number;
          nexus_reward: number;
          requirement_type: string;
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          rarity: AchievementRarity;
          xp_reward?: number;
          nexus_reward?: number;
          requirement_type: string;
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          rarity?: AchievementRarity;
          xp_reward?: number;
          nexus_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
      aggregator_listings: {
        Row: {
          id: string;
          source: string;
          source_url: string;
          source_id: string;
          title: string;
          description: string | null;
          category: ItemCategory;
          price_hkd: number;
          original_price_hkd: number | null;
          condition: string | null;
          seller_name: string | null;
          seller_rating: number | null;
          image_url: string | null;
          location: string | null;
          is_deal: boolean;
          deal_score: number;
          raw_data: Json;
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          source_url: string;
          source_id: string;
          title: string;
          description?: string | null;
          category: ItemCategory;
          price_hkd: number;
          original_price_hkd?: number | null;
          condition?: string | null;
          seller_name?: string | null;
          seller_rating?: number | null;
          image_url?: string | null;
          location?: string | null;
          is_deal?: boolean;
          deal_score?: number;
          raw_data?: Json;
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          source_url?: string;
          source_id?: string;
          title?: string;
          description?: string | null;
          category?: ItemCategory;
          price_hkd?: number;
          original_price_hkd?: number | null;
          condition?: string | null;
          seller_name?: string | null;
          seller_rating?: number | null;
          image_url?: string | null;
          location?: string | null;
          is_deal?: boolean;
          deal_score?: number;
          raw_data?: Json;
          last_seen?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          trade_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Trade = Database["public"]["Tables"]["trades"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"];
export type AggregatorListing = Database["public"]["Tables"]["aggregator_listings"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
