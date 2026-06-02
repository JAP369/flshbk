"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";

export type ProductRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "secret"
  | "chase"
  | "ultra";
export type ProductCategory =
  | "pokemon"
  | "lego"
  | "hottoys"
  | "popmart"
  | "hotwheels";

export interface ProductItem {
  id: string;
  name: string;
  image?: string;
  price: string;
  originalPrice?: string;
  priceChange?: number;
  rarity?: ProductRarity;
  category: ProductCategory;
  series?: string;
  condition?: string;
  verified?: boolean;
  status?: "opened" | "unopened";
  grade?: string;
  source?: string;
  sourceUrl?: string;
  isDeal?: boolean;
  dealScore?: number;
}

const categoryColors: Record<ProductCategory, string> = {
  pokemon: "#fbbf24",
  lego: "#ef4444",
  hottoys: "#8b5cf6",
  popmart: "#ec4899",
  hotwheels: "#f97316",
};

const categoryEmojis: Record<ProductCategory, string> = {
  pokemon: "🃏",
  lego: "🧱",
  hottoys: "🦸",
  popmart: "🎭",
  hotwheels: "🏎️",
};

interface Props {
  item: ProductItem;
  onSelect?: (item: ProductItem) => void;
  onFavorite?: (id: string) => void;
  compact?: boolean;
  showFavorite?: boolean;
  showSource?: boolean;
}

export default function ProductCard({
  item,
  onSelect,
  onFavorite,
  compact = false,
  showFavorite = true,
  showSource = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const categoryColor = categoryColors[item.category];
  const categoryEmoji = categoryEmojis[item.category];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

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

  const isHolo =
    item.rarity === "secret" ||
    item.rarity === "chase" ||
    item.rarity === "ultra";

  return (
    <div className='card-3d-wrapper'>
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          border: `1px solid ${categoryColor}30`,
          boxShadow: `0 0 15px ${categoryColor}15`,
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
        {/* Image area */}
        <div
          className={`relative overflow-hidden ${compact ? "h-32" : "h-44"}`}
          style={{ background: "linear-gradient(135deg, #1a1a22, #0d0d0f)" }}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className='w-full h-full object-cover'
              loading='lazy'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-4xl select-none'>{categoryEmoji}</span>
            </div>
          )}

          {isHolo && (
            <div className='holo-shimmer absolute inset-0 mix-blend-screen opacity-50 pointer-events-none' />
          )}

          {/* Category badge */}
          <div
            className='absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider'
            style={{
              background: `${categoryColor}25`,
              color: categoryColor,
              border: `1px solid ${categoryColor}50`,
            }}
          >
            {item.category === "pokemon"
              ? "Pokemon"
              : item.category === "lego"
                ? "LEGO"
                : item.category === "hottoys"
                  ? "Hot Toys"
                  : item.category === "popmart"
                    ? "Pop Mart"
                    : "Hot Wheels"}
          </div>

          {/* Deal badge */}
          {item.isDeal && item.dealScore && item.dealScore >= 70 && (
            <div className='absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'>
              💎 Deal
            </div>
          )}

          {/* Favorite button */}
          {showFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(item.id);
              }}
              className='absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors'
            >
              <Heart size={12} className='text-white/70' />
            </button>
          )}

          {/* Verified badge */}
          {item.verified && (
            <div className='absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30'>
              <span className='text-[7px] text-emerald-400 font-bold'>
                ✓ VERIFIED
              </span>
            </div>
          )}
        </div>

        {/* Info area */}
        <div className='p-3 bg-[#141418]'>
          {!compact && item.series && (
            <p className='text-[9px] text-[#f0ede6]/35 uppercase tracking-widest font-mono mb-0.5 truncate'>
              {item.series}
            </p>
          )}

          <p
            className={`font-semibold text-[#f5f5dc] truncate ${compact ? "text-[10px]" : "text-sm"}`}
          >
            {item.name}
          </p>

          {/* Price row */}
          <div className='flex items-center justify-between mt-1.5'>
            <div className='flex items-center gap-1.5'>
              <span
                className={`font-black text-[#f5f5dc] ${compact ? "text-xs" : "text-sm"}`}
              >
                {item.price}
              </span>
              {item.originalPrice && (
                <span className='text-[9px] text-[#f0ede6]/25 line-through'>
                  {item.originalPrice}
                </span>
              )}
            </div>

            {item.priceChange !== undefined && (
              <div
                className={`flex items-center gap-0.5 text-[10px] font-mono ${
                  item.priceChange > 0
                    ? "text-emerald-400"
                    : item.priceChange < 0
                      ? "text-red-400"
                      : "text-[#f0ede6]/30"
                }`}
              >
                {item.priceChange > 0 ? (
                  <TrendingUp size={10} />
                ) : item.priceChange < 0 ? (
                  <TrendingDown size={10} />
                ) : (
                  <Minus size={10} />
                )}
                {item.priceChange > 0 ? "+" : ""}
                {item.priceChange}%
              </div>
            )}
          </div>

          {/* Source link */}
          {showSource && item.source && (
            <div className='flex items-center gap-1 mt-1.5'>
              <ExternalLink size={8} className='text-[#f0ede6]/20' />
              <span className='text-[8px] text-[#f0ede6]/25 font-mono truncate'>
                {item.source}
              </span>
            </div>
          )}

          {/* Condition / Status pills */}
          {!compact && (item.condition || item.status) && (
            <div className='flex gap-1 mt-2 flex-wrap'>
              {item.condition && (
                <span className='text-[8px] px-1.5 py-0.5 rounded bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/40 border border-[rgba(245,245,220,0.08)]'>
                  {item.condition}
                </span>
              )}
              {item.status && (
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded border ${
                    item.status === "unopened"
                      ? "bg-blue-500/10 text-blue-300 border-blue-400/20"
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
