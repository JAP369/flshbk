"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Home } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";

export default function CategoryNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop / Tablet horizontal tabs */}
      <div className='hidden md:flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar'>
        <Link href='/'>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              isActive("/") && !pathname.startsWith("/categories")
                ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                : "text-[#f0ede6]/50 hover:text-[#f0ede6]/80 hover:bg-[rgba(245,245,220,0.05)] border border-transparent"
            }`}
          >
            <Home size={14} />
            <span>Dashboard</span>
          </motion.div>
        </Link>

        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={cat.href}>
            <motion.div
              whileTap={{ scale: 0.95 }}
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

        <div className='flex-1' />

        <Link href='/settings'>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              isActive("/settings")
                ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6] border border-[rgba(245,245,220,0.2)]"
                : "text-[#f0ede6]/40 hover:text-[#f0ede6]/70 hover:bg-[rgba(245,245,220,0.05)] border border-transparent"
            }`}
          >
            <Settings size={14} />
            <span>Settings</span>
          </motion.div>
        </Link>
      </div>

      {/* Mobile hamburger menu */}
      <div className='md:hidden flex items-center justify-between px-4 py-2'>
        <Link href='/'>
          <span className='text-sm font-black'>
            <span className='text-[#f5f5dc]'>FLSH</span>
            <span className='neon-red'>BK</span>
          </span>
        </Link>

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
                <Link href='/' onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/") && !pathname.startsWith("/categories")
                        ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <div className='h-px bg-[rgba(245,245,220,0.06)] my-1' />

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

                <Link href='/settings' onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive("/settings")
                        ? "bg-[rgba(245,245,220,0.1)] text-[#f0ede6]"
                        : "text-[#f0ede6]/60"
                    }`}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
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
