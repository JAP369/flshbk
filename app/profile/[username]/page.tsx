"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  Star,
  MapPin,
  Calendar,
  Users,
  Award,
  Package,
  MessageCircle,
  UserPlus,
  UserCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";
import {
  getLevelInfo,
  getLevelTitle,
  getUserAchievements,
} from "@/lib/api/gamification";
import type {
  Profile,
  Achievement,
  UserAchievement,
  Listing,
} from "@/lib/types/database";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [achievements, setAchievements] = useState<
    (UserAchievement & { achievements: Achievement })[]
  >([]);
  const [reviews, setReviews] = useState<
    {
      rating: number;
      comment: string | null;
      reviewer_name: string;
      created_at: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "collection" | "achievements" | "reviews"
  >("collection");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const username = params.username as string;
  const isOwnProfile = currentUser?.username === username;

  const fetchProfile = useCallback(async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      // Fetch active listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", profileData.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      setListings(listingsData as Listing[]);

      // Fetch achievements
      const achievementsData = await getUserAchievements(profileData.id);
      setAchievements(achievementsData);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(
          "rating, comment, created_at, profiles:reviewer_id(username, display_name)",
        )
        .eq("reviewee_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setReviews(
        (reviewsData || []).map((r) => ({
          rating: r.rating,
          comment: r.comment,
          reviewer_name: (r.profiles as any)?.display_name || "Anonymous",
          created_at: r.created_at,
        })),
      );

      // Fetch follower counts
      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileData.id);
      setFollowerCount(followers || 0);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileData.id);
      setFollowingCount(following || 0);

      // Check if current user is following
      if (currentUser) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", profileData.id)
          .single();
        setIsFollowing(!!followData);
      }
    } catch {
      // Supabase not connected
    }
    setLoading(false);
  }, [username, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function toggleFollow() {
    if (!currentUser || !profile) return;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
      } else {
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: profile.id,
        });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (err) {
      console.error(err);
    }
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

  if (!profile) {
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
          <p className='text-5xl'>👤</p>
          <p className='text-sm text-[#f5f5dc] font-bold'>User not found</p>
          <Link href='/'>
            <p className='text-xs text-[#ff2d2d] font-mono'>← Back to home</p>
          </Link>
        </div>
      </main>
    );
  }

  const levelInfo = getLevelInfo(profile.xp);
  const levelTitle = getLevelTitle(levelInfo.level);
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

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
          <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider'>
            PROFILE
          </h1>
          <div className='w-8' />
        </div>
      </div>

      {/* Profile header */}
      <div className='px-4 pt-4 pb-2'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className='glass rounded-2xl p-5 border border-[rgba(245,245,220,0.06)]'
        >
          <div className='flex items-start gap-4'>
            {/* Avatar */}
            <div className='w-16 h-16 rounded-2xl bg-[rgba(255,45,45,0.1)] flex items-center justify-center text-3xl shrink-0'>
              {profile.avatar_url || "👤"}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-black text-[#f5f5dc] truncate'>
                  {profile.display_name}
                </h2>
                {profile.is_verified && (
                  <Shield size={14} className='text-[#ff2d2d] shrink-0' />
                )}
              </div>
              <p className='text-xs text-[#f0ede6]/40 font-mono'>
                @{profile.username}
              </p>

              {/* Level badge */}
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]'>
                  Lvl {levelInfo.level}
                </span>
                <span className='text-[10px] text-[#f0ede6]/40'>
                  {levelTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className='text-sm text-[#f0ede6]/60 mt-3 leading-relaxed'>
              {profile.bio}
            </p>
          )}

          {/* Level progress */}
          <div className='mt-3'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-[9px] text-[#f0ede6]/30 font-mono'>
                {profile.xp} XP
              </span>
              <span className='text-[9px] text-[#f0ede6]/30 font-mono'>
                {levelInfo.xpForNextLevel} XP for Lvl {levelInfo.level + 1}
              </span>
            </div>
            <div className='w-full h-1.5 rounded-full bg-[rgba(245,245,220,0.06)]'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1 }}
                className='h-full rounded-full'
                style={{
                  background: "linear-gradient(90deg, #ff2d2d, #ff6b6b)",
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className='grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[rgba(245,245,220,0.06)]'>
            <div className='flex flex-col items-center'>
              <span className='text-sm font-black text-[#f5f5dc]'>
                {profile.verified_trades}
              </span>
              <span className='text-[9px] text-[#f0ede6]/40'>Trades</span>
            </div>
            <div className='flex flex-col items-center'>
              <span className='text-sm font-black text-[#f5f5dc]'>
                {followerCount}
              </span>
              <span className='text-[9px] text-[#f0ede6]/40'>Followers</span>
            </div>
            <div className='flex flex-col items-center'>
              <span className='text-sm font-black text-[#f5f5dc]'>
                {followingCount}
              </span>
              <span className='text-[9px] text-[#f0ede6]/40'>Following</span>
            </div>
            <div className='flex flex-col items-center'>
              <span className='text-sm font-black text-[#f5f5dc] flex items-center gap-0.5'>
                {avgRating || "—"}
                {avgRating && (
                  <Star size={10} className='text-yellow-500 fill-yellow-500' />
                )}
              </span>
              <span className='text-[9px] text-[#f0ede6]/40'>Rating</span>
            </div>
          </div>

          {/* Streak */}
          {profile.streak_count > 0 && (
            <div className='mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,150,0,0.08)] border border-orange-500/20'>
              <span className='text-sm'>🔥</span>
              <span className='text-xs text-orange-300 font-bold'>
                {profile.streak_count} day streak!
              </span>
            </div>
          )}

          {/* Action buttons */}
          {!isOwnProfile && currentUser && (
            <div className='flex gap-2 mt-4'>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={toggleFollow}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  isFollowing
                    ? "glass border border-[rgba(245,245,220,0.1)] text-[#f0ede6]/60"
                    : "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={12} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={12} /> Follow
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className='flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[rgba(245,245,220,0.1)] text-[#f0ede6]/60 flex items-center justify-center gap-1.5'
              >
                <MessageCircle size={12} /> Message
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className='px-4 pt-3 flex gap-2'>
        {[
          {
            key: "collection" as const,
            label: "Collection",
            icon: Package,
            count: listings.length,
          },
          {
            key: "achievements" as const,
            label: "Badges",
            icon: Award,
            count: achievements.length,
          },
          {
            key: "reviews" as const,
            label: "Reviews",
            icon: Star,
            count: reviews.length,
          },
        ].map(({ key, label, icon: Icon, count }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === key
                ? "bg-[rgba(255,45,45,0.2)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                : "glass border border-[rgba(245,245,220,0.06)] text-[#f0ede6]/50"
            }`}
          >
            <Icon size={12} /> {label} ({count})
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <div className='px-4 py-3'>
        <AnimatePresence mode='wait'>
          {activeTab === "collection" && (
            <motion.div
              key='collection'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {listings.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 gap-3'>
                  <Package size={32} className='text-[#f0ede6]/20' />
                  <p className='text-sm text-[#f0ede6]/30'>
                    No active listings
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-3'>
                  {listings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <CollectibleCard
                        item={{
                          id: listing.id,
                          name: listing.title,
                          series: listing.category,
                          rarity: listing.rarity,
                          price: listing.price_hkd
                            ? `HKD ${listing.price_hkd}`
                            : "Swap",
                          category:
                            listing.category === "pokemon_card"
                              ? "card"
                              : listing.category === "lego"
                                ? "lego"
                                : "blindbox",
                          condition: listing.condition,
                        }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key='achievements'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {achievements.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 gap-3'>
                  <Award size={32} className='text-[#f0ede6]/20' />
                  <p className='text-sm text-[#f0ede6]/30'>
                    No achievements yet
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-3 gap-2'>
                  {achievements.map((ua) => (
                    <motion.div
                      key={ua.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='glass rounded-xl p-3 border border-[rgba(245,245,220,0.06)] flex flex-col items-center text-center gap-1.5'
                    >
                      <span className='text-2xl'>{ua.achievements.icon}</span>
                      <p className='text-[10px] font-bold text-[#f5f5dc] leading-tight'>
                        {ua.achievements.name}
                      </p>
                      <span
                        className='text-[8px] font-bold px-1.5 py-0.5 rounded-full'
                        style={{
                          background: getRarityBg(ua.achievements.rarity),
                          color: getRarityColor(ua.achievements.rarity),
                        }}
                      >
                        {ua.achievements.rarity}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key='reviews'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {reviews.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 gap-3'>
                  <Star size={32} className='text-[#f0ede6]/20' />
                  <p className='text-sm text-[#f0ede6]/30'>No reviews yet</p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {reviews.map((review, i) => (
                    <div
                      key={i}
                      className='glass rounded-xl p-3 border border-[rgba(245,245,220,0.06)]'
                    >
                      <div className='flex items-center justify-between mb-1.5'>
                        <span className='text-xs font-bold text-[#f5f5dc]'>
                          {review.reviewer_name}
                        </span>
                        <div className='flex items-center gap-0.5'>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              size={10}
                              className={
                                j < review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-[#f0ede6]/20"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className='text-xs text-[#f0ede6]/50 leading-relaxed'>
                          {review.comment}
                        </p>
                      )}
                      <p className='text-[9px] text-[#f0ede6]/20 font-mono mt-1.5'>
                        {new Date(review.created_at).toLocaleDateString(
                          "en-HK",
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function getRarityBg(rarity: string): string {
  switch (rarity) {
    case "bronze":
      return "rgba(205,127,50,0.15)";
    case "silver":
      return "rgba(192,192,192,0.15)";
    case "gold":
      return "rgba(255,215,0,0.15)";
    case "platinum":
      return "rgba(229,228,226,0.15)";
    case "diamond":
      return "rgba(185,242,255,0.15)";
    default:
      return "rgba(245,245,220,0.06)";
  }
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "bronze":
      return "#cd7f32";
    case "silver":
      return "#c0c0c0";
    case "gold":
      return "#ffd700";
    case "platinum":
      return "#e5e4e2";
    case "diamond":
      return "#b9f2ff";
    default:
      return "#f0ede6";
  }
}
