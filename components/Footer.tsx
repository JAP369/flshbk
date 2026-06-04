"use client";

import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className='border-t border-[rgba(245,245,220,0.04)] py-6 px-4 mt-auto'>
      <div className='max-w-lg mx-auto'>
        <div className='mb-4'>
          <span className='text-sm font-black'>
            <span className='text-[#f5f5dc]'>FLSH</span>
            <span className='neon-red'>BK</span>
          </span>
          <p className='text-[10px] text-[#f0ede6]/30 mt-1 leading-relaxed'>
            Hong Kong's unified collectibles aggregator. Track prices across
            multiple marketplaces for trading cards, LEGO, Hot Toys, Pop Mart,
            and Hot Wheels.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-2 mb-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20'>
              Categories
            </p>
            <Link
              href='/categories/tcg'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Trading Cards
            </Link>
            <Link
              href='/categories/lego'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              LEGO
            </Link>
            <Link
              href='/categories/hottoys'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Hot Toys
            </Link>
            <Link
              href='/categories/popmart'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Pop Mart
            </Link>
            <Link
              href='/categories/hotwheels'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Hot Wheels
            </Link>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20'>
              Resources
            </p>
            <Link
              href='/leaderboard'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Leaderboard
            </Link>
            <Link
              href='/draw'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Lucky Draw
            </Link>
            <Link
              href='/trade'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d]'
            >
              Trade Arena
            </Link>
            <a
              href='https://github.com/JAP369/flshbk'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[10px] text-[#f0ede6]/40 hover:text-[#ff2d2d] flex items-center gap-1'
            >
              <ExternalLink size={8} /> GitHub
            </a>
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-[9px] font-mono uppercase tracking-widest text-[#f0ede6]/20 mb-1'>
            Data Sources
          </p>
          <p className='text-[9px] text-[#f0ede6]/25 leading-relaxed'>
            Carousell HK, Facebook Marketplace, eBay, Amazon, LEGO.com HK,
            BrickEconomy, Brickset, Sideshow, Hot Toys Official, Pop Mart
            Official, TCGplayer
          </p>
        </div>

        <div className='flex items-center justify-between pt-3 border-t border-[rgba(245,245,220,0.04)]'>
          <p className='text-[9px] text-[#f0ede6]/20 font-mono'>
            FLSHBK v0.1.0
          </p>
          <p className='text-[9px] text-[#f0ede6]/20 flex items-center gap-1'>
            Made with <Heart size={8} className='text-[#ff2d2d]' /> in Hong Kong
          </p>
        </div>
      </div>
    </footer>
  );
}
