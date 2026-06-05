/**
 * Facebook Marketplace Scraper — Hong Kong
 *
 * Fetches live listings from Facebook Marketplace by scraping the
 * public search results page. No API key required.
 *
 * Facebook Marketplace search URL format:
 *   https://www.facebook.com/marketplace/hong-kong/search?query=<query>
 *
 * We parse the HTML response to extract listing data.
 */

import * as cheerio from "cheerio";

import { calculateDealScore } from "@/lib/aggregator/scorer";

export interface FacebookMarketplaceListing {
  id: string;
  title: string;
  price: number | null;
  priceText: string;
  imageUrl: string | null;
  listingUrl: string;
  sellerName: string | null;
  location: string | null;
  condition: string | null;
  category: string;
  source: string;
  sourceUrl: string;
  scrapedAt: string;
  hasPhoto: boolean;
  description: string | null;
}

const FB_MARKETPLACE_BASE = "https://www.facebook.com/marketplace";
const HK_LOCATION = "hong-kong";

/**
 * Build a Facebook Marketplace search URL for Hong Kong
 */
function buildSearchUrl(query: string, category?: string): string {
  const params = new URLSearchParams();
  params.set("query", query);
  if (category) {
    params.set("category", category);
  }
  return `${FB_MARKETPLACE_BASE}/${HK_LOCATION}/search?${params.toString()}`;
}

/**
 * Fetch HTML from Facebook Marketplace
 * Uses a browser-like User-Agent to avoid being blocked
 */
async function fetchMarketplaceHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`[FB Scraper] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`[FB Scraper] Fetch error:`, error);
    return null;
  }
}

/**
 * Parse Facebook Marketplace search results HTML
 *
 * Facebook renders listings as structured data within the page.
 * We look for listing cards in the HTML and extract relevant fields.
 */
function parseListings(html: string, category: string): FacebookMarketplaceListing[] {
  const $ = cheerio.load(html);
  const listings: FacebookMarketplaceListing[] = [];

  // Facebook Marketplace listing cards have a specific structure.
  // They appear as anchor links with data attributes.
  // The exact selectors may change as Facebook updates their UI.

  // Try multiple selector patterns since Facebook's HTML structure varies
  const listingSelectors = [
    // Pattern 1: Listing cards with data-testid
    '[data-testid="marketplace_search_result"]',
    // Pattern 2: Links containing /marketplace/item/
    'a[href*="/marketplace/item/"]',
    // Pattern 3: Generic listing containers
    '[role="main"] a[href*="marketplace"]',
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let foundElements: any = null;

  for (const selector of listingSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      foundElements = elements;
      break;
    }
  }

  if (!foundElements || foundElements.length === 0) {
    // Fallback: try to extract from JSON-LD or embedded JSON data
    const scriptTags = $('script[type="application/ld+json"]');
    scriptTags.each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        if (json["@type"] === "ItemList" && json.itemListElement) {
          json.itemListElement.forEach((item: { url?: string; name?: string; offers?: { price?: number; priceCurrency?: string } }, idx: number) => {
            listings.push({
              id: `fb-ld-${idx}`,
              title: item.name || "Unknown",
              price: item.offers?.price || null,
              priceText: item.offers?.price ? `HKD ${item.offers.price}` : "Price not listed",
              imageUrl: null,
              listingUrl: item.url || "",
              sellerName: null,
              location: "Hong Kong",
              condition: null,
              category,
              source: "facebook_marketplace",
              sourceUrl: item.url || "",
              scrapedAt: new Date().toISOString(),
              hasPhoto: false,
              description: null,
            });
          });
        }
      } catch {
        // Ignore parse errors
      }
    });

    if (listings.length > 0) return listings;

    // Last resort: try to find any marketplace item links
    $('a').each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("/marketplace/item/")) {
        const title = $(el).find("span").first().text().trim() || $(el).text().trim().substring(0, 80);
        const imgEl = $(el).find("img").first();
        const imageUrl = imgEl.attr("src") || null;

        if (title && title.length > 3) {
          listings.push({
            id: `fb-fallback-${listings.length}`,
            title: title.substring(0, 200),
            price: null,
            priceText: "Price not listed",
            imageUrl,
            listingUrl: href.startsWith("http") ? href : `https://www.facebook.com${href}`,
            sellerName: null,
            location: "Hong Kong",
            condition: null,
            category,
            source: "facebook_marketplace",
            sourceUrl: href.startsWith("http") ? href : `https://www.facebook.com${href}`,
            scrapedAt: new Date().toISOString(),
            hasPhoto: !!imageUrl,
            description: null,
          });
        }
      }
    });

    return listings;
  }

  // Parse using the found selector
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foundElements.each((index: number, el: any) => {
    const $el = $(el);

    // Extract listing URL
    const href = $el.attr("href") || "";
    const listingUrl = href.startsWith("http") ? href : `https://www.facebook.com${href}`;

    // Extract title — try multiple patterns
    let title = "";
    const titleSelectors = [
      '[data-testid="marketplace_search_result_title"]',
      'span[dir="auto"]',
      'a span',
      'img[alt]',
    ];
    for (const sel of titleSelectors) {
      const text = $el.find(sel).first().text().trim() || $el.find(sel).first().attr("alt") || "";
      if (text && text.length > 2) {
        title = text;
        break;
      }
    }
    if (!title) {
      title = $el.text().trim().substring(0, 100);
    }

    // Extract price
    let price: number | null = null;
    let priceText = "Price not listed";
    const priceTextEl = $el.find('[data-testid="marketplace_search_result_price"]').first();
    if (priceTextEl.length > 0) {
      priceText = priceTextEl.text().trim();
      const priceMatch = priceText.match(/[\d,]+/);
      if (priceMatch) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rawPrice = priceMatch[0]!.replace(/,/g, "");
        price = parseInt(rawPrice, 10);
        if (isNaN(price)) price = null;
      }
    } else {
      // Try to find price in any text
      const allText = $el.text();
      const priceMatch = allText.match(/HKD?\s*([\d,]+)|([\d,]+)\s*(HKD|HK\$)/i);
      if (priceMatch) {
        const rawPrice = (priceMatch[1] || priceMatch[2] || "").replace(/,/g, "");
        price = parseInt(rawPrice, 10);
        priceText = `HKD ${price?.toLocaleString()}`;
      }
    }

    // Extract image
    const imgEl = $el.find("img").first();
    const imageUrl = imgEl.attr("src") || null;

    // Extract location
    let location: string | null = null;
    const locationEl = $el.find('[data-testid="marketplace_search_result_location"]').first();
    if (locationEl.length > 0) {
      location = locationEl.text().trim();
    }

    // Generate a stable ID from the URL
    const idMatch = listingUrl.match(/\/marketplace\/item\/(\d+)/);
    const id = idMatch ? `fb-${idMatch[1]}` : `fb-${Date.now()}-${index}`;

    if (title && title.length > 2) {
      listings.push({
        id,
        title: title.substring(0, 300),
        price,
        priceText,
        imageUrl,
        listingUrl,
        sellerName: null,
        location: location || "Hong Kong",
        condition: null,
        category,
        source: "facebook_marketplace",
        sourceUrl: listingUrl,
        scrapedAt: new Date().toISOString(),
        hasPhoto: !!imageUrl,
        description: null,
      });
    }
  });

  return listings;
}

