// =============================================================================
// POPULATION SCREENER - RISK MANAGEMENT GATEKEEPER
// =============================================================================

import {
  ScarcityEvaluation,
  ScreeningRule,
  ScreeningResult,
  PopulationTier,
  RiskScore,
  HIGH_VOLUME_MODERN_SETS,
  BASE_RARITY_IDENTIFIERS,
  POPULATION_THRESHOLDS,
  RISK_THRESHOLDS,
} from "@/types/population-screener";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determine population tier based on PSA population count
 */
export function getPopulationTier(psaPop: number): PopulationTier {
  if (psaPop < POPULATION_THRESHOLDS.ULTRA_RARE) return "ultra-rare";
  if (psaPop < POPULATION_THRESHOLDS.SCARCE) return "scarce";
  if (psaPop < POPULATION_THRESHOLDS.LOW_DENSITY) return "low-density";
  if (psaPop < POPULATION_THRESHOLDS.MODERATE) return "moderate";
  if (psaPop < POPULATION_THRESHOLDS.HIGH_DENSITY) return "high-density";
  return "mass-market";
}

/**
 * Check if set type is a high-volume modern configuration
 */
export function isHighVolumeModernSet(setType: string): boolean {
  return HIGH_VOLUME_MODERN_SETS.some(
    (set) => set.toLowerCase() === setType.toLowerCase()
  );
}

/**
 * Check if rarity is base-tier
 */
export function isBaseRarity(rarity: string): boolean {
  return BASE_RARITY_IDENTIFIERS.some(
    (id) => id.toLowerCase() === rarity.toLowerCase()
  );
}

/**
 * Calculate market risk factor (0-1 scale)
 */
function calculateMarketRiskFactor(
  psaPop: number,
  setType: string,
  isBase: boolean
): number {
  const isHighVolume = isHighVolumeModernSet(setType);
  const popTier = getPopulationTier(psaPop);

  // Base risk from population
  let riskFactor = 0;
  switch (popTier) {
    case "ultra-rare":
      riskFactor = 0.9;
      break;
    case "scarce":
      riskFactor = 0.7;
      break;
    case "low-density":
      riskFactor = 0.5;
      break;
    case "moderate":
      riskFactor = 0.3;
      break;
    case "high-density":
      riskFactor = 0.15;
      break;
    case "mass-market":
      riskFactor = 0.05;
      break;
  }

  // Amplify risk for high-volume modern sets with base rarity
  if (isHighVolume && isBase) {
    riskFactor = Math.min(riskFactor + 0.3, 1.0);
  }

  return riskFactor;
}

// =============================================================================
// CORE EVALUATION FUNCTION
// =============================================================================

/**
 * Evaluate scarcity risk for a given asset profile
 *
 * @param psaPop - PSA population count (number of graded copies)
 * @param setType - The set/product line name
 * @param isBaseRarity - Whether the card is base-tier rarity
 * @returns ScarcityEvaluation with risk score and message
 */
export function evaluateScarcity(
  psaPop: number,
  setType: string,
  isBaseRarity: boolean
): ScarcityEvaluation {
  const populationTier = getPopulationTier(psaPop);
  const isHighVolume = isHighVolumeModernSet(setType);
  const marketRiskFactor = calculateMarketRiskFactor(psaPop, setType, isBaseRarity);

  // Primary rule: Low population + base rarity + high-volume modern set
  const isLowPopBaseInHighVolume =
    psaPop < RISK_THRESHOLDS.PSA_POP_HIGH_RISK &&
    isBaseRarity &&
    isHighVolume;

  if (isLowPopBaseInHighVolume) {
    return {
      riskScore: "high",
      message:
        "⚠️ High Market Risk: Low population density detected is an artifact of low grading submission rates for base-tier profiles, not organic supply caps. Do not pay over-inflated premiums.",
      details: {
        psaPop,
        setType,
        isBaseRarity,
        populationTier,
        marketRiskFactor,
      },
      recommendation:
        "This asset profile typically shows low PSA population because base-tier cards from modern high-volume sets receive fewer grading submissions — not because they're genuinely scarce. Consider the raw (ungraded) market price as a more accurate reference.",
      shouldBlock: true,
    };
  }

  // Secondary rule: Ultra-rare in any set
  if (psaPop < POPULATION_THRESHOLDS.ULTRA_RARE) {
    return {
      riskScore: "medium",
      message: `Low population detected (${psaPop} graded). Verify authenticity and condition carefully.`,
      details: {
        psaPop,
        setType,
        isBaseRarity,
        populationTier,
        marketRiskFactor,
      },
      recommendation:
        "While genuinely low population, ensure pricing reflects actual market demand rather than scarcity premiums alone.",
      shouldBlock: false,
    };
  }

  // Default: Low risk
  return {
    riskScore: "low",
    message: `Population profile appears normal for ${setType}.`,
    details: {
      psaPop,
      setType,
      isBaseRarity,
      populationTier,
      marketRiskFactor,
    },
    recommendation: "Standard due diligence applies.",
    shouldBlock: false,
  };
}

