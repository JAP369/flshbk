"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { InventoryTab } from "@/components/dashboard/tabs/InventoryTab";
import { ArbitrageTab } from "@/components/dashboard/tabs/ArbitrageTab";
import { DealsTab } from "@/components/dashboard/tabs/DealsTab";
import { AnalyticsTab } from "@/components/dashboard/tabs/AnalyticsTab";

const VALID_TABS = ["overview", "inventory", "arbitrage", "deals", "analytics"];

export function DashboardClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `/dashboard?tab=${tab}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-24 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
                Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Portfolio overview, inventory, deals & analytics
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg bg-surface-elevated text-slate-400 hover:text-accent transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "arbitrage" && <ArbitrageTab />}
          {activeTab === "deals" && <DealsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </motion.div>
      </div>
    </div>
  );
}
