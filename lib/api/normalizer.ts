// =============================================================================
// LISTING NORMALIZER — Maps messy marketplace listings to canonical cards
// =============================================================================
//
// Challenge: eBay listings are user-generated ("Charizard Holo Base 1999 PSA 10")
// and need to be matched to canonical cards in the pokemontcg.io database.
//
// Strategy: Extract set code + card number from listing title, then fuzzy-match
// against the API catalog. Falls back to name-only matching if needed.
// =============================================================================

import type { PokeCard } from "./pokemontcg";

// -----------------------------------------------------------------------------
// SET CODE EXTRACTION
// =============================================================================

// Common user-friendly set names → pokemontcg.io set IDs
const SET_NAME_MAP: Record<string, string> = {
  "base set": "base1",
  "base": "base1",
  "jungle": "base2",
  "fossil": "base3",
  "base set 2": "base4",
  "team rocket": "base5",
  "gym heroes": "gym1",
  "gym challenge": "gym2",
  "neo genesis": "neo1",
  "neo discovery": "neo2",
  "neo revelation": "neo3",
  "neo destiny": "neo4",
  "legendary collection": "base6",
  "expedition": "ecard1",
  "aquapolis": "ecard2",
  "skyridge": "ecard3",
  "ruby sapphire": "ex1",
  "sandstorm": "ex2",
  "dragon": "ex3",
  "team magma": "ex4",
  "hidden legends": "ex5",
  "firered leafgreen": "ex6",
  "team rocket returns": "ex7",
  "deoxys": "ex8",
  "emerald": "ex9",
  "unseen forces": "ex10",
  "delta species": "ex11",
  "legend makers": "ex12",
  "holon phantoms": "ex13",
  "crystal guardians": "ex14",
  "dragon frontiers": "ex15",
  "power keepers": "ex16",
  "diamond pearl": "dp1",
  "mysterious treasures": "dp2",
  "secret wonders": "dp3",
  "great encounters": "dp4",
  "majestic dawn": "dp5",
  "legends awakened": "dp6",
  "stormfront": "dp7",
  "platinum": "pl1",
  "rising rivals": "pl2",
  "supreme victors": "pl3",
  "arceus": "pl4",
  "heartgold soulsilver": "hgss1",
  "unleashed": "hgss2",
  "undaunted": "hgss3",
  "triumphant": "hgss4",
  "black white": "bw1",
  "emerging powers": "bw2",
  "noble victories": "bw3",
  "destined rivals": "bw4",
  "explorers shadow": "bw5",
  "dragons exalted": "bw6",
  "boundaries crossed": "bw7",
  "plasma storm": "bw8",
  "plasma freeze": "bw9",
  "plasma blast": "bw10",
  "legendary treasures": "bw11",
  "xy": "xy1",
  "flashfire": "xy2",
  "furious fists": "xy3",
  "phantom forces": "xy4",
  "primal clash": "xy5",
  "roaring skies": "xy6",
  "ancient origins": "xy7",
  "breakthrough": "xy8",
  "breakpoint": "xy9",
  "fates collide": "xy10",
  "steam siege": "xy11",
  "evolutions": "xy12",
  "sun moon": "sm1",
  "codename kids": "sm2",
  "guardians rising": "sm4",
  "burning shadows": "sm5",
  "ultra prism": "sm6",
  "forbidden light": "sm7",
  "celestial storm": "sm8",
  "dragon majesty": "sm9",
  "lost thunder": "sm10",
  "team up": "sm11",
  "unified minds": "sm12",
  "cosmic eclipse": "sm13",
  "sword shield": "swsh1",
  "rebel clash": "swsh2",
  "darkness ablaze": "swsh3",
  "vivid voltage": "swsh4",
  "battle styles": "swsh5",
  "chilling reign": "swsh6",
  "evolving skies": "swsh7",
  "fusion strike": "swsh8",
  "brilliant stars": "swsh9",
  "astral radiance": "swsh10",
  "pokemon go": "swsh11",
  "lost origin": "swsh12",
  "silver tempest": "swsh12",
  "crown zenith": "swsh13",
  "scarlet violet": "sv1",
  "paldea evolved": "sv2",
  "obsidian flames": "sv3",
  "151": "sv3pt5",
  "paradox rift": "sv4",
  "temporal forces": "sv5",
  "twilight masquerade": "sv6",
  "stellar crown": "sv7",
  "surging sparks": "sv8",
  "prismatic evolutions": "sv8pt5",
  "journey together": "sv9",
  "mega evolution": "sv10",
};

