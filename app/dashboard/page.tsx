"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Bell,
  ChevronRight,
  Activity,
  DollarSign,
  LayoutGrid,
  Flame,
  Sparkles,
  LogOut,
  Package,
  BarChart3,
  Eye,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";
import DashboardFilters, {
  type FilterStateWithSort,
  type FilterState,
  type SortOption,
} from "@/components/DashboardFilters";
import { getAggregatorListings, getSources } from "@/lib/api/aggregator";
import type { AggregatorListing, ItemCategory } from "@/lib/types/database";
import { CATEGORIES } from "@/lib/data/categories";

const AGGREGATOR_TO_COLLECTIBLE_CATEGORY: Record<
  AggregatorListing["category"],
  CollectibleItem["category"]
> = {
  pokemon_card: "card",
  lego: "lego",
  hot_toys: "blindbox",
  pop_mart: "blindbox",
  hot_wheels: "blindbox",
  funko: "blindbox",
  other: "card",
};

function mapListingToCollectibleItem(
  listing: AggregatorListing,
): CollectibleItem {
  const discount = listing.original_price_hkd
    ? Math.round(
        ((listing.original_price_hkd - listing.price_hkd) /
          listing.original_price_hkd) *
          100,
      )
    : undefined;

  return {
    id: listing.id,
    name: listing.title,
    series: listing.source,
    rarity: listing.is_deal ? "rare" : "uncommon",
    price: listing.price_hkd
      ? `HKD ${listing.price_hkd.toLocaleString()}`
      : "HKD -",
    verified: listing.is_deal,
    condition: listing.condition ?? undefined,
    category: AGGREGATOR_TO_COLLECTIBLE_CATEGORY[listing.category] ?? "card",
    source: listing.source,
    dealScore: listing.deal_score,
    discount: discount && discount > 0 ? discount : undefined,
    sourceUrl: listing.source_url,
    sellerName: listing.seller_name ?? undefined,
    sellerRating: listing.seller_rating,
  };
}

export default function DashboardPage() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <main className='flex flex-col min-h-screen items-center justify-center'>
        <div className='w-6 h-6 rounded-full border-2 border-[#ff2d2d] border-t-transparent animate-spin' />
      </main>
    );
  }

  return <SellerDashboard user={user!} onSignOut={logout} />;
}

