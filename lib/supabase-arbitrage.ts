// =============================================================================
// SUPABASE CLIENT - ARBITRAGE TRACKER (MOCK FOR SHOWCASE)
// =============================================================================

import {
  DUMMY_ARBITRAGE_ENTRIES,
  DUMMY_ARBITRAGE_SUMMARY,
} from "@/data/arbitrage-entries";
import {
  ArbitrageEntry,
  ArbitrageSummary,
  ArbitrageStatus,
} from "@/types/arbitrage";

/**
 * Mock Supabase client for arbitrage tracker.
 * Replace with actual Supabase client when connecting to backend.
 *
 * To use real Supabase:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Create lib/supabase.ts with createClient
 * 3. Replace mock functions with actual Supabase queries
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all arbitrage entries
 * Equivalent to: supabase.from('arbitrage_entries').select('*').order('created_at', { ascending: false })
 */
export async function fetchArbitrageEntries(): Promise<ArbitrageEntry[]> {
  await delay(600);
  return DUMMY_ARBITRAGE_ENTRIES;
}

/**
 * Fetch arbitrage summary
 * Equivalent to: supabase.rpc('get_arbitrage_summary') or custom aggregation
 */
export async function fetchArbitrageSummary(): Promise<ArbitrageSummary> {
  await delay(400);
  return DUMMY_ARBITRAGE_SUMMARY;
}

/**
 * Update arbitrage entry status
 * Equivalent to: supabase.from('arbitrage_entries').update({ status }).eq('id', id)
 */
export async function updateArbitrageStatus(
  id: string,
  status: ArbitrageStatus
): Promise<ArbitrageEntry | null> {
  await delay(300);
  const entry = DUMMY_ARBITRAGE_ENTRIES.find((e) => e.id === id);
  if (entry) {
    entry.status = status;
    entry.updated_at = new Date().toISOString();
  }
  return entry || null;
}

/**
 * Add new arbitrage entry
 * Equivalent to: supabase.from('arbitrage_entries').insert([entry])
 */
export async function addArbitrageEntry(
  entry: Omit<ArbitrageEntry, "id" | "created_at" | "updated_at">
): Promise<ArbitrageEntry> {
  await delay(400);
  const newEntry: ArbitrageEntry = {
    ...entry,
    id: `arb-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  DUMMY_ARBITRAGE_ENTRIES.unshift(newEntry);
  return newEntry;
}

/**
 * Delete arbitrage entry
 * Equivalent to: supabase.from('arbitrage_entries').delete().eq('id', id)
 */
export async function deleteArbitrageEntry(id: string): Promise<boolean> {
  await delay(300);
  const index = DUMMY_ARBITRAGE_ENTRIES.findIndex((e) => e.id === id);
  if (index !== -1) {
    DUMMY_ARBITRAGE_ENTRIES.splice(index, 1);
    return true;
  }
  return false;
}
