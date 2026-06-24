"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Scale,
  AlertTriangle,
  Package,
  Star,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// =============================================================================
// DASHBOARD DATA
// =============================================================================

const dashboardSummary = {
  totalValue: 156750,
  totalCost: 128400,
  totalPnl: 28350,
  pnlPercent: 22.1,
  change30d: 12580,
  change30dPercent: 8.7,
  leftDeployed: 31350,
  leftTarget: 31350,
  leftPercent: 20,
  rightDeployed: 125400,
  rightTarget: 125400,
  rightPercent: 80,
  availableCash: 8500,
};

const monthlyPerformance = [
  { month: "Jul", value: 118000 },
  { month: "Aug", value: 122500 },
  { month: "Sep", value: 119800 },
  { month: "Oct", value: 131200 },
  { month: "Nov", value: 138500 },
  { month: "Dec", value: 144200 },
  { month: "Jan", value: 156750 },
];

const recentActivity = [
  { id: 1, type: "buy", asset: "Charizard ex PSA 10", amount: 8500, quantity: 1, time: "2h ago" },
  { id: 2, type: "sell", asset: "Pikachu Raw", amount: 120, quantity: 5, time: "5h ago" },
  { id: 3, type: "value_up", asset: "Blue-Eyes White Dragon", amount: 2500, time: "1d ago" },
  { id: 4, type: "buy", asset: "151 Booster Box", amount: 4500, quantity: 3, time: "2d ago" },
  { id: 5, type: "value_down", asset: "Evolving Skies Box", amount: -500, time: "3d ago" },
];

const topPerformers = [
  { name: "Blue-Eyes BGS 10", value: 25000, pnl: 16500, pnlPercent: 194.1 },
  { name: "Luffy PSA 10", value: 15000, pnl: 9800, pnlPercent: 188.5 },
  { name: "Umbreon VMAX PSA 10", value: 15000, pnl: 7000, pnlPercent: 87.5 },
  { name: "Miraidon ex PSA 10", value: 6800, pnl: 4000, pnlPercent: 142.9 },
];

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

export function OverviewTab() {
  const isPositive = dashboardSummary.change30d >= 0;
  const pnlIsPositive = dashboardSummary.totalPnl >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Portfolio"
          value={formatHKD(dashboardSummary.totalValue)}
          change={`${pnlIsPositive ? "+" : ""}${formatHKD(dashboardSummary.totalPnl)}`}
          changePercent={dashboardSummary.pnlPercent}
          icon={Wallet}
          color="text-accent"
          bgColor="bg-accent/10"
          delay={0}
        />
        <SummaryCard
          title="30-Day Change"
          value={formatHKD(Math.abs(dashboardSummary.change30d))}
          change={`${dashboardSummary.change30dPercent >= 0 ? "+" : ""}${dashboardSummary.change30dPercent.toFixed(1)}%`}
          changePercent={dashboardSummary.change30dPercent}
          icon={isPositive ? TrendingUp : TrendingDown}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
          delay={0.1}
        />
        <SummaryCard
          title="Active Trading"
          value={formatHKD(dashboardSummary.leftDeployed)}
          change={`${dashboardSummary.leftPercent}% deployed`}
          changePercent={dashboardSummary.leftPercent - 20}
          icon={Zap}
          color="text-sky-400"
          bgColor="bg-sky-400/10"
          delay={0.2}
        />
        <SummaryCard
          title="Premium Vault"
          value={formatHKD(dashboardSummary.rightDeployed)}
          change={`${dashboardSummary.rightPercent}% deployed`}
          changePercent={dashboardSummary.rightPercent - 80}
          icon={Shield}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
          delay={0.3}
        />
      </div>

      {/* Performance Chart & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg text-foreground mb-4">Monthly Performance</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 15, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatHKD(Number(value)), "Value"]}
                />
                <Bar dataKey="value" fill="#ff2d2d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Allocation Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg text-foreground mb-4">Allocation</h3>
          
          {/* Left Side */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-foreground">Active Trading</span>
              </div>
              <span className="text-sm text-slate-400">{dashboardSummary.leftPercent}%</span>
            </div>
            <div className="h-2.5 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dashboardSummary.leftPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">Target: 20%</span>
              <span className="text-xs text-slate-400">{formatHKD(dashboardSummary.leftDeployed)}</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-foreground">Premium Vault</span>
              </div>
              <span className="text-sm text-slate-400">{dashboardSummary.rightPercent}%</span>
            </div>
            <div className="h-2.5 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dashboardSummary.rightPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">Target: 80%</span>
              <span className="text-xs text-slate-400">{formatHKD(dashboardSummary.rightDeployed)}</span>
            </div>
          </div>

          {/* Cash Reserve */}
          <div className="p-3 rounded-lg bg-surface-elevated/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Cash Reserve</span>
              <span className="text-sm font-medium text-foreground">{formatHKD(dashboardSummary.availableCash)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Performers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-5 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-lg text-foreground">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <motion.div
                key={performer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{performer.name}</p>
                    <p className="text-xs text-slate-400">{formatHKD(performer.value)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">
                    +{formatHKD(performer.pnl)}
                  </p>
                  <p className="text-xs text-emerald-400">+{performer.pnlPercent.toFixed(1)}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated/50"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === "buy" ? "bg-emerald-500/10" :
                  activity.type === "sell" ? "bg-sky-500/10" :
                  activity.type === "value_up" ? "bg-emerald-500/10" :
                  "bg-red-500/10"
                }`}>
                  {activity.type === "buy" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : activity.type === "sell" ? (
                    <ArrowDownRight className="w-4 h-4 text-sky-400" />
                  ) : activity.type === "value_up" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.asset}</p>
                  <p className="text-xs text-slate-400">
                    {activity.quantity ? `${activity.quantity}x · ` : ""}{activity.time}
                  </p>
                </div>
                <span className={`text-sm font-medium ${
                  activity.type === "value_down" || activity.type === "sell" ? "text-red-400" : "text-emerald-400"
                }`}>
                  {activity.type === "value_down" ? "-" : activity.type === "sell" ? "-" : "+"}{formatHKD(Math.abs(activity.amount))}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// SUMMARY CARD COMPONENT
// =============================================================================

function SummaryCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  color,
  bgColor,
  delay,
}: {
  title: string;
  value: string;
  change: string;
  changePercent: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay: number;
}) {
  const isPositive = changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {title}
        </span>
      </div>
      <p className="font-serif text-xl sm:text-2xl text-foreground">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400" />
        )}
        <span className={`text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {change}
        </span>
      </div>
    </motion.div>
  );
}