// =============================================================================
// SCREENING RULES
// =============================================================================

export const SCREENING_RULES: ScreeningRule[] = [
  {
    id: "high-risk-base-modern",
    name: "High-Risk Base Rarity in Modern Set",
    description:
      "Low population base-tier cards from high-volume modern sets are often misrepresented as scarce",
    condition: (psaPop, setType, isBaseRarity) =>
      psaPop < RISK_THRESHOLDS.PSA_POP_HIGH_RISK &&
      isBaseRarity &&
      isHighVolumeModernSet(setType),
    riskScore: "high",
    message:
      "⚠️ High Market Risk: Low population density detected is an artifact of low grading submission rates for base-tier profiles, not organic supply caps. Do not pay over-inflated premiums.",
    recommendation:
      "Cross-reference with ungraded market prices before committing to premium pricing.",
  },
  {
    id: "ultra-rare-verification",
    name: "Ultra-Rare Population Verification",
    description:
      "Extremely low population requires additional verification",
    condition: (psaPop) => psaPop < POPULATION_THRESHOLDS.ULTRA_RARE,
    riskScore: "medium",
    message: `Ultra-rare population tier detected. Verify card authenticity and condition.`,
    recommendation:
      "Request additional provenance documentation or third-party verification.",
  },
  {
    id: "low-density-modern-set",
    name: "Low Density in Modern Set",
    description:
      "Modern sets with low population may indicate thin market interest",
    condition: (psaPop, setType) =>
      psaPop < POPULATION_THRESHOLDS.LOW_DENSITY &&
      isHighVolumeModernSet(setType),
    riskScore: "medium",
    message: `Low population in high-volume modern set. May indicate limited collector interest.`,
    recommendation:
      "Review recent sales data to confirm market liquidity before listing.",
  },
];

// =============================================================================
// FULL SCREENING PIPELINE
// =============================================================================

/**
 * Run all screening rules against a record
 */
export function screenRecord(
  psaPop: number,
  setType: string,
  isBaseRarity: boolean
): ScreeningResult {
  const evaluations: ScarcityEvaluation[] = [];
  const blockedRules: ScreeningRule[] = [];

  // Run primary evaluation
  const primaryEval = evaluateScarcity(psaPop, setType, isBaseRarity);
  evaluations.push(primaryEval);

  // Run additional rules
  for (const rule of SCREENING_RULES) {
    if (rule.condition(psaPop, setType, isBaseRarity)) {
      if (rule.riskScore === "high") {
        blockedRules.push(rule);
      }
    }
  }

  return {
    passed: blockedRules.length === 0,
    evaluations,
    blockedRules,
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// VALIDATION INTERCEPTOR
// =============================================================================

/**
 * Validate a record before submission
 * Returns validation result with blocking status
 */
export function validateBeforeSubmission(
  psaPop: number,
  setType: string,
  isBaseRarity: boolean
): {
  canProceed: boolean;
  requiresConfirmation: boolean;
  evaluation: ScarcityEvaluation;
} {
  const evaluation = evaluateScarcity(psaPop, setType, isBaseRarity);

  return {
    canProceed: !evaluation.shouldBlock,
    requiresConfirmation: evaluation.shouldBlock,
    evaluation,
  };
}
