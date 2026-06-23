"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  CheckCircle,
  Info,
  AlertCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ScarcityEvaluation,
  ScreeningResult,
} from "@/types/population-screener";
import {
  evaluateScarcity,
  screenRecord,
  validateBeforeSubmission,
} from "@/lib/population-screener";

// =============================================================================
// TYPES
// =============================================================================

interface PopulationScreenerProps {
  psaPop: number;
  setType: string;
  isBaseRarity: boolean;
  onValidationComplete: (canProceed: boolean, evaluation: ScarcityEvaluation) => void;
  onCancel: () => void;
}

interface ScreeningFormProps {
  onSubmit: (data: {
    psaPop: number;
    setType: string;
    isBaseRarity: boolean;
    assetName: string;
    listedPrice: number;
    marketFloor: number;
  }) => void;
  onCancel: () => void;
}

// =============================================================================
// POPULATION SCREENER MODAL
// =============================================================================

export function PopulationScreenerModal({
  psaPop,
  setType,
  isBaseRarity,
  onValidationComplete,
  onCancel,
}: PopulationScreenerProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const evaluation = useMemo(
    () => evaluateScarcity(psaPop, setType, isBaseRarity),
    [psaPop, setType, isBaseRarity]
  );

  const screeningResult = useMemo(
    () => screenRecord(psaPop, setType, isBaseRarity),
    [psaPop, setType, isBaseRarity]
  );

  const isHighRisk = evaluation.riskScore === "high";
  const isMediumRisk = evaluation.riskScore === "medium";

  const handleConfirm = useCallback(() => {
    if (isHighRisk && !confirmed) {
      setConfirmed(true);
      return;
    }
    onValidationComplete(true, evaluation);
  }, [confirmed, isHighRisk, onValidationComplete, evaluation]);

  const handleProceed = useCallback(() => {
    onValidationComplete(true, evaluation);
  }, [onValidationComplete, evaluation]);

  const handleBlock = useCallback(() => {
    onValidationComplete(false, evaluation);
  }, [onValidationComplete, evaluation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          className={`p-5 border-b border-border ${
            isHighRisk
              ? "bg-red-500/10"
              : isMediumRisk
              ? "bg-amber-500/10"
              : "bg-emerald-500/10"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isHighRisk
                    ? "bg-red-500/20"
                    : isMediumRisk
                    ? "bg-amber-500/20"
                    : "bg-emerald-500/20"
                }`}
              >
                {isHighRisk ? (
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                ) : isMediumRisk ? (
                  <Shield className="w-5 h-5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h2 className="font-serif text-lg text-foreground">
                  Population Screener
                </h2>
                <p className="text-xs text-silver">
                  Automated risk validation gate
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <X className="w-4 h-4 text-silver" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Risk Badge */}
          <div
            className={`p-4 rounded-xl border ${
              isHighRisk
                ? "bg-red-500/10 border-red-500/20"
                : isMediumRisk
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isHighRisk ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : isMediumRisk ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              <span
                className={`font-medium ${
                  isHighRisk
                    ? "text-red-400"
                    : isMediumRisk
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {isHighRisk
                  ? "High Risk Detected"
                  : isMediumRisk
                  ? "Medium Risk Detected"
                  : "Low Risk - Passed"}
              </span>
            </div>
            <p className="text-sm text-silver leading-relaxed">
              {evaluation.message}
            </p>
          </div>

          {/* Parameters Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-surface-elevated">
              <p className="text-xs text-silver">PSA Population</p>
              <p className="font-serif text-lg text-foreground">{psaPop.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated">
              <p className="text-xs text-silver">Set Type</p>
              <p className="font-medium text-sm text-foreground truncate">{setType}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated">
              <p className="text-xs text-silver">Base Rarity</p>
              <p className="font-medium text-sm text-foreground">
                {isBaseRarity ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-accent font-medium mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-silver leading-relaxed">
                  {evaluation.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors"
          >
            <span className="text-sm text-foreground">Technical Details</span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-silver" />
            ) : (
              <ChevronDown className="w-4 h-4 text-silver" />
            )}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-surface-elevated space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-silver">Population Tier</span>
                    <span className="text-foreground capitalize">
                      {evaluation.details.populationTier.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Market Risk Factor</span>
                    <span className="text-foreground">
                      {(evaluation.details.marketRiskFactor * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Rules Triggered</span>
                    <span className="text-foreground">
                      {screeningResult.blockedRules.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmation Checkbox (for high risk) */}
          {isHighRisk && (
            <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated/50 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent"
              />
              <span className="text-sm text-silver">
                I understand this asset may have artificially low population
                metrics due to grading submission rates, not genuine scarcity.
                I accept the risk of paying over-inflated premiums.
              </span>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-5 border-t border-border bg-surface/30">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-surface-elevated text-silver hover:text-foreground transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          {isHighRisk ? (
            confirmed ? (
              <button
                onClick={handleProceed}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Proceed with Risk
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-2.5 rounded-lg bg-red-500/50 text-white/50 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Acknowledge Risk
              </button>
            )
          ) : (
            <button
              onClick={handleProceed}
              className="flex-1 py-2.5 rounded-lg bg-accent text-background hover:bg-accent-hover transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Proceed
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// SCREENING FORM WITH INTERCEPTOR
// =============================================================================

export function ScreeningFormWithInterceptor({ onSubmit, onCancel }: ScreeningFormProps) {
  const [formData, setFormData] = useState({
    assetName: "",
    psaPop: "",
    setType: "",
    isBaseRarity: false,
    listedPrice: "",
    marketFloor: "",
  });

  const [showScreener, setShowScreener] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    psaPop: number;
    setType: string;
    isBaseRarity: boolean;
  } | null>(null);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const psaPop = parseInt(formData.psaPop) || 0;
    const setType = formData.setType;
    const isBaseRarity = formData.isBaseRarity;

    // Run validation
    const validation = validateBeforeSubmission(psaPop, setType, isBaseRarity);

    if (validation.requiresConfirmation) {
      setPendingSubmission({ psaPop, setType, isBaseRarity });
      setShowScreener(true);
    } else {
      // No blocking, proceed directly
      onSubmit({
        psaPop,
        setType,
        isBaseRarity,
        assetName: formData.assetName,
        listedPrice: parseFloat(formData.listedPrice) || 0,
        marketFloor: parseFloat(formData.marketFloor) || 0,
      });
    }
  };

  const handleValidationComplete = (
    canProceed: boolean,
    evaluation: ScarcityEvaluation
  ) => {
    setShowScreener(false);

    if (canProceed && pendingSubmission) {
      onSubmit({
        psaPop: pendingSubmission.psaPop,
        setType: pendingSubmission.setType,
        isBaseRarity: pendingSubmission.isBaseRarity,
        assetName: formData.assetName,
        listedPrice: parseFloat(formData.listedPrice) || 0,
        marketFloor: parseFloat(formData.marketFloor) || 0,
      });
    }

    setPendingSubmission(null);
  };

  const handleScreenerCancel = () => {
    setShowScreener(false);
    setPendingSubmission(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-silver mb-1">Asset Name</label>
          <input
            type="text"
            value={formData.assetName}
            onChange={(e) => handleInputChange("assetName", e.target.value)}
            placeholder="e.g., Pokemon 151 Booster Box"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-silver mb-1">PSA Population</label>
            <input
              type="number"
              value={formData.psaPop}
              onChange={(e) => handleInputChange("psaPop", e.target.value)}
              placeholder="e.g., 5000"
              min={0}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-silver mb-1">Set Type</label>
            <input
              type="text"
              value={formData.setType}
              onChange={(e) => handleInputChange("setType", e.target.value)}
              placeholder="e.g., SV 151 Base"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-silver mb-1">Listed Price (HKD)</label>
            <input
              type="number"
              value={formData.listedPrice}
              onChange={(e) => handleInputChange("listedPrice", e.target.value)}
              placeholder="e.g., 4500"
              min={0}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-silver mb-1">Market Floor (HKD)</label>
            <input
              type="number"
              value={formData.marketFloor}
              onChange={(e) => handleInputChange("marketFloor", e.target.value)}
              placeholder="e.g., 5200"
              min={0}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isBaseRarity}
            onChange={(e) => handleInputChange("isBaseRarity", e.target.checked)}
            className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent"
          />
          <span className="text-sm text-foreground">
            Base Rarity (RR, V, ex, VSTAR, etc.)
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-surface-elevated text-silver hover:text-foreground transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg bg-accent text-background hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Population Screener Modal */}
      <AnimatePresence>
        {showScreener && pendingSubmission && (
          <PopulationScreenerModal
            psaPop={pendingSubmission.psaPop}
            setType={pendingSubmission.setType}
            isBaseRarity={pendingSubmission.isBaseRarity}
            onValidationComplete={handleValidationComplete}
            onCancel={handleScreenerCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// =============================================================================
// INLINE SCREENER BANNER (for existing records)
// =============================================================================

export function InlineScreenerBanner({
  psaPop,
  setType,
  isBaseRarity,
}: {
  psaPop: number;
  setType: string;
  isBaseRarity: boolean;
}) {
  const evaluation = useMemo(
    () => evaluateScarcity(psaPop, setType, isBaseRarity),
    [psaPop, setType, isBaseRarity]
  );

  if (evaluation.riskScore === "low") return null;

  const isHighRisk = evaluation.riskScore === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border flex items-start gap-3 ${
        isHighRisk
          ? "bg-red-500/10 border-red-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      }`}
    >
      {isHighRisk ? (
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isHighRisk ? "text-red-400" : "text-amber-400"
          }`}
        >
          {isHighRisk ? "High Risk Asset" : "Medium Risk Asset"}
        </p>
        <p className="text-xs text-silver mt-1 leading-relaxed">
          {evaluation.message}
        </p>
      </div>
    </motion.div>
  );
}
