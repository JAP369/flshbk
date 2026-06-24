"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// =============================================================================
// ANALYTICS DATA
// =============================================================================

const performanceData = [
  { month: "Jul", portfolio: 118000, benchmark: 115000 },
  { month: "Aug", portfolio: 122500, benchmark: 116200 },
  { month: "Sep", portfolio: 119800, benchmark: 114800 },
  { month: "Oct", portfolio: 131200, benchmark: 118500 },
  { month: "Nov", portfolio: 138500, benchmark: 121000 },
  { month: "Dec", portfolio: 144200, benchmark: 123500 },
  { month: "Jan", portfolio: 156750, benchmark: 126000 },
];

const categoryAllocation = [
  { name: "Pokemon", value: 68, color: "#ff2d2d" },
  { name: "Yu-Gi-Oh!", value: 16, color: "#fbbf24" },
  { name: "One Piece", value: 10, color: "#3b82f6" },
  { name: "Sealed", value: 6, color: "#8b5cf6" },
];

const gradeDistribution = [
  { grade: "PSA 10", count: 4, value: 62000 },
  { grade: "BGS 10", count: 1, value: 25000 },
  { grade: "BGS 9.5", count: 1, value: 5600 },
  { grade: "Sealed", count: 5, value: 12500 },
  { grade: "Raw", count: 5, value: 600 },
];

const topCategories = [
  { category: "Pokemon", items: 6, value: 106600, avgPnl: 85.2 },
  { category: "Yu-Gi-Oh!", items: 1, value: 25000, avgPnl: 194.1 },
  { category: "One Piece", items: 1, value: 15000, avgPnl: 188.5 },
  { category: "Sealed", items: 5, value: 12500, avgPnl: -2.5 },
];

const metrics = {
  totalReturn: 22.1,
  sharpeRatio: 1.85,
  maxDrawdown: -8.4,
  winRate: 73.3,
  avgHoldReturn: 45.2,
  bestPerformer: 194.1,
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

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Return"
          value={`${metrics.totalReturn}%`}
          change="+5.2% vs last month"
          icon={TrendingUp}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
          delay={0}
        />
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          change="Risk-adjusted"
          icon={Activity}
          color="text-sky-400"
          bgColor="bg-sky-400/10"
          delay={0.1}
        />
        <MetricCard
          label="Max Drawdown"
          value={`${metrics.maxDrawdown}%`}
          change="Peak to trough"
          icon={TrendingDown}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
          delay={0.2}
        />
        <MetricCard
          label="Win Rate"
          value={`${metrics.winRate}%`}
          change="11W / 4L trades"
          icon={Target}
          color="text-violet-400"
          bgColor="bg-violet-400/10"
          delay={0.3}
        />
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-foreground">Portfolio vs Benchmark</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-slate-400">Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-xs text-slate-400">Benchmark</span>
            </div>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff2d2d" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ff2d2d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                formatter={(value) => [formatHKD(Number(value))]}
              />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#ff2d2d"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#64748b"
                strokeWidth={2}
                fill="url(#benchmarkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Allocation & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Allocation Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg text-foreground mb-4">Category Allocation</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 15, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}%`, "Allocation"]}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryAllocation.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-slate-400">{cat.name}</span>
                <span className="text-xs font-medium text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grade Distribution Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg text-foreground mb-4">Grade Distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} layout="vertical">
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="grade"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 15, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatHKD(Number(value)), "Value"]}
                />
                <Bar dataKey="value" fill="#ff2d2d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-xl p-5 border border-border"
      >
        <h3 className="font-serif text-lg text-foreground mb-4">Category Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-3">Category</th>
                <th className="text-right text-xs text-slate-400 uppercase tracking-wide pb-3">Items</th>
                <th className="text-right text-xs text-slate-400 uppercase tracking-wide pb-3">Value</th>
                <th className="text-right text-xs text-slate-400 uppercase tracking-wide pb-3">Avg P&L</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((cat, index) => (
                <motion.tr
                  key={cat.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-sm text-foreground">{cat.category}</span>
                    </div>
                  </td>
                  <td className="text-right text-sm text-slate-400">{cat.items}</td>
                  <td className="text-right text-sm font-medium text-foreground">{formatHKD(cat.value)}</td>
                  <td className="text-right">
                    <span className={`text-sm font-medium ${cat.avgPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {cat.avgPnl >= 0 ? "+" : ""}{cat.avgPnl}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// METRIC CARD
// =============================================================================

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  bgColor,
  delay,
}: {
  label: string;
  value: string;
  change: string;
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
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-serif text-2xl text-foreground">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{change}</p>
    </motion.div>
  );
}
