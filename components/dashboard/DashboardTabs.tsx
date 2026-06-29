"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "arbitrage", label: "Arbitrage", icon: Zap },
  { id: "deals", label: "Deals", icon: TrendingUp },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "text-foreground"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="dashboardTabIndicator"
                className="absolute inset-0 bg-accent/10 border border-accent/30 rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
