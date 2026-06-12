"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, Gem, BarChart3, ArrowLeftRight, DollarSign } from "lucide-react";
import type { AggregatorListing } from "@/lib/types/database";
import { calculatePortfolioSegments, getCommissionRate, type PortfolioSegment } from "@/lib/tcg/arbitrage";

interface ArbitragePortfolioProps {
  listings: AggregatorListing[];
  userId?: string;
  verifiedTrades?: number;
}

export function ArbitragePortfolio({ listings, verifiedTrades = 0 }: ArbitragePortfolioProps) {
  const portfolio = useMemo(() => calculatePortfolioSegments(listings), [listings]);
  const commissionRate = getCommissionRate(verifiedTrades);

  const segments: {
    key: PortfolioSegment;
    label: string;
    icon: typeof TrendingUp;
    color: string;
    stats: {
      count: number;
      value: number;
      yield: number;
      avgYield: number;
    };
  }[] = [
    {
      key: "velocity",
      label: "Velocity Flips",
      icon: ArrowLeftRight,
      color: "#ff2d2d",
      stats: {
        count: portfolio.velocity_flips.count,
        value: portfolio.velocity_flips.total_value_hkd,
        yield: portfolio.velocity_flips.potential_yield_hkd,
        avgYield: portfolio.velocity_flips.avg_arb_yield,
      },
    },
    {
      key: "sovereign",
      label: "Sovereign Holds",
      icon: Gem,
      color: "#fbbf24",
      stats: {
        count: portfolio.sovereign_holds.count,
        value: portfolio.sovereign_holds.total_value_hkd,
        yield: portfolio.sovereign_holds.projected_10y_hkd,
        avgYield: portfolio.sovereign_holds.avg_arb_yield,
      },
    },
  ];

  return (
    <div className='glass rounded-2xl p-4 border border-[rgba(245,245,220,0.08)]'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <BarChart3 size={16} className='text-[#ff2d2d]' />
          <h3 className='text-sm font-black text-[#f5f5dc]'>Arbitrage Portfolio</h3>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='text-[10px] font-mono text-[#f0ede6]/40'>Commission:</span>
          <span className='text-[10px] font-bold text-emerald-400'>{commissionRate}%</span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {segments.map((segment) => (
          <motion.div
            key={segment.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl p-3 border'
            style={{
              background: `linear-gradient(135deg, ${segment.color}08, transparent)`,
              borderColor: `${segment.color}20`,
            }}
          >
            <div className='flex items-center gap-2 mb-2'>
              <segment.icon size={14} style={{ color: segment.color }} />
              <span className='text-[10px] font-mono font-bold uppercase' style={{ color: segment.color }}>
                {segment.label}
              </span>
            </div>
            <div className='space-y-1.5'>
              <div>
                <span className='text-lg font-black text-[#f5f5dc]'>{segment.stats.count}</span>
                <span className='text-[10px] text-[#f0ede6]/40 ml-1'>items</span>
              </div>
              <div className='flex items-center gap-1'>
                <DollarSign size={10} className='text-[#f0ede6]/30' />
                <span className='text-xs font-mono text-[#f5f5dc]'>
                  {segment.stats.value.toLocaleString()}
                </span>
              </div>
              {segment.key === "sovereign" && (
                <div className='flex items-center gap-1'>
                  <TrendingUp size={10} className='text-emerald-400' />
                  <span className='text-[10px] font-mono text-emerald-400'>
                    10y proj: {(segment.stats.yield as number).toLocaleString()}
                  </span>
                </div>
              )}
              {segment.key === "velocity" && (
                <div className='flex items-center gap-1'>
                  <Package size={10} className='text-amber-400' />
                  <span className='text-[10px] font-mono text-amber-400'>
                    yield: {Math.round(segment.stats.yield).toLocaleString()} XP
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}