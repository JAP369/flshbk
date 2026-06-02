"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Plus,
  X,
  ArrowLeftRight,
  MessageCircle,
  CheckCircle,
  Package,
  Zap,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import CollectibleCard, { CollectibleItem } from "@/components/CollectibleCard";

const myItems: CollectibleItem[] = [
  {
    id: "m1",
    name: "Labubu Space",
    series: "Pop Mart",
    rarity: "rare",
    price: "HKD 1,200",
    category: "blindbox",
    status: "unopened",
  },
  {
    id: "m2",
    name: "Dimoo Zodiac",
    series: "Pop Mart",
    rarity: "common",
    price: "HKD 480",
    category: "blindbox",
    status: "opened",
  },
  {
    id: "m3",
    name: "LEGO #21335",
    series: "Ideas",
    rarity: "rare",
    price: "HKD 1,900",
    category: "lego",
    condition: "Sealed",
  },
  {
    id: "m4",
    name: "Pikachu VMAX",
    series: "Vivid Voltage",
    rarity: "rare",
    price: "HKD 850",
    category: "card",
    grade: "9",
  },
];

const theirItems: CollectibleItem[] = [
  {
    id: "t1",
    name: "Molly Zodiac",
    series: "Pop Mart × Kenny",
    rarity: "chase",
    price: "HKD 2,400",
    category: "blindbox",
    status: "unopened",
    verified: true,
  },
  {
    id: "t2",
    name: "CryBaby Chase",
    series: "Pop Mart",
    rarity: "secret",
    price: "HKD 3,200",
    category: "blindbox",
    status: "unopened",
  },
];

const activeTrades = [
  {
    id: "at1",
    user: "ghost_pop",
    items: "2× Labubu + HKD 800",
    wants: "Molly Zodiac Chase",
    time: "3m ago",
    status: "new",
  },
  {
    id: "at2",
    user: "brick_lord",
    items: "LEGO #42083 Sealed",
    wants: "LEGO Creator Expert",
    time: "12m ago",
    status: "countered",
  },
  {
    id: "at3",
    user: "nexus_eli",
    items: "PSA 10 Charizard",
    wants: "PSA 9 Rayquaza + HKD 2K",
    time: "28m ago",
    status: "accepted",
  },
];

const statusConfig = {
  new: { label: "New Match", color: "#ff2d2d" },
  countered: { label: "Counter Offer", color: "#f59e0b" },
  accepted: { label: "Accepted ✓", color: "#10b981" },
};

