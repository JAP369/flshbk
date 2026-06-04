"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Shield, Star, ExternalLink, Store } from "lucide-react";

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
  source?: string;
  dealScore?: number;
  discount?: number;
  sourceUrl?: string;
  sellerName?: string;
  sellerRating?: number | null;
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
  chase: { label: "Chase •", color: "#ff2d2d", glow: "rgba(255,45,45,0.4)" },
  ultra: { label: "Ultra ••", color: "#fbbf24", glow: "rgba(251,191,36,0.45)" },
};

const PLACEHOLDER_IMAGES: Record<"blindbox" | "lego" | "card", string> = {
  blindbox:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a22' width='400' height='400'/%3E%3Ctext x='50%' y='50%' font-size='80' fill='%23ff2d2d' text-anchor='middle' dy='.3em' font-family='system-ui'%3E🎭%3C/text%3E%3C/svg%3E",
  lego: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a22' width='400' height='400'/%3E%3Ctext x='50%' y='50%' font-size='80' fill='%2360a5fa' text-anchor='middle' dy='.3em' font-family='system-ui'%3E🧱%3C/text%3E%3C/svg%3E",
  card: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a22' width='400' height='400'/%3E%3Ctext x='50%' y='50%' font-size='80' fill='%23fbbf24' text-anchor='middle' dy='.3em' font-family='system-ui'%3E🃏%3C/text%3E%3C/svg%3E",
};

function SellerBadge({ sellerName, sellerRating }: { sellerName?: string; sellerRating?: number | null }) {
  if (!sellerName && (!sellerRating || sellerRating === null)) return null;

  const normalizedRating = typeof sellerRating === "number" ? Math.min(Math.max(sellerRating, 0), 5) : null;
  const ratingLabel = normalizedRating !== null ? `${normalizedRating.toFixed(1)}\u202f/\u202f5` : null;

  return (
    <div className='absolute top-2 right-2 flex flex-col items-end gap-1'>
      {sellerName && (
        <span className='text-[8px] px-1.5 py-0.5 rounded bg-[rgba(245,245,220,0.08)] text-[#f0ede6]/60 font-mono uppercase tracking-wider'>
          seller
        </span>
      )}
    </div>
  );
}

function SourceLinkBadge({
  source,
  sourceUrl,
}: {
  source?: string;
  sourceUrl?: string;
}) {
  if (!source) return null;

  if (!sourceUrl) {
    return (
      <div className='absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[rgba(100,150,255,0.15)] border border-[rgba(100,150,255,0.3)]'>
        <div className='flex items-center gap-1'>
          <Store size={10} />
          <span className='text-[8px] text-blue-300 font-mono uppercase'>{source}</span>
        </div>
      </div>
    );
  }

  return (
    <a
      href={sourceUrl}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(e) => e.stopPropagation()}
      className='absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[rgba(100,150,255,0.15)] border border-[rgba(100,150,255,0.3)] transition-transform hover:scale-105'
    >
      <div className='flex items-center gap-1'>
        <ExternalLink size={10} />
        <span className='text-[8px] text-blue-300 font-mono uppercase'>{source}</span>
      </div>
    </a>
  );
}

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
        <Image
          src={item.image || PLACEHOLDER_IMAGES[item.category]}
          alt={item.name}
          fill
          className='object-cover w-full h-full'
          sizes={compact ? "128px" : "100%"}
          priority={false}
          onError={(event) => {
            const img = event.currentTarget ?? event.target;
            if (img instanceof HTMLImageElement) {
              img.src = PLACEHOLDER_IMAGES[item.category];
            }
          }}
        />

        <div className='absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent opacity-40' />

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

        {item.dealScore !== undefined && item.dealScore >= 75 && (
          <div className='absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[rgba(255,45,45,0.15)] border border-[rgba(255,45,45,0.4)]'>
            <Star size={10} className='text-red-400 fill-red-400' />
            <span className='text-[9px] text-red-400 font-bold'>
              HOT DEAL
            </span>
          </div>
        )}

        <SourceLinkBadge source={item.source} sourceUrl={item.sourceUrl} />

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
          <div className='flex items-center justify-between mt-2 gap-1'>
            <div className='flex flex-col flex-1'>
              <span className='text-xs text-[#f0ede6]/50'>Floor</span>
              <span className='text-sm font-bold text-[#f5f5dc]'>
                {item.price}
              </span>
            </div>
            {item.discount !== undefined && item.discount > 0 && (
              <div className='flex items-center gap-1 text-xs font-mono bg-[rgba(255,45,45,0.1)] px-2 py-1 rounded border border-[rgba(255,45,45,0.2)]'>
                <span className='text-red-400 font-bold'>
                  -{item.discount}%
                </span>
              </div>
            )}
          </div>
        )}

        {!compact && (item.condition || item.status) && (
          <div className='flex gap-1.5 mt-2 flex-wrap items-center'>
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
            {typeof item.sellerRating === "number" && item.sellerRating !== null && (
              <span className='text-[9px] px-1.5 py-0.5 rounded bg-[rgba(251,191,36,0.08)] text-[#fbbf24] border border-[#fbbf24]/20 flex items-center gap-1'>
                <Star size={10} className='fill-[#fbbf24] text-[#fbbf24]' />
                {item.sellerRating.toFixed(1)}
              </span>
            )}
            {item.sellerName && !item.source && (
              <span className='text-[9px] text-[#f0ede6]/40'>
                {item.sellerName}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  </div>
	);
}
