import { NextResponse, type NextRequest } from "next/server";

// =============================================================================
// TYPES
// =============================================================================

interface CarousellListing {
  id: string;
  title: string;
  seller_name: string;
  seller_rating: number | null;
  listing_age: string;
  asking_price_hkd: number;
  condition: string;
  image_url: string | null;
  listing_url: string;
  location: string;
  category: string;
  market_price_hkd: number;
  market_grade: string;
}

// =============================================================================
// MOCK DATA - Simulating Carousell HK scrape results
// =============================================================================

const MOCK_CAROUSELL_LISTINGS: CarousellListing[] = [
  {
    id: "car-001",
    title: "Pokemon Charizard ex 25th Anniversary PSA 10",
    seller_name: "cardmaster_hk",
    seller_rating: 4.8,
    listing_age: "2 hours ago",
    asking_price_hkd: 6800,
    condition: "PSA 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-001",
    location: "Mong Kok",
    category: "pokemon_card",
    market_price_hkd: 8500,
    market_grade: "PSA 10",
  },
  {
    id: "car-002",
    title: "Pokemon Umbreon VMAX Alt Art PSA 10",
    seller_name: "pokemon_lover_99",
    seller_rating: 4.5,
    listing_age: "5 hours ago",
    asking_price_hkd: 12000,
    condition: "PSA 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-002",
    location: "Causeway Bay",
    category: "pokemon_card",
    market_price_hkd: 15000,
    market_grade: "PSA 10",
  },
  {
    id: "car-003",
    title: "Pokemon 151 Booster Box Sealed (Simplified Chinese)",
    seller_name: "tcg_collector_hk",
    seller_rating: 4.2,
    listing_age: "1 day ago",
    asking_price_hkd: 1100,
    condition: "Sealed",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-003",
    location: "Sha Tin",
    category: "pokemon_card",
    market_price_hkd: 1500,
    market_grade: "Sealed",
  },
  {
    id: "car-004",
    title: "Yu-Gi-Oh! Blue-Eyes White Dragon LOB-001 BGS 10",
    seller_name: "yugioh_veteran",
    seller_rating: 4.9,
    listing_age: "3 hours ago",
    asking_price_hkd: 22000,
    condition: "BGS 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-004",
    location: "Tsim Sha Tsui",
    category: "pokemon_card",
    market_price_hkd: 25000,
    market_grade: "BGS 10",
  },
  {
    id: "car-005",
    title: "One Piece Card Game Luffy OP01-001 Leader PSA 10",
    seller_name: "opcg_fan_hk",
    seller_rating: 4.6,
    listing_age: "8 hours ago",
    asking_price_hkd: 14500,
    condition: "PSA 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-005",
    location: "Kwun Tong",
    category: "pokemon_card",
    market_price_hkd: 15000,
    market_grade: "PSA 10",
  },
  {
    id: "car-006",
    title: "Pokemon Evolving Skies Booster Box Sealed",
    seller_name: "sealed_investor",
    seller_rating: 4.7,
    listing_age: "12 hours ago",
    asking_price_hkd: 3200,
    condition: "Sealed",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-006",
    location: "Central",
    category: "pokemon_card",
    market_price_hkd: 4000,
    market_grade: "Sealed",
  },
  {
    id: "car-007",
    title: "Pokemon Miraidon ex SAR PSA 10",
    seller_name: "modern_collector",
    seller_rating: 4.4,
    listing_age: "6 hours ago",
    asking_price_hkd: 5500,
    condition: "PSA 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-007",
    location: "Tai Wai",
    category: "pokemon_card",
    market_price_hkd: 6800,
    market_grade: "PSA 10",
  },
  {
    id: "car-008",
    title: "Pokemon Mewtwo GX Hidden Fates BGS 9.5",
    seller_name: "vintage_tcg_hk",
    seller_rating: 4.3,
    listing_age: "2 days ago",
    asking_price_hkd: 2400,
    condition: "BGS 9.5",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-008",
    location: "Tsuen Wan",
    category: "pokemon_card",
    market_price_hkd: 2800,
    market_grade: "BGS 9.5",
  },
  {
    id: "car-009",
    title: "Pokemon Shiny Treasure Booster Box Sealed",
    seller_name: "hunter_hk",
    seller_rating: 4.1,
    listing_age: "4 hours ago",
    asking_price_hkd: 750,
    condition: "Sealed",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-009",
    location: "Yuen Long",
    category: "pokemon_card",
    market_price_hkd: 950,
    market_grade: "Sealed",
  },
  {
    id: "car-010",
    title: "Pokemon Pikachu Base Set Shadowless Raw",
    seller_name: "budget_collector",
    seller_rating: 3.9,
    listing_age: "1 day ago",
    asking_price_hkd: 80,
    condition: "Raw",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-010",
    location: "Fanling",
    category: "pokemon_card",
    market_price_hkd: 120,
    market_grade: "Raw",
  },
  {
    id: "car-011",
    title: "Pokemon Charizard VMAX Rainbow Rare PSA 10",
    seller_name: "premium_cards_hk",
    seller_rating: 5.0,
    listing_age: "1 hour ago",
    asking_price_hkd: 18000,
    condition: "PSA 10",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-011",
    location: "Repulse Bay",
    category: "pokemon_card",
    market_price_hkd: 22000,
    market_grade: "PSA 10",
  },
  {
    id: "car-012",
    title: "Pokemon Paldea Evolved Booster Box Sealed",
    seller_name: "box_collector_hk",
    seller_rating: 4.5,
    listing_age: "9 hours ago",
    asking_price_hkd: 680,
    condition: "Sealed",
    image_url: null,
    listing_url: "https://carousell.com.hk/p/car-012",
    location: "Ma On Shan",
    category: "pokemon_card",
    market_price_hkd: 850,
    market_grade: "Sealed",
  },
];

