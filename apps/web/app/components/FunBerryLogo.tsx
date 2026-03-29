"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 560;
const VB_H = 164;
const WORDMARK = "FunBerryKids";

const heights: Record<LogoSize, number> = {
  xs: 26,
  sm: 32,
  md: 42,
  lg: 58,
  xl: 78,
  hero: 136,
};

/**
 * default: premium glass pill + high-contrast lettering (auth and utility screens).
 * editorial: cinematic transparent lockup with richer depth (homepage and marketing).
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
    y: variant === "editorial" ? 70 : 67,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 58 : 52,
    letterSpacing: "0.02em",
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
        <radialGradient id={`${id}-bgGlow`} cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="70%" stopColor="#eef2ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${id}-berryPink`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ffd7e5" />
          <stop offset="35%" stopColor="#ff4b8f" />
          <stop offset="100%" stopColor="#b10d50" />
        </linearGradient>
        <linearGradient id={`${id}-berryBlue`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6e9ff" />
          <stop offset="42%" stopColor="#2b79ff" />
          <stop offset="100%" stopColor="#1843b8" />
        </linearGradient>
        <linearGradient id={`${id}-berryViolet`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eadcff" />
          <stop offset="44%" stopColor="#8a39ff" />
          <stop offset="100%" stopColor="#4f16a6" />
        </linearGradient>
        <linearGradient id={`${id}-berryLeaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#59e6a5" />
          <stop offset="100%" stopColor="#128a4e" />
        </linearGradient>

        <linearGradient id={`${id}-plateGlass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="28%" stopColor="#f8fbff" stopOpacity="0.94" />
          <stop offset="70%" stopColor="#ecf3ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d7e4ff" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id={`${id}-plateShine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient id={`${id}-letter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f3f8ff" />
          <stop offset="100%" stopColor="#dbe8ff" />
        </linearGradient>
        <linearGradient id={`${id}-editorialText`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="25%" stopColor="#ef2f8f" />
          <stop offset="53%" stopColor="#7c3aed" />
          <stop offset="77%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        <filter id={`${id}-berryShadow`} x="-40%" y="-40%" width="180%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.8" result="blur" />
          <feOffset in="blur" dy="4" result="offset" />
          <feColorMatrix
            in="offset"
            type="matrix"
            values="0 0 0 0 0.11 0 0 0 0 0.11 0 0 0 0 0.29 0 0 0 0.26 0"
          />
        </filter>
        <filter id={`${id}-wordShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.3" />
        </filter>
      </defs>

      {variant === "editorial" && (
        <>
          <ellipse cx={VB_W / 2} cy={88} rx={245} ry={56} fill={`url(#${id}-bgGlow)`} />
          <ellipse cx={VB_W / 2} cy={130} rx={232} ry={24} fill="#1e1b4b" opacity="0.08" />
        </>
      )}

      {variant === "default" && (
        <>
          <rect x="12" y="16" width={VB_W - 24} height={130} rx="44" fill="transparent" />
          <ellipse cx={VB_W / 2} cy={132} rx={235} ry={22} fill="#1e1b4b" opacity="0.08" />
        </>
      )}

      <g filter={`url(#${id}-berryShadow)`}>
        {/* left strawberry */}
        <g transform="translate(68 118)">
          <path
            d="M0 -52 C24 -52 38 -29 38 -4 C38 25 20 47 0 58 C-20 47 -38 25 -38 -4 C-38 -29 -24 -52 0 -52 Z"
            fill={`url(#${id}-berryPink)`}
          />
          <path d="M-24 -45 L-28 -60 L-12 -51 L0 -63 L12 -51 L28 -60 L24 -45 L0 -50 Z" fill={`url(#${id}-berryLeaf)`} />
          {[[-9, -18], [6, -12], [14, 2], [-12, 8], [2, 16], [-7, 27], [12, 25]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.2" ry="2.8" fill="#fff3cc" opacity="0.9" />
          ))}
        </g>

        {/* blue glass berry */}
        <g transform="translate(176 103)">
          <circle cx="0" cy="0" r="32" fill={`url(#${id}-berryBlue)`} />
          <ellipse cx="-10" cy="-10" rx="15" ry="11" fill="#ffffff" opacity="0.35" />
          <path d="M-13 -24 L-8 -35 L-2 -27 L0 -40 L2 -27 L8 -35 L13 -24 Q0 -28 -13 -24 Z" fill="#1640a8" />
        </g>

        {/* center raspberry */}
        <g transform="translate(280 108)">
          {[-22, -10, 2, 14].map((x, i) => (
            <circle key={`r1-${i}`} cx={x} cy={-16} r="9" fill={`url(#${id}-berryPink)`} />
          ))}
          {[-28, -16, -4, 8, 20].map((x, i) => (
            <circle key={`r2-${i}`} cx={x} cy={-2} r="9" fill={`url(#${id}-berryPink)`} />
          ))}
          {[-22, -10, 2, 14].map((x, i) => (
            <circle key={`r3-${i}`} cx={x} cy={12} r="9" fill={`url(#${id}-berryPink)`} />
          ))}
        </g>

        {/* center-right blackberry */}
        <g transform="translate(382 108)">
          {[-18, -6, 6, 18].map((x, i) => (
            <circle key={`b1-${i}`} cx={x} cy={-16} r="9" fill={`url(#${id}-berryViolet)`} />
          ))}
          {[-24, -12, 0, 12, 24].map((x, i) => (
            <circle key={`b2-${i}`} cx={x} cy={-2} r="9" fill={`url(#${id}-berryViolet)`} />
          ))}
          {[-18, -6, 6, 18].map((x, i) => (
            <circle key={`b3-${i}`} cx={x} cy={12} r="9" fill={`url(#${id}-berryViolet)`} />
          ))}
        </g>

        {/* right strawberry */}
        <g transform="translate(494 118)">
          <path
            d="M0 -52 C24 -52 38 -29 38 -4 C38 25 20 47 0 58 C-20 47 -38 25 -38 -4 C-38 -29 -24 -52 0 -52 Z"
            fill={`url(#${id}-berryPink)`}
          />
          <path d="M-24 -45 L-28 -60 L-12 -51 L0 -63 L12 -51 L28 -60 L24 -45 L0 -50 Z" fill={`url(#${id}-berryLeaf)`} />
          {[[-9, -18], [6, -12], [14, 2], [-12, 8], [2, 16], [-7, 27], [12, 25]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.2" ry="2.8" fill="#fff3cc" opacity="0.9" />
          ))}
        </g>
      </g>

      {variant === "default" && (
        <>
          <rect
            x="40"
            y="18"
            width={VB_W - 80}
            height="74"
            rx="37"
            fill={`url(#${id}-plateGlass)`}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
          />
          <rect x="40" y="18" width={VB_W - 80} height="74" rx="37" fill={`url(#${id}-plateShine)`} />
        </>
      )}

      <text
        {...textProps}
        fill="none"
        stroke={variant === "editorial" ? "rgba(255,255,255,0.94)" : "#0f172a"}
        strokeWidth={variant === "editorial" ? 3.4 : 4.2}
        strokeLinejoin="round"
        filter={`url(#${id}-wordShadow)`}
      >
        {WORDMARK}
      </text>
      <text
        {...textProps}
        fill={variant === "editorial" ? `url(#${id}-editorialText)` : `url(#${id}-letter)`}
        stroke={variant === "editorial" ? "rgba(15,23,42,0.2)" : "#25427d"}
        strokeWidth={variant === "editorial" ? 1.2 : 1}
      >
        {WORDMARK}
      </text>
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        className="shrink-0 leading-none"
        animate={variant === "editorial" ? { y: [0, -3, 0] } : { y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: variant === "editorial" ? 4.8 : 3.6, ease: "easeInOut" }}
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
