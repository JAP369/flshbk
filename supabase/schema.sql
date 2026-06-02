-- FLSHBK Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  nexus_tokens INTEGER DEFAULT 0,
  verified_trades INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  streak_count INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS
-- ============================================
CREATE TYPE item_category AS ENUM (
  'pokemon_card', 'pop_mart', 'lego', 'hot_toys', 'hot_wheels', 'funko', 'other'
);
CREATE TYPE rarity_type AS ENUM (
  'common', 'uncommon', 'rare', 'secret', 'chase', 'ultra'
);
CREATE TYPE listing_type AS ENUM ('sell', 'buy', 'swap');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired', 'cancelled');

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL,
  rarity rarity_type NOT NULL DEFAULT 'common',
  condition TEXT NOT NULL,
  price_hkd INTEGER,
  original_price_hkd INTEGER,
  currency TEXT DEFAULT 'HKD',
  listing_type listing_type NOT NULL DEFAULT 'sell',
  status listing_status NOT NULL DEFAULT 'active',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  swap_preferences TEXT[],
  location TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRADES
-- ============================================
CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  initiator_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  receiver_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  initiator_cash_topup_hkd INTEGER DEFAULT 0,
  receiver_cash_topup_hkd INTEGER DEFAULT 0,
  status trade_status NOT NULL DEFAULT 'pending',
  safe_zone_id TEXT,
  handshake_code TEXT,
  commission_hkd INTEGER DEFAULT 0,
  nexus_earned INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TYPE achievement_rarity AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity achievement_rarity NOT NULL DEFAULT 'bronze',
  xp_reward INTEGER DEFAULT 0,
  nexus_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- AGGREGATOR LISTINGS (scraped from external marketplaces)
-- ============================================
CREATE TABLE public.aggregator_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- e.g., 'carousell', 'facebook', 'instagram'
  source_url TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL DEFAULT 'pokemon_card',
  price_hkd INTEGER NOT NULL,
  original_price_hkd INTEGER,
  condition TEXT,
  seller_name TEXT,
  seller_rating NUMERIC(3,2),
  image_url TEXT,
  location TEXT,
  is_deal BOOLEAN DEFAULT FALSE,
  deal_score INTEGER DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_id)
);

-- ============================================
-- FOLLOWS
-- ============================================
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- LIKES
-- ============================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_type ON public.listings(listing_type);
CREATE INDEX idx_listings_price ON public.listings(price_hkd);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX idx_listings_tags ON public.listings USING GIN(tags);
CREATE INDEX idx_listings_search ON public.listings USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE INDEX idx_trades_initiator ON public.trades(initiator_id);
CREATE INDEX idx_trades_receiver ON public.trades(receiver_id);
CREATE INDEX idx_trades_status ON public.trades(status);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

CREATE INDEX idx_aggregator_source ON public.aggregator_listings(source);
CREATE INDEX idx_aggregator_category ON public.aggregator_listings(category);
CREATE INDEX idx_aggregator_price ON public.aggregator_listings(price_hkd);
CREATE INDEX idx_aggregator_deal ON public.aggregator_listings(is_deal, deal_score DESC);
CREATE INDEX idx_aggregator_search ON public.aggregator_listings USING GIN(to_tsvector('english', title));

CREATE INDEX idx_messages_trade ON public.messages(trade_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_likes_listing ON public.likes(listing_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregator_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by all, writable by owner
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: readable by all, writable by seller
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Trades: readable by participants
CREATE POLICY "Trades viewable by participants" ON public.trades FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Participants can update trades" ON public.trades FOR UPDATE USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- Reviews: readable by all, writable by reviewer
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Achievements: readable by all
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "User achievements viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Aggregator listings: readable by all
CREATE POLICY "Aggregator listings viewable by everyone" ON public.aggregator_listings FOR SELECT USING (true);

-- Follows
CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Likes
CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Messages: readable by trade participants
CREATE POLICY "Messages viewable by trade participants" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT initiator_id FROM public.trades WHERE id = trade_id UNION SELECT receiver_id FROM public.trades WHERE id = trade_id)
);
CREATE POLICY "Trade participants can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND auth.uid() IN (SELECT initiator_id FROM public.trades WHERE id = trade_id UNION SELECT receiver_id FROM public.trades WHERE id = trade_id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Level calculation based on XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: every 500 XP = 1 level, with increasing thresholds
  RETURN GREATEST(1, FLOOR(xp / 500.0) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SEED DATA: Achievements
-- ============================================
INSERT INTO public.achievements (slug, name, description, icon, rarity, xp_reward, nexus_reward, requirement_type, requirement_value) VALUES
  ('first_listing', 'First Steps', 'Create your first listing', '🌟', 'bronze', 50, 10, 'listings_count', 1),
  ('ten_listings', 'Market Maven', 'Create 10 listings', '📦', 'silver', 200, 50, 'listings_count', 10),
  ('first_trade', 'Deal Maker', 'Complete your first verified trade', '🤝', 'bronze', 100, 25, 'trades_completed', 1),
  ('ten_trades', 'Trading Veteran', 'Complete 10 verified trades', '💎', 'silver', 500, 100, 'trades_completed', 10),
  ('fifty_trades', 'Grand Exchange', 'Complete 50 verified trades', '👑', 'gold', 2000, 500, 'trades_completed', 50),
  ('first_review', 'Critic', 'Leave your first review', '⭐', 'bronze', 25, 5, 'reviews_given', 1),
  ('streak_3', 'On Fire', 'Maintain a 3-day streak', '🔥', 'bronze', 75, 15, 'streak_days', 3),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '⚡', 'silver', 200, 50, 'streak_days', 7),
  ('streak_30', 'Monthly Legend', 'Maintain a 30-day streak', '🏆', 'gold', 1000, 250, 'streak_days', 30),
  ('collector_100', 'Century Club', 'Have 100 items in your vault', '🎯', 'gold', 500, 100, 'items_collected', 100),
  ('big_spender', 'Big Spender', 'Complete a trade worth over HKD 10,000', '💰', 'platinum', 1000, 200, 'trade_value', 10000),
  ('community_pillar', 'Community Pillar', 'Get 50 followers', '🏛️', 'gold', 750, 150, 'followers', 50),
  ('deal_hunter', 'Deal Hunter', 'Find 10 deals via the aggregator', '🔍', 'silver', 300, 75, 'deals_found', 10),
  ('pokemon_master', 'Pokémon Master', 'Collect 50 Pokémon cards', '🃏', 'gold', 1000, 200, 'pokemon_cards', 50),
  ('pop_mart_fanatic', 'Pop Mart Fanatic', 'Collect 25 Pop Mart figures', '🎭', 'gold', 1000, 200, 'pop_mart_items', 25);
