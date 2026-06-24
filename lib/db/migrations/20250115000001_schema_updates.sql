-- =============================================================================
-- FlashBK Schema Migration: Catalog & Sales History Updates
-- Created: 2025-01-15
-- Description: 
--   1. Add is_official_tcg and release_year to catalog_items
--   2. Create sales_history table with transaction_type enum
--   3. Add composite indexes for fast filtering
--   4. Enable Row-Level Security (RLS) on all user-facing tables
-- =============================================================================

-- =============================================================================
-- STEP 1: Update catalog_items table
-- =============================================================================

-- Add new columns
ALTER TABLE catalog_items
  ADD COLUMN IF NOT EXISTS is_official_tcg BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS release_year INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN catalog_items.is_official_tcg IS 'Flag indicating if item is an official TCG product (vs custom/proxy)';
COMMENT ON COLUMN catalog_items.release_year IS 'Year the item was originally released';

-- Add check constraint for valid release years
ALTER TABLE catalog_items
  DROP CONSTRAINT IF EXISTS chk_release_year_valid;

ALTER TABLE catalog_items
  ADD CONSTRAINT chk_release_year_valid
  CHECK (release_year IS NULL OR (release_year >= 1996 AND release_year <= EXTRACT(YEAR FROM NOW()) + 1));

-- =============================================================================
-- STEP 2: Create transaction_type enum
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
    CREATE TYPE transaction_type_enum AS ENUM ('auction', 'fixed_price', 'best_offer');
  END IF;
END
$$;

COMMENT ON TYPE transaction_type_enum IS 'Types of sales transactions in the secondary market';

-- =============================================================================
-- STEP 3: Create sales_history table
-- =============================================================================

CREATE TABLE IF NOT EXISTS sales_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  price_hkd NUMERIC(12, 2) NOT NULL CHECK (price_hkd >= 0),
  platform TEXT NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type transaction_type_enum NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE sales_history IS 'Historical sales data for catalog items across platforms';
COMMENT ON COLUMN sales_history.id IS 'Unique identifier for the sale record';
COMMENT ON COLUMN sales_history.catalog_item_id IS 'Reference to the catalog item';
COMMENT ON COLUMN sales_history.price_hkd IS 'Sale price in Hong Kong Dollars';
COMMENT ON COLUMN sales_history.platform IS 'Platform where the sale occurred (e.g., eBay, Carousell, TCGPlayer)';
COMMENT ON COLUMN sales_history.sale_date IS 'Date the sale was completed';
COMMENT ON COLUMN sales_history.transaction_type IS 'Type of transaction: auction, fixed_price, or best_offer';

-- =============================================================================
-- STEP 4: Create indexes for performance
-- =============================================================================

-- Functional index on catalog_items.set_code for fast filtering
CREATE INDEX IF NOT EXISTS idx_catalog_items_set_code
  ON catalog_items (set_code)
  WHERE set_code IS NOT NULL;

-- Functional index on catalog_items.is_official_tcg for fast filtering
CREATE INDEX IF NOT EXISTS idx_catalog_items_is_official_tcg
  ON catalog_items (is_official_tcg)
  WHERE is_official_tcg IS NOT NULL;

-- Composite index for combined filtering (set_code + is_official_tcg)
CREATE INDEX IF NOT EXISTS idx_catalog_items_set_code_official
  ON catalog_items (set_code, is_official_tcg)
  WHERE set_code IS NOT NULL AND is_official_tcg IS NOT NULL;

-- Index on catalog_items.release_year for year-based queries
CREATE INDEX IF NOT EXISTS idx_catalog_items_release_year
  ON catalog_items (release_year)
  WHERE release_year IS NOT NULL;

-- Indexes for sales_history
CREATE INDEX IF NOT EXISTS idx_sales_history_catalog_item_id
  ON sales_history (catalog_item_id);

