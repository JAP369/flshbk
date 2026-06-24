// =============================================================================
// PORTFOLIO SEEDING SCRIPT
// =============================================================================
// This script seeds the user_portfolio table with verified assets.
// It can be run locally to verify entries before production deployment.
//
// Usage:
//   npx tsx scripts/seed-portfolio.ts
//   or via the API endpoint: POST /api/portfolio/seed
// =============================================================================

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// =============================================================================
// TYPES
// =============================================================================

interface SeedAsset {
  name: string;
  grade: "PSA 10" | "PSA 9" | "PSA 8" | "BGS 10" | "BGS 9.5" | "BGS 9" | "CGC 10" | "CGC 9.5" | "SGC 10" | "Raw" | "Sealed" | "Ungraded";
  status: "active" | "vaulted" | "pending" | "sealed";
  allocation: "left_velocity" | "right_vault";
  valuationHkd: number;
  quantity?: number;
  purchasePriceHkd?: number;
}

interface SeedAssetData extends SeedAsset {
  catalog_item_id: string;
  user_id: string;
  id?: string;
  updated?: boolean;
}

interface SeedResult {
  success: boolean;
  message: string;
  data?: SeedAssetData;
  error?: string;
}

// =============================================================================
// SEED DATA - Verified Portfolio Assets
// =============================================================================

