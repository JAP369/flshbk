// =============================================================================
// BUNDLE OFFER GENERATOR UTILITY
// =============================================================================
// Generates Cantonese Carousell negotiation scripts for bundle deals.
// Calculates fair bundle value using cash-premium discount logic.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface BundleItem {
  id: string;
  title: string;
  asking_price_hkd: number;
  market_price_hkd: number;
  condition: string;
  market_grade: string;
}

export interface BundleCalculation {
  itemCount: number;
  totalAsking: number;
  totalMarket: number;
  totalSavings: number;
  savingsPercent: number;
  fairValue: number;
  negotiationPrice: number;
  premium: number;
}

export interface BundleOfferResult {
  items: BundleItem[];
  calculation: BundleCalculation;
  cantoneseScript: string;
  englishSummary: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Cash premium discount factor — 15% below fair value */
const CASH_PREMIUM_FACTOR = 0.85;

/** Minimum items required for a bundle */
const MIN_BUNDLE_ITEMS = 2;

/** MTR stations commonly used for meetups */
const MTR_MEETUP_STATIONS = [
  "Mong Kok",
  "Causeway Bay",
  "Tsim Sha Tsui",
  "Central",
  "Prince Edward",
  " Admiralty",
];

// =============================================================================
// CORE CALCULATION
// =============================================================================

/**
 * Calculates bundle fair value and suggested negotiation price.
 *
 * Fair Value = Sum of Market Floor prices of all selected items.
 * Negotiation Price = Fair Value × 0.85 (cash premium discount).
 */
export function calculateBundleFairValue(items: BundleItem[]): BundleCalculation {
  if (items.length < MIN_BUNDLE_ITEMS) {
    throw new Error(`Bundle requires at least ${MIN_BUNDLE_ITEMS} items`);
  }

  const totalAsking = items.reduce((sum, item) => sum + item.asking_price_hkd, 0);
  const totalMarket = items.reduce((sum, item) => sum + item.market_price_hkd, 0);
  const totalSavings = totalMarket - totalAsking;
  const savingsPercent = totalMarket > 0 ? (totalSavings / totalMarket) * 100 : 0;

  const fairValue = totalMarket;
  const negotiationPrice = Math.round(fairValue * CASH_PREMIUM_FACTOR / 100) * 100;
  const premium = fairValue - negotiationPrice;

  return {
    itemCount: items.length,
    totalAsking,
    totalMarket,
    totalSavings,
    savingsPercent,
    fairValue,
    negotiationPrice,
    premium,
  };
}

// =============================================================================
// SCRIPT GENERATION
// =============================================================================

/**
 * Formats HKD number for display
 */
function formatHKDCompact(value: number): string {
  return `$${value.toLocaleString("en-HK")}`;
}

/**
 * Generates a professional Cantonese bundle negotiation script for Carousell.
 */
export function generateBundleCantoneseScript(
  items: BundleItem[],
  calculation: BundleCalculation,
  preferredStation?: string
): string {
  const meetupStation = preferredStation || MTR_MEETUP_STATIONS[0];

  // Item list section
  const itemListLines = items
    .map((item, idx) => `${idx + 1}. ${item.title}（${item.condition || item.market_grade}）`)
    .join("\n");

  // Pricing breakdown
  const pricingSection = `
📊  bundle 分析：
• 物品數量：${calculation.itemCount} 件
• 市價總值：${formatHKDCompact(calculation.fairValue)}
• 賣家標價：${formatHKDCompact(calculation.totalAsking)}
• 建議(bundle價：${formatHKDCompact(calculation.negotiationPrice)}（85折現金價）
• 你嘅優惠：${formatHKDCompact(calculation.savingsPercent > 0 ? calculation.totalAsking - calculation.negotiationPrice : 0)}`;

  // Main script
  return `唔該你好！我見到你嘅 listing，對以下 ${calculation.itemCount} 件物品都有興趣：

${itemListLines}
${pricingSection}

我係一個收藏家，想一次過買晒呢 ${calculation.itemCount} 件做 bundle 交易。現金交割，唔行平台。

如果你願意呢個 bundle offer：
✅ 我可以即刻交收，唔使你煩
✅ 現金全數到手
✅ 你唔使逐個 reply

方便約� ${meetupStation} 站見面交收嗎？我可以彈性安排時間。

多謝你考慮！�

---
Bundle Ref: ${items.map(i => i.id).join("-")}
Generated: ${new Date().toLocaleDateString("zh-HK")}`;
}

/**
 * Generates an English summary for internal reference.
 */
export function generateBundleEnglishSummary(
  items: BundleItem[],
  calculation: BundleCalculation
): string {
  const itemList = items.map((item) => `  • ${item.title} (${item.condition}) — Asking: ${formatHKDCompact(item.asking_price_hkd)} | Market: ${formatHKDCompact(item.market_price_hkd)}`).join("\n");

  return `BUNDLE OFFER SUMMARY
====================

Selected Items (${calculation.itemCount}):
${itemList}

CALCULATION:
  Total Market Value:    ${formatHKDCompact(calculation.fairValue)}
  Total Asking Price:     ${formatHKDCompact(calculation.totalAsking)}
  Bundle Negotiation:     ${formatHKDCompact(calculation.negotiationPrice)} (85% of market)
  Potential Savings:      ${formatHKDCompact(calculation.totalAsking - calculation.negotiationPrice)}
  Margin:                 ${calculation.savingsPercent.toFixed(1)}%

OFFER STRATEGY:
  Propose ${formatHKDCompact(calculation.negotiationPrice)} cash for all items.
  Seller saves on platform fees + immediate cash buyer.
  Buyer gets ${calculation.savingsPercent.toFixed(1)}% below market rate.`;
}

// =============================================================================
// MAIN GENERATOR FUNCTION
// =============================================================================

/**
 * Complete bundle offer generator.
 * Takes selected items, calculates fair value, and generates both
 * Cantonese script and English summary.
 */
export function generateBundleOffer(
  selectedItems: BundleItem[],
  preferredStation?: string
): BundleOfferResult {
  const calculation = calculateBundleFairValue(selectedItems);
  const cantoneseScript = generateBundleCantoneseScript(selectedItems, calculation, preferredStation);
  const englishSummary = generateBundleEnglishSummary(selectedItems, calculation);

  return {
    items: selectedItems,
    calculation,
    cantoneseScript,
    englishSummary,
  };
}

// =============================================================================
// EX FOR COMPONENT USE
// =============================================================================

export { CASH_PREMIUM_FACTOR, MIN_BUNDLE_ITEMS, formatHKDCompact };
