import type { Trade } from "@/lib/types/database";

async function getSupabase() {
  const mod = await import("@/lib/supabase/client");
  return mod.createClient();
}

export const COMMISSION_RATE = 0.025;
export const NEXUS_BASE_REWARD = 10;
export const NEXUS_PER_HKD = 0.01;

export interface CommissionBreakdown {
  tradeValue: number;
  commissionHKD: number;
  sellerReceives: number;
  nexusEarned: number;
  xpEarned: number;
}

export function calculateCommission(tradeValueHKD: number): CommissionBreakdown {
  const commissionHKD = Math.round(tradeValueHKD * COMMISSION_RATE * 100) / 100;
  const sellerReceives = tradeValueHKD - commissionHKD;
  const nexusEarned = NEXUS_BASE_REWARD + Math.floor(tradeValueHKD * NEXUS_PER_HKD);
  const xpEarned = 50 + Math.floor(tradeValueHKD * 0.005);

  return { tradeValue: tradeValueHKD, commissionHKD, sellerReceives, nexusEarned, xpEarned };
}

export async function completeTrade(tradeId: string, userId: string) {
  const supabase = await getSupabase();
  const { data: trade, error } = await supabase.from("trades").select("*").eq("id", tradeId).single();
  if (error || !trade) throw new Error("Trade not found");
  if (trade.initiator_id !== userId && trade.receiver_id !== userId) throw new Error("Not authorized");

  const tradeValue = trade.initiator_cash_topup_hkd + trade.receiver_cash_topup_hkd;
  const breakdown = calculateCommission(tradeValue);

  const { data: updatedTrade, error: updateError } = await supabase
    .from("trades")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      commission_hkd: breakdown.commissionHKD,
      nexus_earned: breakdown.nexusEarned,
    })
    .eq("id", tradeId)
    .select()
    .single();

  if (updateError) throw updateError;

  for (const participantId of [trade.initiator_id, trade.receiver_id]) {
    await supabase.rpc("award_xp_and_nexus", {
      uid: participantId,
      xp_amount: breakdown.xpEarned,
      nexus_amount: breakdown.nexusEarned,
    });
  }

  if (trade.initiator_listing_id) {
    await supabase.from("listings").update({ status: "sold" }).eq("id", trade.initiator_listing_id);
  }
  if (trade.receiver_listing_id) {
    await supabase.from("listings").update({ status: "sold" }).eq("id", trade.receiver_listing_id);
  }

  return { trade: updatedTrade as Trade, breakdown };
}

export async function getUserTradeStats(userId: string) {
  const supabase = await getSupabase();
  const { data: trades, error } = await supabase
    .from("trades")
    .select("commission_hkd, nexus_earned, status")
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "completed");

  if (error) throw error;

  const totalTrades = trades.length;
  const totalSpent = trades.reduce((sum, t) => sum + (t.commission_hkd || 0), 0);
  const totalNexusEarned = trades.reduce((sum, t) => sum + (t.nexus_earned || 0), 0);

  return { totalTrades, totalSpent, totalNexusEarned };
}

export async function getNexusBalance(userId: string): Promise<number> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("profiles").select("nexus_tokens").eq("id", userId).single();
  if (error) throw error;
  return data?.nexus_tokens || 0;
}

export async function spendNexus(userId: string, amount: number): Promise<boolean> {
  const balance = await getNexusBalance(userId);
  if (balance < amount) return false;
  const supabase = await getSupabase();
  const { error } = await supabase.from("profiles").update({ nexus_tokens: balance - amount }).eq("id", userId);
  return !error;
}
