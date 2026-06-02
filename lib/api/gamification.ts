import { createClient } from "@/lib/supabase/client";
import type { Achievement, UserAchievement, Profile } from "@/lib/types/database";

const supabase = createClient();

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / 500) + 1;
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  return { level, xpForCurrentLevel, xpForNextLevel, progress };
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return "🌟 Legendary Collector";
  if (level >= 40) return "💎 Diamond Dealer";
  if (level >= 30) return "👑 Grand Master";
  if (level >= 25) return "🏆 Elite Trader";
  if (level >= 20) return "🔥 Chase Hunter";
  if (level >= 15) return "⚡ Veteran Collector";
  if (level >= 10) return "🎯 Skilled Dealer";
  if (level >= 7) return "📦 Regular Trader";
  if (level >= 5) return "🔍 Deal Finder";
  if (level >= 3) return "🌱 Rising Collector";
  return "🐣 Newbie";
}

export const XP_REWARDS = {
  LISTING_CREATED: 25,
  TRADE_COMPLETED: 50,
  REVIEW_GIVEN: 15,
  REVIEW_RECEIVED: 10,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETED: 30,
  FIRST_TRADE: 100,
};

export async function awardXP(userId: string, xpAmount: number) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const newXp = (profile.xp || 0) + xpAmount;
  const newLevel = Math.floor(newXp / 500) + 1;
  const leveledUp = newLevel > (profile.level || 1);

  await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("id", userId);

  return { newXp, newLevel, leveledUp };
}

export async function updateStreak(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_active, xp")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const now = new Date();
  const lastActive = profile.last_active ? new Date(profile.last_active) : null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = lastActive
    ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
    : null;

  let newStreak = profile.streak_count || 0;

  if (!lastDay) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return { streak: newStreak, isNewDay: false };
    } else if (diffDays === 1) {
      newStreak = (profile.streak_count || 0) + 1;
    } else {
      newStreak = 1;
    }
  }

  let bonusXp = XP_REWARDS.DAILY_LOGIN;
  if (newStreak === 3) bonusXp += 25;
  if (newStreak === 7) bonusXp += 50;
  if (newStreak === 14) bonusXp += 75;
  if (newStreak === 30) bonusXp += 150;
  if (newStreak === 60) bonusXp += 300;
  if (newStreak === 100) bonusXp += 500;

  const currentXp = profile.xp || 0;
  const newLevel = Math.floor((currentXp + bonusXp) / 500) + 1;

  await supabase
    .from("profiles")
    .update({
      streak_count: newStreak,
      last_active: now.toISOString(),
      xp: currentXp + bonusXp,
      level: newLevel,
    })
    .eq("id", userId);

  return { streak: newStreak, isNewDay: true, bonusXp };
}

export async function checkAchievements(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return [];

  const { data: allAchievements } = await supabase.from("achievements").select("*");
  const { data: earned } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const earnedIds = new Set((earned || []).map((e) => e.achievement_id));
  const newAchievements: Achievement[] = [];

  for (const achievement of allAchievements || []) {
    if (earnedIds.has(achievement.id)) continue;

    let earnedAchievement = false;
    switch (achievement.requirement_type) {
      case "listings_count": {
        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", userId);
        earnedAchievement = (count || 0) >= achievement.requirement_value;
        break;
      }
      case "trades_completed": {
        const { count } = await supabase
          .from("trades")
          .select("*", { count: "exact", head: true })
          .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq("status", "completed");
        earnedAchievement = (count || 0) >= achievement.requirement_value;
        break;
      }
      case "reviews_given": {
        const { count } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("reviewer_id", userId);
        earnedAchievement = (count || 0) >= achievement.requirement_value;
        break;
      }
      case "streak_days":
        earnedAchievement = (profile.streak_count || 0) >= achievement.requirement_value;
        break;
      case "followers": {
        const { count } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);
        earnedAchievement = (count || 0) >= achievement.requirement_value;
        break;
      }
    }

    if (earnedAchievement) {
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      });
      if (achievement.xp_reward > 0) {
        await awardXP(userId, achievement.xp_reward);
      }
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

export async function getLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, level, xp, verified_trades, is_verified")
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Profile[];
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw error;
  return data as (UserAchievement & { achievements: Achievement })[];
}
