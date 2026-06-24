"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
} from "lucide-react";

// =============================================================================
// INVENTORY DATA
// =============================================================================

const inventoryItems = [
  {
    id: "inv-001",
    name: "Charizard ex",
    setName: "Scarlet & Violet",
    setCode: "sv01",
    cardNumber: "054/198",
    grade: "PSA 10",
    quantity: 2,
    purchasePrice: 3200,
    currentPrice: 8500,
    totalValue: 17000,
    pnl: 10600,
    pnlPercent: 165.6,
    allocation: "vault",
    category: "Pokemon",
  },
  {
    id: "inv-002",
    name: "Blue-Eyes White Dragon",
    setName: "Legend of Blue-Eyes",
    setCode: "LOB",
    cardNumber: "LOB-001",
    grade: "BGS 10",
    quantity: 1,
    purchasePrice: 8500,
    currentPrice: 25000,
    totalValue: 25000,
    pnl: 16500,
    pnlPercent: 194.1,
    allocation: "vault",
    category: "Yu-Gi-Oh!",
  },
  {
    id: "inv-003",
    name: "Monkey D. Luffy",
    setName: "Romance Dawn",
    setCode: "op01",
    cardNumber: "OP01-001",
    grade: "PSA 10",
    quantity: 1,
    purchasePrice: 5200,
    currentPrice: 15000,
    totalValue: 15000,
    pnl: 9800,
    pnlPercent: 188.5,
    allocation: "active",
    category: "One Piece",
  },
  {
    id: "inv-004",
    name: "Umbreon VMAX",
    setName: "Evolving Skies",
    setCode: "swsh07",
    cardNumber: "069/203",
    grade: "PSA 10",
    quantity: 1,
    purchasePrice: 8000,
    currentPrice: 15000,
    totalValue: 15000,
    pnl: 7000,
    pnlPercent: 87.5,
    allocation: "vault",
    category: "Pokemon",
  },
  {
    id: "inv-005",
    name: "Miraidon ex",
    setName: "Scarlet & Violet",
    setCode: "sv01",
    cardNumber: "081/198",
    grade: "PSA 10",
    quantity: 1,
    purchasePrice: 2800,
    currentPrice: 6800,
    totalValue: 6800,
    pnl: 4000,
    pnlPercent: 142.9,
    allocation: "vault",
    category: "Pokemon",
  },
  {
    id: "inv-006",
    name: "151 Booster Box",
    setName: "Scarlet & Violet 151",
    setCode: "sv151",
    cardNumber: null,
    grade: "Sealed",
    quantity: 3,
    purchasePrice: 1200,
    currentPrice: 1500,
    totalValue: 4500,
    pnl: 900,
    pnlPercent: 25.0,
    allocation: "vault",
    category: "Pokemon",
  },
  {
    id: "inv-007",
    name: "Evolving Skies Booster Box",
    setName: "Sword & Shield",
    setCode: "swsh07",
    cardNumber: null,
    grade: "Sealed",
    quantity: 2,
    purchasePrice: 4500,
    currentPrice: 4000,
    totalValue: 8000,
    pnl: -1000,
    pnlPercent: -11.1,
    allocation: "vault",
    category: "Pokemon",
  },
  {
    id: "inv-008",
    name: "Mewtwo GX",
    setName: "Hidden Fates",
    setCode: "hif",
    cardNumber: "33/68",
    grade: "BGS 9.5",
    quantity: 2,
    purchasePrice: 2200,
    currentPrice: 2800,
    totalValue: 5600,
    pnl: 1200,
    pnlPercent: 27.3,
    allocation: "vault",
    category: "Pokemon",
  },
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

export function InventoryTab() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [allocationFilter, setAllocationFilter] = useState<"all" | "active" | "vault">("all");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.setName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAllocation =
      allocationFilter === "all" || item.allocation === allocationFilter;
    return matchesSearch && matchesAllocation;
  });

  const totalQuantity = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.totalValue, 0);
  const totalPnl = inventoryItems.reduce((sum, i) => sum + i.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Items</p>
          <p className="font-serif text-2xl text-foreground">{totalQuantity}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Value</p>
          <p className="font-serif text-2xl text-foreground">{formatHKD(totalValue)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Unrealized P&L</p>
          <p className={`font-serif text-2xl ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}{formatHKD(totalPnl)}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
          />
        </div>

        {/* Allocation Filter */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border">
          {(["all", "active", "vault"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setAllocationFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                allocationFilter === filter
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-xl border border-border">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-foreground"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list" ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filteredItems.map((item, index) => (
              <InventoryCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredItems.map((item, index) => (
              <InventoryListItem key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No items found</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INVENTORY CARD (GRID VIEW)
// =============================================================================

function InventoryCard({ item, index }: { item: typeof inventoryItems[0]; index: number }) {
  const isPositive = item.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-surface-elevated relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-8 h-8 text-slate-600" />
        </div>
        {/* Grade Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-white">{item.grade}</span>
        </div>
        {/* Allocation Badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full ${
          item.allocation === "active" ? "bg-emerald-500/80" : "bg-amber-500/80"
        }`}>
          <span className="text-[10px] font-bold text-white capitalize">{item.allocation}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
        <p className="text-xs text-slate-400 truncate">{item.setName}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
            <p className="text-sm font-semibold text-foreground">{formatHKD(item.totalValue)}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{isPositive ? "+" : ""}{item.pnlPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// INVENTORY LIST ITEM (LIST VIEW)
// =============================================================================

function InventoryListItem({ item, index }: { item: typeof inventoryItems[0]; index: number }) {
  const isPositive = item.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-xl p-4 border border-border"
    >
      <div className="flex items-center gap-4">
        {/* Image Placeholder */}
        <div className="w-16 h-16 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-slate-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
              {item.grade}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">
            {item.setName} {item.cardNumber && `· #${item.cardNumber}`}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
            <span className="text-xs text-slate-400">
              {formatHKD(item.purchasePrice)} → {formatHKD(item.currentPrice)}
            </span>
          </div>
        </div>

        {/* Value & P&L */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-foreground">{formatHKD(item.totalValue)}</p>
          <div className={`flex items-center justify-end gap-0.5 text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? "+" : ""}{item.pnlPercent.toFixed(1)}%</span>
          </div>
          <p className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{formatHKD(item.pnl)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
