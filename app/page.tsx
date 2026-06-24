"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, ChevronRight, Shield, Zap, BarChart3, Package, Swords, Star, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
      {/* Hero Section */}
      <section className='relative flex flex-col items-center justify-center min-h-[60vh] px-4 pt-16 pb-10 overflow-hidden text-center'>
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div
            className='absolute w-96 h-96 rounded-full blur-3xl opacity-15'
            style={{
              background: "radial-gradient(circle, #ff2d2d, transparent)",
              top: "-100px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          <div
            className='absolute w-72 h-72 rounded-full blur-3xl opacity-10'
            style={{
              background: "radial-gradient(circle, #f5f5dc, transparent)",
              bottom: "-40px",
              right: "-60px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full glass border border-[rgba(255,45,45,0.25)]'
        >
          <span className='live-dot w-2 h-2 rounded-full bg-[#ff2d2d] inline-block' />
          <span className='text-[11px] font-mono text-[#ff2d2d] uppercase tracking-widest'>
            Hong Kong's Collector Portal
          </span>
        </motion.div>

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
          className='text-lg text-[#f0ede6]/60 max-w-md leading-relaxed mb-8'
        >
          Trade, collect, and verify rare Pop Mart figures, vintage LEGO, and
          PSA-graded cards — powered by community trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='flex flex-col sm:flex-row gap-3 w-full max-w-md'
        >
          <Link
            href='/signup'
            className='flex-1 px-8 py-3.5 rounded-xl text-sm font-black text-white tracking-wide flex items-center justify-center gap-2'
            style={{
              background: "linear-gradient(135deg, #ff2d2d, #cc1111)",
              boxShadow: "0 0 24px rgba(255,45,45,0.35)",
            }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <Link
            href='/login'
            className='flex-1 px-8 py-3.5 rounded-xl text-sm font-bold text-[#f5f5dc] glass border border-[rgba(245,245,220,0.15)] flex items-center justify-center gap-2 hover:border-[rgba(255,45,45,0.3)] transition-colors'
          >
            Sign In
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='text-[11px] text-[#f0ede6]/30 mt-4'
        >
          No credit card required · Free forever for basic
        </motion.p>
      </section>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className='px-4 pb-8'
      >
        <div className='flex gap-4 pt-6 border-t border-[rgba(245,245,220,0.06)] justify-around max-w-lg mx-auto'>
          {[
            { label: "Active Trades", value: "1,247" },
            { label: "Verified Traders", value: "8,340" },
            { label: "Items Tracked", value: "52K+" },
          ].map(({ label, value }) => (
            <div key={label} className='flex flex-col items-center gap-0.5'>
              <span className='text-xl font-black text-[#f5f5dc]'>{value}</span>
              <span className='text-[10px] text-[#f0ede6]/40 uppercase tracking-wider'>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <section className='px-4 pb-10'>
        <div className='max-w-lg mx-auto'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-4 text-center'>
            Everything you need to collect smarter
          </h2>
          <div className='grid grid-cols-1 gap-3'>
            {[
              {
                icon: <Shield size={20} className='text-[#ff2d2d]' />,
                title: "Verified Trading",
                desc: "Secure trades with dual QR handshake at Safe-Zone partner shops. No more scams.",
              },
              {
                icon: <Package size={20} className='text-[#ff2d2d]' />,
                title: "Digital Shelf",
                desc: "Showcase your collection with rarity badges, condition tags, and price history.",
              },
              {
                icon: <BarChart3 size={20} className='text-[#ff2d2d]' />,
                title: "Price Tracking",
                desc: "Real-time prices across Carousell, Facebook Marketplace, eBay, and more.",
              },
              {
                icon: <Swords size={20} className='text-[#ff2d2d]' />,
                title: "Trade Arena",
                desc: "Challenge other collectors in head-to-head trades. Winner takes all.",
              },
              {
                icon: <Zap size={20} className='text-[#ff2d2d]' />,
                title: "Vault Pro",
                desc: "Track your portfolio value, profit/loss, and get AI-powered deal alerts.",
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
              >
                <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)] flex items-start gap-4 hover:border-[rgba(255,45,45,0.15)] transition-colors'>
                  <div className='w-10 h-10 rounded-xl bg-[rgba(255,45,45,0.1)] flex items-center justify-center shrink-0'>
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className='text-sm font-bold text-[#f5f5dc] mb-1'>{feat.title}</h3>
                    <p className='text-[12px] text-[#f0ede6]/50 leading-relaxed'>{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='px-4 pb-10'>
        <div className='max-w-lg mx-auto'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-4 text-center'>
            Simple, transparent pricing
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {[
              {
                name: "Free",
                price: "HKD 0",
                period: "forever",
                features: ["3 active trades", "Basic shelf", "Community access"],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "HKD 49",
                period: "/month",
                features: ["Unlimited trades", "Vault Pro", "Price alerts", "Priority support"],
                cta: "Start Free Trial",
                highlight: true,
              },
              {
                name: "Collector",
                price: "HKD 129",
                period: "/month",
                features: ["Everything in Pro", "AI deal finder", "Verified badge", "API access"],
                cta: "Start Free Trial",
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.6 }}
                className={`rounded-2xl p-4 flex flex-col ${
                  plan.highlight
                    ? "border-2 border-[#ff2d4d] bg-[rgba(255,45,45,0.05)]"
                    : "border border-[rgba(245,245,220,0.06)] bg-[rgba(245,245,220,0.02)]"
                }`}
              >
                {plan.highlight && (
                  <span className='text-[9px] font-mono uppercase tracking-widest text-[#ff2d2d] mb-2'>Most Popular</span>
                )}
                <h3 className='text-sm font-bold text-[#f5f5dc] mb-1'>{plan.name}</h3>
                <div className='mb-3'>
                  <span className='text-2xl font-black text-[#f5f5dc]'>{plan.price}</span>
                  <span className='text-xs text-[#f0ede6]/40 ml-1'>{plan.period}</span>
                </div>
                <ul className='flex-1 space-y-2 mb-4'>
                  {plan.features.map((f) => (
                    <li key={f} className='flex items-center gap-2 text-[11px] text-[#f0ede6]/60'>
                      <Check size={12} className='text-[#00c864] shrink-0' />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href='/signup'
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 ${
                    plan.highlight
                      ? "bg-[#ff2d2d] text-white"
                      : "bg-[rgba(245,245,220,0.06)] text-[#f5f5dc] border border-[rgba(245,245,220,0.1)]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='px-4 pb-10'>
        <div className='max-w-lg mx-auto'>
          <h2 className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-4 text-center'>
            Loved by collectors
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {[
              {
                name: "Sarah K.",
                role: "Labubu Collector",
                text: "Finally a platform that understands collectors. The trade verification is a game-changer.",
                avatar: "👩",
              },
              {
                name: "Marcus L.",
                role: "Vintage LEGO Dealer",
                text: "I've doubled my sales since joining. The price tracking helps me stay competitive.",
                avatar: "👨",
              },
              {
                name: "Yuki T.",
                role: "PSA Grader",
                text: "The community is amazing. Made real trades with people I met through FLSHBK.",
                avatar: "🧑",
              },
              {
                name: "Alex W.",
                role: "Pop Mart Enthusiast",
                text: "Found my grail piece here. The rarity tracker is incredibly accurate.",
                avatar: "🎯",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.7 }}
                className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-lg'>{t.avatar}</span>
                  <div>
                    <p className='text-xs font-bold text-[#f5f5dc]'>{t.name}</p>
                    <p className='text-[9px] text-[#f0ede6]/40'>{t.role}</p>
                  </div>
                </div>
                <p className='text-[11px] text-[#f0ede6]/50 leading-relaxed'>"{t.text}"</p>
                <div className='flex gap-0.5 mt-2'>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={10} className='text-[#ffc800] fill-[#ffc800]' />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='px-4 pb-16'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className='max-w-lg mx-auto text-center'
        >
          <div
            className='rounded-2xl p-8'
            style={{
              background: "linear-gradient(135deg, rgba(255,45,45,0.1), rgba(255,45,45,0.02))",
              border: "1px solid rgba(255,45,45,0.2)",
            }}
          >
            <h2 className='text-2xl font-black text-[#f5f5dc] mb-2'>Ready to start collecting?</h2>
            <p className='text-sm text-[#f0ede6]/50 mb-6'>Join thousands of collectors on Hong Kong's #1 trading platform.</p>
            <Link
              href='/signup'
              className='inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc1111)",
                boxShadow: "0 0 24px rgba(255,45,45,0.35)",
              }}
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className='px-4 pb-8 border-t border-[rgba(245,245,220,0.04)] pt-6'>
        <div className='max-w-lg mx-auto text-center'>
          <p className='text-sm font-black mb-2'>
            <span className='text-[#f5f5dc]'>FLSH</span>
            <span className='neon-red'>BK</span>
          </p>
          <p className='text-[10px] text-[#f0ede6]/30 mb-4'>Hong Kong's Collector Trading Portal</p>
          <div className='flex justify-center gap-4 text-[10px] text-[#f0ede6]/40'>
            <Link href='/about' className='hover:text-[#f0ede6]/60'>About</Link>
            <Link href='/terms' className='hover:text-[#f0ede6]/60'>Terms</Link>
            <Link href='/privacy' className='hover:text-[#f0ede6]/60'>Privacy</Link>
            <Link href='/contact' className='hover:text-[#f0ede6]/60'>Contact</Link>
          </div>
          <p className='text-[9px] text-[#f0ede6]/20 mt-4'>&copy; 2024 FLSHBK. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
