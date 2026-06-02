"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  Zap,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          href: user ? `/profile/${user.username}` : "/login",
          value: user?.display_name || "Not signed in",
        },
        { icon: Shield, label: "Privacy & Security", href: "#" },
        {
          icon: Zap,
          label: "$NEXUS Tokens",
          href: "#",
          value: user ? `${user.nexus_tokens} tokens` : "—",
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Price Alerts",
          toggle: true,
          value: alertsEnabled,
          onChange: () => setAlertsEnabled(!alertsEnabled),
        },
        {
          icon: Bell,
          label: "Email Notifications",
          toggle: true,
          value: emailNotifications,
          onChange: () => setEmailNotifications(!emailNotifications),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Palette,
          label: "Dark Mode",
          toggle: true,
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        },
        { icon: Globe, label: "Currency", value: "HKD", href: "#" },
      ],
    },
  ];

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Header */}
      <div className='px-4 pt-4 pb-2'>
        <h1 className='text-xl font-black text-[#f5f5dc]'>Settings</h1>
        <p className='text-xs text-[#f0ede6]/40'>
          Manage your account and preferences
        </p>
      </div>

      {/* User card */}
      {isAuthenticated && user && (
        <div className='px-4 py-3'>
          <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-full bg-[rgba(255,45,45,0.1)] flex items-center justify-center text-xl'>
                {user.display_name?.slice(0, 1) || "👤"}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-bold text-[#f5f5dc] truncate'>
                  {user.display_name}
                </p>
                <p className='text-[10px] text-[#f0ede6]/40 font-mono'>
                  @{user.username} · Lvl {user.level}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm font-black text-emerald-400'>
                  {user.nexus_tokens}
                </p>
                <p className='text-[9px] text-[#f0ede6]/30 font-mono'>$NEXUS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings groups */}
      <div className='px-4 py-2 flex flex-col gap-4 pb-8'>
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 px-1'>
              {group.title}
            </p>
            <div className='glass rounded-2xl border border-[rgba(245,245,220,0.06)] overflow-hidden'>
              {group.items.map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      i < group.items.length - 1
                        ? "border-b border-[rgba(245,245,220,0.04)]"
                        : ""
                    }`}
                  >
                    <Icon size={16} className='text-[#ff2d2d] shrink-0' />
                    <span className='text-sm text-[#f5d5dc] flex-1'>
                      {item.label}
                    </span>

                    {"toggle" in item && item.toggle ? (
                      <button
                        onClick={item.onChange}
                        className={`w-10 h-5.5 rounded-full transition-all duration-200 relative ${
                          item.value
                            ? "bg-[#ff2d2d]"
                            : "bg-[rgba(245,245,220,0.15)]"
                        }`}
                        style={{ height: 22, width: 40 }}
                      >
                        <motion.div
                          animate={{ x: item.value ? 20 : 2 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className='absolute top-0.5 w-5 h-5 rounded-full bg-white'
                          style={{ width: 20, height: 20 }}
                        />
                      </button>
                    ) : item.href ? (
                      <div className='flex items-center gap-2'>
                        {item.value && (
                          <span className='text-xs text-[#f0ede6]/40'>
                            {item.value}
                          </span>
                        )}
                        <ChevronRight size={14} className='text-[#f0ede6]/20' />
                      </div>
                    ) : (
                      <span className='text-xs text-[#f0ede6]/40'>
                        {item.value}
                      </span>
                    )}
                  </div>
                );

                if ("toggle" in item && item.toggle) {
                  return <div key={item.label}>{content}</div>;
                }

                return (
                  <Link key={item.label} href={item.href || "#"}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign out */}
        {isAuthenticated && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={signOut}
            className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-red-400'
            style={{
              background: "rgba(255,45,45,0.08)",
              border: "1px solid rgba(255,45,45,0.15)",
            }}
          >
            <LogOut size={14} /> Sign Out
          </motion.button>
        )}

        {/* Version */}
        <p className='text-[9px] text-[#f0ede6]/15 text-center font-mono pt-2'>
          FLSHBK v0.1.0 · Collector's Trading Portal
        </p>
      </div>
    </main>
  );
}
