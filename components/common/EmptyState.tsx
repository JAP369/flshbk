"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export default function EmptyState({
  icon = "🔍",
  title = "No results found",
  message = "Try adjusting your filters or search terms to find what you're looking for.",
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center py-16 gap-4 px-6'
    >
      <div className='text-5xl'>{icon}</div>
      <div className='text-center'>
        <p className='text-sm font-bold text-[#f5f5dc]'>{title}</p>
        <p className='text-xs text-[#f0ede6]/40 mt-1 max-w-xs'>{message}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className='flex gap-2 mt-2'>
          {actionLabel && actionHref && (
            <Link href={actionHref}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white'
                style={{
                  background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                  boxShadow: "0 0 12px rgba(255,45,45,0.3)",
                }}
              >
                {actionLabel} <ArrowRight size={12} />
              </motion.button>
            </Link>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Link href={secondaryActionHref}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className='px-4 py-2 rounded-xl text-xs font-bold text-[#f0ede6]/60 glass border border-[rgba(245,245,220,0.1)]'
              >
                {secondaryActionLabel}
              </motion.button>
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}
