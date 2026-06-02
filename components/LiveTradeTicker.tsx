"use client";

import { motion } from "framer-motion";

const trades = [
  { user: "vault_rex", item: "Labubu Macaron", for: "0.8 ETH", time: "2m ago" },
  { user: "moko_88", item: "LEGO #10327", for: "HKD 2,800", time: "5m ago" },
  {
    user: "ghost_pop",
    item: "Molly Zodiac Set",
    for: "3× Dimoo Series",
    time: "8m ago",
  },
  {
    user: "nexus_eli",
    item: "PSA 10 Charizard",
    for: "HKD 12,000",
    time: "11m ago",
  },
  {
    user: "brick_lord",
    item: "LEGO Millenium Falcon",
    for: "HKD 8,500",
    time: "14m ago",
  },
  {
    user: "chase_queen",
    item: "Skullpanda Chase",
    for: "2× Secret Box",
    time: "17m ago",
  },
  {
    user: "pop_zen",
    item: "CryBaby Series 1",
    for: "HKD 1,200",
    time: "21m ago",
  },
  {
    user: "lego_sage",
    item: "LEGO Technic #42083",
    for: "HKD 4,200",
    time: "24m ago",
  },
];

export default function LiveTradeTicker() {
  const doubled = [...trades, ...trades]; // seamless loop

  return (
    <div className='relative w-full overflow-hidden py-2 border-y border-[rgba(245,245,220,0.06)]'>
      {/* Fade edges */}
      <div className='absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#0d0d0f] to-transparent pointer-events-none' />
      <div className='absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#0d0d0f] to-transparent pointer-events-none' />

      <div className='flex items-center gap-1 px-3 mb-1'>
        <span className='live-dot w-1.5 h-1.5 rounded-full bg-[#ff2d2d] inline-block' />
        <span className='text-[10px] font-mono text-[#ff2d2d] uppercase tracking-widest'>
          Live Trade Feed
        </span>
      </div>

      <div className='flex whitespace-nowrap ticker-inner gap-0'>
        {doubled.map((trade, i) => (
          <div
            key={i}
            className='inline-flex items-center gap-2 px-4 py-1 mr-6 glass rounded-full text-xs shrink-0'
          >
            <span className='text-[#ff2d2d] font-mono'>@{trade.user}</span>
            <span className='text-[#f0ede6]/60'>traded</span>
            <span className='text-[#f5f5dc] font-semibold'>{trade.item}</span>
            <span className='text-[#f0ede6]/40'>for</span>
            <span className='text-[#f5f5dc]'>{trade.for}</span>
            <span className='text-[#f0ede6]/30 font-mono text-[10px]'>
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
