"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { X, ChevronDown, LogOut, Zap } from "lucide-react";

const DEV_USERS = [
  {
    id: "dev-001",
    username: "vault_rex",
    displayName: "Vault Rex",
    avatar: "🦁",
    level: 7,
    nexus_tokens: 2840,
    verified_trades: 14,
    is_verified: true,
  },
  {
    id: "dev-002",
    username: "chase_queen",
    displayName: "Chase Queen",
    avatar: "👑",
    level: 12,
    nexus_tokens: 8200,
    verified_trades: 31,
    is_verified: true,
  },
  {
    id: "dev-003",
    username: "newbie_collector",
    displayName: "Newbie",
    avatar: "🐣",
    level: 1,
    nexus_tokens: 40,
    verified_trades: 0,
    is_verified: false,
  },
];

// Only renders in development builds
export default function DevAuthButton() {
  if (process.env.NODE_ENV !== "development") return null;

  return <DevAuthPanel />;
}

function DevAuthPanel() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Map dev user to profile shape for display
  const currentUser = user;
  const isAuthenticated = !!user;

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className='fixed top-3 right-3 z-[9999] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider select-none'
        style={{
          background: "rgba(255,200,0,0.15)",
          border: "1px solid rgba(255,200,0,0.5)",
          color: "#ffc800",
          backdropFilter: "blur(12px)",
        }}
      >
        <span>DEV</span>
        {isAuthenticated ? (
          <>
            <span className='text-white/70'>
              {currentUser?.display_name?.slice(0, 1) || "👤"}
            </span>
            <span className='max-w-[60px] truncate text-white/80'>
              {currentUser?.username}
            </span>
          </>
        ) : (
          <span className='text-white/50'>no auth</span>
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-[9998]'
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className='fixed top-11 right-3 z-[9999] w-64 rounded-2xl overflow-hidden'
              style={{
                background: "rgba(14,14,18,0.96)",
                border: "1px solid rgba(255,200,0,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Header */}
              <div
                className='flex items-center justify-between px-3 py-2.5'
                style={{ borderBottom: "1px solid rgba(255,200,0,0.15)" }}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className='text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded'
                    style={{
                      background: "rgba(255,200,0,0.15)",
                      color: "#ffc800",
                    }}
                  >
                    DEV MODE
                  </span>
                  <span className='text-[9px] text-white/30 font-mono'>
                    bypass auth
                  </span>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X size={13} className='text-white/40' />
                </button>
              </div>

              {/* Current user */}
              {isAuthenticated && currentUser && (
                <div
                  className='px-3 py-2.5'
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xl'>
                        {currentUser.display_name?.slice(0, 1) || "👤"}
                      </span>
                      <div>
                        <p className='text-xs font-bold text-white leading-none'>
                          {currentUser.display_name}
                        </p>
                        <p className='text-[9px] text-white/40 font-mono mt-0.5'>
                          @{currentUser.username} · Lvl {currentUser.level}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 text-[10px] font-mono text-[#ff2d2d]'>
                      <Zap size={10} />
                      {currentUser.nexus_tokens}
                    </div>
                  </div>
                </div>
              )}

              {/* Login as… */}
              <div className='px-3 py-2'>
                <p className='text-[9px] font-mono uppercase tracking-widest text-white/25 mb-1.5'>
                  Quick Login…
                </p>
                <div className='flex flex-col gap-1'>
                  {DEV_USERS.map((u) => (
                    <motion.button
                      key={u.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        // In dev mode, we just show the panel
                        // Real auth goes through /login
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                        currentUser?.id === u.id
                          ? "bg-[rgba(255,200,0,0.1)] border border-[rgba(255,200,0,0.25)]"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className='text-base'>{u.avatar}</span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-white/90 truncate'>
                          {u.displayName}
                        </p>
                        <p className='text-[9px] text-white/35 font-mono'>
                          Lvl {u.level} · {u.verified_trades} trades{" "}
                          {u.is_verified ? "· ✓ Verified" : ""}
                        </p>
                      </div>
                      {currentUser?.id === u.id && (
                        <span className='text-[9px] text-[#ffc800] font-mono shrink-0'>
                          active
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              {isAuthenticated && (
                <div
                  className='px-3 pb-3'
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className='mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400'
                    style={{
                      background: "rgba(255,45,45,0.1)",
                      border: "1px solid rgba(255,45,45,0.2)",
                    }}
                  >
                    <LogOut size={12} /> Log Out
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
