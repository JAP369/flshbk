"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  MapPin,
  QrCode,
  CheckCircle,
  Clock,
  Navigation,
} from "lucide-react";
import Link from "next/link";

const safeZones = [
  {
    id: "sz1",
    name: "In's Point Mall",
    address: "226-242 Nathan Rd, Mong Kok",
    type: "Partner Shop",
    rating: 4.9,
    distance: "0.3 km",
    open: true,
    emoji: "🏬",
    x: 48,
    y: 38,
  },
  {
    id: "sz2",
    name: "Sino Centre",
    address: "582-592 Nathan Rd, Mong Kok",
    type: "Official Hub",
    rating: 4.8,
    distance: "0.6 km",
    open: true,
    emoji: "🏢",
    x: 55,
    y: 52,
  },
  {
    id: "sz3",
    name: "Mong Kok MTR Station",
    address: "Argyle St, Mong Kok",
    type: "MTR Hub",
    rating: 4.6,
    distance: "0.8 km",
    open: true,
    emoji: "🚇",
    x: 42,
    y: 62,
  },
  {
    id: "sz4",
    name: "Sham Shui Po MTR",
    address: "Cheung Sha Wan Rd, SSP",
    type: "MTR Hub",
    rating: 4.5,
    distance: "1.4 km",
    open: true,
    emoji: "🚇",
    x: 30,
    y: 75,
  },
  {
    id: "sz5",
    name: "Popcorn Mall",
    address: "9 Tong Chun St, Tseung Kwan O",
    type: "Partner Shop",
    rating: 4.7,
    distance: "8.2 km",
    open: false,
    emoji: "🏬",
    x: 75,
    y: 68,
  },
];

type HandshakePhase =
  | "idle"
  | "my-scan"
  | "their-scan"
  | "confirming"
  | "success";

