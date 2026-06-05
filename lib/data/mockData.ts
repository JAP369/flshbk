import type { ProductItem } from "@/components/common/ProductCard";
import type { AggregatorListing, ItemCategory } from "@/lib/types/database";

function generateImageUrl(title: string, category: ItemCategory, index: number): string {
  const lowerTitle = title.toLowerCase();

  if (category === "pokemon_card") {
    const cardMap: Record<string, string> = {
      "charizard": "swsh4/188_hires.png",
      "pikachu": "swsh4/190_hires.png",
      "mew": "swsh7/275_hires.png",
      "umbreon": "xy1/1_hires.png",
      "rayquaza": "sm1/1_hires.png",
      "greninja": "swsh4/189_hires.png",
      "lugia": "xy12/1_hires.png",
      "mewtwo": "sm1/1_hires.png",
      "blastoise": "base1/4_hires.png",
    };
    for (const [key, path] of Object.entries(cardMap)) {
      if (lowerTitle.includes(key)) {
        return `https://images.pokemontcg.io/${path}`;
      }
    }
    return "https://images.pokemontcg.io/swsh4/188_hires.png";
  }

  if (category === "lego") {
    const legoMap: Record<string, string> = {
      "falcon": "10307_prod.jpg",
      "at-at": "75313_prod.jpg",
      "eiffel": "75252_prod.jpg",
      "tower": "10295_prod.jpg",
      "bugatti": "75309_prod.jpg",
      "civic": "42115_prod.jpg",
      "porsche": "42056_prod.jpg",
    };
    for (const [key, path] of Object.entries(legoMap)) {
      if (lowerTitle.includes(key)) {
        return `https://www.lego.com/cdn/product-assets/product.img.pri/${path}`;
      }
    }
    return "https://www.lego.com/cdn/product-assets/product.img.pri/10307_prod.jpg";
  }

  if (category === "pop_mart") {
    const popmartMap: Record<string, string> = {
      "labubu": "m/o/molly_zodiac_series_1.jpg",
      "molly": "m/o/molly_zodiac_series_1.jpg",
      "skullpanda": "s/k/skullpanda_1.jpg",
      "dimoo": "d/i/dimoo_world_1.jpg",
      "pucky": "p/a/pucky_1.jpg",
    };
    for (const [key, path] of Object.entries(popmartMap)) {
      if (lowerTitle.includes(key)) {
        return `https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/${path}`;
      }
    }
    return "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_zodiac_series_1.jpg";
  }

  return CATEGORY_IMAGES[category]?.[index % 10] || CATEGORY_PLACEHOLDER_IMAGE_MAP[category];
}

// Real product images per category for mock data
const CATEGORY_IMAGES: Record<ItemCategory, string[]> = {
  pokemon_card: [
    "https://images.pokemontcg.io/swsh4/188_hires.png",
    "https://images.pokemontcg.io/swsh4/190_hires.png",
    "https://images.pokemontcg.io/swsh7/275_hires.png",
    "https://images.pokemontcg.io/xy1/1_hires.png",
    "https://images.pokemontcg.io/sm1/1_hires.png",
    "https://images.pokemontcg.io/swsh4/189_hires.png",
    "https://images.pokemontcg.io/swsh3/184_hires.png",
    "https://images.pokemontcg.io/xy12/1_hires.png",
    "https://images.pokemontcg.io/base1/4_hires.png",
    "https://images.pokemontcg.io/swsh9/155_hires.png",
  ],
  lego: [
    "https://www.lego.com/cdn/product-assets/product.img.pri/10307_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/75313_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/75252_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/10295_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/75309_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/71043_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/42115_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/76210_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/75192_prod.jpg",
    "https://www.lego.com/cdn/product-assets/product.img.pri/10279_prod.jpg",
  ],
  hot_toys: [
    "https://www.sideshow.com/storage/product-images/903429/hot-toys-iron-man-mark-85-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903430/hot-toys-spider-man-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903431/hot-toys-captain-america-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903432/hot-toys-thor-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903433/hot-toys-hulk-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903434/hot-toys-black-widow-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903435/hot-toys-darth-vader-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903436/hot-toys-boba-fett-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903437/hot-toys-stormtrooper-16th-scale-figure.jpg",
    "https://www.sideshow.com/storage/product-images/903438/hot-toys-mandalorian-16th-scale-figure.jpg",
  ],
  pop_mart: [
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_zodiac_series_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/l/a/labubu_macaron_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/s/k/skullpanda_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/i/dimoo_world_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/a/pucky_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_candy_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/l/a/labubu_forest_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/s/k/skullpanda_city_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/i/dimoo_space_1.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/a/pucky_sleep_1.jpg",
  ],
  hot_wheels: [
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_custom_camaro.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_nissan_gtr.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_porsche_911.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_ford_mustang.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_lamborghini.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_bmw_m3.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_mazda_rx7.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_toyota_supra.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_dodge_charger.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_chevrolet_corvette.jpg",
  ],
  funko: [
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-marvel-spider-man-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-star-wars-darth-vader-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-harry-potter-harry-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-disney-mickey-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-marvel-iron-man-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-anime-naruto-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-games-master-chief-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-tv-stranger-things-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-dc-batman-1000_1024x1024.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-marvel-thor-1000_1024x1024.jpg",
  ],
  other: [
    "https://images.pokemontcg.io/swsh4/188_hires.png",
    "https://www.lego.com/cdn/product-assets/product.img.pri/10307_prod.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-marvel-spider-man-1000_1024x1024.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/m/o/molly_zodiac_series_1.jpg",
    "https://www.mattelcreations.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/h/o/hot_wheels_custom_camaro.jpg",
    "https://www.sideshow.com/storage/product-images/903429/hot-toys-iron-man-mark-85-16th-scale-figure.jpg",
    "https://images.pokemontcg.io/swsh7/275_hires.png",
    "https://www.lego.com/cdn/product-assets/product.img.pri/75313_prod.jpg",
    "https://cdn.shopify.com/s/files/1/0017/5007/4251/products/funko-pop-star-wars-darth-vader-1000_1024x1024.jpg",
    "https://www.popmart.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/l/a/labubu_macaron_1.jpg",
  ],
};

