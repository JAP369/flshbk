"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Zap,
  User,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  BarChart3,
  Grid3X3,
  Package,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { useAuth } from "@/contexts/AuthContext";
import { DEV_USERS } from "@/contexts/AuthContext";

export default function CategoryNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("flshbk_active_tab");
  });
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("flshbk_active_tab", activeTab);
    }
  }, [activeTab]);

  const normalizedPathname =
    pathname === "/categories/pokemon" ? "/categories/tcg" : pathname;

  const isActive = (href: string) => {
    if (href === "/") return normalizedPathname === "/";
    return normalizedPathname.startsWith(href);
  };

  const currentCategory = CATEGORIES.find((c) => isActive(c.href));

  return (
    <>
      {/* Desktop / Tablet horizontal tabs */}
      <div className='hidden md:flex items-center justify-between px-4 py-2 overflow-x-auto no-scrollbar sticky top-0 z-30 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[rgba(245,245,220,0.04)]'>
        {/* Left — empty for dashboard button space */}
        <div className='w-24' />

        {/* Center — categories */}
        <div className='flex items-center gap-1'>
          {isAuthenticated &&
            CATEGORIES.map((cat) => (
              <Link key={cat.id} href={cat.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(cat.href)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive(cat.href)
                      ? "border"
                      : "text-[#f0ede6]/50 hover:text-[#f0ede6]/80 hover:bg-[rgba(245,245,220,0.05)] border border-transparent"
                  }`}
                  style={
                    isActive(cat.href)
                      ? {
                          background: `${cat.color}15`,
                          color: cat.color,
                          borderColor: `${cat.color}40`,
                        }
                      : {}
                  }
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </motion.div>
              </Link>
            ))}
        </div>

        {/* Right — spacer for auth button */}
        <div className='w-24' />
      </div>

      {/* Mobile header */}
      <div className='md:hidden flex items-center justify-between px-4 py-2 sticky top-0 z-30 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[rgba(245,245,220,0.04)]'>
        <Link href='/'>
          <span className='text-sm font-black'>
            <span className='text-[#f5f5dc]'>FLSH</span>
            <span className='neon-red'>BK</span>
          </span>
        </Link>

        <div className='flex items-center gap-2'>
          {/* Active category indicator on mobile */}
          {currentCategory && (
            <span
              className='text-[10px] font-bold px-2 py-1 rounded-full'
              style={{
                background: `${currentCategory.color}15`,
                color: currentCategory.color,
                border: `1px solid ${currentCategory.color}30`,
              }}
            >
              {currentCategory.emoji} {currentCategory.name}
            </span>
          )}

          {/* Auth dropdown button */}
          <div className='relative'>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthDropdownOpen((v) => !v)}
              className='flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider select-none'
              style={{
                background: isAuthenticated
                  ? "rgba(0,200,100,0.15)"
                  : "rgba(255,200,0,0.15)",
                border: `1px solid ${isAuthenticated ? "rgba(0,200,100,0.5)" : "rgba(255,200,0,0.5)"}`,
                color: isAuthenticated ? "#00c864" : "#ffc800",
              }}
            >
              <span>{isAuthenticated ? "✓" : "DEV"}</span>
              {isAuthenticated && user && (
                <span className='max-w-[50px] truncate text-white/70 font-normal'>
                  {user.username}
                </span>
              )}
              {!isAuthenticated && (
                <Link href='/signup' onClick={() => setAuthDropdownOpen(false)}>
                  <span className='text-[10px] font-bold px-2 py-1 rounded-lg bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]'>
                    Sign Up
                  </span>
                </Link>
              )}
              <ChevronDown
                size={10}
                className='transition-transform duration-200'
                style={{
                  transform: authDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </motion.button>

            <AnimatePresence>
              {authDropdownOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed inset-0 z-40'
                    onClick={() => setAuthDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ type: "spring", stiffness: 320, damping: 25 }}
                    className='absolute top-full right-0 mt-1 z-50 w-64 rounded-2xl overflow-hidden'
                    style={{
                      background: "rgba(14,14,18,0.96)",
                      border: `1px solid ${isAuthenticated ? "rgba(0,200,100,0.3)" : "rgba(255,200,0,0.3)"}`,
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {isAuthenticated && user && (
                      <div
                        className='px-3 py-3'
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-9 h-9 rounded-full bg-[rgba(0,200,100,0.15)] flex items-center justify-center text-sm font-bold text-emerald-400'>
                              {user.displayName?.slice(0, 1) || "D"}
                            </div>
                            <div>
                              <p className='text-xs font-bold text-white leading-none'>
                                {user.displayName}
                              </p>
                              <p className='text-[9px] text-white/40 font-mono mt-0.5'>
                                @{user.username} · Lvl {user.level}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-1 text-[10px] font-mono text-emerald-400'>
                            <Zap size={10} />
                            {user.nexusTokens}
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)]'>
                          <div className='text-center'>
                            <p className='text-xs font-bold text-white'>
                              {user.xp}
                            </p>
                            <p className='text-[8px] text-white/30'>XP</p>
                          </div>
                          <div className='text-center'>
                            <p className='text-xs font-bold text-white'>
                              {user.verifiedTrades}
                            </p>
                            <p className='text-[8px] text-white/30'>Trades</p>
                          </div>
                          <div className='text-center'>
                            <p className='text-xs font-bold text-white'>
                              {user.streakCount}🔥
                            </p>
                            <p className='text-[8px] text-white/30'>Streak</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className='px-3 py-2'>
                      {!isAuthenticated ? (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            signIn(DEV_USERS[0]);
                            setAuthDropdownOpen(false);
                          }}
                          className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white'
                          style={{
                            background:
                              "linear-gradient(135deg, #00c864, #00a050)",
                            boxShadow: "0 0 16px rgba(0,200,100,0.3)",
                          }}
                        >
                          <ShieldCheck size={14} /> Dev Login
                        </motion.button>
                      ) : (
                        <div className='flex flex-col gap-1.5'>
                          <Link
                            href='/profile/dev_collector'
                            onClick={() => setAuthDropdownOpen(false)}
                          >
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5'
                            >
                              <User size={14} className='text-white/50' />
                              <span className='text-xs text-white/70'>
                                View Profile
                              </span>
                            </motion.button>
                          </Link>
                          <Link
                            href='/collection'
                            onClick={() => setAuthDropdownOpen(false)}
                          >
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5'
                            >
                              <Briefcase size={14} className='text-white/50' />
                              <span className='text-xs text-white/70'>
                                My Collection
                              </span>
                            </motion.button>
                          </Link>
                          <Link
                            href='/arbitrage'
                            onClick={() => setAuthDropdownOpen(false)}
                          >
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5'
                            >
                              <TrendingUp size={14} className='text-white/50' />
                              <span className='text-xs text-white/70'>
                                Arbitrage
                              </span>
                            </motion.button>
                          </Link>
                          <Link
                            href='/vault'
                            onClick={() => setAuthDropdownOpen(false)}
                          >
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5'
                            >
                              <Zap size={14} className='text-white/50' />
                              <span className='text-xs text-white/70'>
                                My Vault
                              </span>
                            </motion.button>
                          </Link>
                          <Link
                            href='/dashboard'
                            onClick={() => setAuthDropdownOpen(false)}
                          >
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5'
                            >
                              <Package size={14} className='text-white/50' />
                              <span className='text-xs text-white/70'>
                                Dashboard
                              </span>
                            </motion.button>
                          </Link>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              signOut();
                              setAuthDropdownOpen(false);
                            }}
                            className='w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400'
                            style={{
                              background: "rgba(255,45,45,0.1)",
                              border: "1px solid rgba(255,45,45,0.2)",
                            }}
                          >
                            <LogOut size={12} /> Sign Out
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger menu */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='p-2 rounded-xl glass'
          >
            {mobileMenuOpen ? (
              <X size={18} className='text-[#f5f5dc]' />
            ) : (
              <Menu size={18} className='text-[#f5f5dc]' />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-40 bg-black/60 md:hidden'
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className='fixed top-0 right-0 bottom-0 z-50 w-72 glass-strong md:hidden overflow-y-auto'
            >
              <div className='flex items-center justify-between px-4 py-3 border-b border-[rgba(245,245,220,0.06)]'>
                <span className='text-sm font-black'>
                  <span className='text-[#f5f5dc]'>FLSH</span>
                  <span className='neon-red'>BK</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={18} className='text-[#f0ede6]/60' />
                </button>
              </div>

              <div className='px-3 py-3 flex flex-col gap-1'>
                {isAuthenticated && (
                  <>
                    <p className='text-[9px] font-mono uppercase tracking-widest text-white/20 px-3 py-1'>
                      Categories
                    </p>

                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                            isActive(cat.href) ? "border" : "text-[#f0ede6]/60"
                          }`}
                          style={
                            isActive(cat.href)
                              ? {
                                  background: `${cat.color}15`,
                                  color: cat.color,
                                  borderColor: `${cat.color}40`,
                                }
                              : {}
                          }
                        >
                          <span className='text-lg'>{cat.emoji}</span>
                          <div className='flex flex-col'>
                            <span>{cat.name}</span>
                            <span className='text-[9px] font-normal opacity-60'>
                              {cat.description}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    <div className='h-px bg-[rgba(245,245,220,0.06)] my-1' />

                    <p className='text-[9px] font-mono uppercase tracking-widest text-white/20 px-3 py-1 mt-2'>
                      Quick Access
                    </p>
                  </>
                )}

                {/* New Pages */}
                <Link
                  href='/collection'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/collection")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <Briefcase size={18} />
                    <span>My Collection</span>
                  </div>
                </Link>
                <Link
                  href='/arbitrage'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/arbitrage")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <TrendingUp size={18} />
                    <span>Arbitrage</span>
                  </div>
                </Link>
                <Link
                  href='/vault/projections'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/vault/projections")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span>Vault Projections</span>
                  </div>
                </Link>
                <Link href='/screener' onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/screener")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <Grid3X3 size={18} />
                    <span>Pop Screener</span>
                  </div>
                </Link>
                <Link
                  href='/dashboard'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/dashboard")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <Package size={18} />
                    <span>Dashboard</span>
                  </div>
                </Link>


              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
