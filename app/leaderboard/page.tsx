"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Trophy,
  Star,
  Shield,
  Flame,
  Loader2,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { getLeaderboard } from "@/lib/api/gamification";
import { getLevelTitle } from "@/lib/api/gamification";
import type { Profile } from "@/lib/types/database";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(50);
      setLeaders(data);
    } catch {
      // Supabase not connected
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <main className='flex flex-col min-h-screen'>
      <div className='sticky top-0 z-40 glass-strong'>
        <div className='flex items-center justify-between px-4 py-3'>
          <Link href='/'>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className='p-1.5 rounded-xl glass'
            >
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </motion.button>
          </Link>
          <div className='flex flex-col items-center'>
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider flex items-center gap-1.5'>
              <Trophy size={14} className='text-[#ff2d2d]' /> LEADERBOARD
            </h1>
            <p className='text-[9px] font-mono text-[#ff2d2d]'>
              TOP COLLECTORS IN HK
            </p>
          </div>
          <div className='w-8' />
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div className='px-4 pt-4 pb-2'>
          <div className='flex items-end justify-center gap-2'>
            {/* 2nd place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='flex flex-col items-center'
            >
              <div className='w-14 h-14 rounded-full bg-[rgba(192,192,192,0.15)] border-2 border-silver-400 flex items-center justify-center text-2xl mb-1'>
                {leaders[1].avatar_url || "🥈"}
              </div>
              <p className='text-[10px] font-bold text-[#f5f5dc] truncate max-w-[80px]'>
                {leaders[1].display_name}
              </p>
              <p className='text-[9px] text-slate-400 font-mono'>
                {leaders[1].xp} XP
              </p>
              <div className='w-16 h-16 rounded-t-xl bg-gradient-to-t from-slate-600/30 to-slate-400/20 mt-1 flex items-center justify-center'>
                <span className='text-xl'>🥈</span>
              </div>
            </motion.div>

            {/* 1st place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center'
            >
              <Crown size={16} className='text-yellow-400 mb-0.5' />
              <div className='w-16 h-16 rounded-full bg-[rgba(255,215,0,0.15)] border-2 border-yellow-400 flex items-center justify-center text-3xl mb-1'>
                {leaders[0].avatar_url || "🥇"}
              </div>
              <p className='text-xs font-black text-[#f5f5dc] truncate max-w-[90px]'>
                {leaders[0].display_name}
              </p>
              <p className='text-[10px] text-yellow-400 font-mono font-bold'>
                {leaders[0].xp} XP
              </p>
              <div className='w-20 h-20 rounded-t-xl bg-gradient-to-t from-yellow-600/30 to-yellow-400/20 mt-1 flex items-center justify-center'>
                <span className='text-2xl'>🥇</span>
              </div>
            </motion.div>

            {/* 3rd place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center'
            >
              <div className='w-14 h-14 rounded-full bg-[rgba(205,127,50,0.15)] border-2 border-orange-400 flex items-center justify-center text-2xl mb-1'>
                {leaders[2].avatar_url || "🥉"}
              </div>
              <p className='text-[10px] font-bold text-[#f5f5dc] truncate max-w-[80px]'>
                {leaders[2].display_name}
              </p>
              <p className='text-[9px] text-orange-400 font-mono'>
                {leaders[2].xp} XP
              </p>
              <div className='w-16 h-12 rounded-t-xl bg-gradient-to-t from-orange-700/30 to-orange-500/20 mt-1 flex items-center justify-center'>
                <span className='text-xl'>🥉</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className='px-4 py-3 flex flex-col gap-2'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 size={24} className='text-[#ff2d2d] animate-spin' />
          </div>
        ) : leaders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 gap-3'>
            <Trophy size={32} className='text-[#f0ede6]/20' />
            <p className='text-sm text-[#f0ede6]/30'>No data yet</p>
            <p className='text-xs text-[#f0ede6]/20'>
              Connect Supabase to see the leaderboard
            </p>
          </div>
        ) : (
          leaders.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/profile/${profile.username}`}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl glass border transition-all hover:border-[rgba(255,45,45,0.2)] ${
                    i < 3
                      ? "border-[rgba(255,45,45,0.15)]"
                      : "border-[rgba(245,245,220,0.06)]"
                  }`}
                >
                  {/* Rank */}
                  <div className='w-8 text-center shrink-0'>
                    {i === 0 ? (
                      <span className='text-lg'>🥇</span>
                    ) : i === 1 ? (
                      <span className='text-lg'>🥈</span>
                    ) : i === 2 ? (
                      <span className='text-lg'>🥉</span>
                    ) : (
                      <span className='text-sm font-black text-[#f0ede6]/30'>
                        #{i + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className='w-10 h-10 rounded-full bg-[rgba(255,45,45,0.1)] flex items-center justify-center text-lg shrink-0'>
                    {profile.avatar_url || "👤"}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <p className='text-sm font-bold text-[#f5f5dc] truncate'>
                        {profile.display_name}
                      </p>
                      {profile.is_verified && (
                        <Shield size={10} className='text-[#ff2d2d] shrink-0' />
                      )}
                    </div>
                    <p className='text-[10px] text-[#f0ede6]/40 font-mono'>
                      @{profile.username} · {getLevelTitle(profile.level || 1)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className='text-right shrink-0'>
                    <p className='text-sm font-black text-[#f5f5dc]'>
                      {profile.xp}
                    </p>
                    <p className='text-[9px] text-[#f0ede6]/30 font-mono'>XP</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
