// =============================================================================
// POPULATION SCREENER TYPES
// =============================================================================

export type RiskScore = "low" | "high" | "medium";

export interface ScarcityEvaluation {
  riskScore: RiskScore;
  message: string;
  details: {
    psaPop: number;
    setType: string;
    isBaseRarity: boolean;
    populationTier: PopulationTier;
    marketRiskFactor: number;
  };
  recommendation: string;
  shouldBlock: boolean;
}

export type PopulationTier =
  | "ultra-rare" // < 1000
  | "scarce" // 1000 - 3000
  | "low-density" // 3000 - 6000
  | "moderate" // 6000 - 15000
  | "high-density" // 15000 - 50000
  | "mass-market"; // > 50000

export interface ScreeningRule {
  id: string;
  name: string;
  description: string;
  condition: (psaPop: number, setType: string, isBaseRarity: boolean) => boolean;
  riskScore: RiskScore;
  message: string;
  recommendation: string;
}

export interface ScreeningResult {
  passed: boolean;
  evaluations: ScarcityEvaluation[];
  blockedRules: ScreeningRule[];
  timestamp: string;
}

export interface TrackedRecord {
  id: string;
  assetName: string;
  psaPop: number;
  setType: string;
  isBaseRarity: boolean;
  listedPrice: number;
  marketFloor: number;
  createdAt: string;
}

// =============================================================================
// HIGH-VOLUME MODERN SET CONFIGURATIONS
// =============================================================================

export const HIGH_VOLUME_MODERN_SETS = [
  "VMAX Climax",
  "Shiny Treasure",
  "SV 151 Base",
  "Paldean Fates",
  "Crown Zenith",
  "Evolving Skies",
  "Chilling Reign",
  "Battle Styles",
  "Fusion Strike",
  "Brilliant Stars",
  "Astral Radiance",
  "Lost Origin",
  "Silver Tempest",
  "Scarlet & Violet Base",
  "Obsidian Flames",
  "Paldea Evolved",
  "Temporal Forces",
  "Twilight Masquerade",
  "Shrouded Fable",
  "Stellar Crown",
] as const;

// =============================================================================
// BASE RARITY IDENTIFIERS
// =============================================================================

export const BASE_RARITY_IDENTIFIERS = [
  "RR", // Double Rare
  "V", // Base V
  "ex", // Base ex
  "VSTAR", // Base VSTAR
  "VMAX", // Base VMAX (non-full art)
  "SV", // Scarlet & Violet Base
  "S", // Base Star
  "AR", // Alternate Rare (base)
] as const;

// =============================================================================
// POPULATION THRESHOLDS
// =============================================================================

export const POPULATION_THRESHOLDS = {
  ULTRA_RARE: 1000,
  SCARCE: 3000,
  LOW_DENSITY: 6000,
  MODERATE: 15000,
  HIGH_DENSITY: 50000,
} as const;

// =============================================================================
// RISK THRESHOLDS
// =============================================================================

export const RISK_THRESHOLDS = {
  PSA_POP_HIGH_RISK: 6000,
  MARKET_RISK_FACTOR_HIGH: 0.7,
  MARKET_RISK_FACTOR_MEDIUM: 0.4,
} as const;
