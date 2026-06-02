import type { ProductItem } from "@/components/common/ProductCard";
import type { AggregatorListing, ItemCategory } from "@/lib/types/database";

export const MOCK_PRODUCTS: Record<string, ProductItem[]> = {
  pokemon: [
    { id: "p1", name: "Charizard VMAX Rainbow Rare", series: "Shining Fates", rarity: "secret", price: "HKD 9,500", priceChange: 15.7, verified: true, grade: "10", category: "pokemon_card", condition: "PSA 10", isDeal: true, dealScore: 85 },
    { id: "p2", name: "Pikachu V-UNION", series: "Celebrations", rarity: "rare", price: "HKD 1,100", priceChange: 9.8, category: "pokemon_card", condition: "Mint", grade: "9" },
    { id: "p3", name: "Marnie Premium Tournament Pack", series: "SWSH Black Star Promos", rarity: "chase", price: "HKD 2,800", priceChange: -5.2, verified: true, category: "pokemon_card", condition: "Unopened" },
    { id: "p4", name: "Umbreon VMAX Alt Art", series: "Evolving Skies", rarity: "secret", price: "HKD 12,000", priceChange: 22.3, verified: true, grade: "10", category: "pokemon_card", condition: "PSA 10", isDeal: true, dealScore: 72 },
    { id: "p5", name: "Rayquaza VMAX Star", series: "Evolving Skies", rarity: "ultra", price: "HKD 3,200", priceChange: 3.1, category: "pokemon_card", condition: "Near Mint" },
    { id: "p6", name: "Greninja V-UNION", series: "SWSH Black Star Promos", rarity: "rare", price: "HKD 850", priceChange: -1.5, category: "pokemon_card", condition: "Lightly Played" },
  ],
  lego: [
    { id: "l1", name: "Millennium Falcon UCS 75192", series: "Star Wars UCS", rarity: "chase", price: "HKD 7,800", priceChange: 12.5, verified: true, category: "lego", condition: "Sealed", status: "unopened", isDeal: true, dealScore: 78 },
    { id: "l2", name: "AT-AT UCS 75313", series: "Star Wars UCS", rarity: "rare", price: "HKD 6,200", priceChange: 8.3, category: "lego", condition: "Sealed", status: "unopened" },
    { id: "l3", name: "Iron Man BrickHeadz 40535", series: "Marvel BrickHeadz", rarity: "common", price: "HKD 180", priceChange: -2.1, category: "lego", condition: "New" },
    { id: "l4", name: "Captain Rex Y-Wing 75391", series: "Star Wars Microfighter", rarity: "rare", price: "HKD 220", priceChange: 45.0, category: "lego", condition: "Sealed", isDeal: true, dealScore: 92 },
    { id: "l5", name: "Thanos BrickHeadz 40536", series: "Marvel BrickHeadz", rarity: "common", price: "HKD 190", priceChange: 5.5, category: "lego", condition: "New" },
    { id: "l6", name: "Darth Vader Bust 75304", series: "Star Wars", rarity: "rare", price: "HKD 1,400", priceChange: 18.2, category: "lego", condition: "Sealed", isDeal: true, dealScore: 68 },
  ],
  hot_toys: [
    { id: "h1", name: "Iron Man Mark LXXXV", series: "Avengers: Endgame", rarity: "chase", price: "HKD 3,200", priceChange: 25.0, verified: true, category: "hot_toys", condition: "New", status: "unopened", isDeal: true, dealScore: 88 },
    { id: "h2", name: "Darth Vader MMS616", series: "Star Wars", rarity: "rare", price: "HKD 2,800", priceChange: 15.3, category: "hot_toys", condition: "New", status: "unopened" },
    { id: "h3", name: "Spider-Man Integrated Suit", series: "No Way Home", rarity: "secret", price: "HKD 2,400", priceChange: 32.1, verified: true, category: "hot_toys", condition: "New", isDeal: true, dealScore: 82 },
    { id: "h4", name: "Boba Fett MMS618", series: "Star Wars", rarity: "rare", price: "HKD 2,600", priceChange: 8.7, category: "hot_toys", condition: "New" },
    { id: "h5", name: "Batman Begins MMS700", series: "DC Comics", rarity: "ultra", price: "HKD 4,500", priceChange: -3.2, category: "hot_toys", condition: "New", status: "unopened" },
    { id: "h6", name: "Stormtrooper MMS614", series: "Star Wars", rarity: "common", price: "HKD 1,800", priceChange: 12.0, category: "hot_toys", condition: "New" },
  ],
  pop_mart: [
    { id: "pm1", name: "Labubu Macaron Series", series: "Pop Mart x How2work", rarity: "chase", price: "HKD 3,800", priceChange: 24.5, verified: true, category: "pop_mart", condition: "Unopened", status: "unopened", isDeal: true, dealScore: 75 },
    { id: "pm2", name: "Molly Zodiac Series", series: "Pop Mart x Kenny Wong", rarity: "rare", price: "HKD 1,600", priceChange: -3.2, category: "pop_mart", condition: "Opened", status: "opened" },
    { id: "pm3", name: "Dimoo Space Travel", series: "Pop Mart", rarity: "common", price: "HKD 680", priceChange: 8.1, category: "pop_mart", condition: "New" },
    { id: "pm4", name: "Skullpanda Night City", series: "Pop Mart", rarity: "secret", price: "HKD 2,200", priceChange: 18.5, category: "pop_mart", condition: "New", isDeal: true, dealScore: 70 },
    { id: "pm5", name: "Pucky Sleeping Babies", series: "Pop Mart", rarity: "common", price: "HKD 450", priceChange: -5.0, category: "pop_mart", condition: "New" },
    { id: "pm6", name: "Hirono Little Mischief", series: "Pop Mart", rarity: "rare", price: "HKD 890", priceChange: 12.3, category: "pop_mart", condition: "New" },
  ],
  hot_wheels: [
    { id: "hw1", name: "Custom Camaro Super TH", series: "Mainline", rarity: "chase", price: "HKD 380", priceChange: 55.0, verified: true, category: "hot_wheels", condition: "New", isDeal: true, dealScore: 90 },
    { id: "hw2", name: "Nissan Skyline GT-R R34", series: "Premium", rarity: "rare", price: "HKD 280", priceChange: 18.2, category: "hot_wheels", condition: "New" },
    { id: "hw3", name: "Tesla Roadster", series: "Mainline", rarity: "common", price: "HKD 45", priceChange: -2.0, category: "hot_wheels", condition: "New" },
    { id: "hw4", name: "Batmobile 1989", series: "Premium", rarity: "secret", price: "HKD 520", priceChange: 28.5, category: "hot_wheels", condition: "New", isDeal: true, dealScore: 76 },
    { id: "hw5", name: "DeLorean DMC-12", series: "Mainline", rarity: "common", price: "HKD 55", priceChange: 10.0, category: "hot_wheels", condition: "New" },
    { id: "hw6", name: "Porsche 911 GT3 RS", series: "Premium", rarity: "rare", price: "HKD 350", priceChange: 15.8, category: "hot_wheels", condition: "New" },
  ],
};

