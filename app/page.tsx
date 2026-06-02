"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Search,
  BarChart3,
  Bell,
  Star,
  ChevronRight,
} from "lucide-react";
import LiveTradeTicker from "@/components/LiveTradeTicker";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";
import { CATEGORIES } from "@/lib/data/categories";

const featuredItems: CollectibleItem[] = [
  {
    id: "1",
    name: "Labubu Macaron Series",
    series: "Pop Mart x How2work",
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
    series: "Pop Mart x Kenny Wong",
    rarity: "rare",
    price: "HKD 1,600",
    priceChange: -3.2,
    status: "opened",
    category: "blindbox",
  },
];

const stats = [
  { label: "Active Trades", value: "1,247", icon: Zap },
  { label: "Verified Traders", value: "8,340", icon: Shield },
  { label: "Jackpot Pool", value: "HKD 42K", icon: TrendingUp },
];

export default function HomePage() {
  return (
    <main className='flex flex-col min-h-screen'>
      {/* Hero */}
      <section className='relative flex flex-col items-center justify-center min-h-[40vh] px-4 pt-8 overflow-hidden text-center'>
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div
            className='absolute w-80 h-80 rounded-full blur-3xl opacity-20'
            style={{
              background: "radial-gradient(circle, #ff2d2d, transparent)",
              top: "-80px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          <div
            className='absolute w-64 h-64 rounded-full blur-3xl opacity-10'
            style={{
              background: "radial-gradient(circle, #f5f5dc, transparent)",
              bottom: "0px",
              right: "-40px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center gap-2 px-3 py-1 mb-4 rounded-full glass border border-[rgba(255,45,45,0.25)]'
        >
          <span className='live-dot w-1.5 h-1.5 rounded-full bg-[#ff2d2d] inline-block' />
          <span className='text-[10px] font-mono text-[#ff2d2d] uppercase tracking-widest'>
            Hong Kong's Collector Portal
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='text-5xl font-black tracking-tight leading-none mb-2'
        >
          <span className='text-[#f5f5dc]'>FLSH</span>
          <span className='neon-red'>BK</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='text-sm text-[#f0ede6]/50 max-w-xs leading-relaxed mb-4'
        >
          Trade, collect, and verify rare collectibles across multiple
          categories — powered by community trust.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='flex gap-4 pt-4 border-t border-[rgba(245,245,220,0.06)] w-full max-w-sm justify-around'
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className='flex flex-col items-center gap-1'>
              <Icon size={14} className='text-[#ff2d2d]' />
              <span className='text-lg font-black text-[#f5f5dc]'>{value}</span>
              <span className='text-[10px] text-[#f0ede6]/40 uppercase tracking-wider'>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Live Trade Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <LiveTradeTicker />
      </motion.div>

      {/* Category Cards */}
      <section className='px-4 pt-6 pb-4'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30'>
            Categories
          </h2>
          <Link href='/settings'>
            <span className='text-[10px] text-[#ff2d2d] font-mono flex items-center gap-1'>
              <Bell size={10} /> Alerts
            </span>
          </Link>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.6 }}
            >
              <Link href={cat.href}>
                <div
                  className='relative p-3 rounded-2xl overflow-hidden cursor-pointer h-full'
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}05)`,
                    border: `1px solid ${cat.color}25`,
                  }}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <span className='text-2xl'>{cat.emoji}</span>
                    <ArrowRight
                      size={12}
                      style={{ color: cat.color }}
                      className='mt-1'
                    />
                  </div>
                  <h3 className='text-sm font-bold text-[#f5f5dc] leading-tight'>
                    {cat.name}
                  </h3>
                  <p className='text-[9px] text-[#f0ede6]/40 mt-0.5 line-clamp-2'>
                    {cat.description}
                  </p>
                  <div className='flex items-center gap-1 mt-2'>
                    <BarChart3 size={9} style={{ color: cat.color }} />
                    <span
                      className='text-[9px] font-mono'
                      style={{ color: cat.color }}
                    >
                      {cat.marketplaces.length} sources
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className='px-4 pt-4 pb-4'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30'>
            Hot Right Now
          </h2>
          <Link href='/vault'>
            <span className='text-xs text-[#ff2d2d] font-mono flex items-center gap-1'>
              See all <ChevronRight size={12} />
            </span>
          </Link>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {featuredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.8 }}
            >
              <CollectibleCard item={item} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className='px-4 pt-2 pb-6'>
        <div className='grid grid-cols-3 gap-2'>
          {[
            {
              icon: Search,
              label: "Card Finder",
              href: "/categories/pokemon",
              color: "#fbbf24",
            },
            {
              icon: Star,
              label: "Lucky Draw",
              href: "/draw",
              color: "#ff2d2d",
            },
            {
              icon: BarChart3,
              label: "Leaderboard",
              href: "/leaderboard",
              color: "#60a5fa",
            },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className='flex flex-col items-center gap-1.5 p-3 rounded-2xl glass border border-[rgba(245,245,220,0.06)] cursor-pointer'
              >
                <Icon size={18} style={{ color }} />
                <span className='text-[10px] font-bold text-[#f5f5dc]'>
                  {label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
