"use client";

import { useState } from "react";
import Image from "next/image";

interface CardImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Card image component with automatic fallback on error.
 * Uses next/image for optimization with graceful degradation.
 */
export function CardImage({ src, alt, className = "", fallbackClassName = "" }: CardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 ${fallbackClassName}`}>
        <div className="text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] text-slate-500">No image</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-contain p-1 ${className}`}
      quality={80}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      onError={() => setHasError(true)}
      unoptimized={true}
    />
  );
}
