"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  X,
  Filter,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { CollectionItem, FilterState, SortOption } from "@/types/collection";

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

function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function getGradeColor(grade: string): string {
  if (grade.includes("10")) return "bg-emerald-500";
  if (grade.includes("9.5")) return "bg-emerald-400";
  if (grade.includes("9")) return "bg-sky-500";
  if (grade.includes("8")) return "bg-sky-400";
  if (grade === "Sealed") return "bg-violet-500";
  if (grade === "Raw") return "bg-slate-400";
  return "bg-slate-500";
}

function getGradeBorderColor(grade: string): string {
  if (grade.includes("10")) return "border-emerald-500/30";
  if (grade.includes("9.5")) return "border-emerald-400/30";
  if (grade.includes("9")) return "border-sky-500/30";
  if (grade.includes("8")) return "border-sky-400/30";
  if (grade === "Sealed") return "border-violet-500/30";
  if (grade === "Raw") return "border-slate-400/30";
  return "border-slate-500/30";
}

function getPnlColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-slate-400";
}

function getPnlBgColor(value: number): string {
  if (value > 0) return "bg-emerald-500/10";
  if (value < 0) return "bg-red-500/10";
  return "bg-slate-500/10";
}

// =============================================================================
// DUMMY DATA
// =============================================================================