export default function TradePage() {
  const [myOffer, setMyOffer] = useState<CollectibleItem[]>([]);
  const [theirOffer, setTheirOffer] = useState<CollectibleItem[]>([]);
  const [bulkSlot, setBulkSlot] = useState<CollectibleItem[]>([]);
  const [activeTab, setActiveTab] = useState<"arena" | "build">("arena");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "them",
      text: "Hey! Interested in trading my Molly Chase for your Labubu Space + HKD 500?",
    },
    { from: "me", text: "How about Labubu Space + HKD 800?" },
  ]);

  function toggleMyItem(item: CollectibleItem) {
    setMyOffer((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    );
  }

  function toggleTheirItem(item: CollectibleItem) {
    setTheirOffer((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    );
  }

  function addToBulk(item: CollectibleItem) {
    if (
      !bulkSlot.find((i) => i.id === item.id) &&
      item.category === "blindbox"
    ) {
      setBulkSlot((prev) => [...prev, item]);
    }
  }

  function sendMessage() {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: message }]);
    setMessage("");
  }

  return (
    <main className='flex flex-col min-h-screen'>
      {/* Header */}
      <div className='sticky top-0 z-40 glass-strong'>
        <div className='flex items-center justify-between px-4 py-3'>
          <Link href='/'>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className='p-1.5 rounded-xl glass'
            >
              <ChevronLeft size={18} className='text-[#f5f5dc]' />
            </motion.button>
          </Link>
          <div className='flex flex-col items-center'>
            <h1 className='text-sm font-black text-[#f5f5dc] tracking-wider'>
              TRADE ARENA
            </h1>
            <div className='flex items-center gap-1'>
              <span className='live-dot w-1.5 h-1.5 rounded-full bg-[#ff2d2d] inline-block' />
              <span className='text-[9px] font-mono text-[#ff2d2d]'>
                1,247 LIVE TRADES
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatOpen(true)}
            className='relative p-1.5 rounded-xl glass'
          >
            <MessageCircle size={18} className='text-[#f5f5dc]' />
            <span className='absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ff2d2d] text-[8px] flex items-center justify-center text-white font-bold'>
              2
            </span>
          </motion.button>
        </div>

        {/* Tabs */}
        <div className='flex px-4 pb-2 gap-2'>
          {(["arena", "build"] as const).map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#ff2d2d] text-white"
                  : "glass text-[#f0ede6]/50"
              }`}
            >
              {tab === "arena" ? "Live Matches" : "Build Offer"}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {activeTab === "arena" ? (
          <motion.div
            key='arena'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className='flex flex-col gap-3 px-4 py-4'
          >
            <p className='text-xs text-[#f0ede6]/30 font-mono uppercase tracking-widest'>
              Active Matches
            </p>
            {activeTrades.map((trade, i) => {
              const status =
                statusConfig[trade.status as keyof typeof statusConfig];
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className='p-4 rounded-2xl glass border border-[rgba(245,245,220,0.06)] relative overflow-hidden'
                >
                  {/* Status glow line */}
                  <div
                    className='absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full'
                    style={{ background: status.color }}
                  />
                  <div className='pl-2'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-bold text-[#f5f5dc]'>
                        @{trade.user}
                      </span>
                      <span
                        className='text-[9px] font-mono px-2 py-0.5 rounded-full'
                        style={{
                          color: status.color,
                          background: `${status.color}18`,
                          border: `1px solid ${status.color}40`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-[#f0ede6]/60'>
                      <Package size={12} className='text-[#ff2d2d] shrink-0' />
                      <span className='font-medium text-[#f5f5dc]'>
                        {trade.items}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-[#f0ede6]/40 mt-1'>
                      <ArrowLeftRight size={12} className='shrink-0' />
                      <span>Wants: {trade.wants}</span>
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        className='flex-1 py-2 rounded-xl text-xs font-bold'
                        style={{
                          background: "rgba(255,45,45,0.15)",
                          color: "#ff2d2d",
                          border: "1px solid rgba(255,45,45,0.3)",
                        }}
                      >
                        Counter
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        className='flex-1 py-2 rounded-xl text-xs font-bold text-white'
                        style={{
                          background:
                            "linear-gradient(135deg, #ff2d2d, #cc0000)",
                        }}
                      >
                        Accept →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key='build'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='flex flex-col gap-4 px-4 py-4'
          >
            <LayoutGroup>
              {/* Split-screen trade */}
              <div className='grid grid-cols-2 gap-2'>
                {/* My Offer */}
                <div>
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                    My Offer
                  </p>
                  <div className='min-h-24 p-2 rounded-2xl border-2 border-dashed border-[rgba(255,45,45,0.2)] bg-[rgba(255,45,45,0.03)]'>
                    <AnimatePresence>
                      {myOffer.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className='flex flex-col items-center justify-center h-20 gap-1'
                        >
                          <Plus size={16} className='text-[#ff2d2d]/40' />
                          <span className='text-[9px] text-[#f0ede6]/30'>
                            Add items
                          </span>
                        </motion.div>
                      ) : (
                        myOffer.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='flex items-center gap-1 mb-1 p-1.5 rounded-lg bg-[rgba(255,45,45,0.08)]'
                          >
                            <span className='text-xs flex-1 text-[#f5f5dc] truncate'>
                              {item.name}
                            </span>
                            <button onClick={() => toggleMyItem(item)}>
                              <X size={10} className='text-[#f0ede6]/40' />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Their Offer */}
                <div>
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                    Their Offer
                  </p>
                  <div className='min-h-24 p-2 rounded-2xl border-2 border-dashed border-[rgba(245,245,220,0.1)] bg-[rgba(245,245,220,0.02)]'>
                    <AnimatePresence>
                      {theirOffer.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className='flex flex-col items-center justify-center h-20 gap-1'
                        >
                          <Plus size={16} className='text-[#f0ede6]/20' />
                          <span className='text-[9px] text-[#f0ede6]/30'>
                            Add items
                          </span>
                        </motion.div>
                      ) : (
                        theirOffer.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='flex items-center gap-1 mb-1 p-1.5 rounded-lg bg-[rgba(245,245,220,0.05)]'
                          >
                            <span className='text-xs flex-1 text-[#f5f5dc] truncate'>
                              {item.name}
                            </span>
                            <button onClick={() => toggleTheirItem(item)}>
                              <X size={10} className='text-[#f0ede6]/40' />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Bulk Swap Slot */}
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30'>
                    Bulk Blind Box Swap
                  </p>
                  <span className='text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(96,165,250,0.15)] text-blue-300 border border-blue-400/20'>
                    Stack multiples for 1 chase
                  </span>
                </div>
                <div className='p-3 rounded-2xl border-2 border-dashed border-[rgba(96,165,250,0.2)] bg-[rgba(96,165,250,0.03)] min-h-16'>
                  <div className='flex flex-wrap gap-2'>
                    <AnimatePresence>
                      {bulkSlot.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          className='flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(96,165,250,0.12)] border border-blue-400/20'
                        >
                          <span className='text-[10px] text-blue-300'>
                            {item.name}
                          </span>
                          <button
                            onClick={() =>
                              setBulkSlot((prev) =>
                                prev.filter((i) => i.id !== item.id),
                              )
                            }
                          >
                            <X size={8} className='text-blue-300/60' />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {bulkSlot.length === 0 && (
                      <span className='text-[10px] text-[#f0ede6]/20 self-center'>
                        Tap blindbox items below to add to bundle
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* My inventory */}
              <div>
                <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                  My Vault — Select to Add
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {myItems.map((item) => {
                    const inOffer = myOffer.find((i) => i.id === item.id);
                    const inBulk = bulkSlot.find((i) => i.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.95 }}
                        className={`relative rounded-xl p-2 glass cursor-pointer border transition-all ${
                          inOffer
                            ? "border-[#ff2d2d]/50"
                            : "border-[rgba(245,245,220,0.06)]"
                        }`}
                        onClick={() => toggleMyItem(item)}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-xl'>
                            {item.category === "blindbox"
                              ? "🎭"
                              : item.category === "lego"
                                ? "🧱"
                                : "🃏"}
                          </span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-[#f5f5dc] truncate'>
                              {item.name}
                            </p>
                            <p className='text-[9px] text-[#f0ede6]/40'>
                              {item.price}
                            </p>
                          </div>
                          {inOffer && (
                            <CheckCircle
                              size={14}
                              className='text-[#ff2d2d] shrink-0'
                            />
                          )}
                        </div>
                        {item.category === "blindbox" && (
                          <button
                            className='mt-1.5 w-full text-[9px] text-blue-300 font-mono py-0.5 rounded-lg bg-[rgba(96,165,250,0.08)] border border-blue-400/20'
                            onClick={(e) => {
                              e.stopPropagation();
                              addToBulk(item);
                            }}
                          >
                            + Bulk Slot
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Their inventory */}
              <div>
                <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-2'>
                  Counterparty Vault
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {theirItems.map((item) => {
                    const inOffer = theirOffer.find((i) => i.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.95 }}
                        className={`relative rounded-xl p-2 glass cursor-pointer border transition-all ${
                          inOffer
                            ? "border-[rgba(245,245,220,0.3)]"
                            : "border-[rgba(245,245,220,0.06)]"
                        }`}
                        onClick={() => toggleTheirItem(item)}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-xl'>🎭</span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-[#f5f5dc] truncate'>
                              {item.name}
                            </p>
                            <p className='text-[9px] text-[#f0ede6]/40'>
                              {item.price}
                            </p>
                          </div>
                          {inOffer && (
                            <CheckCircle
                              size={14}
                              className='text-[#f5f5dc] shrink-0'
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </LayoutGroup>

            {/* Submit trade */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className='w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2'
              style={{
                background:
                  myOffer.length || theirOffer.length
                    ? "linear-gradient(135deg, #ff2d2d, #cc0000)"
                    : "rgba(255,45,45,0.2)",
                boxShadow:
                  myOffer.length || theirOffer.length
                    ? "0 0 24px rgba(255,45,45,0.4)"
                    : "none",
              }}
            >
              <Zap size={16} />
              {myOffer.length || theirOffer.length
                ? "Send Trade Offer"
                : "Select Items to Trade"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className='fixed inset-x-0 bottom-0 z-50 h-[70vh] rounded-t-3xl glass-strong flex flex-col'
            style={{ border: "1px solid rgba(245,245,220,0.1)" }}
          >
            <div className='flex items-center justify-between px-4 py-3 border-b border-[rgba(245,245,220,0.06)]'>
              <div>
                <p className='text-sm font-bold text-[#f5f5dc]'>@ghost_pop</p>
                <p className='text-[9px] text-emerald-400 font-mono'>
                  ● Online
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setChatOpen(false)}
                className='p-1.5 rounded-xl glass'
              >
                <X size={16} className='text-[#f0ede6]/60' />
              </motion.button>
            </div>

            <div className='flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2'>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${
                      msg.from === "me"
                        ? "bg-[#ff2d2d] text-white rounded-br-sm"
                        : "glass border border-[rgba(245,245,220,0.08)] text-[#f0ede6] rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className='flex gap-2 px-4 py-3 border-t border-[rgba(245,245,220,0.06)]'>
              <input
                type='text'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder='Propose a swap...'
                className='flex-1 bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] rounded-xl px-3 py-2 text-xs text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)]'
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                className='px-3 py-2 rounded-xl text-xs font-bold text-white'
                style={{
                  background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                }}
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat backdrop */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChatOpen(false)}
            className='fixed inset-0 z-40 bg-black/60'
          />
        )}
      </AnimatePresence>
    </main>
  );
}
