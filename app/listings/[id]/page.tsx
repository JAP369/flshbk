"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Share2,
  ExternalLink,
  MapPin,
  Clock,
  Shield,
  Star,
  MessageCircle,
  ArrowLeftRight,
  DollarSign,
  Send,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Listing, ItemCategory, Rarity } from "@/lib/types/database";

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  pokemon_card: "🃏",
  pop_mart: "🎭",
  lego: "🧱",
  hot_toys: "🦸",
  hot_wheels: "🏎️",
  funko: "🎃",
  other: "📦",
};

const RARITY_CONFIG: Record<Rarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#94a3b8" },
  uncommon: { label: "Uncommon", color: "#4ade80" },
  rare: { label: "Rare", color: "#60a5fa" },
  secret: { label: "Secret", color: "#c084fc" },
  chase: { label: "Chase ✦", color: "#ff2d2d" },
  ultra: { label: "Ultra", color: "#fbbf24" },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<{
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    level: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerType, setOfferType] = useState<"cash" | "swap" | "mixed">("cash");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const listingId = params.id as string;
  const isOwner = user?.id === listing?.seller_id;

  const fetchListing = useCallback(async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listings")
        .select(
          "*, profiles:seller_id(username, display_name, avatar_url, is_verified, level)",
        )
        .eq("id", listingId)
        .single();
      if (error) throw error;
      if (data) {
        setListing(data as Listing);
        setSeller(data.profiles as typeof seller);
        // Increment view
        await supabase
          .from("listings")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", listingId);
      }
    } catch {
      // Supabase not connected
    }
    setLoading(false);
  }, [listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  async function handleMakeOffer() {
    if (!user || !listing) return;
    setOfferSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Create a trade offer
      await supabase.from("trades").insert({
        initiator_id: user.id,
        receiver_id: listing.seller_id,
        receiver_listing_id: listing.id,
        initiator_cash_topup_hkd:
          offerType === "cash" || offerType === "mixed"
            ? parseInt(offerPrice) || 0
            : 0,
        status: "pending",
        notes: offerMessage || null,
      });

      setOfferSuccess(true);
      setTimeout(() => {
        setShowOfferModal(false);
        setOfferSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
    setOfferSubmitting(false);
  }

  if (loading) {
    return (
      <main className='flex flex-col min-h-screen'>
        <div className='sticky top-0 z-40 glass-strong'>
          <div className='flex items-center px-4 py-3'>
            <Link href='/'>
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </Link>
          </div>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <Loader2 size={24} className='text-[#ff2d2d] animate-spin' />
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className='flex flex-col min-h-screen'>
        <div className='sticky top-0 z-40 glass-strong'>
          <div className='flex items-center px-4 py-3'>
            <Link href='/'>
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </Link>
          </div>
        </div>
        <div className='flex-1 flex flex-col items-center justify-center gap-4 px-6'>
          <p className='text-5xl'>🔍</p>
          <p className='text-sm text-[#f5f5dc] font-bold'>Listing not found</p>
          <p className='text-xs text-[#f0ede6]/40 text-center'>
            This listing may have been removed or the link is incorrect.
          </p>
          <Link href='/'>
            <p className='text-xs text-[#ff2d2d] font-mono'>← Back to home</p>
          </Link>
        </div>
      </main>
    );
  }

  const rarity = RARITY_CONFIG[listing.rarity];

  return (
    <main className='flex flex-col min-h-screen'>
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
          <div className='flex items-center gap-2'>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className='p-1.5 rounded-xl glass'
            >
              <Share2 size={16} className='text-[#f5f5dc]' />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className='p-1.5 rounded-xl glass'
            >
              <Heart
                size={16}
                className={
                  liked ? "text-[#ff2d2d] fill-[#ff2d2d]" : "text-[#f5f5dc]"
                }
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Image gallery */}
      {listing.images.length > 0 && (
        <div className='relative'>
          <div className='aspect-square bg-[#141418] flex items-center justify-center overflow-hidden'>
            <img
              src={listing.images[activeImage]}
              alt={listing.title}
              className='w-full h-full object-cover'
            />
          </div>
          {listing.images.length > 1 && (
            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {listing.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? "bg-[#ff2d2d] w-4" : "bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {listing.images.length === 0 && (
        <div className='aspect-square bg-[#141418] flex items-center justify-center'>
          <span className='text-8xl'>{CATEGORY_ICONS[listing.category]}</span>
        </div>
      )}

      {/* Content */}
      <div className='px-4 py-4 flex flex-col gap-4'>
        {/* Title & price */}
        <div>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <span
                  className='text-[9px] font-bold px-2 py-0.5 rounded-full'
                  style={{
                    background: `${rarity.color}20`,
                    color: rarity.color,
                    border: `1px solid ${rarity.color}40`,
                  }}
                >
                  {rarity.label}
                </span>
                <span className='text-[9px] text-[#f0ede6]/40 font-mono'>
                  {listing.condition}
                </span>
              </div>
              <h1 className='text-xl font-black text-[#f5f5dc] leading-tight'>
                {listing.title}
              </h1>
            </div>
            {listing.price_hkd && (
              <div className='text-right shrink-0'>
                <p className='text-2xl font-black text-[#f5f5dc]'>
                  HKD {listing.price_hkd.toLocaleString()}
                </p>
                {listing.listing_type === "sell" && (
                  <p className='text-[9px] text-[#f0ede6]/30 font-mono'>
                    +2.5% fee
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className='flex items-center gap-3 mt-2 flex-wrap'>
            <span className='text-[10px] text-[#f0ede6]/40 flex items-center gap-1'>
              <Clock size={10} /> {formatTimeAgo(listing.created_at)}
            </span>
            <span className='text-[10px] text-[#f0ede6]/40 flex items-center gap-1'>
              👁 {listing.views_count} views
            </span>
            <span className='text-[10px] text-[#f0ede6]/40 flex items-center gap-1'>
              ❤️ {listing.likes_count} likes
            </span>
            {listing.location && (
              <span className='text-[10px] text-[#f0ede6]/40 flex items-center gap-1'>
                <MapPin size={10} /> {listing.location}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'>
            <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
              Description
            </p>
            <p className='text-sm text-[#f0ede6]/70 leading-relaxed whitespace-pre-wrap'>
              {listing.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {listing.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className='text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,245,220,0.06)] text-[#f0ede6]/50 border border-[rgba(245,245,220,0.08)]'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Swap preferences */}
        {listing.listing_type === "swap" &&
          listing.swap_preferences &&
          listing.swap_preferences.length > 0 && (
            <div className='glass rounded-2xl p-4 border border-[rgba(96,165,250,0.15)]'>
              <p className='text-xs font-mono uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1'>
                <ArrowLeftRight size={10} /> Looking For
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {listing.swap_preferences.map((pref) => (
                  <span
                    key={pref}
                    className='text-xs px-2.5 py-1 rounded-lg bg-[rgba(96,165,250,0.1)] text-blue-300 border border-blue-400/20'
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Seller card */}
        {seller && (
          <Link href={`/profile/${seller.username}`}>
            <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)] flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-[rgba(255,45,45,0.1)] flex items-center justify-center text-lg'>
                {seller.avatar_url || "👤"}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-sm font-bold text-[#f5f5dc] truncate'>
                    {seller.display_name}
                  </p>
                  {seller.is_verified && (
                    <Shield size={12} className='text-[#ff2d2d] shrink-0' />
                  )}
                </div>
                <p className='text-[10px] text-[#f0ede6]/40 font-mono'>
                  @{seller.username} · Lvl {seller.level}
                </p>
              </div>
              <ChevronLeft size={16} className='text-[#f0ede6]/20 rotate-180' />
            </div>
          </Link>
        )}
      </div>

      {/* Bottom action bar */}
      {!isOwner && (
        <div className='sticky bottom-16 glass-strong border-t border-[rgba(245,245,220,0.06)]'>
          <div className='flex items-center gap-2 px-4 py-3 max-w-lg mx-auto'>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOfferModal(true)}
              className='flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                boxShadow: "0 0 16px rgba(255,45,45,0.3)",
              }}
            >
              {listing.listing_type === "sell" ? (
                <>
                  <DollarSign size={14} /> Make Offer
                </>
              ) : listing.listing_type === "swap" ? (
                <>
                  <ArrowLeftRight size={14} /> Propose Swap
                </>
              ) : (
                <>
                  <MessageCircle size={14} /> I Have This
                </>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className='p-3 rounded-xl glass border border-[rgba(245,245,220,0.1)]'
            >
              <MessageCircle size={18} className='text-[#f5f5dc]' />
            </motion.button>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOfferModal(false)}
              className='fixed inset-0 z-50 bg-black/80'
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className='fixed inset-x-0 bottom-0 z-50 rounded-t-3xl glass-strong'
              style={{ border: "1px solid rgba(245,245,220,0.1)" }}
            >
              <div className='px-5 py-5 flex flex-col gap-4'>
                <div className='w-10 h-1 rounded-full bg-[rgba(245,245,220,0.2)] mx-auto' />
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-black text-[#f5f5dc]'>
                    {listing.listing_type === "sell"
                      ? "Make an Offer"
                      : listing.listing_type === "swap"
                        ? "Propose a Swap"
                        : "Message Seller"}
                  </h3>
                  <button onClick={() => setShowOfferModal(false)}>
                    <X size={18} className='text-[#f0ede6]/40' />
                  </button>
                </div>

                {offerSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='flex flex-col items-center gap-3 py-8'
                  >
                    <CheckCircle size={48} className='text-emerald-400' />
                    <p className='text-sm font-bold text-[#f5f5dc]'>
                      Offer Sent!
                    </p>
                    <p className='text-xs text-[#f0ede6]/40'>
                      The seller will be notified
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Offer type tabs */}
                    <div className='flex gap-2'>
                      {(["cash", "swap", "mixed"] as const).map((type) => (
                        <motion.button
                          key={type}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setOfferType(type)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                            offerType === type
                              ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.4)]"
                              : "glass border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/50"
                          }`}
                        >
                          {type === "cash"
                            ? "💰 Cash"
                            : type === "swap"
                              ? "🔄 Swap"
                              : "💰+🔄 Mixed"}
                        </motion.button>
                      ))}
                    </div>

                    {(offerType === "cash" || offerType === "mixed") && (
                      <div>
                        <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-1.5 block'>
                          Your Offer (HKD)
                        </label>
                        <div className='relative'>
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#f0ede6]/30'>
                            HKD
                          </span>
                          <input
                            type='number'
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            placeholder={listing.price_hkd?.toString() || "0"}
                            className='w-full pl-12 pr-4 py-2.5 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                          />
                        </div>
                        {listing.price_hkd && (
                          <p className='text-[9px] text-[#f0ede6]/20 font-mono mt-1'>
                            Listed at HKD {listing.price_hkd.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-1.5 block'>
                        Message (optional)
                      </label>
                      <textarea
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder='Add a message to your offer...'
                        rows={3}
                        className='w-full px-3 py-2.5 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors resize-none'
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleMakeOffer}
                      disabled={offerSubmitting}
                      className='w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50'
                      style={{
                        background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                        boxShadow: "0 0 16px rgba(255,45,45,0.3)",
                      }}
                    >
                      {offerSubmitting ? (
                        <>
                          <Loader2 size={14} className='animate-spin' />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Send Offer
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-HK");
}
