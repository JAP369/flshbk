"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";
import LiveTradeTicker from "@/components/LiveTradeTicker";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Hero */}
      <section className='relative flex flex-col items-center justify-center min-h-[42vh] px-4 pt-10 pb-6 overflow-hidden text-center'>
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
            Hong Kong&apos;s Collector Portal
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
          className='text-sm text-[#f0ede6]/50 max-w-xs leading-relaxed mb-5'
        >
          Trade, collect, and verify rare Pop Mart figures, vintage LEGO, and
          PSA-graded cards — powered by community trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='flex gap-3'
        >
          <Link
            href='/trade'
            className='px-6 py-2.5 rounded-xl text-xs font-black text-white tracking-wide'
            style={{
              background: "linear-gradient(135deg, #ff2d2d, #cc1111)",
              boxShadow: "0 0 20px rgba(255,45,45,0.3)",
            }}
          >
            Enter Arena
          </Link>
          <Link
            href='/vault'
            className='px-6 py-2.5 rounded-xl text-xs font-bold text-[#f5f5dc] glass border border-[rgba(245,245,220,0.1)]'
          >
            My Vault
          </Link>
        </motion.div>
      </section>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className='px-4 pb-4'
      >
        <div className='flex gap-3 pt-4 border-t border-[rgba(245,245,220,0.06)] justify-around'>
          {[
            { label: "Active Trades", value: "1,247" },
            { label: "Verified Traders", value: "8,340" },
            { label: "Jackpot Pool", value: "HKD 42K" },
          ].map(({ label, value }) => (
            <div key={label} className='flex flex-col items-center gap-0.5'>
              <span className='text-base font-black text-[#f5f5dc]'>
                {value}
              </span>
              <span className='text-[9px] text-[#f0ede6]/40 uppercase tracking-wider'>
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Live Trade Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='pb-4'
      >
        <LiveTradeTicker />
      </motion.div>

      {/* Feature cards — What is FLSHBK? */}
      <section className='px-4 pb-4'>
        <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-3'>
          What is FLSHBK?
        </h2>
        <div className='grid grid-cols-1 gap-3'>
          {[
            {
              icon: "🛡️",
              title: "Verified Trade",
              desc: "Secure trading of Pop Mart (Labubu/Molly) and vintage LEGO with dual QR handshake at Safe-Zone partner shops.",
              href: "/trade",
              cta: "Enter Arena",
            },
            {
              icon: "📦",
              title: "Digital Shelf",
              desc: "Showcase your collection with rarity badges, condition tags, and price history. Share your shelf with the community.",
              href: "/vault",
              cta: "My Vault",
            },
            {
              icon: "📊",
              title: "Rarity Tracker",
              desc: "Real-time price tracking across Carousell, Facebook Marketplace, eBay, and more. Never miss a deal.",
              href: "/vault",
              cta: "Track Now",
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
            >
              <Link href={feat.href}>
                <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)] flex items-center gap-3 cursor-pointer hover:border-[rgba(255,45,45,0.15)] transition-colors'>
                  <span className='text-2xl shrink-0'>{feat.icon}</span>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-sm font-bold text-[#f5f5dc] mb-0.5'>
                      {feat.title}
                    </h3>
                    <p className='text-[11px] text-[#f0ede6]/40 leading-relaxed'>
                      {feat.desc}
                    </p>
                  </div>
                  <span
                    className='text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 px-2.5 py-1 rounded-lg'
                    style={{
                      background: "rgba(255,45,45,0.12)",
                      color: "#ff2d2d",
                      border: "1px solid rgba(255,45,45,0.2)",
                    }}
                  >
                    {feat.cta}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hot Right Now */}
      <section className='px-4 pb-4'>
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
          {hotItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i + 0.6 }}
            >
              <CollectibleCard item={item} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lucky Draw promo */}
      <section className='px-4 pb-8'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href='/draw'>
            <div
              className='relative rounded-2xl overflow-hidden cursor-pointer'
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,45,45,0.12), rgba(255,45,45,0.04))",
                border: "1px solid rgba(255,45,45,0.2)",
              }}
            >
              <div className='p-4 flex items-center gap-4'>
                <div className='text-3xl'>🎲</div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Flame size={14} className='text-[#ff2d2d]' />
                    <h3 className='text-sm font-bold text-[#f5f5dc]'>
                      Lucky Draw
                    </h3>
                  </div>
                  <p className='text-[10px] text-[#f0ede6]/40 mt-0.5'>
                    Win a Be@rbrick 1000%
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-black text-[#ff2d2d]'>
                    HKD 42,000
                  </p>
                  <p className='text-[9px] text-[#f0ede6]/30 font-mono'>
                    6d 14h left
                  </p>
                </div>
              </div>
              <div className='h-1 bg-[rgba(255,45,45,0.1)]'>
                <div
                  className='h-full rounded-r-full'
                  style={{
                    width: "68%",
                    background: "linear-gradient(90deg, #ff2d2d, #ff6b6b)",
                  }}
                />
              </div>
            </div>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

const hotItems: CollectibleItem[] = [
  {
    id: "h1",
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
    id: "h2",
    name: "LEGO Icons Eiffel Tower",
    series: "Icons #10307",
    rarity: "rare",
    price: "HKD 2,200",
    priceChange: 8.3,
    condition: "Sealed",
    category: "lego",
  },
  {
    id: "h3",
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
    id: "h4",
    name: "Molly Zodiac Series",
    series: "Pop Mart × Kenny Wong",
    rarity: "rare",
    price: "HKD 1,600",
    priceChange: -3.2,
    status: "opened",
    category: "blindbox",
  },
];
