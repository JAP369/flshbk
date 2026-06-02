"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Camera,
  X,
  DollarSign,
  ArrowLeftRight,
  Tag,
  MapPin,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { ItemCategory, Rarity, ListingType } from "@/lib/types/database";

const CATEGORIES: { value: ItemCategory; label: string; icon: string }[] = [
  { value: "pokemon_card", label: "Pokémon Card", icon: "🃏" },
  { value: "pop_mart", label: "Pop Mart", icon: "🎭" },
  { value: "lego", label: "LEGO", icon: "🧱" },
  { value: "hot_toys", label: "Hot Toys", icon: "🦸" },
  { value: "hot_wheels", label: "Hot Wheels", icon: "🏎️" },
  { value: "funko", label: "Funko Pop", icon: "🎃" },
  { value: "other", label: "Other", icon: "📦" },
];

const RARITIES: { value: Rarity; label: string; color: string }[] = [
  { value: "common", label: "Common", color: "#94a3b8" },
  { value: "uncommon", label: "Uncommon", color: "#4ade80" },
  { value: "rare", label: "Rare", color: "#60a5fa" },
  { value: "secret", label: "Secret", color: "#c084fc" },
  { value: "chase", label: "Chase ✦", color: "#ff2d2d" },
  { value: "ultra", label: "Ultra", color: "#fbbf24" },
];

