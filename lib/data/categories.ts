export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  href: string;
  color: string;
  subcategories: string[];
  marketplaces: string[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "tcg",
    name: "Trading Cards",
    icon: "🃏",
    emoji: "🃏",
    description: "Pokemon, Magic, Yu-Gi-Oh and more",
    href: "/categories/tcg",
    color: "#fbbf24",
    subcategories: ["Pokemon", "Magic: The Gathering", "Yu-Gi-Oh", "Sports Cards"],
    marketplaces: ["Carousell HK", "Facebook Marketplace", "Reddit", "TCGplayer"],
  },
  {
    id: "lego",
    name: "LEGO",
    icon: "🧱",
    emoji: "🧱",
    description: "Star Wars, Marvel, BrickHeadz and more",
    href: "/categories/lego",
    color: "#ef4444",
    subcategories: ["Star Wars", "Marvel", "BrickHeadz", "Technic", "Ideas", "Creator Expert"],
    marketplaces: ["Carousell HK", "Facebook Marketplace", "BrickLink", "BrickOwl"],
  },
  {
    id: "hottoys",
    name: "Hot Toys",
    icon: "🦸",
    emoji: "🦸",
    description: "6 inch figures, statues and collectibles",
    href: "/categories/hottoys",
    color: "#8b5cf6",
    subcategories: ["Marvel", "Star Wars", "DC Comics", "Anime", "Video Games"],
    marketplaces: ["Carousell HK", "Facebook Marketplace", "Sideshow", "BigBadToyStore"],
  },
  {
    id: "popmart",
    name: "Pop Mart",
    icon: "🎭",
    emoji: "🎭",
    description: "Blind boxes, vinyl figures and designer toys",
    href: "/categories/popmart",
    color: "#ec4899",
    subcategories: ["Labubu", "Molly", "Dimoo", "Skullpanda", "Pucky", "Hirono"],
    marketplaces: ["Carousell HK", "Facebook Marketplace", "Pop Mart Official", "ToyStation"],
  },
  {
    id: "hotwheels",
    name: "Hot Wheels",
    icon: "🏎️",
    emoji: "🏎️",
    description: "Diecast cars and collectible vehicles",
    href: "/categories/hotwheels",
    color: "#f97316",
    subcategories: ["Mainline", "Premium", "Treasure Hunt", "Super Treasure Hunt", "Red Line Club"],
    marketplaces: ["Carousell HK", "Facebook Marketplace", "eBay", "Mercari"],
  },
];

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  pokemon: "tcg",
};

export function getCategory(id: string): CategoryConfig | undefined {
  const normalizedId = CATEGORY_ALIAS_MAP[id] ?? id;
  return CATEGORIES.find((c) => c.id === normalizedId);
}

export function getCategoryByPath(path: string): CategoryConfig | undefined {
  const normalizedPath = path === "/categories/pokemon" ? "/categories/tcg" : path;
  return CATEGORIES.find((c) => c.href === normalizedPath);
}