const DUMMY_ITEMS: CollectionItem[] = [
  {
    id: "col-001",
    name: "Charizard ex",
    setName: "Scarlet & Violet",
    setCode: "sv01",
    cardNumber: "054/198",
    rarity: "Ultra Rare",
    itemType: "singles",
    imageUrl: "/images/charizard-ex.jpg",
    grade: "PSA 10",
    quantity: 2,
    purchasePriceHkd: 3200,
    currentValueHkd: 8500,
    priceChange30d: 12.4,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "PSA 10",
  },
  {
    id: "col-002",
    name: "Miraidon ex",
    setName: "Scarlet & Violet",
    setCode: "sv01",
    cardNumber: "081/198",
    rarity: "Ultra Rare",
    itemType: "singles",
    imageUrl: "/images/miraidon-ex.jpg",
    grade: "PSA 10",
    quantity: 1,
    purchasePriceHkd: 2800,
    currentValueHkd: 6800,
    priceChange30d: 8.7,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "PSA 10",
  },
  {
    id: "col-003",
    name: "151 Booster Box",
    setName: "Scarlet & Violet 151",
    setCode: "sv151",
    cardNumber: null,
    rarity: null,
    itemType: "sealed_box",
    imageUrl: "/images/151-box.jpg",
    grade: "Sealed",
    quantity: 3,
    purchasePriceHkd: 1200,
    currentValueHkd: 1500,
    priceChange30d: 5.2,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "Sealed",
  },
  {
    id: "col-004",
    name: "Monkey D. Luffy",
    setName: "Romance Dawn",
    setCode: "op01",
    cardNumber: "OP01-001",
    rarity: "Leader",
    itemType: "singles",
    imageUrl: "/images/luffy.jpg",
    grade: "PSA 10",
    quantity: 1,
    purchasePriceHkd: 5200,
    currentValueHkd: 15000,
    priceChange30d: 24.8,
    priceChangeDirection: "up",
    allocationSide: "left_velocity",
    conditionGrade: "PSA 10",
  },
  {
    id: "col-005",
    name: "Blue-Eyes White Dragon",
    setName: "Legend of Blue-Eyes",
    setCode: "LOB",
    cardNumber: "LOB-001",
    rarity: "Ultra Rare",
    itemType: "singles",
    imageUrl: "/images/blue-eyes.jpg",
    grade: "BGS 10",
    quantity: 1,
    purchasePriceHkd: 8500,
    currentValueHkd: 25000,
    priceChange30d: 15.3,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "BGS 10",
  },
  {
    id: "col-006",
    name: "Evolving Skies Booster Box",
    setName: "Sword & Shield",
    setCode: "swsh07",
    cardNumber: null,
    rarity: null,
    itemType: "sealed_box",
    imageUrl: "/images/evolving-skies.jpg",
    grade: "Sealed",
    quantity: 2,
    purchasePriceHkd: 4500,
    currentValueHkd: 4000,
    priceChange30d: -3.2,
    priceChangeDirection: "down",
    allocationSide: "right_vault",
    conditionGrade: "Sealed",
  },
  {
    id: "col-007",
    name: "Pikachu",
    setName: "Base Set",
    setCode: "base",
    cardNumber: "58/102",
    rarity: "Common",
    itemType: "singles",
    imageUrl: "/images/pikachu.jpg",
    grade: "Raw",
    quantity: 5,
    purchasePriceHkd: 150,
    currentValueHkd: 120,
    priceChange30d: -2.1,
    priceChangeDirection: "down",
    allocationSide: "left_velocity",
    conditionGrade: "Raw",
  },
  {
    id: "col-008",
    name: "Umbreon VMAX",
    setName: "Evolving Skies",
    setCode: "swsh07",
    cardNumber: "069/203",
    rarity: "Secret Rare",
    itemType: "singles",
    imageUrl: "/images/umbreon-vmax.jpg",
    grade: "PSA 10",
    quantity: 1,
    purchasePriceHkd: 8000,
    currentValueHkd: 15000,
    priceChange30d: 18.5,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "PSA 10",
  },
  {
    id: "col-009",
    name: "Shiny Treasure Booster Box",
    setName: "Paldea Evolved",
    setCode: "sv02",
    cardNumber: null,
    rarity: null,
    itemType: "sealed_box",
    imageUrl: "/images/shiny-treasure.jpg",
    grade: "Sealed",
    quantity: 4,
    purchasePriceHkd: 950,
    currentValueHkd: 950,
    priceChange30d: 0,
    priceChangeDirection: "neutral",
    allocationSide: "left_velocity",
    conditionGrade: "Sealed",
  },
  {
    id: "col-010",
    name: "Mewtwo GX",
    setName: "Hidden Fates",
    setCode: "hif",
    cardNumber: "33/68",
    rarity: "Ultra Rare",
    itemType: "singles",
    imageUrl: "/images/mewtwo-gx.jpg",
    grade: "BGS 9.5",
    quantity: 2,
    purchasePriceHkd: 2200,
    currentValueHkd: 2800,
    priceChange30d: 6.3,
    priceChangeDirection: "up",
    allocationSide: "right_vault",
    conditionGrade: "BGS 9.5",
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CollectionGrid() {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    sortBy: "recent",
    allocationFilter: "all",
    itemTypeFilter: "all",
  });
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...DUMMY_ITEMS];

    // Search filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.setName.toLowerCase().includes(query) ||
          item.setCode.toLowerCase().includes(query) ||
          (item.cardNumber && item.cardNumber.toLowerCase().includes(query)),
      );
    }

    // Allocation filter
    if (filterState.allocationFilter !== "all") {
      items = items.filter(
        (item) => item.allocationSide === filterState.allocationFilter,
      );
    }

    // Item type filter
    if (filterState.itemTypeFilter !== "all") {
      items = items.filter(
        (item) => item.itemType === filterState.itemTypeFilter,
      );
    }

    // Sort
    switch (filterState.sortBy) {
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "value":
        items.sort((a, b) => b.currentValueHkd - a.currentValueHkd);
        break;
      case "pnl":
        items.sort((a, b) => b.priceChange30d - a.priceChange30d);
        break;
      case "quantity":
        items.sort((a, b) => b.quantity - a.quantity);
        break;
      case "recent":
      default:
        // Keep original order for recent
        break;
    }

    return items;
  }, [filterState]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalQuantity = DUMMY_ITEMS.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalInvested = DUMMY_ITEMS.reduce(
      (sum, item) => sum + item.purchasePriceHkd * item.quantity,
      0,
    );
    const totalCurrent = DUMMY_ITEMS.reduce(
      (sum, item) => sum + item.currentValueHkd * item.quantity,
      0,
    );
    const pnl = totalCurrent - totalInvested;
    const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    return {
      totalItems: DUMMY_ITEMS.length,
      totalQuantity,
      totalInvestedHkd: totalInvested,
      totalCurrentValueHkd: totalCurrent,
      totalUnrealizedPnlHkd: pnl,
      pnlPercentage: pnlPct,
      leftVelocityCount: DUMMY_ITEMS.filter(
        (i) => i.allocationSide === "left_velocity",
      ).length,
      rightVaultCount: DUMMY_ITEMS.filter(
        (i) => i.allocationSide === "right_vault",
      ).length,
    };
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setFilterState((prev) => ({ ...prev, sortBy }));
  }, []);

  const handleAllocationFilter = useCallback(
    (allocation: "all" | "left_velocity" | "right_vault") => {
      setFilterState((prev) => ({ ...prev, allocationFilter: allocation }));
      setShowFilterSheet(false);
    },
    [],
  );

  const handleItemTypeFilter = useCallback(
    (itemType: "all" | "singles" | "sealed_box" | "booster_bundle") => {
      setFilterState((prev) => ({ ...prev, itemTypeFilter: itemType }));
      setShowFilterSheet(false);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Sub-Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="px-4 py-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search your collection"
              value={filterState.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
            <button
              onClick={() => setShowFilterSheet(!showFilterSheet)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                showFilterSheet
                  ? "bg-accent text-background"
                  : "text-slate-400 hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {filteredItems.length} items
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {formatHKD(summary.totalCurrentValueHkd)}
                </span>
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getPnlBgColor(
                summary.pnlPercentage,
              )}`}
            >
              {summary.pnlPercentage > 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : summary.pnlPercentage < 0 ? (
                <TrendingDown className="w-3 h-3 text-red-400" />
              ) : (
                <Minus className="w-3 h-3 text-slate-400" />
              )}
              <span
                className={`text-xs font-medium ${getPnlColor(
                  summary.pnlPercentage,
                )}`}
              >
                {formatPercentage(summary.pnlPercentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sheet */}
      <AnimatePresence>
        {showFilterSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterSheet(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl glass-strong border-t border-border pb-24"
            >
              <div className="px-5 py-5 space-y-5">
                <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto" />
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-foreground">
                    Filter & Sort
                  </h3>
                  <button
                    onClick={() => setShowFilterSheet(false)}
                    className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Sort Options */}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "recent", label: "Recent" },
                        { value: "name", label: "Name" },
                        { value: "value", label: "Value" },
                        { value: "pnl", label: "P&L" },
                        { value: "quantity", label: "Quantity" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filterState.sortBy === option.value
                            ? "bg-accent text-background"
                            : "bg-surface-elevated text-slate-400 hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allocation Filter */}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Allocation
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All", icon: Filter },
                      { value: "left_velocity", label: "Active", icon: Zap },
                      { value: "right_vault", label: "Vault", icon: Shield },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleAllocationFilter(
                            option.value as
                              | "all"
                              | "left_velocity"
                              | "right_vault",
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filterState.allocationFilter === option.value
                            ? "bg-accent text-background"
                            : "bg-surface-elevated text-slate-400 hover:text-foreground"
                        }`}
                      >
                        <option.icon className="w-3 h-3" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Type Filter */}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Item Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "singles", label: "Singles" },
                      { value: "sealed_box", label: "Sealed" },
                      { value: "booster_bundle", label: "Bundles" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleItemTypeFilter(
                            option.value as
                              | "all"
                              | "singles"
                              | "sealed_box"
                              | "booster_bundle",
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filterState.itemTypeFilter === option.value
                            ? "bg-accent text-background"
                            : "bg-surface-elevated text-slate-400 hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilterState({
                      searchQuery: "",
                      sortBy: "recent",
                      allocationFilter: "all",
                      itemTypeFilter: "all",
                    });
                    setShowFilterSheet(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-surface-elevated text-slate-400 hover:text-foreground transition-colors text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Collection Grid */}
      <div className="px-4 pt-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No items found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CollectionCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COLLECTION CARD COMPONENT