const CONDITIONS = [
  "Mint",
  "Near Mint",
  "Lightly Played",
  "Played",
  "Heavily Played",
  "Damaged",
  "Sealed",
  "PSA 10",
  "PSA 9",
  "PSA 8",
  "BGS 10",
  "BGS 9.5",
];

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [listingType, setListingType] = useState<ListingType>("sell");
  const [category, setCategory] = useState<ItemCategory>("pokemon_card");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [condition, setCondition] = useState("Near Mint");
  const [price, setPrice] = useState("");
  const [swapPreferences, setSwapPreferences] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const userId = user?.id ?? "";

  const addImageUrl = useCallback(() => {
    if (imageInput.trim() && imageUrls.length < 6) {
      setImageUrls((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  }, [imageInput, imageUrls.length]);

  const removeImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (!user) {
    router.replace("/login");
    return null;
  }

  async function handleSubmit() {
    if (!userId) return;
    setSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("listings").insert({
        seller_id: userId,
        title,
        description: description || null,
        category,
        rarity,
        condition,
        price_hkd: listingType === "sell" ? parseInt(price) || null : null,
        listing_type: listingType,
        status: "active",
        images: imageUrls,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        swap_preferences: swapPreferences
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        location: location || null,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push("/vault"), 2000);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  const canProceed =
    step === 1
      ? listingType && category
      : step === 2
        ? title.trim() && condition
        : step === 3
          ? listingType === "swap" || (price && parseInt(price) > 0)
          : true;

  if (success) {
    return (
      <main className='flex flex-col min-h-screen items-center justify-center px-6'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='flex flex-col items-center gap-4'
        >
          <CheckCircle size={60} className='text-emerald-400' />
          <h2 className='text-xl font-black text-[#f5f5dc]'>
            Listing Created!
          </h2>
          <p className='text-sm text-[#f0ede6]/50'>+25 XP earned</p>
          <p className='text-xs text-[#f0ede6]/30 font-mono'>
            Redirecting to your vault...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className='flex flex-col min-h-screen'>
      <div className='sticky top-0 z-40 glass-strong'>
        <div className='flex items-center justify-between px-4 py-3'>
          <Link href={step === 1 ? "/vault" : "#"}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => step > 1 && setStep(step - 1)}
              className='p-1.5 rounded-xl glass'
            >
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </motion.button>
          </Link>
          <div className='flex flex-col items-center'>
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider'>
              NEW LISTING
            </h1>
            <p className='text-[9px] font-mono text-[#ff2d2d]'>
              STEP {step} OF 4
            </p>
          </div>
          <div className='w-8' />
        </div>
        <div className='h-0.5 bg-[rgba(245,245,220,0.06)]'>
          <motion.div
            animate={{ width: `${(step / 4) * 100}%` }}
            className='h-full bg-[#ff2d2d]'
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className='px-4 py-5 flex flex-col gap-5'>
        <AnimatePresence mode='wait'>
          {step === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-5'
            >
              <div>
                <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-3'>
                  What do you want to do?
                </p>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { value: "sell" as const, label: "Sell", icon: DollarSign },
                    {
                      value: "swap" as const,
                      label: "Swap",
                      icon: ArrowLeftRight,
                    },
                    { value: "buy" as const, label: "Want", icon: Tag },
                  ].map(({ value, label, icon: Icon }) => (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setListingType(value)}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${listingType === value ? "bg-[rgba(255,45,45,0.15)] border border-[rgba(255,45,45,0.4)]" : "glass border border-[rgba(245,245,220,0.06)]"}`}
                    >
                      <Icon
                        size={20}
                        className={
                          listingType === value
                            ? "text-[#ff2d2d]"
                            : "text-[#f0ede6]/40"
                        }
                      />
                      <span
                        className={`text-xs font-bold ${listingType === value ? "text-[#ff2d2d]" : "text-[#f0ede6]/50"}`}
                      >
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-3'>
                  Category
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all ${category === cat.value ? "bg-[rgba(255,45,45,0.15)] border border-[rgba(255,45,45,0.4)]" : "glass border border-[rgba(245,245,220,0.06)]"}`}
                    >
                      <span className='text-xl'>{cat.icon}</span>
                      <span
                        className={`text-xs font-semibold ${category === cat.value ? "text-[#ff2d2d]" : "text-[#f0ede6]/60"}`}
                      >
                        {cat.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key='step2'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                  Title *
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g., Charizard VMAX Rainbow Rare'
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                />
              </div>
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe your item...'
                  rows={4}
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors resize-none'
                />
              </div>
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                  Rarity
                </label>
                <div className='flex flex-wrap gap-2'>
                  {RARITIES.map((r) => (
                    <motion.button
                      key={r.value}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setRarity(r.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${rarity === r.value ? "border" : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"}`}
                      style={
                        rarity === r.value
                          ? {
                              background: `${r.color}20`,
                              color: r.color,
                              borderColor: `${r.color}40`,
                            }
                          : {}
                      }
                    >
                      {r.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                  Condition *
                </label>
                <div className='flex flex-wrap gap-2'>
                  {CONDITIONS.map((c) => (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setCondition(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${condition === c ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.4)]" : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6]/50"}`}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              {listingType === "sell" && (
                <div>
                  <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                    Price (HKD) *
                  </label>
                  <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#f0ede6]/30'>
                      HKD
                    </span>
                    <input
                      type='number'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder='0'
                      min='0'
                      className='w-full pl-14 pr-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                    />
                  </div>
                  {price && parseInt(price) > 0 && (
                    <p className='text-[10px] text-[#f0ede6]/30 font-mono mt-1.5'>
                      Platform fee (2.5%): HKD{" "}
                      {Math.round(parseInt(price) * 0.025)} · You receive: HKD{" "}
                      {Math.round(parseInt(price) * 0.975)}
                    </p>
                  )}
                </div>
              )}
              {listingType === "swap" && (
                <div>
                  <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                    What are you looking for?
                  </label>
                  <textarea
                    value={swapPreferences}
                    onChange={(e) => setSwapPreferences(e.target.value)}
                    placeholder='e.g., Looking for Pikachu VMAX, Molly Zodiac, or LEGO Star Wars sets'
                    rows={3}
                    className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors resize-none'
                  />
                </div>
              )}
              {listingType === "buy" && (
                <div>
                  <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                    Max Budget (HKD)
                  </label>
                  <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#f0ede6]/30'>
                      HKD
                    </span>
                    <input
                      type='number'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder='0'
                      min='0'
                      className='w-full pl-14 pr-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                    />
                  </div>
                </div>
              )}
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block flex items-center gap-1'>
                  <MapPin size={10} /> Location
                </label>
                <input
                  type='text'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='e.g., Mong Kok, Kowloon'
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                />
              </div>
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block'>
                  Tags (comma separated)
                </label>
                <input
                  type='text'
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder='e.g., vintage, holographic, first edition'
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key='step4'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-5'
            >
              <div>
                <label className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2 block flex items-center gap-1'>
                  <Camera size={10} /> Images (up to 6)
                </label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='url'
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder='Paste image URL...'
                    className='flex-1 px-4 py-2.5 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addImageUrl())
                    }
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={addImageUrl}
                    className='px-4 py-2.5 rounded-xl bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] text-xs font-bold border border-[rgba(255,45,45,0.3)]'
                  >
                    Add
                  </motion.button>
                </div>
                {imageUrls.length > 0 && (
                  <div className='grid grid-cols-3 gap-2'>
                    {imageUrls.map((url, i) => (
                      <div
                        key={i}
                        className='relative aspect-square rounded-xl overflow-hidden bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.08)]'
                      >
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className='w-full h-full object-cover'
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center'
                        >
                          <X size={10} className='text-white' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageUrls.length === 0 && (
                  <div className='flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-[rgba(245,245,220,0.08)]'>
                    <Camera size={24} className='text-[#f0ede6]/20 mb-2' />
                    <p className='text-xs text-[#f0ede6]/30'>
                      Paste image URLs above
                    </p>
                    <p className='text-[10px] text-[#f0ede6]/20 mt-1'>
                      Tip: Upload to imgur.com and paste the link
                    </p>
                  </div>
                )}
              </div>
              <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.06)]'>
                <p className='text-[10px] font-mono uppercase tracking-widest text-[#ff2d2d] mb-3'>
                  Review Your Listing
                </p>
                <div className='flex flex-col gap-2'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-[#f0ede6]/40'>Type</span>
                    <span className='text-[#f5f5dc] font-semibold capitalize'>
                      {listingType}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-[#f0ede6]/40'>Category</span>
                    <span className='text-[#f5f5dc] font-semibold'>
                      {CATEGORIES.find((c) => c.value === category)?.label}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-[#f0ede6]/40'>Title</span>
                    <span className='text-[#f5f5dc] font-semibold truncate max-w-[60%]'>
                      {title}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-[#f0ede6]/40'>Condition</span>
                    <span className='text-[#f5f5dc] font-semibold'>
                      {condition}
                    </span>
                  </div>
                  {listingType === "sell" && price && (
                    <div className='flex justify-between text-xs'>
                      <span className='text-[#f0ede6]/40'>Price</span>
                      <span className='text-[#f5f5dc] font-semibold'>
                        HKD {parseInt(price).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {imageUrls.length > 0 && (
                    <div className='flex justify-between text-xs'>
                      <span className='text-[#f0ede6]/40'>Images</span>
                      <span className='text-[#f5f5dc] font-semibold'>
                        {imageUrls.length} photo
                        {imageUrls.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex gap-3 mt-2'>
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(step - 1)}
              className='flex-1 py-3.5 rounded-xl text-sm font-bold glass border border-[rgba(245,245,220,0.1)] text-[#f0ede6]/60'
            >
              Back
            </motion.button>
          )}
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => canProceed && setStep(step + 1)}
              disabled={!canProceed}
              className='flex-1 py-3.5 rounded-xl text-sm font-black text-white disabled:opacity-30'
              style={{
                background: canProceed
                  ? "linear-gradient(135deg, #ff2d2d, #cc0000)"
                  : "rgba(255,45,45,0.2)",
                boxShadow: canProceed ? "0 0 20px rgba(255,45,45,0.3)" : "none",
              }}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting}
              className='flex-1 py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                boxShadow: "0 0 20px rgba(255,45,45,0.3)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className='animate-spin' /> Creating...
                </>
              ) : (
                <>
                  <Camera size={14} /> Publish Listing
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </main>
  );
}
