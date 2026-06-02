"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Shield, Star, TrendingUp } from "lucide-react";

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "secret"
  | "chase"
  | "ultra";

export interface CollectibleItem {
  id: string;
  name: string;
  series: string;
  rarity: Rarity;
  image?: string;
  price: string;
  priceChange?: number;
  verified?: boolean;
  grade?: string;
  condition?: string;
  status?: "opened" | "unopened";
  category: "blindbox" | "lego" | "card";
}

const rarityConfig: Record<
  Rarity,
  { label: string; color: string; glow: string }
> = {
  common: { label: "Common", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  uncommon: {
    label: "Uncommon",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.25)",
  },
  rare: { label: "Rare", color: "#60a5fa", glow: "rgba(96,165,250,0.3)" },
  secret: { label: "Secret", color: "#c084fc", glow: "rgba(192,132,252,0.35)" },
  chase: { label: "Chase ✦", color: "#ff2d2d", glow: "rgba(255,45,45,0.4)" },
  ultra: { label: "Ultra ✦✦", color: "#fbbf24", glow: "rgba(251,191,36,0.45)" },
};

interface Props {
  item: CollectibleItem;
  onSelect?: (item: CollectibleItem) => void;
  compact?: boolean;
}

export default function CollectibleCard({
  item,
  onSelect,
  compact = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rarity = rarityConfig[item.rarity];
  const isHolo =
    item.rarity === "secret" ||
    item.rarity === "chase" ||
    item.rarity === "ultra";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["-20%", "120%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["-20%", "120%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleTouch(e: React.TouchEvent<HTMLDivElement>) {
    if (!cardRef.current || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.touches[0].clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.touches[0].clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div className='card-3d-wrapper'>
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          border: `1px solid ${rarity.glow}`,
          boxShadow: `0 0 20px ${rarity.glow}`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouch}
        onTouchEnd={handleMouseLeave}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSelect?.(item)}
        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-shadow duration-300 ${
          compact ? "w-32" : "w-full"
        }`}
      >
        <div
          className={`relative overflow-hidden ${compact ? "h-36" : "h-48"}`}
          style={{ background: "linear-gradient(135deg, #1a1a22, #0d0d0f)" }}
        >
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-5xl select-none'>
              {item.category === "blindbox"
                ? "🎭"
                : item.category === "lego"
                  ? "🧱"
                  : "🃏"}
            </span>
          </div>

          {isHolo && (
            <div className='holo-shimmer absolute inset-0 mix-blend-screen opacity-60 pointer-events-none' />
          )}

          {isHolo && (
            <motion.div
              className='absolute w-24 h-24 rounded-full pointer-events-none'
              style={{
                x: glareX,
                y: glareY,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                translateX: "-50%",
                translateY: "-50%",
              }}
            />
          )}

          <div
            className='absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider'
            style={{
              background: rarity.glow,
              color: rarity.color,
              border: `1px solid ${rarity.color}`,
            }}
          >
            {rarity.label}
          </div>

          {item.verified && (
            <div className='absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[rgba(0,200,100,0.15)] border border-[rgba(0,200,100,0.4)]'>
              <Shield size={10} className='text-emerald-400' />
              <span className='text-[9px] text-emerald-400 font-bold'>
                VERIFIED
              </span>
            </div>
          )}

          {item.grade && (
            <div className='absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[rgba(255,45,45,0.2)] border border-[#ff2d2d]/40'>
              <span className='text-[10px] text-[#ff2d2d] font-mono font-bold'>
                PSA {item.grade}
              </span>
            </div>
          )}
        </div>

        <div className='p-3 bg-[#141418]'>
          {!compact && (
            <p className='text-[10px] text-[#f0ede6]/40 uppercase tracking-widest font-mono mb-0.5'>
              {item.series}
            </p>
          )}
          <p
            className={`font-semibold text-[#f5f5dc] truncate ${compact ? "text-xs" : "text-sm"}`}
          >
            {item.name}
          </p>

          {!compact && (
            <div className='flex items-center justify-between mt-2'>
              <div className='flex flex-col'>
                <span className='text-xs text-[#f0ede6]/50'>Floor</span>
                <span className='text-sm font-bold text-[#f5f5dc]'>
                  {item.price}
                </span>
              </div>
              {item.priceChange !== undefined && (
                <div
                  className={`flex items-center gap-1 text-xs font-mono ${item.priceChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  <TrendingUp size={12} />
                  {item.priceChange >= 0 ? "+" : ""}
                  {item.priceChange}%
                </div>
              )}
            </div>
          )}

          {!compact && (item.condition || item.status) && (
            <div className='flex gap-1.5 mt-2 flex-wrap'>
              {item.condition && (
                <span className='text-[9px] px-1.5 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)]'>
                  {item.condition}
                </span>
              )}
              {item.status && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    item.status === "unopened"
                      ? "bg-[rgba(96,165,250,0.1)] text-blue-300 border-blue-400/30"
                      : "bg-[rgba(148,163,184,0.08)] text-slate-400 border-slate-500/20"
                  }`}
                >
                  {item.status}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
