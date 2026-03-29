"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 780;
const VB_H = 250;
const WORDMARK = "FunBerryKids";

const heights: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 66,
  xl: 88,
  hero: 172,
};

export function FunBerryLogo({
  size = "md",
  className = "",
  animate = false,
  variant = "default",
}: {
  size?: LogoSize;
  className?: string;
  animate?: boolean;
  priority?: boolean;
  variant?: "default" | "editorial";
}) {
  const h = heights[size];
  const w = Math.round((h * VB_W) / VB_H);
  const id = useId().replace(/:/g, "");

  const textProps = {
    x: VB_W / 2,
    y: 92,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 80 : 72,
    letterSpacing: "0.011em",
    style: { paintOrder: "stroke fill" as const },
  };

  const svg = (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={WORDMARK}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}-capsule`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="40%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#fdf2f8" />
        </linearGradient>
        <linearGradient id={`${id}-word`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5a9f" />
          <stop offset="25%" stopColor="#d946ef" />
          <stop offset="56%" stopColor="#7c3aed" />
          <stop offset="80%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${id}-learn`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <radialGradient id={`${id}-berryPink`} cx="32%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffd8ec" />
          <stop offset="55%" stopColor="#ff4f9c" />
          <stop offset="100%" stopColor="#a40f5a" />
        </radialGradient>
        <radialGradient id={`${id}-berryBlue`} cx="32%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#dff1ff" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <filter id={`${id}-softGlow`} x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#0f172a" floodOpacity="0.23" />
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#312e81" floodOpacity="0.12" />
        </filter>
      </defs>

      {variant !== "editorial" ? (
        <rect x="8" y="14" width={VB_W - 16} height={VB_H - 28} rx="50" fill="white" fillOpacity="0.88" />
      ) : null}
      <rect x="22" y="26" width={VB_W - 44} height={154} rx="76" fill={`url(#${id}-capsule)`} />

      <text {...textProps} fill="none" stroke="rgba(255,255,255,0.98)" strokeWidth="6.4" filter={`url(#${id}-softGlow)`}>
        {WORDMARK}
      </text>
      <text {...textProps} dx="0" dy="7" fill="rgba(30,41,59,0.34)" stroke="none">
        {WORDMARK}
      </text>
      <text {...textProps} fill={`url(#${id}-word)`} stroke="rgba(30,41,59,0.24)" strokeWidth="1.5">
        {WORDMARK}
      </text>

      {/* Education + play signal */}
      <g transform="translate(236 193)">
        <rect x="0" y="-22" width="308" height="34" rx="17" fill="rgba(255,255,255,0.88)" stroke="rgba(255,255,255,0.92)" />
        <text x="154" y="-1" textAnchor="middle" style={{ fontFamily: "Poppins, Inter, sans-serif", fontWeight: 800, fontSize: 17, fill: "url(#" + `${id}-learn` + ")" }}>
          PLAY + LEARN ADVENTURES
        </text>
      </g>

      {/* Better-styled berry mascots */}
      <g transform="translate(102 130)">
        <path d="M0 -46 C22 -46 38 -30 38 -5 C38 24 20 50 0 65 C-20 50 -38 24 -38 -5 C-38 -30 -22 -46 0 -46 Z" fill={`url(#${id}-berryPink)`} stroke="#9d174d" strokeWidth="2" />
        <path d="M-24 -39 L-26 -54 L-10 -43 L0 -58 L10 -43 L26 -54 L24 -39 L0 -43 Z" fill="#22c55e" stroke="#166534" strokeWidth="1.2" />
        <circle cx="-8" cy="7" r="2.9" fill="#0f172a" />
        <circle cx="7" cy="7" r="2.9" fill="#0f172a" />
        <path d="M-8 18 Q0 26 8 18" stroke="#0f172a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(678 130)">
        <circle cx="0" cy="0" r="35" fill={`url(#${id}-berryBlue)`} stroke="#1e3a8a" strokeWidth="2" />
        <path d="M-14 -27 L-8 -40 L-2 -31 L0 -44 L2 -31 L8 -40 L14 -27 Q0 -30 -14 -27 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.2" />
        <circle cx="-8" cy="7" r="2.9" fill="#0f172a" />
        <circle cx="7" cy="7" r="2.9" fill="#0f172a" />
        <path d="M-8 18 Q0 26 8 18" stroke="#0f172a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>

      {/* Learning + playing chips */}
      <g transform="translate(266 222)">
        <rect x="0" y="-18" width="74" height="26" rx="13" fill="#ede9fe" />
        <text x="37" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#5b21b6" }}>📚 Learn</text>
      </g>
      <g transform="translate(352 222)">
        <rect x="0" y="-18" width="66" height="26" rx="13" fill="#e0f2fe" />
        <text x="33" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#075985" }}>🎮 Play</text>
      </g>
      <g transform="translate(430 222)">
        <rect x="0" y="-18" width="86" height="26" rx="13" fill="#fef3c7" />
        <text x="43" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#92400e" }}>🧠 Skills</text>
      </g>
    </svg>
  );

  const decorativeAnimations = animate ? (
    <>
      <motion.span
        className="pointer-events-none absolute left-[10%] top-[75%] text-[14px] sm:text-[18px]"
        animate={{ x: [-10, 12, -10], y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        🛝
      </motion.span>
      <motion.span
        className="pointer-events-none absolute left-[17%] top-[74%] text-[14px] sm:text-[18px]"
        animate={{ rotate: [-13, 13, -13], y: [0, 3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        👧
      </motion.span>
      <motion.span
        className="pointer-events-none absolute right-[14%] top-[74%] text-[14px] sm:text-[18px]"
        animate={{ rotate: [-10, 11, -10], y: [0, -3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        🤾
      </motion.span>
      <motion.span
        className="pointer-events-none absolute right-[8%] top-[76%] text-[14px] sm:text-[18px]"
        animate={{ x: [0, -14, 0, 14, 0], y: [0, -7, 0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ⚽
      </motion.span>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-[76%] -translate-x-1/2 text-[14px] sm:text-[18px]"
        animate={{ y: [0, -7, 0], x: [-4, 4, -4] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        📚
      </motion.span>
    </>
  ) : null;

  if (animate) {
    return (
      <motion.div
        className="relative shrink-0 leading-none"
        animate={{ y: [0, -2.5, 0] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
        style={{ height: h, width: w }}
      >
        {svg}
        {decorativeAnimations}
      </motion.div>
    );
  }

  return (
    <span className="relative inline-flex shrink-0 leading-none" style={{ height: h, width: w }}>
      {svg}
    </span>
  );
}