CREATE INDEX IF NOT EXISTS idx_sales_history_sale_date
  ON sales_history (sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_history_platform
  ON sales_history (platform);

CREATE INDEX IF NOT EXISTS idx_sales_history_transaction_type
  ON sales_history (transaction_type);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_sales_history_item_date_type
  ON sales_history (catalog_item_id, sale_date DESC, transaction_type);

-- =============================================================================
-- STEP 5: Enable Row-Level Security (RLS) on all user-facing tables
-- =============================================================================

-- Enable RLS on catalog_items
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sales_history
ALTER TABLE sales_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 6: Create RLS Policies for catalog_items
-- =============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "catalog_items_select_all" ON catalog_items;
DROP POLICY IF EXISTS "catalog_items_insert_authenticated" ON catalog_items;
DROP POLICY IF EXISTS "catalog_items_update_owner" ON catalog_items;
DROP POLICY IF EXISTS "catalog_items_delete_owner" ON catalog_items;

-- Allow anyone to read catalog items (public catalog)
CREATE POLICY "catalog_items_select_all"
  ON catalog_items
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert catalog items
CREATE POLICY "catalog_items_insert_authenticated"
  ON catalog_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update catalog items they created
CREATE POLICY "catalog_items_update_owner"
  ON catalog_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete catalog items they created
CREATE POLICY "catalog_items_delete_owner"
  ON catalog_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- =============================================================================
-- STEP 7: Create RLS Policies for sales_history
-- =============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "sales_history_select_all" ON sales_history;
DROP POLICY IF EXISTS "sales_history_insert_authenticated" ON sales_history;
DROP POLICY IF EXISTS "sales_history_update_owner" ON sales_history;
DROP POLICY IF EXISTS "sales_history_delete_owner" ON sales_history;

-- Allow anyone to read sales history (public market data)
CREATE POLICY "sales_history_select_all"
  ON sales_history
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert sales records
CREATE POLICY "sales_history_insert_authenticated"
  ON sales_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update sales records they created
CREATE POLICY "sales_history_update_owner"
  ON sales_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete sales records they created
CREATE POLICY "sales_history_delete_owner"
  ON sales_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- =============================================================================
-- STEP 8: Enable RLS on other existing tables (if they exist)
-- =============================================================================

-- Enable RLS on portfolio_assets (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_assets') THEN
    ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "portfolio_assets_select_owner" ON portfolio_assets;
    DROP POLICY IF EXISTS "portfolio_assets_insert_authenticated" ON portfolio_assets;
    DROP POLICY IF EXISTS "portfolio_assets_update_owner" ON portfolio_assets;
    DROP POLICY IF EXISTS "portfolio_assets_delete_owner" ON portfolio_assets;
    
    CREATE POLICY "portfolio_assets_select_owner"
      ON portfolio_assets
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    CREATE POLICY "portfolio_assets_insert_authenticated"
      ON portfolio_assets
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "portfolio_assets_update_owner"
      ON portfolio_assets
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "portfolio_assets_delete_owner"
      ON portfolio_assets
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Enable RLS on user_portfolios (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_portfolios') THEN
    ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "user_portfolios_select_owner" ON user_portfolios;
    DROP POLICY IF EXISTS "user_portfolios_insert_authenticated" ON user_portfolios;
    DROP POLICY IF EXISTS "user_portfolios_update_owner" ON user_portfolios;
    DROP POLICY IF EXISTS "user_portfolios_delete_owner" ON user_portfolios;
    
    CREATE POLICY "user_portfolios_select_owner"
      ON user_portfolios
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    CREATE POLICY "user_portfolios_insert_authenticated"
      ON user_portfolios
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "user_portfolios_update_owner"
      ON user_portfolios
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "user_portfolios_delete_owner"
      ON user_portfolios
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Enable RLS on listings (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "listings_select_all" ON listings;
    DROP POLICY IF EXISTS "listings_insert_authenticated" ON listings;
    DROP POLICY IF EXISTS "listings_update_owner" ON listings;
    DROP POLICY IF EXISTS "listings_delete_owner" ON listings;
    
    CREATE POLICY "listings_select_all"
      ON listings
      FOR SELECT
      USING (true);
    
    CREATE POLICY "listings_insert_authenticated"
      ON listings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
    
    CREATE POLICY "listings_update_owner"
      ON listings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = seller_id)
      WITH CHECK (auth.uid() = seller_id);
    
    CREATE POLICY "listings_delete_owner"
      ON listings
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END
$$;

-- Enable RLS on trades (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades') THEN
    ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "trades_select_participants" ON trades;
    DROP POLICY IF EXISTS "trades_insert_authenticated" ON trades;
    DROP POLICY IF EXISTS "trades_update_participants" ON trades;
    
    CREATE POLICY "trades_select_participants"
      ON trades
      FOR SELECT
      TO authenticated
      USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);
    
    CREATE POLICY "trades_insert_authenticated"
      ON trades
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = initiator_id);
    
    CREATE POLICY "trades_update_participants"
      ON trades
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = initiator_id OR auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = initiator_id OR auth.uid() = receiver_id);
  END IF;
END
$$;

-- =============================================================================
-- STEP 9: Create updated_at trigger function (if not exists)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sales_history
DROP TRIGGER IF EXISTS trg_sales_history_updated_at ON sales_history;
CREATE TRIGGER trg_sales_history_updated_at
  BEFORE UPDATE ON sales_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 10: Create views for common queries
-- =============================================================================

-- View: Sales summary by catalog item
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT
  sh.catalog_item_id,
  ci.name AS item_name,
  ci.set_code,
  ci.is_official_tcg,
  COUNT(*) AS total_sales,
  MIN(sh.price_hkd) AS min_price_hkd,
  MAX(sh.price_hkd) AS max_price_hkd,
  AVG(sh.price_hkd) AS avg_price_hkd,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sh.price_hkd) AS median_price_hkd,
  MAX(sh.sale_date) AS last_sale_date
FROM sales_history sh
JOIN catalog_items ci ON ci.id = sh.catalog_item_id
GROUP BY sh.catalog_item_id, ci.name, ci.set_code, ci.is_official_tcg;

COMMENT ON VIEW v_sales_summary IS 'Aggregated sales statistics per catalog item';

-- View: Recent sales with item details
CREATE OR REPLACE VIEW v_recent_sales AS
SELECT
  sh.id,
  sh.catalog_item_id,
  ci.name AS item_name,
  ci.set_code,
  ci.release_year,
  sh.price_hkd,
  sh.platform,
  sh.sale_date,
  sh.transaction_type,
  sh.created_at
FROM sales_history sh
JOIN catalog_items ci ON ci.id = sh.catalog_item_id
ORDER BY sh.sale_date DESC, sh.created_at DESC;

COMMENT ON VIEW v_recent_sales IS 'Recent sales with catalog item details';

-- =============================================================================
-- VERIFICATION: Check migration results
-- =============================================================================

-- Verify catalog_items columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'catalog_items'
ORDER BY ordinal_position;

-- Verify sales_history table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sales_history'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('catalog_items', 'sales_history')
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN ('catalog_items', 'sales_history', 'portfolio_assets', 'user_portfolios', 'listings', 'trades')
  AND relkind = 'r';

-- Verify policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('catalog_items', 'sales_history')
ORDER BY tablename, policyname;
