"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  suggestions?: string[];
  categoryScope?: string;
  onCategoryScopeChange?: (scope: string) => void;
  showScopeSelector?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search collectibles...",
  recentSearches = [],
  suggestions = [],
  categoryScope = "all",
  onCategoryScopeChange,
  showScopeSelector = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase()),
  );

  const showDropdown =
    focused && (recentSearches.length > 0 || filteredSuggestions.length > 0);

  return (
    <div ref={containerRef} className='relative w-full'>
      <div className='relative'>
        <Search
          size={16}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30'
        />
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setFocused(true);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch?.(value);
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          className='w-full pl-10 pr-10 py-2.5 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30 hover:text-[#f0ede6]/60'
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category scope selector */}
      {showScopeSelector && onCategoryScopeChange && (
        <div className='flex gap-1.5 mt-2'>
          {["all", "pokemon", "lego", "hottoys", "popmart", "hotwheels"].map(
            (scope) => (
              <button
                key={scope}
                onClick={() => onCategoryScopeChange(scope)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                  categoryScope === scope
                    ? "bg-[rgba(255,45,45,0.15)] text-[#ff2d2d] border border-[rgba(255,45,45,0.3)]"
                    : "text-[#f0ede6]/30 border border-transparent hover:text-[#f0ede6]/50"
                }`}
              >
                {scope === "all"
                  ? "All"
                  : scope === "pokemon"
                    ? "Cards"
                    : scope === "lego"
                      ? "LEGO"
                      : scope === "hottoys"
                        ? "Hot Toys"
                        : scope === "popmart"
                          ? "Pop Mart"
                          : "Hot Wheels"}
              </button>
            ),
          )}
        </div>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='absolute top-full left-0 right-0 z-50 mt-1 rounded-xl glass-strong border border-[rgba(245,245,220,0.08)] overflow-hidden'
          >
            {value && filteredSuggestions.length > 0 && (
              <div className='p-2'>
                <p className='text-[8px] font-mono uppercase tracking-widest text-[#f0ede6]/20 px-2 py-1'>
                  Suggestions
                </p>
                {filteredSuggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      onChange(suggestion);
                      onSearch?.(suggestion);
                      setShowSuggestions(false);
                    }}
                    className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-[#f0ede6]/60 hover:bg-[rgba(245,245,220,0.05)] text-left'
                  >
                    <TrendingUp size={10} className='text-[#f0ede6]/20' />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {!value && recentSearches.length > 0 && (
              <div className='p-2'>
                <p className='text-[8px] font-mono uppercase tracking-widest text-[#f0ede6]/20 px-2 py-1'>
                  Recent Searches
                </p>
                {recentSearches.slice(0, 5).map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      onChange(search);
                      onSearch?.(search);
                      setShowSuggestions(false);
                    }}
                    className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-[#f0ede6]/60 hover:bg-[rgba(245,245,220,0.05)] text-left'
                  >
                    <Clock size={10} className='text-[#f0ede6]/20' />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