export const SEED_ASSETS: SeedAsset[] = [
  {
    name: "Gengar 6 of Spades (1996 Playing Card)",
    grade: "PSA 10",
    status: "vaulted",
    allocation: "right_vault",
    valuationHkd: 5500,
    quantity: 1,
    purchasePriceHkd: 4200,
  },
  {
    name: "Charizard V Shiny Star V (307/190)",
    grade: "PSA 10",
    status: "sealed",
    allocation: "left_velocity",
    valuationHkd: 1500,
    quantity: 1,
    purchasePriceHkd: 1200,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find or create a catalog item by name and set code
 */
async function findOrCreateCatalogItem(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  asset: SeedAsset
): Promise<{ id: string; isNew: boolean }> {
  // Try to find existing item by name
  const { data: existing, error: findError } = await supabase
    .from("catalog_items")
    .select("id")
    .ilike("name", `%${asset.name}%`)
    .maybeSingle();

  if (findError) {
    console.warn(`Warning searching for "${asset.name}":`, findError.message);
  }

  if (existing) {
    return { id: existing.id, isNew: false };
  }

  // Create new catalog item
  // First, ensure we have a TCG category (Pokémon)
  const { data: category } = await supabase
    .from("tcg_categories")
    .select("id")
    .eq("slug", "pokemon")
    .maybeSingle();

  const categoryId = category?.id || await createDefaultCategory(supabase);

  const { data: newItem, error: createError } = await supabase
    .from("catalog_items")
    .insert({
      tcg_category_id: categoryId,
      name: asset.name,
      set_name: extractSetName(asset.name),
      set_code: extractSetCode(asset.name),
      rarity: extractRarity(asset.name),
      item_type: asset.grade === "Sealed" ? "sealed_box" : "singles",
      is_active: true,
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(`Failed to create catalog item: ${createError.message}`);
  }

  return { id: newItem.id, isNew: true };
}

/**
 * Create a default Pokémon category if none exists
 */
async function createDefaultCategory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<string> {
  const { data: newCat, error } = await supabase
    .from("tcg_categories")
    .insert({
      name: "Pokémon",
      slug: "pokemon",
      description: "Pokémon Trading Card Game",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return newCat.id;
}

/**
 * Extract set name from asset name
 */
function extractSetName(name: string): string {
  // Handle specific cases
  if (name.includes("1996 Playing Card")) return "1996 Playing Cards";
  if (name.includes("Shiny Star")) return "Shiny Star";
  return "Unknown Set";
}

/**
 * Extract set code from asset name
 */
function extractSetCode(name: string): string {
  if (name.includes("1996 Playing Card")) return "PC1";
  if (name.includes("Shiny Star")) return "SVS";
  return "UNK";
}

/**
 * Extract rarity from asset name
 */
function extractRarity(name: string): string {
  if (name.includes("6 of Spades")) return "Rare Holo";
  if (name.includes("Shiny Star")) return "Secret Rare";
  return "Rare";
}

/**
 * Find or create market price for catalog item
 */
async function findOrCreateMarketPrice(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  catalogItemId: string,
  asset: SeedAsset
): Promise<void> {
  // Check for existing current price
  const { data: existingPrice } = await supabase
    .from("market_prices")
    .select("id")
    .eq("catalog_item_id", catalogItemId)
    .eq("grade", asset.grade)
    .eq("is_current", true)
    .maybeSingle();

  if (existingPrice) {
    return; // Price already exists
  }

  // Create new market price
  const { error } = await supabase
    .from("market_prices")
    .insert({
      catalog_item_id: catalogItemId,
      grade: asset.grade,
      price_hkd: asset.valuationHkd,
      price_source: "manual",
      is_current: true,
      condition_notes: `${asset.status} - ${asset.allocation}`,
    });

  if (error) {
    throw new Error(`Failed to create market price: ${error.message}`);
  }
}

/**
 * Insert a single asset into user_portfolio
 */
export async function insertPortfolioAsset(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  asset: SeedAsset,
  userId: string
): Promise<SeedResult> {
  try {
    // Step 1: Find or create catalog item
    const { id: catalogItemId, isNew: isNewCatalogItem } = await findOrCreateCatalogItem(supabase, asset);
    console.log(`  ${isNewCatalogItem ? "✓ Created" : "→ Found"} catalog item: ${asset.name}`);

    // Step 2: Find or create market price
    await findOrCreateMarketPrice(supabase, catalogItemId, asset);
    console.log(`  ✓ Market price verified: ${asset.grade} @ HKD ${asset.valuationHkd}`);

    // Step 3: Check for existing portfolio entry
    const { data: existingEntry } = await supabase
      .from("user_portfolio")
      .select("id")
      .eq("user_id", userId)
      .eq("catalog_item_id", catalogItemId)
      .eq("condition_grade", asset.grade)
      .maybeSingle();

    if (existingEntry) {
      // Update existing entry
      const { error: updateError } = await supabase
        .from("user_portfolio")
        .update({
          quantity: asset.quantity || 1,
          purchase_price_hkd: asset.purchasePriceHkd || asset.valuationHkd,
          condition_grade: asset.grade,
          allocation_side: asset.allocation,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEntry.id);

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }

      return {
        success: true,
        message: `Updated existing entry for "${asset.name}" (${asset.grade})`,
        data: { ...asset, catalog_item_id: catalogItemId, user_id: userId, updated: true },
      };
    }

    // Step 4: Insert new portfolio entry
    const { error: insertError, data: newEntry } = await supabase
      .from("user_portfolio")
      .insert({
        user_id: userId,
        catalog_item_id: catalogItemId,
        quantity: asset.quantity || 1,
        purchase_price_hkd: asset.purchasePriceHkd || asset.valuationHkd,
        condition_grade: asset.grade,
        allocation_side: asset.allocation,
        storage_location: asset.allocation === "right_vault" ? "Home Vault" : "Active Collection",
        notes: `Status: ${asset.status}`,
        is_favorite: false,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    return {
      success: true,
      message: `Inserted "${asset.name}" (${asset.grade}) into portfolio`,
      data: { ...asset, catalog_item_id: catalogItemId, user_id: userId, id: newEntry.id },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Failed to seed "${asset.name}"`,
      error: errorMessage,
    };
  }
}

/**
 * Main seed function - Seeds all assets into user_portfolio
 */
export async function seedUserPortfolio(userId?: string): Promise<{
  totalAttempted: number;
  totalSuccess: number;
  totalFailed: number;
  results: SeedResult[];
}> {
  console.log("=" .repeat(60));
  console.log("🌱 PORTFOLIO SEEDING SCRIPT");
  console.log("=" .repeat(60));
  console.log();

  // Initialize Supabase client
  const supabase = await createSupabaseServerClient();

  // If no userId provided, look for a test user
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .order("created_at", { ascending: true });

    if (users && users.length > 0) {
      targetUserId = users[0].id;
      console.log(`ℹ No userId provided, using first user: ${targetUserId}`);
    } else {
      // Create a test user for local development
      console.log("ℹ No users found, creating test user...");
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: `test-${Date.now()}@flashbk.local`,
        password: "test-password-123",
        email_confirm: true,
      });

      if (error || !newUser) {
        console.error("❌ Failed to create test user:", error?.message);
        return {
          totalAttempted: SEED_ASSETS.length,
          totalSuccess: 0,
          totalFailed: SEED_ASSETS.length,
          results: SEED_ASSETS.map((asset) => ({
            success: false,
            message: `Failed: No user available`,
            error: "No user ID available and failed to create test user",
          })),
        };
      }

      targetUserId = newUser.user.id;
      console.log(`✓ Created test user: ${targetUserId}`);
    }
  }

  // Ensure we have a valid user ID
  if (!targetUserId) {
    console.error("❌ Unable to determine target user ID");
    return {
      totalAttempted: SEED_ASSETS.length,
      totalSuccess: 0,
      totalFailed: SEED_ASSETS.length,
      results: SEED_ASSETS.map((asset) => ({
        success: false,
        message: `Failed: No user available`,
        error: "No user ID available",
      })),
    };
  }

  console.log(`👤 Target user: ${targetUserId}`);
  console.log(`📦 Assets to seed: ${SEED_ASSETS.length}`);
  console.log("-" .repeat(60));

  const results: SeedResult[] = [];

  for (const asset of SEED_ASSETS) {
    console.log(`\n🔄 Processing: ${asset.name}`);
    const result = await insertPortfolioAsset(supabase, asset, targetUserId);
    results.push(result);

    if (result.success) {
      console.log(`  ${result.success ? "✓" : "✗"} ${result.message}`);
    } else {
      console.error(`  ✗ ${result.message}: ${result.error}`);
    }
  }

  console.log("\n" + "=" .repeat(60));
  console.log("📊 SEED SUMMARY");
  console.log("=" .repeat(60));

  const totalSuccess = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  console.log(`  Total attempted: ${SEED_ASSETS.length}`);
  console.log(`  ✓ Successful: ${totalSuccess}`);
  console.log(`  ✗ Failed: ${totalFailed}`);
  console.log("=" .repeat(60));

  return {
    totalAttempted: SEED_ASSETS.length,
    totalSuccess,
    totalFailed,
    results,
  };
}

// =============================================================================
// STANDALONE EXECUTION
// =============================================================================

if (require.main === module) {
  seedUserPortfolio()
    .then((result) => {
      console.log("\n✅ Seeding complete");
      process.exit(result.totalFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding failed:", error);
      process.exit(1);
    });
}
