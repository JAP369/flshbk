"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Swords, Package, Ticket, MapPin, Search } from "lucide-react";

const navItems = [
  { href: "/", label: "Portal", icon: Home },
  { href: "/aggregator", label: "Find", icon: Search },
  { href: "/trade", label: "Arena", icon: Swords },
  { href: "/vault", label: "Vault", icon: Package },
  { href: "/draw", label: "Lucky", icon: Ticket },
  { href: "/meetup", label: "Meetup", icon: MapPin },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 glass-strong'
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className='flex items-center justify-around h-16 px-1 max-w-lg mx-auto'>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className='flex-1 flex flex-col items-center gap-0.5 py-2 group relative'
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className='relative flex flex-col items-center'
              >
                {active && (
                  <motion.div
                    layoutId='nav-indicator'
                    className='absolute -inset-2 rounded-xl'
                    style={{ background: "rgba(255,45,45,0.12)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.5}
                  className={`transition-all duration-200 relative z-10 ${
                    active
                      ? "text-[#ff2d2d] drop-shadow-[0_0_6px_rgba(255,45,45,0.7)]"
                      : "text-[#f0ede6]/40 group-hover:text-[#f0ede6]/70"
                  }`}
                />
                <span
                  className={`text-[9px] font-medium tracking-wide relative z-10 transition-all duration-200 ${
                    active ? "text-[#ff2d2d]" : "text-[#f0ede6]/40"
                  }`}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