// =============================================================================
// API HANDLER
// =============================================================================

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const search = params.get("search") || undefined;
  const category = params.get("category") || undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const sortBy = params.get("sortBy") || "margin_desc";
  const limit = params.get("limit") ? Number(params.get("limit")) : 50;

  let filtered = [...MOCK_CAROUSELL_LISTINGS];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(searchLower) ||
        l.seller_name.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (category) {
    filtered = filtered.filter((l) => l.category === category);
  }

  // Apply price filters
  if (minPrice !== undefined) {
    filtered = filtered.filter((l) => l.asking_price_hkd >= minPrice);
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter((l) => l.asking_price_hkd <= maxPrice);
  }

  // Sort results
  switch (sortBy) {
    case "price_asc":
      filtered.sort((a, b) => a.asking_price_hkd - b.asking_price_hkd);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.asking_price_hkd - a.asking_price_hkd);
      break;
    case "margin_desc":
      filtered.sort((a, b) => {
        const marginA = ((a.market_price_hkd - a.asking_price_hkd) / a.market_price_hkd) * 100;
        const marginB = ((b.market_price_hkd - b.asking_price_hkd) / b.market_price_hkd) * 100;
        return marginB - marginA;
      });
      break;
    case "margin_asc":
      filtered.sort((a, b) => {
        const marginA = ((a.market_price_hkd - a.asking_price_hkd) / a.market_price_hkd) * 100;
        const marginB = ((b.market_price_hkd - b.asking_price_hkd) / b.market_price_hkd) * 100;
        return marginA - marginB;
      });
      break;
    case "newest":
      // Already in mock order
      break;
    default:
      // Default: sort by margin descending
      filtered.sort((a, b) => {
        const marginA = ((a.market_price_hkd - a.asking_price_hkd) / a.market_price_hkd) * 100;
        const marginB = ((b.market_price_hkd - b.asking_price_hkd) / b.market_price_hkd) * 100;
        return marginB - marginA;
      });
  }

  // Apply limit
  const results = filtered.slice(0, limit);

  return NextResponse.json({
    data: results,
    total: results.length,
    source: "carousell_hk_scraper",
    timestamp: new Date().toISOString(),
  });
}
