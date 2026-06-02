"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Filter,
  Package,
  Shield,
  Zap,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";
import CollectibleCard, {
  CollectibleItem,
  Rarity,
} from "@/components/CollectibleCard";

const vaultItems: CollectibleItem[] = [
  {
    id: "v1",
    name: "Labubu Macaron Chase",
    series: "Pop Mart × How2work",
    rarity: "chase",
    price: "HKD 3,800",
    priceChange: 24.5,
    verified: true,
    status: "unopened",
    category: "blindbox",
  },
  {
    id: "v2",
    name: "Molly Zodiac Dragon",
    series: "Pop Mart × Kenny Wong",
    rarity: "secret",
    price: "HKD 2,200",
    priceChange: 12.3,
    status: "unopened",
    category: "blindbox",
  },
  {
    id: "v3",
    name: "LEGO Icons Eiffel Tower",
    series: "Icons #10307",
    rarity: "rare",
    price: "HKD 2,200",
    priceChange: 8.3,
    condition: "Sealed",
    category: "lego",
  },
  {
    id: "v4",
    name: "Charizard VMAX Rainbow",
    series: "Vivid Voltage",
    rarity: "secret",
    price: "HKD 9,500",
    priceChange: 15.7,
    verified: true,
    grade: "10",
    category: "card",
  },
  {
    id: "v5",
    name: "Dimoo Space Travel",
    series: "Pop Mart",
    rarity: "rare",
    price: "HKD 680",
    priceChange: -4.2,
    status: "opened",
    category: "blindbox",
  },
  {
    id: "v6",
    name: "LEGO Technic Bugatti",
    series: "Technic #42083",
    rarity: "rare",
    price: "HKD 4,200",
    priceChange: 5.1,
    condition: "Opened, Complete",
    category: "lego",
  },
  {
    id: "v7",
    name: "Skullpanda Skull",
    series: "Pop Mart",
    rarity: "common",
    price: "HKD 320",
    priceChange: 1.2,
    status: "opened",
    category: "blindbox",
  },
  {
    id: "v8",
    name: "Pikachu V-UNION",
    series: "Celebrations",
    rarity: "rare",
    price: "HKD 1,100",
    priceChange: 9.8,
    grade: "9",
    category: "card",
  },
];

const rarityFilters: { label: string; value: Rarity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Chase ✦", value: "chase" },
  { label: "Secret", value: "secret" },
  { label: "Rare", value: "rare" },
  { label: "Common", value: "common" },
];

const categoryFilters = [
  { label: "All", value: "all" },
  { label: "Blind Box", value: "blindbox" },
  { label: "LEGO", value: "lego" },
  { label: "Cards", value: "card" },
];

