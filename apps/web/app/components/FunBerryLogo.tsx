"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

/** Wide banner: room for berry illustrations + large wordmark */
const VB_W = 420;
const VB_H = 104;

const heights: Record<LogoSize, number> = {
  xs: 30,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 68,
  hero: 104,
};

const WORDMARK = "FunBerryKids";

/**
 * `default` — readable wordmark on a soft pill over a row of illustrated berries.
 * `editorial` — larger gradient wordmark, berries as atmospheric backdrop (no pill).
 */
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
    y: variant === "editorial" ? 52 : 50,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 34 : 30,
    letterSpacing: variant === "editorial" ? "0.02em" : "0.03em",
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
      overflow="visible"
    >
      <defs>
        {/* Scene: soft vignette behind fruit */}
        <radialGradient id={`${id}-scene`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#faf8f5" />
          <stop offset="55%" stopColor="#f4f0ea" />
          <stop offset="100%" stopColor="#ebe4dc" />
        </radialGradient>

        <radialGradient id={`${id}-straw1`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="40%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
        <radialGradient id={`${id}-straw2`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="45%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <radialGradient id={`${id}-blue`} cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id={`${id}-blueBloom`} cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-rasp`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
        <radialGradient id={`${id}-black`} cx="32%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="45%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#3b0764" />
        </radialGradient>

        <filter id={`${id}-berryShadow`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b" />
          <feOffset dx="0" dy="3" in="b" result="o" />
          <feComponentTransfer in="o" result="s">
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-wordShadow`} x="-12%" y="-12%" width="124%" height="124%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.35" />
        </filter>

        <linearGradient id={`${id}-letter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id={`${id}-plateShine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id={`${id}-editorialText`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="34%" stopColor="#db2777" />
          <stop offset="52%" stopColor="#9333ea" />
          <stop offset="78%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Backdrop: warm panel for default; editorial stays transparent for hero pages */}
      {variant === "default" && (
        <>
          <rect width={VB_W} height={VB_H} rx="12" fill={`url(#${id}-scene)`} />
          <ellipse cx={VB_W / 2} cy={VB_H + 4} rx={195} ry={28} fill="#0f172a" opacity="0.06" />
        </>
      )}
      {variant === "editorial" && (
        <>
          <ellipse cx={VB_W / 2} cy={VB_H - 8} rx={200} ry={52} fill={`url(#${id}-scene)`} opacity="0.45" />
          <ellipse cx={VB_W / 2} cy={VB_H + 2} rx={178} ry={22} fill="#0f172a" opacity="0.05" />
        </>
      )}

      {/* ── Berry row (behind text band) ── */}
      <g filter={`url(#${id}-berryShadow)`}>
        {/* Strawberry left */}
        <g transform="translate(44, 86)">
          <path
            d="M0 -36 C18 -36 26 -18 26 2 C26 22 12 34 0 40 C-12 34 -26 22 -26 2 C-26 -18 -18 -36 0 -36 Z"
            fill={`url(#${id}-straw1)`}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.1"
          />
          <path
            d="M-18 -32 L-22 -42 L-8 -38 L0 -46 L8 -38 L22 -42 L18 -32 L0 -36 Z"
            fill={`url(#${id}-leaf)`}
            stroke="#14532d"
            strokeWidth="0.5"
            opacity="0.95"
          />
          {[
            [-8, -8],
            [6, -4],
            [-4, 6],
            [10, 10],
            [-10, 14],
            [4, 20],
            [12, 0],
            [-6, 22],
          ].map(([sx, sy], i) => (
            <ellipse
              key={i}
              cx={sx}
              cy={sy}
              rx="1.8"
              ry="2.4"
              fill="#fef3c7"
              opacity="0.85"
              transform={`rotate(-12 ${sx} ${sy})`}
            />
          ))}
        </g>

        {/* Blueberry */}
        <g transform="translate(118, 82)">
          <ellipse cx="0" cy="4" rx="20" ry="6" fill="#1e1b4b" opacity="0.12" />
          <circle r="23" cx="0" cy="0" fill={`url(#${id}-blue)`} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <circle r="10" cx="-7" cy="-7" fill={`url(#${id}-blueBloom)`} />
          <path
            d="M-10 -18 L-6 -26 L-2 -20 L0 -28 L2 -20 L6 -26 L10 -18 Q0 -22 -10 -18 Z"
            fill="#1e40af"
            stroke="#172554"
            strokeWidth="0.4"
          />
        </g>

        {/* Raspberry cluster */}
        <g transform="translate(198, 84)">
          {[
            [-10, -14],
            [0, -16],
            [10, -14],
            [-16, -4],
            [-5, -4],
            [5, -4],
            [16, -4],
            [-12, 6],
            [0, 8],
            [12, 6],
            [-6, 18],
            [6, 18],
            [0, -6],
          ].map(([dx, dy], i) => (
            <circle
              key={i}
              cx={dx}
              cy={dy}
              r="6.2"
              fill={`url(#${id}-rasp)`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.6"
            />
          ))}
        </g>

        {/* Blackberry */}
        <g transform="translate(278, 84)">
          {[
            [-8, -12],
            [4, -14],
            [14, -10],
            [-14, 0],
            [-2, 0],
            [10, 0],
            [16, 2],
            [-10, 12],
            [2, 14],
            [12, 10],
            [0, 4],
          ].map(([dx, dy], i) => (
            <circle
              key={i}
              cx={dx}
              cy={dy}
              r="6.5"
              fill={`url(#${id}-black)`}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.55"
            />
          ))}
        </g>

        {/* Strawberry right (slightly smaller) */}
        <g transform="translate(352, 88) scale(0.92)">
          <path
            d="M0 -36 C18 -36 26 -18 26 2 C26 22 12 34 0 40 C-12 34 -26 22 -26 2 C-26 -18 -18 -36 0 -36 Z"
            fill={`url(#${id}-straw2)`}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.1"
          />
          <path
            d="M-16 -32 L-20 -40 L-6 -38 L0 -44 L6 -38 L20 -40 L16 -32 L0 -36 Z"
            fill={`url(#${id}-leaf)`}
            stroke="#14532d"
            strokeWidth="0.5"
            opacity="0.95"
          />
          {[
            [-6, -6],
            [8, -2],
            [-10, 8],
            [6, 14],
            [10, 4],
            [-4, 20],
          ].map(([sx, sy], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx="1.6" ry="2.2" fill="#fef9c3" opacity="0.8" />
          ))}
        </g>
      </g>

      {variant === "default" && (
        <>
          <rect
            x="14"
            y="18"
            width={VB_W - 28}
            height="50"
            rx="25"
            fill="rgba(255,255,255,0.97)"
            stroke="rgba(15,23,42,0.1)"
            strokeWidth="1.35"
          />
          <rect
            x="14"
            y="18"
            width={VB_W - 28}
            height="50"
            rx="25"
            fill={`url(#${id}-plateShine)`}
            opacity="0.55"
          />
          <text
            {...textProps}
            fill="none"
            stroke="#0f172a"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {WORDMARK}
          </text>
          <text
            {...textProps}
            fill={`url(#${id}-letter)`}
            stroke="#334155"
            strokeWidth="0.9"
            filter={`url(#${id}-wordShadow)`}
          >
            {WORDMARK}
          </text>
        </>
      )}

      {variant === "editorial" && (
        <text
          {...textProps}
          fill={`url(#${id}-editorialText)`}
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          filter={`url(#${id}-wordShadow)`}
        >
          {WORDMARK}
        </text>
      )}
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        className="shrink-0 leading-none"
        animate={variant === "editorial" ? { y: [0, -2, 0] } : { y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: variant === "editorial" ? 5 : 3.2, ease: "easeInOut" }}
        style={{ height: h, width: w }}
      >
        {svg}
      </motion.div>
    );
  }

  return (
    <span className="inline-flex shrink-0 leading-none" style={{ height: h, width: w }}>
      {svg}
    </span>
  );
}
