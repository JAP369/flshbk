"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Layers,
  ChevronRight,
} from "lucide-react";
import LiveTradeTicker from "@/components/LiveTradeTicker";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";

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

const stats = [
  { label: "Active Trades", value: "1,247", icon: Zap },
  { label: "Verified Traders", value: "8,340", icon: Shield },
  { label: "Jackpot Pool", value: "HKD 42K", icon: TrendingUp },
];

const features = [
  {
    icon: Shield,
    title: "Verified Trade",
    desc: "Secure trading of Pop Mart (Labubu/Molly) and vintage LEGO with dual QR handshake at Safe-Zone partner shops.",
    href: "/trade",
    cta: "Enter Arena",
  },
  {
    icon: Layers,
    title: "Digital Shelf",
    desc: "Virtual showcase for your collection. 3D card tilt, PSA grades, box condition, and community verification badges.",
    href: "/vault",
    cta: "My Vault",
  },
  {
    icon: TrendingUp,
    title: "Rarity Tracker",
    desc: "Real-time data on chase figures and market prices. Live floor price feeds for Labubu, Molly, and retiring LEGO sets.",
    href: "/vault",
    cta: "Track Now",
  },
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Hero */}
      <section className='relative flex flex-col items-center justify-center min-h-[55vh] px-4 pt-12 overflow-hidden text-center'>
        {/* Background glow orbs */}
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

        {/* Tagline chip */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center gap-2 px-3 py-1 mb-5 rounded-full glass border border-[rgba(255,45,45,0.25)]'
        >
          <span className='live-dot w-1.5 h-1.5 rounded-full bg-[#ff2d2d] inline-block' />
          <span className='text-[10px] font-mono text-[#ff2d2d] uppercase tracking-widest'>
            Hong Kong&apos;s Collector Portal
          </span>
        </motion.div>

        {/* Logo / Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='text-6xl font-black tracking-tight leading-none mb-3'
        >
          <span className='text-[#f5f5dc]'>FLSH</span>
          <span className='neon-red'>BK</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='text-sm text-[#f0ede6]/50 max-w-xs leading-relaxed mb-6'
        >
          Trade, collect, and verify rare Pop Mart figures, vintage LEGO, and
          PSA-graded cards — powered by community trust.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='flex gap-3 flex-wrap justify-center'
        >
          <Link href='/trade'>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className='flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                boxShadow: "0 0 20px rgba(255,45,45,0.4)",
              }}
            >
              Enter Arena <ArrowRight size={14} />
            </motion.button>
          </Link>
          <Link href='/vault'>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className='flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold glass border border-[rgba(245,245,220,0.15)] text-[#f5f5dc]'
            >
              My Vault
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className='flex gap-4 mt-8 pt-6 border-t border-[rgba(245,245,220,0.06)] w-full max-w-sm justify-around'
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
        transition={{ delay: 0.6 }}
      >
        <LiveTradeTicker />
      </motion.div>

      {/* Feature Highlight */}
      <section className='px-4 pt-8 pb-4'>
        <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-4'>
          What is FLSHBK?
        </h2>
        <div className='flex flex-col gap-3'>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.7 }}
              onClick={() => setActiveFeature(i)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 glass ${
                activeFeature === i
                  ? "border border-[rgba(255,45,45,0.3)]"
                  : "border border-[rgba(245,245,220,0.05)]"
              }`}
              style={
                activeFeature === i
                  ? { boxShadow: "0 0 20px rgba(255,45,45,0.1)" }
                  : {}
              }
            >
              <div className='flex items-start gap-3'>
                <div
                  className='w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5'
                  style={{ background: "rgba(255,45,45,0.12)" }}
                >
                  <f.icon size={16} className='text-[#ff2d2d]' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-bold text-[#f5f5dc] text-sm'>
                      {f.title}
                    </h3>
                    <Link href={f.href}>
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className='flex items-center gap-1 text-[10px] text-[#ff2d2d] font-mono'
                      >
                        {f.cta} <ChevronRight size={10} />
                      </motion.div>
                    </Link>
                  </div>
                  <AnimatePresence>
                    {activeFeature === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className='text-xs text-[#f0ede6]/50 leading-relaxed mt-1.5 overflow-hidden'
                      >
                        {f.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className='px-4 pt-6 pb-8'>
        <div className='flex items-center justify-between mb-4'>
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
              transition={{ delay: 0.1 * i + 0.9 }}
            >
              <CollectibleCard item={item} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lucky Draw CTA Banner */}
      <section className='px-4 pb-6'>
        <Link href='/draw'>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='relative p-5 rounded-2xl overflow-hidden cursor-pointer'
            style={{
              background:
                "linear-gradient(135deg, rgba(255,45,45,0.15), rgba(245,245,220,0.05))",
              border: "1px solid rgba(255,45,45,0.25)",
            }}
          >
            {/* Background shimmer */}
            <div className='absolute inset-0 holo-shimmer opacity-20 pointer-events-none' />
            <div className='relative flex items-center justify-between'>
              <div>
                <p className='text-[10px] font-mono uppercase tracking-widest text-[#ff2d2d] mb-1'>
                  🎲 Lucky Draw
                </p>
                <h3 className='text-lg font-black text-[#f5f5dc] leading-tight'>
                  Win a Be@rbrick 1000%
                </h3>
                <p className='text-xs text-[#f0ede6]/50 mt-1'>
                  Pool: HKD 42,000 · 6d 14h left
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className='text-5xl'
              >
                📦
              </motion.div>
            </div>
            <div className='relative mt-3 w-full h-1.5 rounded-full bg-[rgba(245,245,220,0.08)]'>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "68%" }}
                transition={{ duration: 1.5, delay: 1 }}
                className='h-full rounded-full'
                style={{
                  background: "linear-gradient(90deg, #ff2d2d, #ff6b6b)",
                }}
              />
              <span className='absolute right-0 -top-5 text-[10px] text-[#ff2d2d] font-mono'>
                68% filled
              </span>
            </div>
          </motion.div>
        </Link>
      </section>
    </main>
  );
}
