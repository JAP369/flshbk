"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DEV_USERS } from "@/contexts/AuthContext";
import { X, ChevronDown, LogOut, Zap, LayoutDashboard, BarChart3, Package, TrendingUp } from "lucide-react";
import Link from "next/link";

const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard?tab=overview" },
  { id: "inventory", label: "Inventory", icon: Package, href: "/dashboard?tab=inventory" },
  { id: "deals", label: "Deals", icon: TrendingUp, href: "/dashboard?tab=deals" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard?tab=analytics" },
];

export default function DevAuthButton() {
  return <DevAuthPanel />;
}

function DevAuthPanel() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  return (
    <>
      {/* Dashboard button — left side, green */}
      {isAuthenticated && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDashboardOpen((v) => !v)}
          className='fixed top-3 left-3 z-[9999] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider select-none'
          style={{
            background: "rgba(0,200,100,0.15)",
            border: "1px solid rgba(0,200,100,0.5)",
            color: "#00c864",
            backdropFilter: "blur(12px)",
          }}
        >
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronDown
            size={10}
            className='transition-transform duration-200'
            style={{ transform: dashboardOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
</motion.button>
      )}

      {/* Auth button — right side */}
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
        <span>DEV</span>
        {isAuthenticated ? (
          <>
            <span className='text-white/70'>{user?.avatar}</span>
            <span className='max-w-[60px] truncate text-white/80'>
              {user?.username}
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

      {/* Dashboard dropdown */}
      <AnimatePresence>
        {dashboardOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-[9998]'
              onClick={() => setDashboardOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className='fixed top-11 left-3 z-[9999] w-56 rounded-2xl overflow-hidden'
              style={{
                background: "rgba(14,14,18,0.96)",
                border: "1px solid rgba(0,200,100,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className='px-3 py-2.5' style={{ borderBottom: "1px solid rgba(0,200,100,0.15)" }}>
                <span className='text-[9px] font-mono font-bold uppercase tracking-widest text-[#00c864]'>
                  Dashboard Sections
                </span>
              </div>
              <div className='p-1.5'>
                {DASHBOARD_SECTIONS.map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    onClick={() => setDashboardOpen(false)}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-white/5 transition-all'
                  >
                    <section.icon size={14} className='text-[#00c864]' />
                    <span className='text-xs font-medium text-white/80'>{section.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth dropdown */}
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
              className='fixed top-11 right-3 z-[9999] w-64 rounded-2xl overflow-hidden'
              style={{
                background: "rgba(14,14,18,0.96)",
                border: `1px solid ${isAuthenticated ? "rgba(0,200,100,0.3)" : "rgba(255,200,0,0.3)"}`,
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Header */}
              <div
                className='flex items-center justify-between px-3 py-2.5'
                style={{ borderBottom: `1px solid ${isAuthenticated ? "rgba(0,200,100,0.15)" : "rgba(255,200,0,0.15)"}` }}
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

              {/* Current user */}
              {isAuthenticated && user && (
                <div
                  className='px-3 py-2.5'
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xl'>{user.avatar}</span>
                      <div>
                        <p className='text-xs font-bold text-white leading-none'>
                          {user.displayName}
                        </p>
                        <p className='text-[9px] text-white/40 font-mono mt-0.5'>
                          @{user.username} · Lvl {user.level}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 text-[10px] font-mono text-[#00c864]'>
                      <Zap size={10} />
                      {user.nexusTokens}
                    </div>
                  </div>
                </div>
              )}

              {/* Login as… */}
              <div className='px-3 py-2'>
                <p className='text-[9px] font-mono uppercase tracking-widest text-white/25 mb-1.5'>
                  Login as…
                </p>
                <div className='flex flex-col gap-1'>
                  {DEV_USERS.map((u) => (
                    <motion.button
                      key={u.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        login(u);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                        user?.id === u.id
                          ? "bg-[rgba(0,200,100,0.1)] border border-[rgba(0,200,100,0.25)]"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className='text-base'>{u.avatar}</span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-white/90 truncate'>
                          {u.displayName}
                        </p>
                        <p className='text-[9px] text-white/35 font-mono'>
                          Lvl {u.level} · {u.verifiedTrades}{" "}
                          {u.isVerified ? "· ✓ Verified" : ""}
                        </p>
                      </div>
                      {user?.id === u.id && (
                        <span className='text-[9px] text-[#00c864] font-mono shrink-0'>
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
                      logout();
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