/**
 * Marketplace Aggregator Sources
 * 
 * Defines the external marketplaces we aggregate from.
 * Each source has a base URL, search URL pattern, and parser.
 * 
 * Note: In production, these would be actual API calls or scrapers.
 * For now, we define the structure and provide a mock data generator
 * that simulates real marketplace data.
 */

export interface MarketplaceSource {
  id: string;
  name: string;
  baseUrl: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export const MARKETPLACE_SOURCES: MarketplaceSource[] = [
  {
    id: "tcgplayer",
    name: "TCGPlayer",
    baseUrl: "https://www.tcgplayer.com",
    icon: "🃏",
    color: "#0D6EFD",
    enabled: true,
  },
  {
    id: "cardmarket",
    name: "CardMarket",
    baseUrl: "https://www.cardmarket.com",
    icon: "🇪🇺",
    color: "#FF6600",
    enabled: true,
  },
  {
    id: "carousell",
    name: "Carousell HK",
    baseUrl: "https://www.carousell.com.hk",
    icon: "🛒",
    color: "#00B4D8",
    enabled: true,
  },
  {
    id: "facebook_marketplace",
    name: "Facebook Marketplace",
    baseUrl: "https://www.facebook.com/marketplace",
    icon: "📘",
    color: "#1877F2",
    enabled: true,
  },
  {
    id: "instagram",
    name: "Instagram Shops",
    baseUrl: "https://www.instagram.com",
    icon: "📸",
    color: "#E4405F",
    enabled: true,
  },
  {
    id: "reddit",
    name: "Reddit r/pkmntcgtrades",
    baseUrl: "https://www.reddit.com/r/pkmntcgtrades",
    icon: "🤖",
    color: "#FF4500",
    enabled: true,
  },
];

export function getEnabledSources() {
  return MARKETPLACE_SOURCES.filter((s) => s.enabled);
}