export const MOCK_AGGREGATOR_LISTINGS: AggregatorListing[] = [
  {
    id: "al1", source: "carousell", source_url: "https://www.carousell.com.hk/p/charizard-vmax", source_id: "car-001",
    title: "Charizard VMAX Rainbow Rare Shining Fates", description: "PSA 10 Gem Mint condition.",
    category: "pokemon_card", price_hkd: 9500, original_price_hkd: 12000, condition: "PSA 10",
    seller_name: "vault_rex", seller_rating: 4.8, image_url: null, location: "Mong Kok",
    is_deal: true, deal_score: 85, raw_data: {}, last_seen: new Date().toISOString(), created_at: new Date().toISOString(),
  },
  {
    id: "al2", source: "facebook", source_url: "https://www.facebook.com/marketplace/item/lego-falcon", source_id: "fb-001",
    title: "LEGO Millennium Falcon UCS 75192 - Sealed", description: "Brand new sealed. Pick up only.",
    category: "lego", price_hkd: 7800, original_price_hkd: 8500, condition: "Sealed",
    seller_name: "lego_hk_collector", seller_rating: 4.9, image_url: null, location: "Causeway Bay",
    is_deal: true, deal_score: 78, raw_data: {}, last_seen: new Date().toISOString(), created_at: new Date().toISOString(),
  },
  {
    id: "al3", source: "carousell", source_url: "https://www.carousell.com.hk/p/iron-man-ht", source_id: "car-002",
    title: "Hot Toys Iron Man Mark LXXXV Avengers Endgame", description: "New in box. All accessories included.",
    category: "hot_toys", price_hkd: 3200, original_price_hkd: 3800, condition: "New",
    seller_name: "toy_hk", seller_rating: 4.7, image_url: null, location: "Tsim Sha Tsui",
    is_deal: true, deal_score: 88, raw_data: {}, last_seen: new Date().toISOString(), created_at: new Date().toISOString(),
  },
  {
    id: "al4", source: "ebay", source_url: "https://www.ebay.com/itm/labubu-macaron", source_id: "eb-001",
    title: "Pop Mart Labubu Macaron Series - Full Set", description: "Complete set of 12 figures.",
    category: "pop_mart", price_hkd: 3800, original_price_hkd: 4500, condition: "New",
    seller_name: "popmart_hk", seller_rating: 4.6, image_url: null, location: "Hong Kong",
    is_deal: true, deal_score: 75, raw_data: {}, last_seen: new Date().toISOString(), created_at: new Date().toISOString(),
  },
  {
    id: "al5", source: "carousell", source_url: "https://www.carousell.com.hk/p/camaro-th", source_id: "car-003",
    title: "Hot Wheels Custom Camaro Super Treasure Hunt", description: "Super TH, never opened.",
    category: "hot_wheels", price_hkd: 380, original_price_hkd: 600, condition: "New",
    seller_name: "diecast_hk", seller_rating: 4.5, image_url: null, location: "Kowloon",
    is_deal: true, deal_score: 90, raw_data: {}, last_seen: new Date().toISOString(), created_at: new Date().toISOString(),
  },
];

export function getMockProducts(category: string): ProductItem[] {
  return MOCK_PRODUCTS[category] || [];
}

export function getMockAggregatorListings(category?: string): AggregatorListing[] {
  if (!category) return MOCK_AGGREGATOR_LISTINGS;
  const categoryMap: Record<string, ItemCategory> = {
    pokemon: "pokemon_card",
    pokemon_card: "pokemon_card",
    lego: "lego",
    hot_toys: "hot_toys",
    hottoys: "hot_toys",
    pop_mart: "pop_mart",
    popmart: "pop_mart",
    hot_wheels: "hot_wheels",
    hotwheels: "hot_wheels",
  };
  const dbCategory = categoryMap[category];
  if (!dbCategory) return [];
  return MOCK_AGGREGATOR_LISTINGS.filter((l) => l.category === dbCategory);
}

export function getMockDeals(limit = 20): AggregatorListing[] {
  return MOCK_AGGREGATOR_LISTINGS.filter((l) => l.is_deal).slice(0, limit);
}