// =============================================================================

function CollectionCard({ item }: { item: CollectionItem }) {
  const totalValue = item.currentValueHkd * item.quantity;
  const totalCost = item.purchasePriceHkd * item.quantity;
  const pnlAmount = totalValue - totalCost;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass-card rounded-xl overflow-hidden border ${getGradeBorderColor(
        item.grade,
      )} transition-all hover:shadow-lg hover:shadow-black/20`}
    >
      {/* Grade Badge Header */}
      <div
        className={`${getGradeColor(
          item.grade,
        )} px-3 py-1.5 flex items-center justify-between`}
      >
        <span className="text-xs font-bold text-white tracking-wide">
          {item.grade.toUpperCase()}
        </span>
        {item.allocationSide === "left_velocity" ? (
          <Zap className="w-3 h-3 text-white/80" />
        ) : (
          <Shield className="w-3 h-3 text-white/80" />
        )}
      </div>

      {/* Image Placeholder */}
      <div className="relative aspect-[3/4] bg-surface-elevated">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Package className="w-8 h-8 text-slate-600" />
          </div>
        )}
        {/* Item Type Badge */}
        {item.itemType !== "singles" && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white uppercase">
              {item.itemType.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name & Set */}
        <div>
          <h3 className="text-sm font-semibold text-foreground truncate">
            {item.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">{item.setName}</p>
        </div>

        {/* Card Number & Rarity */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {item.cardNumber || "—"}
          </span>
          {item.rarity && (
            <span className="text-[10px] text-slate-400 bg-surface-elevated px-1.5 py-0.5 rounded">
              {item.rarity}
            </span>
          )}
        </div>

        {/* Footer Stats */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Qty</span>
            <span className="text-xs font-medium text-foreground">
              {item.quantity}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Value</span>
            <span className="text-sm font-semibold text-foreground">
              {formatHKD(totalValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">30d</span>
            <div
              className={`flex items-center gap-0.5 ${getPnlColor(
                item.priceChange30d,
              )}`}
            >
              {item.priceChangeDirection === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : item.priceChangeDirection === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">
                {formatPercentage(item.priceChange30d)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
