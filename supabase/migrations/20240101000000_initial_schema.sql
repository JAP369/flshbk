-- =============================================================================
-- FLSHBK PLATFORM - INITIAL DATABASE SCHEMA
-- =============================================================================
-- Multi-TCG & Sealed Tracking Migration
-- Supports: Pokémon, One Piece, Yu-Gi-Oh!, Magic: The Gathering, etc.
-- =============================================================================

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- CUSTOM ENUMS
-- =============================================================================
DO $$ BEGIN CREATE TYPE item_type_enum AS ENUM ('singles','sealed_box','booster_bundle'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE allocation_side_enum AS ENUM ('left_velocity','right_vault'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE grade_enum AS ENUM ('PSA 10','PSA 9','PSA 8','BGS 10','BGS 9.5','BGS 9','CGC 10','CGC 9.5','SGC 10','Raw','Sealed','Ungraded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE price_source_enum AS ENUM ('ebay','tcgplayer','cardmarket','psa','beckett','manual','aggregator','api'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS tcg_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT, icon_url TEXT, is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tcg_category_id UUID NOT NULL REFERENCES tcg_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL, set_name TEXT NOT NULL, set_code TEXT NOT NULL, card_number TEXT,
    rarity TEXT NOT NULL, item_type item_type_enum NOT NULL DEFAULT 'singles',
    image_url TEXT, description TEXT, release_date DATE, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    grade grade_enum NOT NULL DEFAULT 'Raw', price_hkd NUMERIC(12,2) NOT NULL CHECK (price_hkd >= 0),
    price_usd NUMERIC(12,2) CHECK (price_usd >= 0), price_source price_source_enum NOT NULL DEFAULT 'manual',
    condition_notes TEXT, listing_url TEXT, is_current BOOLEAN DEFAULT true, recorded_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    purchase_price_hkd NUMERIC(12,2) NOT NULL CHECK (purchase_price_hkd >= 0),
    current_value_hkd NUMERIC(12,2), condition_grade grade_enum DEFAULT 'Raw',
    allocation_side allocation_side_enum NOT NULL DEFAULT 'right_vault',
    storage_location TEXT, notes TEXT, is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    grade grade_enum NOT NULL DEFAULT 'Raw', price_hkd NUMERIC(12,2) NOT NULL,
    price_usd NUMERIC(12,2), price_source price_source_enum NOT NULL,
    volume INTEGER, recorded_date DATE NOT NULL DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    target_price_hkd NUMERIC(12,2), alert_on_drop BOOLEAN DEFAULT true,
    alert_on_rise BOOLEAN DEFAULT false, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, catalog_item_id)
);

CREATE TABLE IF NOT EXISTS portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy','sell','trade')),
    quantity INTEGER NOT NULL, price_per_unit_hkd NUMERIC(12,2) NOT NULL,
    total_price_hkd NUMERIC(12,2) NOT NULL, counterparty_username TEXT,
    notes TEXT, transaction_date DATE NOT NULL DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tcg_slug ON tcg_categories(slug);
CREATE INDEX IF NOT EXISTS idx_cat_tcg_cat ON catalog_items(tcg_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_setcode ON catalog_items(set_code);
CREATE INDEX IF NOT EXISTS idx_cat_cardnum ON catalog_items(card_number);
CREATE INDEX IF NOT EXISTS idx_cat_type ON catalog_items(item_type);
CREATE INDEX IF NOT EXISTS idx_cat_trgm ON catalog_items USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cat_composite ON catalog_items(tcg_category_id, set_code, card_number);
CREATE INDEX IF NOT EXISTS idx_mp_item_grade ON market_prices(catalog_item_id, grade);
CREATE INDEX IF NOT EXISTS idx_mp_current ON market_prices(catalog_item_id, grade) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_up_user ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_up_item ON user_portfolio(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_up_alloc ON user_portfolio(user_id, allocation_side);
CREATE INDEX IF NOT EXISTS idx_ph_item_date ON price_history(catalog_item_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_wl_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_user ON portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_date ON portfolio_transactions(transaction_date DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_tcg_upd ON tcg_categories;    CREATE TRIGGER trg_tcg_upd BEFORE UPDATE ON tcg_categories FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
DROP TRIGGER IF EXISTS trg_cat_upd ON catalog_items;       CREATE TRIGGER trg_cat_upd BEFORE UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
DROP TRIGGER IF EXISTS trg_mp_upd ON market_prices;        CREATE TRIGGER trg_mp_upd BEFORE UPDATE ON market_prices FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
DROP TRIGGER IF EXISTS trg_up_upd ON user_portfolio;      CREATE TRIGGER trg_up_upd BEFORE UPDATE ON user_portfolio FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE OR REPLACE FUNCTION fn_current_price_flag() RETURNS TRIGGER AS $$ BEGIN UPDATE market_prices SET is_current = false WHERE catalog_item_id = NEW.catalog_item_id AND grade = NEW.grade AND id != NEW.id; NEW.is_current = true; RETURN NEW; END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_mp_curr ON market_prices; CREATE TRIGGER trg_mp_curr BEFORE INSERT ON market_prices FOR EACH ROW EXECUTE FUNCTION fn_current_price_flag();

CREATE OR REPLACE FUNCTION fn_portfolio_value() RETURNS TRIGGER AS $$ BEGIN SELECT price_hkd INTO NEW.current_value_hkd FROM market_prices WHERE catalog_item_id = NEW.catalog_item_id AND is_current = true LIMIT 1; NEW.current_value_hkd = NEW.current_value_hkd * NEW.quantity; RETURN NEW; END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_up_val ON user_portfolio; CREATE TRIGGER trg_up_val BEFORE INSERT OR UPDATE ON user_portfolio FOR EACH ROW EXECUTE FUNCTION fn_portfolio_value();

-- =============================================================================
-- VIEWS
-- =============================================================================
CREATE OR REPLACE VIEW v_current_prices AS SELECT mp.id, mp.catalog_item_id, ci.name AS item_name, ci.set_name, ci.set_code, ci.card_number, ci.rarity, ci.item_type, tc.name AS tcg_category, mp.grade, mp.price_hkd, mp.price_usd, mp.price_source, mp.recorded_at FROM market_prices mp JOIN catalog_items ci ON mp.catalog_item_id = ci.id JOIN tcg_categories tc ON ci.tcg_category_id = tc.id WHERE mp.is_current = true;
CREATE OR REPLACE VIEW v_user_portfolio AS SELECT up.id AS portfolio_id, up.user_id, up.catalog_item_id, ci.name AS item_name, ci.set_name, ci.set_code, ci.card_number, ci.rarity, ci.item_type, ci.image_url, tc.name AS tcg_category, up.quantity, up.purchase_price_hkd, up.current_value_hkd, (up.current_value_hkd - up.purchase_price_hkd*up.quantity) AS unrealized_pnl_hkd, CASE WHEN up.purchase_price_hkd > 0 THEN ((up.current_value_hkd-up.purchase_price_hkd*up.quantity)/(up.purchase_price_hkd*up.quantity))*100 ELSE 0 END AS pnl_pct, up.condition_grade, up.allocation_side, up.storage_location, up.is_favorite, up.created_at FROM user_portfolio up JOIN catalog_items ci ON up.catalog_item_id=ci.id JOIN tcg_categories tc ON ci.tcg_category_id=tc.id;

-- =============================================================================
-- RLS
-- =============================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['tcg_categories','catalog_items','market_prices','user_portfolio','watchlist','portfolio_transactions','price_history']) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "tcg_select" ON tcg_categories;       CREATE POLICY "tcg_select" ON tcg_categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "tcg_write" ON tcg_categories;        CREATE POLICY "tcg_write" ON tcg_categories FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
DROP POLICY IF EXISTS "cat_select" ON catalog_items;          CREATE POLICY "cat_select" ON catalog_items FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "cat_write" ON catalog_items;           CREATE POLICY "cat_write" ON catalog_items FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
DROP POLICY IF EXISTS "mp_select" ON market_prices;           CREATE POLICY "mp_select" ON market_prices FOR SELECT USING (true);
DROP POLICY IF EXISTS "mp_write" ON market_prices;            CREATE POLICY "mp_write" ON market_prices FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
DROP POLICY IF EXISTS "up_select" ON user_portfolio;         CREATE POLICY "up_select" ON user_portfolio FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "up_write" ON user_portfolio;          CREATE POLICY "up_write" ON user_portfolio FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wl_select" ON watchlist;              CREATE POLICY "wl_select" ON watchlist FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wl_write" ON watchlist;               CREATE POLICY "wl_write" ON watchlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "txn_select" ON portfolio_transactions; CREATE POLICY "txn_select" ON portfolio_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "txn_write" ON portfolio_transactions;  CREATE POLICY "txn_write" ON portfolio_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ph_select" ON price_history;          CREATE POLICY "ph_select" ON price_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "ph_write" ON price_history;           CREATE POLICY "ph_write" ON price_history FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