/**
 * Extract set ID and card number from a listing title.
 * Handles formats like:
 *   "Charizard #4 Base Set"
 *   "Pikachu sv3pt5/183"
 *   "Umbreon VMAX 151 203/165"
 *   "Charizard Holo 1999 4/102"
 */
export function extractCardIdentifiers(title: string): {
  setId: string | null;
  cardNumber: string | null;
  cardName: string;
} {
  const lower = title.toLowerCase().trim();

  // Try to find set by name
  let setId: string | null = null;
  // Sort by length descending so "base set" matches before "base"
  const sortedNames = Object.keys(SET_NAME_MAP).sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (lower.includes(name)) {
      setId = SET_NAME_MAP[name];
      break;
    }
  }

  // Try to find set by code (e.g. "sv3pt5", "swsh4", "xy1")
  const codeMatch = lower.match(/\b(sv\d*|swsh\d*|xy\d*|sm\d*|bw\d*|dp\d*|hgss\d*|pl\d*|ex\d*|base\d*|gym\d*|neo\d*|ecard\d*)\b/);
  if (!setId && codeMatch) {
    setId = codeMatch[1];
  }

  // Extract card number: "183/165", "#4", "4/102", "203/165"
  let cardNumber: string | null = null;
  const numMatch = lower.match(/(?:#|\/)\s*(\d{2,3})\s*(?:\/\s*\d{2,3})?/);
  if (numMatch) {
    cardNumber = numMatch[1];
  } else {
    const slashMatch = lower.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    if (slashMatch) {
      cardNumber = slashMatch[1];
    }
  }

  // Extract card name — remove set/number noise
  let cardName = title;
  // Remove common patterns
  cardName = cardName
    .replace(/\b(psa|bgs|cgc|sgc)\s*\d+(\.\d+)?/gi, "")
    .replace(/\b(holo|reverse holo|full art|ultra secret)\b/gi, "")
    .replace(/\b\d{2,3}\s*\/\s*\d{2,3}\b/g, "")
    .replace(/#\s*\d+/g, "")
    .replace(/\b(sv\d*|swsh\d*|xy\d*|sm\d*|bw\d*|dp\d*|hgss\d*|pl\d*|ex\d*|base\d*|gym\d*|neo\d*|ecard\d*)\b/gi, "")
    .replace(/\b(1999|2000|2023|2024|2025)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return { setId, cardNumber, cardName };
}

// -----------------------------------------------------------------------------
// FUZZY MATCHING
// =============================================================================

/**
 * Match a normalized listing to a card in the pokemontcg.io catalog.
 * Returns the best match or null.
 */
export function matchListingToCard(
  identifiers: { setId: string | null; cardNumber: string | null; cardName: string },
  catalog: PokeCard[],
): PokeCard | null {
  // Strategy 1: Exact set + number match
  if (identifiers.setId && identifiers.cardNumber) {
    const exact = catalog.find(
      (c) =>
        c.set.id === identifiers.setId &&
        c.number === identifiers.cardNumber,
    );
    if (exact) return exact;
  }

  // Strategy 2: Set + name match
  if (identifiers.setId) {
    const inSet = catalog.filter((c) => c.set.id === identifiers.setId);
    const nameMatch = fuzzyFindCard(identifiers.cardName, inSet);
    if (nameMatch) return nameMatch;
  }

  // Strategy 3: Name-only match across all cards
  return fuzzyFindCard(identifiers.cardName, catalog);
}

/**
 * Simple fuzzy match: checks if the listing name contains the card name
 * or vice versa, with a basic similarity threshold.
 */
function fuzzyFindCard(name: string, cards: PokeCard[]): PokeCard | null {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9 ]/g, "");

  let bestMatch: PokeCard | null = null;
  let bestScore = 0;

  for (const card of cards) {
    const cardName = card.name.toLowerCase().replace(/[^a-z0-9 ]/g, "");

    // Exact substring match
    if (normalizedName.includes(cardName) || cardName.includes(normalizedName)) {
      const score = Math.min(normalizedName.length, cardName.length) /
        Math.max(normalizedName.length, cardName.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = card;
      }
      continue;
    }

    // Word overlap score
    const nameWords = new Set(normalizedName.split(/\s+/));
    const cardWords = new Set(cardName.split(/\s+/));
    let overlap = 0;
    for (const w of nameWords) {
      if (cardWords.has(w)) overlap++;
    }
    const score = overlap / Math.max(nameWords.size, cardWords.size);
    if (score > 0.5 && score > bestScore) {
      bestScore = score;
      bestMatch = card;
    }
  }

  return bestMatch;
}