const CATEGORY_PLACEHOLDER_IMAGE_MAP: Record<ItemCategory, string> = {
  pokemon_card: CATEGORY_IMAGES.pokemon_card[0],
  lego: CATEGORY_IMAGES.lego[0],
  hot_toys: CATEGORY_IMAGES.hot_toys[0],
  pop_mart: CATEGORY_IMAGES.pop_mart[0],
  hot_wheels: CATEGORY_IMAGES.hot_wheels[0],
  funko: CATEGORY_IMAGES.funko[0],
  other: CATEGORY_IMAGES.other[0],
};

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

const AGGREGATOR_PRODUCT_TEMPLATES: Record<string, string[]> = {
  pokemon_card: [
    "Charizard VMAX Rainbow Rare Shining Fates",
    "Pikachu V-UNION Celebrations",
    "Umbreon VMAX Alternate Art",
    "Rayquaza VMAX Star",
    "Marnie Premium Tournament Pack",
    "Greninja V-UNION",
    "Reshiram & Charizard GX Tin",
    "Lugia EX Collector's Set",
    "Mewtwo GX Full Art",
    "Blastoise VMAX Secret Rare",
  ],
  lego: [
    "Millennium Falcon UCS 75192",
    "AT-AT UCS 75313",
    "Iron Man BrickHeadz 40535",
    "Captain Rex Y-Wing 75391",
    "Thanos BrickHeadz 40536",
    "Darth Vader Bust 75304",
    "Honda Civic Type R 42144",
    "Porsche 911 GT3 RS 42056",
    "Roller Coaster 10261",
    "Temple of Doom 75950",
  ],
  hot_toys: [
    "Iron Man Mark LXXXV",
    "Darth Vader MMS616",
    "Spider-Man Integrated Suit",
    "Boba Fett MMS618",
    "Batman Begins MMS700",
    "Stormtrooper MMS614",
    "Black Panther MMS486",
    "Joker MMS399",
    "Thanos MMS493",
    "Wolverine MMS513",
  ],
  pop_mart: [
    "Labubu Macaron Series",
    "Molly Zodiac Series",
    "Dimoo Space Travel",
    "Skullpanda Night City",
    "Pucky Sleeping Babies",
    "Hirono Little Mischief",
    "Molly Wishing Star",
    "Labubu Ice Cream Shine",
    "Dimoo Garden Adventure",
    "Skullpanda City Lights",
  ],
  hot_wheels: [
    "Custom Camaro Super TH",
    "Nissan Skyline GT-R R34",
    "Tesla Roadster",
    "Batmobile 1989",
    "DeLorean DMC-12",
    "Porsche 911 GT3 RS",
    "Lamborghini Countach",
    "Ford Mustang Shelby GT500",
    "Chevrolet Camaro ZL1",
    "Mazda RX-7 FD",
  ],
};

const CATEGORY_SOURCES: Record<string, string[]> = {
  pokemon_card: ["carousell", "facebook", "instagram", "reddit"],
  lego: ["carousell", "facebook", "bricklink", "brickowl"],
  hot_toys: ["carousell", "facebook", "sideshow", "bigbadtoystore"],
  pop_mart: ["carousell", "facebook", "popmart_official", "toystation"],
  hot_wheels: ["carousell", "facebook", "ebay", "mercari"],
};

const CATEGORY_LOCATIONS: Record<string, string[]> = {
  pokemon_card: ["Mong Kok", "Central", "Tsim Sha Tsui", "Kowloon", "Causeway Bay"],
  lego: ["Causeway Bay", "Mong Kok", "Sham Shui Po", "Kwun Tong", "Wan Chai"],
  hot_toys: ["Tsim Sha Tsui", "Discovery Bay", "Jordan", "Tsuen Wan", "Mong Kok"],
  pop_mart: ["Mong Kok", "Tseung Kwan O", "Whampoa", "Kowloon Bay", "Shatin"],
  hot_wheels: ["Tsuen Wan", "Sha Tin", "North Point", "Yau Ma Tei", "Tsim Sha Tsui"],
};

