"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Flame,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Search,
  X,
} from "lucide-react";
import {
  ArbitrageEntry,
  ArbitrageSummary,
  BarbellCategory,
  ArbitrageStatus,
  BARBELL_CATEGORIES,
  ARBITRAGE_STATUSES,
  STATUS_COLORS,
} from "@/types/arbitrage";
import {
  fetchArbitrageEntries,
  fetchArbitrageSummary,
  updateArbitrageStatus,
  addArbitrageEntry,
  deleteArbitrageEntry,
} from "@/lib/supabase-arbitrage";

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

function getStatusIcon(status: ArbitrageStatus) {
  switch (status) {
    case "Active Negotiation":
      return Clock;
    case "Secured":
      return CheckCircle;
    case "Vaulted":
      return Package;
    case "Pass":
      return XCircle;
    default:
      return Clock;
  }
}

function generateId(): string {
  return `arb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// INITIAL EMPTY ROW
// =============================================================================

function createEmptyEntry(): ArbitrageEntry {
  return {
    id: generateId(),
    asset_name: "",
    certification_number: null,
    barbell_category: "Category 1",
    listed_price: 0,
    market_floor: 0,
    variance: 0,
    target_bundle_offer: "",
    status: "Active Negotiation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ArbitrageTracker() {
  const [entries, setEntries] = useState<ArbitrageEntry[]>([]);
  const [summary, setSummary] = useState<ArbitrageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArbitrageStatus | "All">("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<ArbitrageEntry>(createEmptyEntry());

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [entriesData, summaryData] = await Promise.all([
        fetchArbitrageEntries(),
        fetchArbitrageSummary(),
      ]);
      setEntries(entriesData);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load arbitrage data. Please try again.");
      console.error("Error loading arbitrage data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.certification_number &&
          entry.certification_number.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === "All" || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, statusFilter]);

  // Recalculate summary based on current entries
  const liveSummary = useMemo<ArbitrageSummary>(() => {
    const total_secured_margin = entries
      .filter((e) => e.status === "Secured" && e.variance > 0)
      .reduce((sum, e) => sum + e.variance, 0);

    return {
      total_secured_margin,
      total_entries: entries.length,
      active_count: entries.filter((e) => e.status === "Active Negotiation").length,
      secured_count: entries.filter((e) => e.status === "Secured").length,
      vaulted_count: entries.filter((e) => e.status === "Vaulted").length,
      pass_count: entries.filter((e) => e.status === "Pass").length,
      buy_signal_count: entries.filter((e) => e.variance > 0).length,
    };
  }, [entries]);

  // Update entry field
  const updateEntryField = useCallback(
    (id: string, field: keyof ArbitrageEntry, value: string | number | null) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, [field]: value, updated_at: new Date().toISOString() };
          // Recalculate variance when prices change
          if (field === "listed_price" || field === "market_floor") {
            updated.variance = updated.market_floor - updated.listed_price;
          }
          return updated;
        })
      );
    },
    []
  );

  // Update status
  const handleStatusChange = useCallback(
    async (id: string, status: ArbitrageStatus) => {
      updateEntryField(id, "status", status);
      // In real app, sync with Supabase
      // await updateArbitrageStatus(id, status);
    },
    [updateEntryField]
  );

  // Delete entry
  const handleDelete = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      // In real app, sync with Supabase
      // await deleteArbitrageEntry(id);
    },
    []
  );

  // Add new entry
  const handleAddEntry = useCallback(async () => {
    if (!newEntry.asset_name.trim()) return;
    const entryToAdd = {
      ...newEntry,
      variance: newEntry.market_floor - newEntry.listed_price,
    };
    setEntries((prev) => [entryToAdd, ...prev]);
    setNewEntry(createEmptyEntry());
    setShowAddForm(false);
    // In real app, sync with Supabase
    // await addArbitrageEntry(entryToAdd);
  }, [newEntry]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
                Arbitrage Tracker
              </h1>
              <p className="text-silver mt-1">
                Real-time flip variance for secondary market runs
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-surface-elevated text-silver hover:text-accent transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* Summary Card */}
        <SummaryCard summary={liveSummary} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-silver hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ArbitrageStatus | "All")}
              className="pl-10 pr-8 py-2.5 rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-accent/50 transition-colors text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              {ARBITRAGE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>

        {/* Add Entry Form */}
        <AnimatePresence>
          {showAddForm && (
            <AddEntryForm
              entry={newEntry}
              onUpdate={setNewEntry}
              onAdd={handleAddEntry}
              onCancel={() => {
                setShowAddForm(false);
                setNewEntry(createEmptyEntry());
              }}
            />
          )}
        </AnimatePresence>

        {/* Entries Table */}
        <div className="mt-6 space-y-3">
          {filteredEntries.length === 0 ? (
            <EmptyState hasFilters={searchQuery !== "" || statusFilter !== "All"} />
          ) : (
            filteredEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onUpdateField={updateEntryField}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
        <p className="text-silver">Loading arbitrage data...</p>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-serif text-xl text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-silver mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
        {hasFilters ? (
          <Search className="w-8 h-8 text-silver" />
        ) : (
          <Package className="w-8 h-8 text-silver" />
        )}
      </div>
      <h3 className="font-serif text-lg text-foreground mb-2">
        {hasFilters ? "No matching entries" : "No arbitrage entries yet"}
      </h3>
      <p className="text-silver text-sm">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Add your first arbitrage entry to start tracking"}
      </p>
    </div>
  );
}

// =============================================================================
// SUMMARY CARD
// =============================================================================

function SummaryCard({ summary }: { summary: ArbitrageSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 mt-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-silver uppercase tracking-wide">
            Total Secured Arbitrage Margin
          </p>
          <p className="font-serif text-2xl sm:text-3xl text-emerald-400">
            {formatHKD(summary.total_secured_margin)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-surface-elevated">
          <p className="text-xs text-silver">Total Entries</p>
          <p className="text-lg font-semibold text-foreground">
            {summary.total_entries}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10">
          <p className="text-xs text-blue-400">Active</p>
          <p className="text-lg font-semibold text-blue-400">
            {summary.active_count}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10">
          <p className="text-xs text-emerald-400">Secured</p>
          <p className="text-lg font-semibold text-emerald-400">
            {summary.secured_count}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10">
          <p className="text-xs text-amber-400">Buy Signals</p>
          <p className="text-lg font-semibold text-amber-400 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            {summary.buy_signal_count}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// ADD ENTRY FORM
// =============================================================================

function AddEntryForm({
  entry,
  onUpdate,
  onAdd,
  onCancel,
}: {
  entry: ArbitrageEntry;
  onUpdate: (entry: ArbitrageEntry) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 overflow-hidden"
    >
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-serif text-lg text-foreground mb-4">
          New Arbitrage Entry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-silver mb-1">Asset Name *</label>
            <input
              type="text"
              value={entry.asset_name}
              onChange={(e) => onUpdate({ ...entry, asset_name: e.target.value })}
              placeholder="e.g., Pokemon Booster Box"
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-silver mb-1">
              Certification #
            </label>
            <input
              type="text"
              value={entry.certification_number || ""}
              onChange={(e) =>
                onUpdate({
                  ...entry,
                  certification_number: e.target.value || null,
                })
              }
              placeholder="e.g., PSA-2024-00123"
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-silver mb-1">Category</label>
            <select
              value={entry.barbell_category}
              onChange={(e) =>
                onUpdate({
                  ...entry,
                  barbell_category: e.target.value as BarbellCategory,
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-accent/50 transition-colors text-sm"
            >
              {BARBELL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-silver mb-1">
              Listed Price (HKD)
            </label>
            <input
              type="number"
              value={entry.listed_price || ""}
              onChange={(e) =>
                onUpdate({
                  ...entry,
                  listed_price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-silver mb-1">
              Market Floor (HKD)
            </label>
            <input
              type="number"
              value={entry.market_floor || ""}
              onChange={(e) =>
                onUpdate({
                  ...entry,
                  market_floor: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-silver mb-1">
              Bundle Offer
            </label>
            <input
              type="text"
              value={entry.target_bundle_offer}
              onChange={(e) =>
                onUpdate({ ...entry, target_bundle_offer: e.target.value })
              }
              placeholder="e.g., Bundle with Charizard"
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Variance Preview */}
        <div className="mt-4 p-3 rounded-lg bg-surface-elevated">
          <div className="flex items-center justify-between">
            <span className="text-sm text-silver">Calculated Variance</span>
            <span
              className={`text-lg font-semibold ${
                entry.market_floor - entry.listed_price > 0
                  ? "text-emerald-400"
                  : entry.market_floor - entry.listed_price < 0
                  ? "text-red-400"
                  : "text-silver"
              }`}
            >
              {formatHKD(entry.market_floor - entry.listed_price)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onAdd}
            disabled={!entry.asset_name.trim()}
            className="flex-1 py-2.5 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Entry
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-surface-elevated text-silver hover:text-foreground transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// ENTRY CARD
// =============================================================================

function EntryCard({
  entry,
  index,
  onUpdateField,
  onStatusChange,
  onDelete,
}: {
  entry: ArbitrageEntry;
  index: number;
  onUpdateField: (id: string, field: keyof ArbitrageEntry, value: string | number | null) => void;
  onStatusChange: (id: string, status: ArbitrageStatus) => void;
  onDelete: (id: string) => void;
}) {
  const isPositive = entry.variance > 0;
  const isNegative = entry.variance < 0;
  const StatusIcon = getStatusIcon(entry.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`glass-card rounded-xl overflow-hidden transition-all ${
        isPositive
          ? "border-emerald-500/20 bg-emerald-500/5"
          : isNegative
          ? "border-red-500/10"
          : ""
      }`}
    >
      {/* Header Row */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground truncate">
                {entry.asset_name}
              </h3>
              {entry.certification_number && (
                <span className="text-xs text-silver bg-surface px-2 py-0.5 rounded">
                  {entry.certification_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-silver bg-surface-elevated px-2 py-0.5 rounded">
                {entry.barbell_category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Buy Signal Badge */}
            {isPositive && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <Flame className="w-3 h-3" />
                Buy Signal
              </span>
            )}

            {/* Status Dropdown */}
            <select
              value={entry.status}
              onChange={(e) => onStatusChange(entry.id, e.target.value as ArbitrageStatus)}
              className={`px-2 py-1 rounded-lg border text-xs font-medium appearance-none cursor-pointer ${STATUS_COLORS[entry.status]}`}
            >
              {ARBITRAGE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 rounded-lg text-silver hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Listed Price */}
          <div>
            <label className="block text-xs text-silver mb-1">Listed Price</label>
            <input
              type="number"
              value={entry.listed_price || ""}
              onChange={(e) =>
                onUpdateField(entry.id, "listed_price", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Market Floor */}
          <div>
            <label className="block text-xs text-silver mb-1">Market Floor</label>
            <input
              type="number"
              value={entry.market_floor || ""}
              onChange={(e) =>
                onUpdateField(entry.id, "market_floor", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Variance (Computed) */}
          <div>
            <label className="block text-xs text-silver mb-1">Variance</label>
            <div
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                isPositive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : isNegative
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-surface-elevated border-border text-silver"
              }`}
            >
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {formatHKD(entry.variance)}
              </div>
            </div>
          </div>

          {/* Bundle Offer */}
          <div>
            <label className="block text-xs text-silver mb-1">Bundle Offer</label>
            <input
              type="text"
              value={entry.target_bundle_offer}
              onChange={(e) =>
                onUpdateField(entry.id, "target_bundle_offer", e.target.value)
              }
              placeholder="Bundle with..."
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-silver/50 text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
