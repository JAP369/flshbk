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
  {
    id: "tcgplayer",
    name: "TCGplayer",
    baseUrl: "https://www.tcgplayer.com",
    icon: "🃏",
    color: "#6B21A8",
    enabled: false, // US-based, not HK
  },
  {
    id: "cardmarket",
    name: "Cardmarket",
    baseUrl: "https://www.cardmarket.com",
    icon: "🇪🇺",
    color: "#0066CC",
    enabled: false, // EU-based
  },
];

export function getEnabledSources() {
  return MARKETPLACE_SOURCES.filter((s) => s.enabled);
}