const CONDITION_OPTIONS: string[] = [
  "Mint",
  "Near Mint",
  "Lightly Played",
  "Played",
  "Sealed",
  "New",
  "PSA 10",
  "PSA 9",
];

const MARKET_SOURCE_URLS: Record<string, string> = {
  carousell: "https://www.carousell.com.hk",
  facebook: "https://www.facebook.com/marketplace",
  instagram: "https://www.instagram.com",
  reddit: "https://www.reddit.com",
  bricklink: "https://www.bricklink.com",
  brickowl: "https://www.brickowl.com",
  sideshow: "https://www.sideshow.com",
  bigbadtoystore: "https://www.bigbadtoystore.com",
  popmart_official: "https://www.popmart.com",
  toystation: "https://www.toystation.com",
  ebay: "https://www.ebay.com",
  mercari: "https://www.mercari.com",
};

const dealScoreForIndex = (index: number) => {
  const score = 90 - (index % 10) * 4;
  return Math.max(30, Math.min(95, score));
};

const isDealForIndex = (index: number) => (index % 4 === 0);

function calculateListingDealScore(listing: {
  price_hkd: number;
  original_price_hkd: number | null;
  condition: string;
  hasPhoto: boolean;
}): number {
  const { price_hkd, original_price_hkd, condition, hasPhoto } = listing;
  let score = 0;

  if (original_price_hkd && original_price_hkd > 0) {
    const discountRatio = price_hkd / original_price_hkd;
    if (discountRatio <= 0.5) score += 40;
    else if (discountRatio <= 0.7) score += 35;
    else if (discountRatio <= 0.85) score += 28;
    else if (discountRatio <= 1.0) score += 20;
    else score += 10;
  } else {
    score += 20;
  }

  const conditionScores: Record<string, number> = {
    "mint": 1.0, "near mint": 0.9, "lightly played": 0.7,
    "played": 0.5, "sealed": 1.0, "new": 1.0,
    "psa 10": 1.0, "psa 9": 0.95, "psa 8": 0.85,
  };
  const condKey = condition.toLowerCase();
  score += (conditionScores[condKey] ?? 0.5) * 20;

  if (hasPhoto) score += 5;
  score += 5;

  return Math.round(Math.min(100, Math.max(0, score)));
}

const makeListing = (
  category: string,
  index: number,
  title: string,
  source: string,
): AggregatorListing => {
  const priceBase = Math.round(500 + (index % 10) * 450 + Math.random() * 250);
  const originalPrice = priceBase + Math.round(Math.random() * 500 + 100);
  const condition = CONDITION_OPTIONS[index % CONDITION_OPTIONS.length];
  const sourceUrl = `${MARKET_SOURCE_URLS[source] ?? "https://www.example.com"}/item/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const dbCategory = category as ItemCategory;
  const imageUrl = generateImageUrl(title, dbCategory, index);
  const hasPhoto = !!imageUrl;
  const isDeal = isDealForIndex(index);

  const dealScore = isDeal
    ? calculateListingDealScore({ price_hkd: priceBase, original_price_hkd: originalPrice, condition, hasPhoto })
    : dealScoreForIndex(index);

  return {
    id: `${category}-${index + 1}`,
    source,
    source_url: sourceUrl,
    source_id: `${source}-${index + 1}`,
    title,
    description: `${title} in ${condition} condition from a trusted Hong Kong seller.`,
    category: dbCategory,
    price_hkd: priceBase,
    original_price_hkd: isDeal ? originalPrice : null,
    condition,
    seller_name: `${category}_seller_${index + 1}`,
    seller_rating: Number((4.3 + ((index % 6) * 0.1)).toFixed(2)),
    image_url: imageUrl,
    location: CATEGORY_LOCATIONS[category][index % CATEGORY_LOCATIONS[category].length],
    is_deal: isDeal,
    deal_score: dealScore,
    raw_data: {},
    last_seen: new Date(Date.now() - index * 60000).toISOString(),
    created_at: new Date(Date.now() - index * 3600000).toISOString(),
  };
};

export const MOCK_AGGREGATOR_LISTINGS: AggregatorListing[] = [
  ...Object.keys(AGGREGATOR_PRODUCT_TEMPLATES).flatMap((category) => {
    const names = AGGREGATOR_PRODUCT_TEMPLATES[category];
    const sources = CATEGORY_SOURCES[category];
    return Array.from({ length: 30 }, (_, idx) => {
      const title = names[idx % names.length] + ` ${idx + 1}`;
      const source = sources[idx % sources.length];
      return makeListing(category, idx, title, source);
    });
  }),
];

export function getMockProducts(category: string): ProductItem[] {
  return MOCK_PRODUCTS[category] || [];
}

export function getMockAggregatorListings(category?: string): AggregatorListing[] {
  if (!category) return MOCK_AGGREGATOR_LISTINGS;
  const categoryMap: Record<string, ItemCategory> = {
    tcg: "pokemon_card",
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
