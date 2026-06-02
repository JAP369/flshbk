"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { X, ChevronDown, LogOut, Zap, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Only renders in development builds
export default function DevAuthButton() {
  if (process.env.NODE_ENV !== "development") return null;

  return <DevAuthPanel />;
}

function DevAuthPanel() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDevLogin() {
    const res = await fetch("/api/dev-login");
    if (res.redirected) {
      router.push(res.url);
      router.refresh();
    }
  }

  async function handleDevLogout() {
    await fetch("/api/dev-login", { method: "DELETE" });
    signOut();
  }

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className='fixed top-3 right-3 z-[9999] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider select-none'
        style={{
          background: isAuthenticated
            ? "rgba(0,200,100,0.15)"
            : "rgba(255,200,0,0.15)",
          border: `1px solid ${isAuthenticated ? "rgba(0,200,100,0.5)" : "rgba(255,200,0,0.5)"}`,
          color: isAuthenticated ? "#00c864" : "#ffc800",
          backdropFilter: "blur(12px)",
        }}
      >
        <span>{isAuthenticated ? "DEV✓" : "DEV"}</span>
        {loading ? (
          <span className='text-white/50'>...</span>
        ) : isAuthenticated ? (
          <>
            <span className='text-white/70'>
              {user?.display_name?.slice(0, 1) || "👤"}
            </span>
            <span className='max-w-[60px] truncate text-white/80'>
              {user?.username}
            </span>
          </>
        ) : (
          <span className='text-white/50'>login</span>
        )}
        <ChevronDown
          size={10}
          className='transition-transform duration-200'
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-[9998]'
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className='fixed top-11 right-3 z-[9999] w-72 rounded-2xl overflow-hidden'
              style={{
                background: "rgba(14,14,18,0.96)",
                border: "1px solid rgba(255,200,0,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className='flex items-center justify-between px-3 py-2.5'
                style={{ borderBottom: "1px solid rgba(255,200,0,0.15)" }}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className='text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded'
                    style={{
                      background: isAuthenticated
                        ? "rgba(0,200,100,0.15)"
                        : "rgba(255,200,0,0.15)",
                      color: isAuthenticated ? "#00c864" : "#ffc800",
                    }}
                  >
                    {isAuthenticated ? "AUTHENTICATED" : "DEV MODE"}
                  </span>
                  <span className='text-[9px] text-white/30 font-mono'>
                    bypass auth
                  </span>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X size={13} className='text-white/40' />
                </button>
              </div>

              {isAuthenticated && user && (
                <div
                  className='px-3 py-3'
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-10 h-10 rounded-full bg-[rgba(0,200,100,0.15)] flex items-center justify-center text-lg'>
                        {user.display_name?.slice(0, 1) || "👤"}
                      </div>
                      <div>
                        <p className='text-xs font-bold text-white leading-none'>
                          {user.display_name}
                        </p>
                        <p className='text-[9px] text-white/40 font-mono mt-0.5'>
                          @{user.username} · Lvl {user.level}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 text-[10px] font-mono text-emerald-400'>
                      <Zap size={10} />
                      {user.nexus_tokens}
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className='grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)]'>
                    <div className='text-center'>
                      <p className='text-xs font-bold text-white'>{user.xp}</p>
                      <p className='text-[8px] text-white/30'>XP</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-xs font-bold text-white'>
                        {user.verified_trades}
                      </p>
                      <p className='text-[8px] text-white/30'>Trades</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-xs font-bold text-white'>
                        {user.streak_count}🔥
                      </p>
                      <p className='text-[8px] text-white/30'>Streak</p>
                    </div>
                  </div>
                </div>
              )}

              <div className='px-3 py-2'>
                {!isAuthenticated ? (
                  <>
                    <p className='text-[9px] font-mono uppercase tracking-widest text-white/25 mb-2'>
                      Quick Login
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDevLogin}
                      className='w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white'
                      style={{
                        background: "linear-gradient(135deg, #00c864, #00a050)",
                        boxShadow: "0 0 16px rgba(0,200,100,0.3)",
                      }}
                    >
                      <ShieldCheck size={14} /> Dev Login (Bypass Auth)
                    </motion.button>
                    <p className='text-[9px] text-white/20 text-center mt-2 font-mono'>
                      Creates a mock dev session with Lvl 7 collector profile
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-[9px] font-mono uppercase tracking-widest text-white/25 mb-2'>
                      Actions
                    </p>
                    <div className='flex flex-col gap-1.5'>
                      <Link
                        href='/profile/dev_collector'
                        onClick={() => setOpen(false)}
                      >
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5 border border-transparent'
                        >
                          <User size={14} className='text-white/50' />
                          <span className='text-xs text-white/70'>
                            View Profile
                          </span>
                        </motion.button>
                      </Link>
                      <Link href='/vault' onClick={() => setOpen(false)}>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5 border border-transparent'
                        >
                          <Zap size={14} className='text-white/50' />
                          <span className='text-xs text-white/70'>
                            My Vault
                          </span>
                        </motion.button>
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDevLogout}
                        className='w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400'
                        style={{
                          background: "rgba(255,45,45,0.1)",
                          border: "1px solid rgba(255,45,45,0.2)",
                        }}
                      >
                        <LogOut size={12} /> Sign Out
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
