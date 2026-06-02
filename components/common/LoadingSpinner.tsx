"use client";

import { motion } from "framer-motion";

interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text,
  fullPage = false,
}: Props) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const pixelSize = sizes[size];

  const spinner = (
    <div className='flex flex-col items-center gap-3'>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: pixelSize, height: pixelSize }}
        className='rounded-full border-2 border-[rgba(255,45,45,0.2)] border-t-[#ff2d2d]'
      />
      {text && <p className='text-xs text-[#f0ede6]/40 font-mono'>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0f]/80 backdrop-blur-sm'>
        {spinner}
      </div>
    );
  }

  return <div className='flex items-center justify-center py-8'>{spinner}</div>;
}

export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`glass rounded-2xl p-3 border border-[rgba(245,245,220,0.06)] ${compact ? "w-32" : "w-full"}`}
    >
      <div className='flex gap-3'>
        <div
          className={`${compact ? "w-16 h-16" : "w-20 h-20"} rounded-xl bg-[rgba(245,245,220,0.05)] animate-pulse shrink-0`}
        />
        <div className='flex-1 flex flex-col gap-2'>
          <div className='h-3.5 rounded bg-[rgba(245,245,220,0.05)] animate-pulse w-3/4' />
          <div className='h-3 rounded bg-[rgba(245,245,220,0.05)] animate-pulse w-1/2' />
          <div className='h-2.5 rounded bg-[rgba(245,245,220,0.05)] animate-pulse w-1/3' />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} compact={compact} />
      ))}
    </div>
  );
}