/**
 * Main export: Search Facebook Marketplace for collectibles in Hong Kong
 */
export async function searchFacebookMarketplace(
  query: string,
  category?: string,
): Promise<FacebookMarketplaceListing[]> {
  const url = buildSearchUrl(query, category);
  console.log(`[FB Scraper] Searching: ${url}`);

  const html = await fetchMarketplaceHTML(url);
  if (!html) {
    console.error("[FB Scraper] Failed to fetch HTML");
    return [];
  }

  console.log(`[FB Scraper] Fetched ${html.length} bytes of HTML`);

  const listings = parseListings(html, category || "other");
  console.log(`[FB Scraper] Parsed ${listings.length} listings`);

  return listings;
}

/**
 * Search multiple queries and deduplicate by ID
 */
export async function searchMultipleQueries(
  queries: string[],
  category?: string,
): Promise<FacebookMarketplaceListing[]> {
  const allListings: FacebookMarketplaceListing[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    const listings = await searchFacebookMarketplace(query, category);
    for (const listing of listings) {
      if (!seenIds.has(listing.id)) {
        seenIds.add(listing.id);
        allListings.push(listing);
      }
    }
    // Small delay between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return allListings;
}

/**
 * Map a Facebook Marketplace listing to our internal AggregatorListing format
 */
export function mapToAggregatorListing(
  fb: FacebookMarketplaceListing,
): import("@/lib/types/database").AggregatorListing {
  const dealScore = calculateDealScore({
    priceHKD: fb.price || 0,
    marketAverageHKD: fb.price || 0,
    sellerRating: null,
    condition: fb.condition || "new",
    daysSinceListed: 0,
    hasPhoto: !!fb.imageUrl,
    hasDescription: !!fb.description,
  });

  const now = new Date();
  return {
    id: fb.id,
    source: "facebook_marketplace",
    source_url: fb.listingUrl,
    source_id: fb.id,
    title: fb.title,
    description: fb.description || `${fb.title} — listed on Facebook Marketplace Hong Kong`,
    category: fb.category as import("@/lib/types/database").ItemCategory,
    price_hkd: fb.price || 0,
    original_price_hkd: null,
    condition: fb.condition,
    seller_name: fb.sellerName,
    seller_rating: null,
    image_url: fb.imageUrl,
    location: fb.location || "Hong Kong",
    is_deal: dealScore >= 70,
    deal_score: dealScore,
    raw_data: JSON.stringify({
      source: "facebook_marketplace",
      scrapedAt: fb.scrapedAt,
      priceText: fb.priceText,
    }) as unknown as import("@/lib/types/database").Json,
    last_seen: fb.scrapedAt,
    created_at: fb.scrapedAt,
  };
}
