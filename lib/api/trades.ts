import { createClient } from "@/lib/supabase/client";
import type { Trade, TradeStatus } from "@/lib/types/database";

const supabase = createClient();

const COMMISSION_RATE = 0.025;
const NEXUS_BASE = 10;
const NEXUS_PER_HKD = 0.01;

export async function createTrade(trade: {
  initiatorId: string;
  receiverId: string;
  initiatorListingId?: string;
  receiverListingId?: string;
  initiatorCashTopup?: number;
  receiverCashTopup?: number;
  notes?: string;
}) {
  const totalValue = (trade.initiatorCashTopup || 0) + (trade.receiverCashTopup || 0);
  const commission = Math.round(totalValue * COMMISSION_RATE * 100) / 100;
  const nexusEarned = NEXUS_BASE + Math.floor(totalValue * NEXUS_PER_HKD);

  const { data, error } = await supabase
    .from("trades")
    .insert({
      initiator_id: trade.initiatorId,
      receiver_id: trade.receiverId,
      initiator_listing_id: trade.initiatorListingId || null,
      receiver_listing_id: trade.receiverListingId || null,
      initiator_cash_topup_hkd: trade.initiatorCashTopup || 0,
      receiver_cash_topup_hkd: trade.receiverCashTopup || 0,
      commission_hkd: commission,
      nexus_earned: nexusEarned,
      notes: trade.notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Trade;
}

export async function updateTradeStatus(tradeId: string, status: TradeStatus) {
  const updates: Partial<Trade> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("trades")
    .update(updates)
    .eq("id", tradeId)
    .select()
    .single();

  if (error) throw error;

  // If completed, award XP and nexus tokens
  if (status === "completed" && data) {
    await awardTradeRewards(data);
  }

  return data as Trade;
}

async function awardTradeRewards(trade: Trade) {
  const xpGain = 50 + Math.floor(trade.commission_hkd * 0.5);
  const nexusGain = trade.nexus_earned;

  for (const userId of [trade.initiator_id, trade.receiver_id]) {
    await supabase.rpc("award_xp_and_nexus", {
      uid: userId,
      xp_amount: xpGain,
      nexus_amount: nexusGain,
    });
  }
}

export async function getUserTrades(userId: string) {
  const { data, error } = await supabase
    .from("trades")
    .select("*, initiator:initiator_id(username, display_name, avatar_url), receiver:receiver_id(username, display_name, avatar_url)")
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
