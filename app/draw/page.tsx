"use client";

import { useState, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { ChevronLeft, Ticket, Star, Trophy, Zap, Gift } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const draws = [
  {
    id: "d1",
    name: "Be@rbrick 1000% Medicom",
    type: "physical",
    rarity: "chase",
    pool: "HKD 42,000",
    entries: 68,
    maxEntries: 100,
    timeLeft: "6d 14h",
    emoji: "🐻",
    reward: "Physical Golden Ticket",
  },
  {
    id: "d2",
    name: "Retiring LEGO #21335",
    type: "physical",
    rarity: "rare",
    pool: "HKD 12,500",
    entries: 45,
    maxEntries: 60,
    timeLeft: "2d 4h",
    emoji: "🧱",
    reward: "Physical Golden Ticket",
  },
  {
    id: "d3",
    name: "2× $NEXUS Token Multiplier",
    type: "digital",
    rarity: "rare",
    pool: "$NEXUS 5,000",
    entries: 80,
    maxEntries: 100,
    timeLeft: "12h 30m",
    emoji: "⚡",
    reward: "Digital Token × 2",
  },
];

type RewardType = "token" | "golden-ticket" | null;

export default function LuckyDrawPage() {
  const [selectedDraw, setSelectedDraw] = useState<(typeof draws)[0] | null>(
    null,
  );
  const [phase, setPhase] = useState<"idle" | "shaking" | "burst" | "reveal">(
    "idle",
  );
  const [reward, setReward] = useState<RewardType>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, []);

  function fireConfetti() {
    const colors = ["#ff2d2d", "#f5f5dc", "#ff6b6b", "#fffde7"];
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors,
      startVelocity: 40,
      gravity: 0.8,
      ticks: 200,
    });
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { y: 0.55, x: 0.3 },
      colors,
      startVelocity: 35,
      angle: 60,
    });
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { y: 0.55, x: 0.7 },
      colors,
      startVelocity: 35,
      angle: 120,
    });
  }

  function openLootBox(draw: (typeof draws)[0]) {
    setSelectedDraw(draw);
    setPhase("shaking");
    triggerHaptic();

    setTimeout(() => {
      setPhase("burst");
      triggerHaptic();
    }, 1800);

    setTimeout(() => {
      setPhase("reveal");
      setReward(draw.type === "digital" ? "token" : "golden-ticket");
      fireConfetti();
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }, 2600);
  }

  function resetModal() {
    setPhase("idle");
    setSelectedDraw(null);
    setReward(null);
  }

  return (
    <main className='flex flex-col min-h-screen' ref={containerRef}>
      {/* Header */}
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
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider'>
              LUCKY DRAW
            </h1>
            <p className='text-[9px] font-mono text-[#ff2d2d]'>
              POWERED BY $NEXUS TOKENS
            </p>
          </div>
          <div className='flex items-center gap-1 px-2 py-1 rounded-xl glass'>
            <Zap size={12} className='text-[#ff2d2d]' />
            <span className='text-xs font-bold text-[#f5f5dc]'>240</span>
          </div>
        </div>
      </div>

      <div className='px-4 py-4 flex flex-col gap-4'>
        {/* Collector Level bar */}
        <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <Trophy size={16} className='text-[#ff2d2d]' />
              <span className='text-sm font-bold text-[#f5f5dc]'>
                Collector Level 7
              </span>
            </div>
            <span className='text-xs text-[#f0ede6]/40 font-mono'>
              2,840 / 5,000 XP
            </span>
          </div>
          <div className='w-full h-2 rounded-full bg-[rgba(245,245,220,0.06)]'>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "56.8%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className='h-full rounded-full'
              style={{ background: "linear-gradient(90deg, #ff2d2d, #ff6b6b)" }}
            />
          </div>
          <div className='flex justify-between mt-1.5'>
            <span className='text-[9px] text-[#f0ede6]/30 font-mono'>
              LVL 7 — Phantom Dealer
            </span>
            <span className='text-[9px] text-[#ff2d2d] font-mono'>
              +3 draw entries at LVL 8
            </span>
          </div>
        </div>

        {/* Entries summary */}
        <div className='grid grid-cols-3 gap-2'>
          {[
            { label: "Your Entries", value: "12", icon: Ticket },
            { label: "$NEXUS", value: "240", icon: Zap },
            { label: "Win Rate", value: "8.3%", icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className='glass rounded-xl p-3 border border-[rgba(245,245,220,0.06)] flex flex-col items-center gap-1'
            >
              <Icon size={14} className='text-[#ff2d2d]' />
              <span className='text-lg font-black text-[#f5f5dc]'>{value}</span>
              <span className='text-[9px] text-[#f0ede6]/40 text-center uppercase tracking-wider'>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Draw cards */}
        <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30'>
          Active Draws
        </p>
        {draws.map((draw, i) => (
          <motion.div
            key={draw.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)] relative overflow-hidden'
            style={
              draw.rarity === "chase"
                ? {
                    borderColor: "rgba(255,45,45,0.3)",
                    boxShadow: "0 0 20px rgba(255,45,45,0.08)",
                  }
                : {}
            }
          >
            {draw.rarity === "chase" && (
              <div className='absolute inset-0 holo-shimmer opacity-10 pointer-events-none' />
            )}
            <div className='relative flex items-start gap-3'>
              <div
                className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0'
                style={{ background: "rgba(255,45,45,0.1)" }}
              >
                {draw.emoji}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <p className='text-sm font-bold text-[#f5f5dc] leading-tight'>
                    {draw.name}
                  </p>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      draw.type === "physical"
                        ? "bg-[rgba(245,245,220,0.08)] text-[#f5f5dc] border border-[rgba(245,245,220,0.15)]"
                        : "bg-[rgba(255,45,45,0.12)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                    }`}
                  >
                    {draw.type === "physical" ? "🏆 Physical" : "⚡ Digital"}
                  </span>
                </div>
                <p className='text-xs text-[#f0ede6]/40 mt-0.5'>
                  Pool: {draw.pool} · {draw.timeLeft} left
                </p>

                {/* Progress bar */}
                <div className='mt-2 w-full h-1.5 rounded-full bg-[rgba(245,245,220,0.06)]'>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${draw.entries}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className='h-full rounded-full'
                    style={{
                      background:
                        draw.entries > 75
                          ? "linear-gradient(90deg, #ff2d2d, #ff6b6b)"
                          : "linear-gradient(90deg, #4ade80, #22d3ee)",
                    }}
                  />
                </div>
                <p className='text-[9px] text-[#f0ede6]/30 mt-1 font-mono'>
                  {draw.entries}/{draw.maxEntries} entries
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openLootBox(draw)}
              className='mt-3 w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                boxShadow: "0 0 16px rgba(255,45,45,0.35)",
              }}
            >
              <Gift size={15} /> Open Loot Box — 20 $NEXUS
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Loot Box Modal */}
      <AnimatePresence>
        {selectedDraw && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={phase === "reveal" ? resetModal : undefined}
              className='fixed inset-0 z-50 bg-black/80'
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className='fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl glass-strong overflow-hidden'
              style={{ border: "1px solid rgba(255,45,45,0.3)" }}
            >
              <div className='p-6 flex flex-col items-center text-center'>
                {/* Box visual */}
                <motion.div
                  animate={
                    phase === "shaking"
                      ? {
                          rotate: [0, -8, 8, -8, 8, -6, 6, -4, 4, 0],
                          y: [0, -4, 4, -4, 4, 0],
                        }
                      : phase === "burst"
                        ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                        : {}
                  }
                  transition={
                    phase === "shaking"
                      ? { duration: 1.6, ease: "easeInOut" }
                      : phase === "burst"
                        ? { duration: 0.5, times: [0, 0.6, 1] }
                        : {}
                  }
                  className='text-8xl mb-4 select-none'
                >
                  📦
                </motion.div>

                {phase === "idle" && (
                  <>
                    <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/40 mb-1'>
                      Opening
                    </p>
                    <p className='text-lg font-black text-[#f5f5dc]'>
                      {selectedDraw.name}
                    </p>
                  </>
                )}

                {phase === "shaking" && (
                  <motion.p
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className='text-sm font-mono text-[#ff2d2d] uppercase tracking-widest'
                  >
                    Opening...
                  </motion.p>
                )}

                {phase === "burst" && (
                  <motion.p
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='text-2xl font-black neon-red'
                  >
                    BURST!
                  </motion.p>
                )}

                {phase === "reveal" && reward && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col items-center gap-4'
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                      }}
                      className='text-7xl'
                    >
                      {reward === "token" ? "⚡" : "🎟️"}
                    </motion.div>
                    <div>
                      <p className='text-[10px] font-mono uppercase tracking-widest text-[#ff2d2d] mb-1'>
                        {reward === "token"
                          ? "Digital Reward"
                          : "Golden Ticket"}
                      </p>
                      <p className='text-xl font-black text-[#f5f5dc]'>
                        {reward === "token"
                          ? "2× $NEXUS Multiplier"
                          : selectedDraw.reward}
                      </p>
                      <p className='text-xs text-[#f0ede6]/50 mt-1'>
                        {reward === "token"
                          ? "Applied to your next 5 verified trades"
                          : "Claim at Sino Centre or In's Point partner shop"}
                      </p>
                    </div>

                    {/* Chain reaction flash */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.8, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className='fixed inset-0 pointer-events-none z-50'
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,45,45,0.3) 0%, transparent 70%)",
                      }}
                    />

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={resetModal}
                      className='px-8 py-3 rounded-full text-sm font-black text-white mt-2'
                      style={{
                        background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                      }}
                    >
                      Claim Reward ✓
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