export default function VaultPage() {
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectibleItem | null>(
    null,
  );

  const totalValue = vaultItems.reduce((sum, item) => {
    const numeric = parseInt(item.price.replace(/[^\d]/g, ""));
    return sum + (isNaN(numeric) ? 0 : numeric);
  }, 0);

  const filtered = vaultItems.filter((item) => {
    const matchRarity = rarityFilter === "all" || item.rarity === rarityFilter;
    const matchCat =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchRarity && matchCat;
  });

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Header */}
      <div className='sticky top-0 z-40 glass-strong'>
        <div className='flex items-center justify-between px-4 py-3'>
          <Link href='/'>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className='p-1.5 rounded-xl glass'
            >
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </motion.button>
          </Link>
          <div className='flex flex-col items-center'>
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider'>
              MY VAULT
            </h1>
            <p className='text-[9px] font-mono text-[#ff2d2d]'>
              {vaultItems.length} ITEMS
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setFilterOpen(true)}
            className='p-1.5 rounded-xl glass relative'
          >
            <Filter size={18} className='text-[#f5f5dc]' />
            {(rarityFilter !== "all" || categoryFilter !== "all") && (
              <span className='absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ff2d2d]' />
            )}
          </motion.button>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className='px-4 pt-4 pb-2'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative p-4 rounded-2xl overflow-hidden'
          style={{
            background:
              "linear-gradient(135deg, rgba(255,45,45,0.1), rgba(245,245,220,0.03))",
            border: "1px solid rgba(255,45,45,0.2)",
          }}
        >
          <div className='absolute inset-0 holo-shimmer opacity-10 pointer-events-none' />
          <div className='relative'>
            <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/40 mb-1'>
              Vault Value
            </p>
            <p className='text-3xl font-black text-[#f5f5dc]'>
              HKD {totalValue.toLocaleString()}
            </p>
            <div className='flex items-center gap-3 mt-3'>
              <div className='flex items-center gap-1'>
                <TrendingUp size={12} className='text-emerald-400' />
                <span className='text-xs text-emerald-400 font-mono font-bold'>
                  +12.4% this month
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Shield size={12} className='text-[#ff2d2d]' />
                <span className='text-xs text-[#f0ede6]/40'>
                  Community Verified
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className='relative grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[rgba(245,245,220,0.06)]'>
            {[
              { label: "Items", value: vaultItems.length.toString() },
              {
                label: "Chase",
                value: vaultItems
                  .filter((i) => i.rarity === "chase")
                  .length.toString(),
              },
              {
                label: "Verified",
                value: vaultItems.filter((i) => i.verified).length.toString(),
              },
            ].map(({ label, value }) => (
              <div key={label} className='flex flex-col items-center'>
                <span className='text-lg font-black text-[#f5f5dc]'>
                  {value}
                </span>
                <span className='text-[9px] text-[#f0ede6]/40 uppercase tracking-wider'>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Rarity quick filters */}
      <div className='px-4 pt-3 pb-2 overflow-x-auto'>
        <div className='flex gap-2 w-max'>
          {rarityFilters.map((f) => (
            <motion.button
              key={f.value}
              whileTap={{ scale: 0.92 }}
              onClick={() => setRarityFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                rarityFilter === f.value
                  ? "bg-[#ff2d2d] text-white"
                  : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rarity Tracker — price movers */}
      <div className='px-4 pt-2 pb-3'>
        <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
          Rarity Tracker
        </p>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {vaultItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className='shrink-0 px-3 py-2 rounded-xl glass border border-[rgba(245,245,220,0.06)] min-w-[110px]'
            >
              <p className='text-[9px] text-[#f0ede6]/40 truncate'>
                {item.name}
              </p>
              <p className='text-xs font-bold text-[#f5f5dc] mt-0.5'>
                {item.price}
              </p>
              <div
                className={`flex items-center gap-1 mt-0.5 ${(item.priceChange ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {(item.priceChange ?? 0) >= 0 ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                <span className='text-[9px] font-mono'>
                  {(item.priceChange ?? 0) >= 0 ? "+" : ""}
                  {item.priceChange}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className='px-4 pb-6'>
        <div className='grid grid-cols-2 gap-3'>
          <AnimatePresence mode='popLayout'>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <CollectibleCard item={item} onSelect={setSelectedItem} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 gap-3'>
            <Package size={32} className='text-[#f0ede6]/20' />
            <p className='text-sm text-[#f0ede6]/30'>
              No items match the filter
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className='fixed inset-0 z-50 bg-black/80'
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className='fixed inset-x-0 bottom-0 z-50 rounded-t-3xl glass-strong pb-10'
              style={{ border: "1px solid rgba(245,245,220,0.1)" }}
            >
              <div className='flex flex-col px-5 pt-4 gap-4'>
                <div className='w-10 h-1 rounded-full bg-[rgba(245,245,220,0.2)] mx-auto' />
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/40'>
                      {selectedItem.series}
                    </p>
                    <h2 className='text-xl font-black text-[#f5f5dc] mt-0.5'>
                      {selectedItem.name}
                    </h2>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedItem(null)}
                    className='p-1.5 rounded-xl glass'
                  >
                    <X size={16} className='text-[#f0ede6]/60' />
                  </motion.button>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { label: "Floor Price", value: selectedItem.price },
                    {
                      label: "Price Change",
                      value: `${(selectedItem.priceChange ?? 0) >= 0 ? "+" : ""}${selectedItem.priceChange}%`,
                      color:
                        (selectedItem.priceChange ?? 0) >= 0
                          ? "#4ade80"
                          : "#f87171",
                    },
                    { label: "Category", value: selectedItem.category },
                    {
                      label: "Rarity",
                      value: selectedItem.rarity.toUpperCase(),
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className='glass rounded-xl p-3 border border-[rgba(245,245,220,0.06)]'
                    >
                      <p className='text-[9px] text-[#f0ede6]/40 uppercase tracking-wider'>
                        {label}
                      </p>
                      <p
                        className='text-sm font-bold mt-1'
                        style={{ color: color ?? "#f5f5dc" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className='flex gap-2'>
                  <Link href='/trade' className='flex-1'>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className='w-full py-3 rounded-xl text-sm font-black'
                      style={{
                        background: "rgba(255,45,45,0.15)",
                        color: "#ff2d2d",
                        border: "1px solid rgba(255,45,45,0.3)",
                      }}
                    >
                      List for Trade
                    </motion.button>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className='flex-1 py-3 rounded-xl text-sm font-black text-white'
                    style={{
                      background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                    }}
                  >
                    Set Floor Price
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className='fixed inset-0 z-50 bg-black/70'
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className='fixed inset-x-0 bottom-0 z-50 rounded-t-3xl glass-strong pb-10'
              style={{ border: "1px solid rgba(245,245,220,0.1)" }}
            >
              <div className='px-5 py-5 flex flex-col gap-5'>
                <div className='w-10 h-1 rounded-full bg-[rgba(245,245,220,0.2)] mx-auto' />
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-black text-[#f5f5dc]'>
                    Filter Vault
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFilterOpen(false)}
                  >
                    <X size={18} className='text-[#f0ede6]/40' />
                  </motion.button>
                </div>

                <div>
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                    Rarity
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {rarityFilters.map((f) => (
                      <motion.button
                        key={f.value}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setRarityFilter(f.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${rarityFilter === f.value ? "bg-[#ff2d2d] text-white" : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"}`}
                      >
                        {f.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                    Category
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {categoryFilters.map((f) => (
                      <motion.button
                        key={f.value}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setCategoryFilter(f.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${categoryFilter === f.value ? "bg-[#ff2d2d] text-white" : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"}`}
                      >
                        {f.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFilterOpen(false)}
                  className='w-full py-3 rounded-xl text-sm font-black text-white'
                  style={{
                    background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                  }}
                >
                  Apply Filters ({filtered.length} items)
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
