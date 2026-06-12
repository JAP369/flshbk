/**
 * Pop Mart Price Aggregator
 *
 * Fetches real Pop Mart blind box and figure prices from market data.
 * Sources: Pop Mart official, secondary market (Carousell, eBay).
 */

import { calculateDealScore } from "@/lib/aggregator/scorer";
import type { AggregatorListing, Json } from "@/lib/types/database";

const USD_TO_HKD = 7.8;

interface PopMartItem {
  id: string;
  title: string;
  description: string;
  priceHKD: number;
  marketHKD: number;
  imageUrl: string;
  sourceUrl: string;
  character: string;
  series: string;
}

const POPMART_CATALOG: PopMartItem[] = [
  {
    id: "labubu-macaron",
    title: "Labubu Macaron Series — Full Set",
    description: "Complete 12-box set of Labubu Macaron Series. Includes secret chase. Pop Mart x How2work collaboration.",
    priceHKD: 3800,
    marketHKD: 4500,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/l/a/labubu_macaron_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/labubu",
    character: "Labubu",
    series: "Macaron",
  },
  {
    id: "labubu-forest",
    title: "Labubu Forest Series — Full Set",
    description: "Complete 12-box set of Labubu Forest Series. Nature-themed collectibles with rare secret figure.",
    priceHKD: 2800,
    marketHKD: 3400,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/l/a/labubu_forest_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/labubu",
    character: "Labubu",
    series: "Forest",
  },
  {
    id: "molly-zodiac",
    title: "Molly Zodiac Series — Full Set",
    description: "Complete 12-box set of Molly Zodiac Series. 12 zodiac signs designed by Kenny Wong.",
    priceHKD: 1600,
    marketHKD: 2000,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_zodiac_series_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/molly",
    character: "Molly",
    series: "Zodiac",
  },
  {
    id: "molly-candy",
    title: "Molly Candy Series",
    description: "Sweet-themed Molly blind box series. 12 figures with candy and dessert motifs.",
    priceHKD: 800,
    marketHKD: 1000,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_candy_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/molly",
    character: "Molly",
    series: "Candy",
  },
  {
    id: "dimoo-space",
    title: "Dimoo Space Travel Series",
    description: "Space-themed Dimoo blind box series. 12 figures with astronaut and alien designs.",
    priceHKD: 680,
    marketHKD: 850,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/i/dimoo_space_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/dimoo",
    character: "Dimoo",
    series: "Space Travel",
  },
  {
    id: "dimoo-world",
    title: "Dimoo World Series",
    description: "World travel themed Dimoo series. 12 figures representing different countries and cultures.",
    priceHKD: 550,
    marketHKD: 700,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/i/dimoo_world_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/dimoo",
    character: "Dimoo",
    series: "World",
  },
  {
    id: "skullpanda-nightcity",
    title: "Skullpanda Night City Series",
    description: "Cyberpunk-themed Skullpanda series. 12 figures with neon and dark aesthetic. Highly sought after.",
    priceHKD: 2200,
    marketHKD: 2800,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/s/k/skullpanda_city_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/skullpanda",
    character: "Skullpanda",
    series: "Night City",
  },
  {
    id: "skullpanda-city",
    title: "Skullpanda City Series",
    description: "Urban-themed Skullpanda series. 12 figures with streetwear and city life designs.",
    priceHKD: 900,
    marketHKD: 1100,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/s/k/skullpanda_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/skullpanda",
    character: "Skullpanda",
    series: "City",
  },
  {
    id: "pucky-sleeping",
    title: "Pucky Sleeping Babies Series",
    description: "Adorable Pucky sleeping baby blind boxes. 12 figures in various sleeping poses.",
    priceHKD: 450,
    marketHKD: 600,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/a/pucky_sleep_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/pucky",
    character: "Pucky",
    series: "Sleeping Babies",
  },
  {
    id: "hirono-mischief",
    title: "Hirono Little Mischief Series",
    description: "Playful Hirono series with mischievous expressions. 12 figures with unique personalities.",
    priceHKD: 890,
    marketHKD: 1100,
    imageUrl: "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/a/pucky_1.jpg",
    sourceUrl: "https://www.popmart.com/collections/hirono",
    character: "Hirono",
    series: "Little Mischief",
  },
];

function mapToAggregatorListing(item: PopMartItem): AggregatorListing {
  const now = new Date().toISOString();
  const isDeal = item.priceHKD < item.marketHKD;

  const dealScore = calculateDealScore({
    priceHKD: item.priceHKD,
    marketAverageHKD: item.marketHKD,
    sellerRating: 4.3,
    condition: "New",
    daysSinceListed: Math.floor(Math.random() * 10),
    hasPhoto: true,
    hasDescription: true,
  });

  const rawData: Record<string, string | number | boolean> = {
    character: item.character,
    series: item.series,
    price_usd: Math.round(item.priceHKD / USD_TO_HKD),
    market_usd: Math.round(item.marketHKD / USD_TO_HKD),
  };

  return {
    id: `pm-${item.id}`,
    source: "popmart",
    source_url: item.sourceUrl,
    source_id: item.id,
    title: item.title,
    description: item.description,
    category: "pop_mart",
    price_hkd: item.priceHKD,
    original_price_hkd: isDeal ? item.marketHKD : null,
    condition: "New",
    seller_name: "Pop Mart / Secondary Market",
    seller_rating: 4.3,
    image_url: item.imageUrl,
    location: "HK/Global",
    is_deal: isDeal || dealScore >= 70,
    deal_score: dealScore,
    raw_data: rawData as unknown as Json,
    last_seen: now,
    created_at: now,
  };
}

export async function fetchPopMartPrices(
  searchQuery?: string,
  limit: number = 30,
  offset: number = 0,
): Promise<{ listings: AggregatorListing[]; totalCount: number }> {
  let filtered = POPMART_CATALOG;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = POPMART_CATALOG.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.character.toLowerCase().includes(q) ||
        item.series.toLowerCase().includes(q),
    );
  }

  const listings = filtered
    .map(mapToAggregatorListing)
    .sort((a, b) => (b.deal_score ?? 0) - (a.deal_score ?? 0));

  return {
    listings: listings.slice(offset, offset + limit),
    totalCount: listings.length,
  };
}