export default function MeetupPage() {
  const [selectedZone, setSelectedZone] = useState<
    (typeof safeZones)[0] | null
  >(null);
  const [handshakeOpen, setHandshakeOpen] = useState(false);
  const [phase, setPhase] = useState<HandshakePhase>("idle");
  const [mapScale, setMapScale] = useState(1);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 200]);
    }
  }, []);

  function startHandshake() {
    setHandshakeOpen(true);
    setPhase("my-scan");
  }

  function simulateScan() {
    if (phase === "my-scan") {
      triggerHaptic();
      setPhase("their-scan");
    } else if (phase === "their-scan") {
      triggerHaptic();
      setPhase("confirming");
      setTimeout(() => {
        setPhase("success");
        triggerHaptic();
      }, 1500);
    }
  }

  function resetHandshake() {
    setPhase("idle");
    setHandshakeOpen(false);
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
              SAFE MEETUP
            </h1>
            <p className='text-[9px] font-mono text-emerald-400'>
              5 VERIFIED ZONES NEARBY
            </p>
          </div>
          <div className='flex items-center gap-1 px-2 py-1 rounded-xl glass'>
            <Navigation size={12} className='text-[#ff2d2d]' />
            <span className='text-xs font-bold text-[#f5f5dc]'>HK</span>
          </div>
        </div>
      </div>

      {/* Stylized Map */}
      <div
        className='relative mx-4 mt-4 rounded-3xl overflow-hidden'
        style={{ height: 260 }}
      >
        <motion.div
          animate={{ scale: mapScale }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className='absolute inset-0'
        >
          {/* Map background */}
          <div
            className='absolute inset-0'
            style={{
              background:
                "linear-gradient(135deg, #0f1318 0%, #151b25 50%, #0f1318 100%)",
            }}
          />

          {/* Grid lines (stylized streets) */}
          <svg
            className='absolute inset-0 w-full h-full opacity-20'
            viewBox='0 0 100 100'
            preserveAspectRatio='none'
          >
            {/* Horizontal streets */}
            {[20, 35, 50, 65, 80].map((y) => (
              <line
                key={`h${y}`}
                x1='0'
                y1={y}
                x2='100'
                y2={y}
                stroke='#f5f5dc'
                strokeWidth='0.3'
              />
            ))}
            {/* Vertical streets */}
            {[15, 30, 45, 60, 75, 90].map((x) => (
              <line
                key={`v${x}`}
                x1={x}
                y1='0'
                x2={x}
                y2='100'
                stroke='#f5f5dc'
                strokeWidth='0.3'
              />
            ))}
            {/* Main diagonal road */}
            <line
              x1='10'
              y1='90'
              x2='85'
              y2='15'
              stroke='#f5f5dc'
              strokeWidth='0.8'
            />
            {/* Nathan Road indicator */}
            <line
              x1='45'
              y1='5'
              x2='50'
              y2='95'
              stroke='#f5f5dc'
              strokeWidth='1.2'
            />
          </svg>

          {/* Zone labels */}
          <div className='absolute top-3 left-3 text-[8px] font-mono text-[#f0ede6]/20 uppercase tracking-widest'>
            Mong Kok · Sham Shui Po
          </div>

          {/* Safe Zone pins */}
          {safeZones.map((zone) => (
            <motion.button
              key={zone.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                setSelectedZone(zone);
                setMapScale(1.05);
                setTimeout(() => setMapScale(1), 600);
              }}
              className='absolute flex flex-col items-center -translate-x-1/2 -translate-y-full'
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: Math.random() * 2,
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-base shadow-lg ${
                  selectedZone?.id === zone.id
                    ? "ring-2 ring-[#ff2d2d] ring-offset-1 ring-offset-transparent"
                    : ""
                }`}
                style={{
                  background: zone.open
                    ? "linear-gradient(135deg, #ff2d2d, #cc0000)"
                    : "rgba(100,100,100,0.5)",
                  boxShadow: zone.open
                    ? "0 0 12px rgba(255,45,45,0.5)"
                    : "none",
                }}
              >
                <Shield size={12} className='text-white' />
              </motion.div>
              <div className='w-0.5 h-2 bg-[#ff2d2d] opacity-60' />
              <div className='w-1 h-1 rounded-full bg-[#ff2d2d] opacity-40' />
            </motion.button>
          ))}
        </motion.div>

        {/* Map overlay gradient */}
        <div className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d0d0f] to-transparent pointer-events-none' />
        <div className='absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#0d0d0f] to-transparent pointer-events-none' />
      </div>

      {/* Selected Zone Info */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className='mx-4 mt-3 p-4 rounded-2xl glass border border-[rgba(255,45,45,0.2)]'
          >
            <div className='flex items-start gap-3'>
              <div
                className='w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0'
                style={{ background: "rgba(255,45,45,0.1)" }}
              >
                {selectedZone.emoji}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-sm font-bold text-[#f5f5dc]'>
                      {selectedZone.name}
                    </p>
                    <p className='text-[10px] text-[#f0ede6]/40 mt-0.5'>
                      {selectedZone.address}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        selectedZone.open
                          ? "bg-[rgba(74,222,128,0.12)] text-emerald-400 border border-emerald-400/20"
                          : "bg-[rgba(148,163,184,0.1)] text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {selectedZone.open ? "● Open" : "● Closed"}
                    </span>
                    <span className='text-[9px] text-[#f0ede6]/30 font-mono'>
                      {selectedZone.distance}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 mt-2'>
                  <div className='flex items-center gap-1'>
                    <Shield size={10} className='text-[#ff2d2d]' />
                    <span className='text-[9px] text-[#ff2d2d] font-mono'>
                      Verified Safe-Zone
                    </span>
                  </div>
                  <span className='text-[9px] text-[#f0ede6]/30'>·</span>
                  <span className='text-[9px] text-[#f0ede6]/40'>
                    ⭐ {selectedZone.rating}
                  </span>
                  <span className='text-[9px] text-[#f0ede6]/30'>·</span>
                  <span className='text-[9px] text-[#f0ede6]/40'>
                    {selectedZone.type}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startHandshake}
              className='mt-3 w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2'
              style={{
                background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                boxShadow: "0 0 16px rgba(255,45,45,0.3)",
              }}
            >
              <QrCode size={16} /> Start Handshake Verification
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone list */}
      <div className='px-4 py-4 flex flex-col gap-2'>
        <p className='text-xs font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-1'>
          All Safe-Zones
        </p>
        {safeZones.map((zone, i) => (
          <motion.button
            key={zone.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedZone(zone)}
            className={`flex items-center gap-3 p-3 rounded-xl glass border text-left transition-all ${
              selectedZone?.id === zone.id
                ? "border-[rgba(255,45,45,0.3)]"
                : "border-[rgba(245,245,220,0.05)]"
            }`}
          >
            <span className='text-xl'>{zone.emoji}</span>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-bold text-[#f5f5dc] truncate'>
                {zone.name}
              </p>
              <p className='text-[9px] text-[#f0ede6]/40 truncate'>
                {zone.type} · {zone.distance}
              </p>
            </div>
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${zone.open ? "bg-emerald-400" : "bg-slate-500"}`}
            />
          </motion.button>
        ))}
      </div>

      {/* Handshake Modal */}
      <AnimatePresence>
        {handshakeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={phase === "success" ? resetHandshake : undefined}
              className='fixed inset-0 z-50 bg-black/85'
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className='fixed inset-x-0 bottom-0 z-50 rounded-t-3xl glass-strong'
              style={{ border: "1px solid rgba(245,245,220,0.1)" }}
            >
              <div className='flex flex-col items-center px-6 py-6 pb-10'>
                {/* Handle */}
                <div className='w-10 h-1 rounded-full bg-[rgba(245,245,220,0.2)] mb-6' />

                {phase !== "success" && (
                  <p className='text-[10px] font-mono uppercase tracking-widest text-[#f0ede6]/30 mb-4'>
                    Handshake Protocol — {selectedZone?.name}
                  </p>
                )}

                {/* Phase: My QR */}
                {phase === "my-scan" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='flex flex-col items-center gap-4 w-full'
                  >
                    <p className='text-lg font-black text-[#f5f5dc]'>
                      Your Trade QR
                    </p>
                    <div
                      className='w-48 h-48 rounded-2xl flex items-center justify-center relative overflow-hidden'
                      style={{
                        background: "rgba(245,245,220,0.03)",
                        border: "2px solid rgba(255,45,45,0.4)",
                      }}
                    >
                      <QrCode size={80} className='text-[#f5f5dc]' />
                      {/* Scanner line */}
                      <motion.div
                        animate={{ y: [-90, 90, -90] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear",
                        }}
                        className='absolute inset-x-0 h-0.5 opacity-70'
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, #ff2d2d, transparent)",
                        }}
                      />
                    </div>
                    <p className='text-xs text-[#f0ede6]/40 text-center max-w-xs'>
                      Show this to your trade partner. Once they scan, step 2
                      will unlock.
                    </p>
                    <div className='flex items-center gap-2 text-xs text-[#f0ede6]/40'>
                      <Clock size={12} />
                      <span className='font-mono'>QR expires in 05:00</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={simulateScan}
                      className='w-full py-3 rounded-xl text-sm font-black text-white'
                      style={{
                        background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                      }}
                    >
                      Partner Scanned → Next Step
                    </motion.button>
                  </motion.div>
                )}

                {/* Phase: Their QR */}
                {phase === "their-scan" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='flex flex-col items-center gap-4 w-full'
                  >
                    <p className='text-lg font-black text-[#f5f5dc]'>
                      Scan Partner&apos;s QR
                    </p>
                    <div
                      className='w-48 h-48 rounded-2xl flex items-center justify-center relative overflow-hidden'
                      style={{
                        background: "rgba(245,245,220,0.03)",
                        border: "2px solid rgba(74,222,128,0.4)",
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className='text-5xl'
                      >
                        📷
                      </motion.div>
                      {/* Corner brackets */}
                      {[
                        ["top-3 left-3", "border-t-2 border-l-2"],
                        ["top-3 right-3", "border-t-2 border-r-2"],
                        ["bottom-3 left-3", "border-b-2 border-l-2"],
                        ["bottom-3 right-3", "border-b-2 border-r-2"],
                      ].map(([pos, brd]) => (
                        <div
                          key={pos}
                          className={`absolute w-5 h-5 ${pos} ${brd} border-emerald-400 rounded-sm`}
                        />
                      ))}
                    </div>
                    <p className='text-xs text-[#f0ede6]/40 text-center max-w-xs'>
                      Point your camera at your partner&apos;s QR code to
                      confirm the meetup.
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={simulateScan}
                      className='w-full py-3 rounded-xl text-sm font-black'
                      style={{
                        background: "rgba(74,222,128,0.15)",
                        color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.3)",
                      }}
                    >
                      ✓ Confirm Scan (Simulate)
                    </motion.button>
                  </motion.div>
                )}

                {/* Phase: Confirming */}
                {phase === "confirming" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='flex flex-col items-center gap-4'
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className='w-16 h-16 rounded-full border-2 border-[#ff2d2d] border-t-transparent'
                    />
                    <p className='text-lg font-black text-[#f5f5dc]'>
                      Verifying...
                    </p>
                    <p className='text-xs text-[#f0ede6]/40'>
                      Confirming both parties · calculating 2.5% fee
                    </p>
                  </motion.div>
                )}

                {/* Phase: Success */}
                {phase === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className='flex flex-col items-center gap-4 w-full'
                  >
                    {/* Chain reaction rings */}
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.8 }}
                        className='absolute w-24 h-24 rounded-full border border-[#ff2d2d] pointer-events-none'
                      />
                    ))}

                    <CheckCircle size={60} className='text-emerald-400' />
                    <p className='text-xl font-black text-[#f5f5dc]'>
                      Handshake Complete!
                    </p>
                    <div className='glass rounded-2xl p-4 w-full border border-[rgba(74,222,128,0.2)]'>
                      <div className='flex justify-between text-xs mb-2'>
                        <span className='text-[#f0ede6]/40'>Trade Value</span>
                        <span className='text-[#f5f5dc] font-bold'>
                          HKD 3,800
                        </span>
                      </div>
                      <div className='flex justify-between text-xs mb-2'>
                        <span className='text-[#f0ede6]/40'>
                          Service Fee (2.5%)
                        </span>
                        <span className='text-[#ff2d2d] font-bold'>HKD 95</span>
                      </div>
                      <div className='flex justify-between text-xs pt-2 border-t border-[rgba(245,245,220,0.06)]'>
                        <span className='text-[#f0ede6]/40'>$NEXUS Earned</span>
                        <span className='text-emerald-400 font-black'>
                          +48 $NEXUS ⚡
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={resetHandshake}
                      className='w-full py-3 rounded-xl text-sm font-black text-white'
                      style={{
                        background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                      }}
                    >
                      Done — Trade Verified ✓
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
