"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Sparkles,
} from "lucide-react";

// =============================================================================
// DEALS DATA
// =============================================================================

const activeDeals = [
  {
    id: "deal-001",
    asset: "Charizard ex PSA 10",
    type: "arbitrage",
    buyPrice: 7200,
    sellPrice: 8500,
    potentialProfit: 1300,
    profitPercent: 18.1,
    status: "active",
    timeLeft: "2h 34m",
    source: "eBay → TCGPlayer",
  },
  {
    id: "deal-002",
    asset: "Blue-Eyes White Dragon BGS 10",
    type: "arbitrage",
    buyPrice: 22000,
    sellPrice: 25000,
    potentialProfit: 3000,
    profitPercent: 13.6,
    status: "active",
    timeLeft: "5h 12m",
    source: "CardMarket → PSA",
  },
  {
    id: "deal-003",
    asset: "Miraidon ex PSA 10",
    type: "flip",
    buyPrice: 6800,
    estimatedSell: 8200,
    potentialProfit: 1400,
    profitPercent: 20.6,
    status: "pending",
    timeLeft: null,
    source: "Recent Purchase",
  },
];

const completedDeals = [
  {
    id: "deal-004",
    asset: "Luffy PSA 10",
    type: "flip",
    buyPrice: 5200,
    sellPrice: 15000,
    profit: 9800,
    profitPercent: 188.5,
    status: "completed",
    completedDate: "2 days ago",
  },
  {
    id: "deal-005",
    asset: "Umbreon VMAX PSA 10",
    type: "arbitrage",
    buyPrice: 12000,
    sellPrice: 15000,
    profit: 3000,
    profitPercent: 25.0,
    status: "completed",
    completedDate: "5 days ago",
  },
  {
    id: "deal-006",
    asset: "Mewtwo GX BGS 9.5",
    type: "flip",
    buyPrice: 2800,
    sellPrice: 2200,
    profit: -600,
    profitPercent: -21.4,
    status: "loss",
    completedDate: "1 week ago",
  },
];

const dealStats = {
  totalArbitrage: 4300,
  totalFlips: 9200,
  totalProfit: 13500,
  successRate: 87.5,
  avgHoldTime: "4.2 days",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DealsTab() {
  const [activeSection, setActiveSection] = useState<"active" | "completed">("active");

  return (
    <div className="space-y-6">
      {/* Deal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Arbitrage Profit"
          value={formatHKD(dealStats.totalArbitrage)}
          icon={Zap}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
          delay={0}
        />
        <StatCard
          label="Flip Profit"
          value={formatHKD(dealStats.totalFlips)}
          icon={TrendingUp}
          color="text-sky-400"
          bgColor="bg-sky-400/10"
          delay={0.1}
        />
        <StatCard
          label="Total Profit"
          value={formatHKD(dealStats.totalProfit)}
          icon={Sparkles}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
          delay={0.2}
        />
        <StatCard
          label="Success Rate"
          value={`${dealStats.successRate}%`}
          icon={CheckCircle}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
          delay={0.3}
        />
        <StatCard
          label="Avg Hold Time"
          value={dealStats.avgHoldTime}
          icon={Clock}
          color="text-violet-400"
          bgColor="bg-violet-400/10"
          delay={0.4}
        />
      </div>

      {/* Section Toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border w-fit">
        <button
          onClick={() => setActiveSection("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === "active"
              ? "bg-accent/10 text-accent border border-accent/30"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          Active Deals ({activeDeals.length})
        </button>
        <button
          onClick={() => setActiveSection("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === "completed"
              ? "bg-accent/10 text-accent border border-accent/30"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          Completed ({completedDeals.length})
        </button>
      </div>

      {/* Deals List */}
      <AnimatePresence mode="wait">
        {activeSection === "active" ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activeDeals.map((deal, index) => (
              <ActiveDealCard key={deal.id} deal={deal} index={index} />
            ))}
            {activeDeals.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No active deals</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {completedDeals.map((deal, index) => (
              <CompletedDealCard key={deal.id} deal={deal} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-serif text-lg text-foreground">{value}</p>
    </motion.div>
  );
}

// =============================================================================
// ACTIVE DEAL CARD
// =============================================================================

function ActiveDealCard({ deal, index }: { deal: typeof activeDeals[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-xl p-4 border border-border"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Deal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-foreground">{deal.asset}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              deal.type === "arbitrage" ? "bg-emerald-500/10 text-emerald-400" : "bg-sky-500/10 text-sky-400"
            }`}>
              {deal.type}
            </span>
          </div>
          <p className="text-xs text-slate-400">{deal.source}</p>
        </div>

        {/* Price Info */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Buy</p>
            <p className="text-sm font-medium text-foreground">{formatHKD(deal.buyPrice)}</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Sell</p>
            <p className="text-sm font-medium text-foreground">
              {formatHKD(deal.sellPrice || deal.estimatedSell || 0)}
            </p>
          </div>
        </div>

        {/* Profit & Status */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Profit</p>
            <p className="text-sm font-bold text-emerald-400">
              +{formatHKD(deal.potentialProfit)}
            </p>
            <p className="text-xs text-emerald-400">+{deal.profitPercent}%</p>
          </div>
          {deal.timeLeft && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">{deal.timeLeft}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// COMPLETED DEAL CARD
// =============================================================================

function CompletedDealCard({ deal, index }: { deal: typeof completedDeals[0]; index: number }) {
  const isProfit = deal.profit >= 0;
  const isCompleted = deal.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-xl p-4 border border-border"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Deal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-foreground">{deal.asset}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              isCompleted ? "bg-emerald-500/10 text-emerald-400" :
              deal.status === "loss" ? "bg-red-500/10 text-red-400" :
              "bg-amber-500/10 text-amber-400"
            }`}>
              {deal.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">{deal.completedDate}</p>
        </div>

        {/* Price Info */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Buy</p>
            <p className="text-sm font-medium text-foreground">{formatHKD(deal.buyPrice)}</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Sell</p>
            <p className="text-sm font-medium text-foreground">{formatHKD(deal.sellPrice)}</p>
          </div>
        </div>

        {/* Profit */}
        <div className="text-right">
          <p className="text-xs text-slate-400">Profit</p>
          <p className={`text-sm font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? "+" : ""}{formatHKD(deal.profit)}
          </p>
          <p className={`text-xs ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? "+" : ""}{deal.profitPercent}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