function SellerDashboard({ user, onSignOut }: { user: import("@/contexts/AuthContext").AuthUser; onSignOut: () => void }) {
  const [topDeals, setTopDeals] = useState<CollectibleItem[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterStateWithSort>({});
  const [sources, setSources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "deals" | "analytics">("overview");

  useEffect(() => {
    let sourcesActive = true;
    let dealsActive = true;

    getSources().then(({ data }) => {
      if (!sourcesActive) return;
      setSources(data);
    });

    const load = () => {
      getAggregatorListings({
        dealsOnly: filters.dealsOnly,
        search: filters.search,
        category: filters.category,
        source: filters.source,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: (filters.sortBy as SortOption) ?? "price_asc",
        limit: 8,
      })
        .then(({ data }) => {
          if (!dealsActive) return;
          if (data.length > 0) {
            setTopDeals(data.map(mapListingToCollectibleItem));
          } else {
            setTopDeals([]);
          }
        })
        .catch(() => {
          if (!dealsActive) return;
          setTopDeals([]);
        })
        .finally(() => {
          if (!dealsActive) return;
          setIsDealsLoading(false);
        });
    };

    load();

    return () => {
      sourcesActive = false;
      dealsActive = false;
    };
  }, [filters]);

  const handleFilterChange = (newFilters: FilterStateWithSort) => {
    setFilters(newFilters);
  };

  const dealItems = topDeals.length > 0 ? topDeals : featuredItems;
  const hasFilters = !!(
    filters.search ||
    filters.category ||
    filters.source ||
    filters.dealsOnly ||
    filters.minPrice ||
    filters.maxPrice
  );
  const isLive = topDeals.length > 0;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: LayoutGrid },
    { id: "inventory" as const, label: "Inventory", icon: Package },
    { id: "deals" as const, label: "Deals", icon: Flame },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Header */}
      <div className='px-4 pt-4 pb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-[rgba(255,45,45,0.15)] border border-[rgba(255,45,45,0.3)] flex items-center justify-center'>
            <Activity size={16} className='text-[#ff2d2d]' />
          </div>
          <div>
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-tight leading-none'>
              FLSH<span className='text-[#ff2d2d]'>BK</span>
            </h1>
            <p className='text-[9px] text-[#f0ede6]/40 font-mono tracking-wider'>
              SELLER DASHBOARD
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/settings' className='relative p-2'>
            <Bell size={16} className='text-[#f0ede6]/50' />
            <span className='absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff2d2d]' />
          </Link>
          <button onClick={onSignOut} className='p-2' title='Sign out'>
            <LogOut size={16} className='text-[#f0ede6]/30 hover:text-[#ff2d2d] transition-colors' />
          </button>
        </div>
      </div>

      {/* User bar */}
      <div className='px-4 pb-3'>
        <div className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-3 flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-[rgba(0,200,100,0.12)] border border-[rgba(0,200,100,0.25)] flex items-center justify-center text-lg'>
            {user.avatar}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-bold text-[#f5f5dc] leading-none truncate'>
              {user.displayName}
            </p>
            <p className='text-[9px] text-[#f0ede6]/40 font-mono mt-0.5'>
              @{user.username} · Lvl {user.level} · {user.verifiedTrades} trades
            </p>
          </div>
          <div className='flex items-center gap-1 text-[10px] font-mono text-[#00c864]'>
            <Zap size={10} />
            {user.nexusTokens}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='px-4 pb-3'>
        <div className='flex gap-1 overflow-x-auto no-scrollbar'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                  : "text-[#f0ede6]/40 hover:text-[#f0ede6]/60 border border-transparent"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab
          user={user}
          isLive={isLive}
          sources={sources}
          topDeals={topDeals}
          dealItems={dealItems}
          isDealsLoading={isDealsLoading}
          hasFilters={hasFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "deals" && (
        <DealsTab
          dealItems={dealItems}
          isDealsLoading={isDealsLoading}
          hasFilters={hasFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
      {activeTab === "analytics" && <AnalyticsTab />}
    </main>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({
  user,
  isLive,
  sources,
  topDeals,
  dealItems,
  isDealsLoading,
  hasFilters,
  filters,
  onFilterChange,
}: {
  user: import("@/contexts/AuthContext").AuthUser;
  isLive: boolean;
  sources: string[];
  topDeals: CollectibleItem[];
  dealItems: CollectibleItem[];
  isDealsLoading: boolean;
  hasFilters: boolean;
  filters: FilterStateWithSort;
  onFilterChange: (f: FilterStateWithSort) => void;
}) {
  const stats = [
    { label: "Total Value", value: "HKD 24,000", change: "+12.4%", up: true, icon: DollarSign, color: "#00c864" },
    { label: "Active Listings", value: "47", change: "+3", up: true, icon: Package, color: "#60a5fa" },
    { label: "Views Today", value: "1,284", change: "+18.2%", up: true, icon: Eye, color: "#fbbf24" },
    { label: "Pending Offers", value: "8", change: "-2", up: false, icon: Clock, color: "#ff2d2d" },
  ];

  return (
    <div className='px-4 pb-6 space-y-4'>
      {/* Stats grid */}
      <div className='grid grid-cols-2 gap-2'>
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-3'
          >
            <div className='flex items-center justify-between mb-2'>
              <stat.icon size={14} style={{ color: stat.color }} />
              <div className={`flex items-center gap-0.5 text-[9px] font-mono ${stat.up ? "text-[#00c864]" : "text-[#ff2d2d]"}`}>
                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.change}
              </div>
            </div>
            <p className='text-base font-black text-[#f5f5dc]'>{stat.value}</p>
            <p className='text-[9px] text-[#f0ede6]/40 mt-0.5'>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className='flex gap-2'>
        <Link href='/listings/new' className='flex-1'>
          <div className='rounded-2xl bg-[rgba(255,45,45,0.1)] border border-[rgba(255,45,45,0.2)] p-3 flex items-center gap-2 cursor-pointer hover:bg-[rgba(255,45,45,0.15)] transition-colors'>
            <Plus size={16} className='text-[#ff2d2d]' />
            <span className='text-xs font-bold text-[#ff2d2d]'>New Listing</span>
          </div>
        </Link>
        <Link href='/trade' className='flex-1'>
          <div className='rounded-2xl bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.15)] p-3 flex items-center gap-2 cursor-pointer hover:bg-[rgba(0,200,100,0.12)] transition-colors'>
            <Zap size={16} className='text-[#00c864]' />
            <span className='text-xs font-bold text-[#00c864]'>Trade Arena</span>
          </div>
        </Link>
      </div>

      {/* Live market summary */}
      <div className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-3 flex items-center gap-3'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
          />
          <span className='text-[10px] font-mono uppercase tracking-wider text-[#f0ede6]/50'>
            {isLive ? "Live" : "Preview"}
          </span>
          <span className='text-[10px] text-[#f0ede6]/30 truncate'>
            {isLive ? `${sources.length} sources · ${topDeals.length} deals` : "Awaiting live data"}
          </span>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <div className='flex items-center gap-1 text-[10px] font-mono'>
            <DollarSign size={10} className='text-[#4ade80]' />
            <span className='text-[#4ade80]'>Lowest</span>
          </div>
          <div className='flex items-center gap-1 text-[10px] font-mono'>
            <Flame size={10} className='text-[#ff2d2d]' />
            <span className='text-[#ff2d2d]'>Hot</span>
          </div>
          <div className='flex items-center gap-1 text-[10px] font-mono'>
            <Sparkles size={10} className='text-[#fbbf24]' />
            <span className='text-[#fbbf24]'>New</span>
          </div>
        </div>
      </div>

      {/* Deals grid */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30'>
            Market Deals
          </h2>
          <Link href='/categories/tcg'>
            <span className='text-[10px] text-[#ff2d2d] font-mono flex items-center gap-1'>
              Browse all <ChevronRight size={12} />
            </span>
          </Link>
        </div>

        {isDealsLoading ? (
          <div className='grid grid-cols-2 gap-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.04)] overflow-hidden'>
                <div className='h-36 bg-[rgba(245,245,220,0.03)] animate-pulse' />
                <div className='p-3 space-y-2'>
                  <div className='h-3 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-3/4' />
                  <div className='h-3 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-1/2' />
                </div>
              </div>
            ))}
          </div>
        ) : dealItems.length === 0 && hasFilters ? (
          <div className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-8 text-center'>
            <p className='text-sm text-[#f0ede6]/30 mb-1'>No results</p>
            <p className='text-[11px] text-[#f0ede6]/20'>Try adjusting your filters</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            {dealItems.slice(0, 4).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <CollectibleCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-3'>
          Recent Activity
        </h2>
        <div className='space-y-2'>
          {[
            { icon: Eye, text: "Your listing viewed 47 times", time: "2m ago", color: "#60a5fa" },
            { icon: Zap, text: "New offer on Labubu Macaron", time: "15m ago", color: "#fbbf24" },
            { icon: CheckCircle2, text: "Trade completed with @moko_88", time: "1h ago", color: "#00c864" },
            { icon: AlertCircle, text: "Price drop alert: Charizard VMAX", time: "3h ago", color: "#ff2d2d" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.3 }}
              className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.04)] p-3 flex items-center gap-3'
            >
              <item.icon size={14} style={{ color: item.color }} className='shrink-0' />
              <span className='text-[11px] text-[#f0ede6]/60 flex-1'>{item.text}</span>
              <span className='text-[9px] text-[#f0ede6]/20 font-mono shrink-0'>{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Inventory Tab ─── */
function InventoryTab() {
  const inventory = [
    { name: "Labubu Macaron Chase", category: "Pop Mart", qty: 3, value: "HKD 11,400", status: "active", rarity: "chase" },
    { name: "Charizard VMAX Rainbow", category: "Pokémon TCG", qty: 1, value: "HKD 9,500", status: "active", rarity: "secret" },
    { name: "LEGO Icons Eiffel Tower", category: "LEGO", qty: 2, value: "HKD 4,400", status: "active", rarity: "rare" },
    { name: "Molly Zodiac Dragon", category: "Pop Mart", qty: 5, value: "HKD 8,000", status: "pending", rarity: "rare" },
    { name: "Skullpanda Secret Box", category: "Pop Mart", qty: 12, value: "HKD 3,840", status: "active", rarity: "secret" },
    { name: "LEGO Technic Bugatti", category: "LEGO", qty: 1, value: "HKD 4,200", status: "sold", rarity: "rare" },
  ];

  return (
    <div className='px-4 pb-6 space-y-4'>
      {/* Summary */}
      <div className='grid grid-cols-3 gap-2'>
        {[
          { label: "Total Items", value: "24", icon: Package },
          { label: "Active", value: "18", icon: CheckCircle2 },
          { label: "Total Value", value: "HKD 41K", icon: DollarSign },
        ].map((s) => (
          <div key={s.label} className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-3 text-center'>
            <s.icon size={14} className='text-[#ff2d2d] mx-auto mb-1' />
            <p className='text-sm font-black text-[#f5f5dc]'>{s.value}</p>
            <p className='text-[8px] text-[#f0ede6]/40'>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add listing button */}
      <Link href='/listings/new' className='block'>
        <div className='rounded-2xl bg-[rgba(255,45,45,0.1)] border border-[rgba(255,45,45,0.2)] p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-[rgba(255,45,45,0.15)] transition-colors'>
          <Plus size={16} className='text-[#ff2d2d]' />
          <span className='text-xs font-bold text-[#ff2d2d]'>Add New Listing</span>
        </div>
      </Link>

      {/* Inventory list */}
      <div className='space-y-2'>
        {inventory.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.04)] p-3'
          >
            <div className='flex items-center justify-between'>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-[#f5f5dc] truncate'>{item.name}</p>
                <p className='text-[9px] text-[#f0ede6]/40 mt-0.5'>
                  {item.category} · Qty: {item.qty} · {item.value}
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0 ml-2'>
                <span
                  className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    item.status === "active"
                      ? "bg-[rgba(0,200,100,0.1)] text-[#00c864]"
                      : item.status === "pending"
                        ? "bg-[rgba(255,200,0,0.1)] text-[#ffc800]"
                        : "bg-[rgba(148,163,184,0.1)] text-slate-400"
                  }`}
                >
                  {item.status}
                </span>
                <MoreHorizontal size={14} className='text-[#f0ede6]/20' />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Analytics Tab ─── */
function AnalyticsTab() {
  const metrics = [
    { label: "Total Views", value: "12,847", change: "+23.4%", up: true },
    { label: "Conversion Rate", value: "4.2%", change: "+0.8%", up: true },
    { label: "Avg. Sale Price", value: "HKD 1,240", change: "-2.1%", up: false },
    { label: "Response Time", value: "1.2h", change: "-15m", up: true },
  ];

  return (
    <div className='px-4 pb-6 space-y-4'>
      <div className='grid grid-cols-2 gap-2'>
        {metrics.map((m) => (
          <div key={m.label} className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-3'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-[9px] text-[#f0ede6]/40'>{m.label}</span>
              <span className={`text-[9px] font-mono ${m.up ? "text-[#00c864]" : "text-[#ff2d2d]"}`}>
                {m.change}
              </span>
            </div>
            <p className='text-base font-black text-[#f5f5dc]'>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Top performers */}
      <div>
        <h3 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-3'>
          Top Performers
        </h3>
        <div className='space-y-2'>
          {[
            { name: "Labubu Macaron Chase", views: 2847, offers: 12 },
            { name: "Charizard VMAX Rainbow", views: 1923, offers: 8 },
            { name: "LEGO Icons Eiffel Tower", views: 1456, offers: 5 },
          ].map((item, i) => (
            <div key={i} className='rounded-xl bg-[#141418] border border-[rgba(245,245,220,0.04)] p-3 flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-[rgba(255,45,45,0.1)] flex items-center justify-center text-xs font-black text-[#ff2d2d]'>
                #{i + 1}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-[#f5f5dc] truncate'>{item.name}</p>
                <p className='text-[9px] text-[#f0ede6]/40'>{item.views} views · {item.offers} offers</p>
              </div>
              <Star size={12} className='text-[#fbbf24] shrink-0' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Deals Tab ─── */
function DealsTab({
  dealItems,
  isDealsLoading,
  hasFilters,
  filters,
  onFilterChange,
}: {
  dealItems: CollectibleItem[];
  isDealsLoading: boolean;
  hasFilters: boolean;
  filters: FilterState;
  onFilterChange: (f: FilterStateWithSort) => void;
}) {
  return (
    <div className='px-4 pb-6 space-y-4'>
      <DashboardFilters
        onFilter={onFilterChange}
        categories={CATEGORIES.map((c) => ({
          id: c.id as ItemCategory,
          name: c.name,
          emoji: c.emoji,
        }))}
        sources={[]}
        isLoading={isDealsLoading}
      />

      {isDealsLoading ? (
        <div className='grid grid-cols-2 gap-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.04)] overflow-hidden'>
              <div className='h-36 bg-[rgba(245,245,220,0.03)] animate-pulse' />
              <div className='p-3 space-y-2'>
                <div className='h-3 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-3/4' />
                <div className='h-3 rounded bg-[rgba(245,245,220,0.04)] animate-pulse w-1/2' />
              </div>
            </div>
          ))}
        </div>
      ) : dealItems.length === 0 && hasFilters ? (
        <div className='rounded-2xl bg-[#141418] border border-[rgba(245,245,220,0.06)] p-8 text-center'>
          <p className='text-sm text-[#f0ede6]/30 mb-1'>No results</p>
          <p className='text-[11px] text-[#f0ede6]/20'>Try adjusting your filters</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          {dealItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <CollectibleCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Shared data ─── */
const featuredItems: CollectibleItem[] = [
  {
    id: "1",
    name: "Labubu Macaron Series",
    series: "Pop Mart × How2work",
    rarity: "chase",
    price: "HKD 3,800",
    priceChange: 24.5,
    verified: true,
    status: "unopened",
    category: "blindbox",
  },
  {
    id: "2",
    name: "LEGO Icons Eiffel Tower",
    series: "Icons #10307",
    rarity: "rare",
    price: "HKD 2,200",
    priceChange: 8.3,
    condition: "Sealed",
    category: "lego",
  },
  {
    id: "3",
    name: "Charizard VMAX",
    series: "Shining Fates",
    rarity: "secret",
    price: "HKD 9,500",
    priceChange: 15.7,
    verified: true,
    grade: "10",
    category: "card",
  },
  {
    id: "4",
    name: "Molly Zodiac Series",
    series: "Pop Mart × Kenny Wong",
    rarity: "rare",
    price: "HKD 1,600",
    priceChange: -3.2,
    status: "opened",
    category: "blindbox",
  },
];
