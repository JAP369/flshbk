// =============================================================================
// VOLATILITY CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate the Price Variance Coefficient (Volatility Index)
 * 
 * The Price Variance Coefficient (PVC) measures the relative variability
 * of prices around the mean. It is calculated as:
 * 
 *   PVC = (Standard Deviation / Mean) × 100
 * 
 * A higher PVC indicates higher volatility (more price fluctuation).
 * A lower PVC indicates more stable pricing.
 * 
 * @param prices - Array of historical prices (HKD)
 * @returns Price Variance Coefficient as a percentage (0-100+)
 * 
 * @example
 * calculateVolatility([100, 120, 110, 130, 90]) // returns ~12.65
 * calculateVolatility([100, 100, 100, 100])     // returns 0
 * calculateVolatility([50, 200, 75, 300])        // returns ~64.55
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length === 0) return 0;
  if (prices.length === 1) return 0;

  // Calculate mean
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Avoid division by zero
  if (mean === 0) return 0;

  // Calculate variance (average of squared differences from mean)
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
    prices.length;

  // Calculate standard deviation
  const standardDeviation = Math.sqrt(variance);

  // Calculate Price Variance Coefficient as percentage
  const pvc = (standardDeviation / Math.abs(mean)) * 100;

  return Math.round(pvc * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine volatility level based on Price Variance Coefficient
 * 
 * @param pvc - Price Variance Coefficient
 * @returns Volatility level classification
 */
export function getVolatilityLevel(pvc: number): "low" | "moderate" | "high" | "extreme" {
  if (pvc < 10) return "low";
  if (pvc < 25) return "moderate";
  if (pvc < 50) return "high";
  return "extreme";
}

/**
 * Check if an asset has high volatility (PVC >= 25%)
 * 
 * @param prices - Array of historical prices
 * @returns true if the asset is considered high volatility
 */
export function isHighVolatility(prices: number[]): boolean {
  const pvc = calculateVolatility(prices);
  return pvc >= 25;
}

/**
 * Generate simulated historical prices for an asset
 * Used when real sales_history data is not available
 * 
 * @param currentPrice - Current market price
 * @param priceChange30d - 30-day price change percentage
 * @param volatility - Optional volatility override (0-1)
 * @returns Array of simulated historical prices
 */
export function generateSimulatedPrices(
  currentPrice: number,
  priceChange30d: number,
  volatility: number = 0.15
): number[] {
  const prices: number[] = [];
  const numPoints = 30; // 30 days of data

  // Calculate starting price based on 30d change
  const startPrice = currentPrice / (1 + priceChange30d / 100);

  for (let i = 0; i <= numPoints; i++) {
    const progress = i / numPoints;
    
    // Linear interpolation from start to current
    const basePrice = startPrice + (currentPrice - startPrice) * progress;
    
    // Add random volatility
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
    const price = basePrice * randomFactor;
    
    prices.push(Math.round(price * 100) / 100);
  }

  return prices;
}

/**
 * Calculate volatility for a collection holding using available price data
 * 
 * @param currentPrice - Current market price
 * @param purchasePrice - Purchase price
 * @param priceChange30d - 30-day price change percentage
 * @returns Price Variance Coefficient
 */
export function calculateHoldingVolatility(
  currentPrice: number,
  purchasePrice: number,
  priceChange30d: number
): number {
  // Generate simulated price history based on available data
  const simulatedPrices = generateSimulatedPrices(currentPrice, priceChange30d);
  
  // Include purchase price as historical data point
  const allPrices = [purchasePrice, ...simulatedPrices];
  
  return calculateVolatility(allPrices);
}
