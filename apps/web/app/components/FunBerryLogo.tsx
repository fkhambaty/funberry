"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 620;
const VB_H = 182;
const WORDMARK = "FunBerryKids";

const heights: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 86,
  hero: 148,
};

/**
 * default: playful glass lockup for auth and utility screens.
 * editorial: vibrant hero lockup with stronger depth and glow.
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
    y: variant === "editorial" ? 84 : 80,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 67 : 61,
    letterSpacing: "0.012em",
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
        <radialGradient id={`${id}-bgGlow`} cx="50%" cy="42%" r="66%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="62%" stopColor="#dbeafe" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-berryPink`} cx="32%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#ffd2e8" />
          <stop offset="45%" stopColor="#ff3d8a" />
          <stop offset="100%" stopColor="#b4004b" />
        </radialGradient>
        <radialGradient id={`${id}-berryBlue`} cx="30%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#d7edff" />
          <stop offset="45%" stopColor="#2f7dff" />
          <stop offset="100%" stopColor="#193db6" />
        </radialGradient>
        <radialGradient id={`${id}-berryPurple`} cx="30%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#ecd9ff" />
          <stop offset="45%" stopColor="#8d3dff" />
          <stop offset="100%" stopColor="#5216b5" />
        </radialGradient>
        <linearGradient id={`${id}-berryLeaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#63ebb0" />
          <stop offset="100%" stopColor="#149354" />
        </linearGradient>

        <linearGradient id={`${id}-glassPlate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="35%" stopColor="#f8fbff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#d7e7ff" stopOpacity="0.86" />
        </linearGradient>
        <linearGradient id={`${id}-glassShine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.25" />
        </linearGradient>

        <linearGradient id={`${id}-wordFill`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff3f84" />
          <stop offset="26%" stopColor="#f51ab1" />
          <stop offset="52%" stopColor="#8b3dff" />
          <stop offset="76%" stopColor="#2f7dff" />
          <stop offset="100%" stopColor="#00b5ff" />
        </linearGradient>
        <linearGradient id={`${id}-wordFillSoft`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5d9a" />
          <stop offset="30%" stopColor="#e53ff7" />
          <stop offset="58%" stopColor="#6b4dff" />
          <stop offset="100%" stopColor="#35b6ff" />
        </linearGradient>

        <filter id={`${id}-berryShadow`} x="-42%" y="-42%" width="184%" height="210%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.9" result="blur" />
          <feOffset in="blur" dy="4" result="offset" />
          <feColorMatrix
            in="offset"
            type="matrix"
            values="0 0 0 0 0.06 0 0 0 0 0.12 0 0 0 0 0.35 0 0 0 0.3 0"
          />
        </filter>

        <filter id={`${id}-wordShadow`} x="-22%" y="-22%" width="144%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#172554" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.16" />
        </filter>
      </defs>

      {variant === "editorial" && (
        <>
          <ellipse cx={VB_W / 2} cy={100} rx={292} ry={67} fill={`url(#${id}-bgGlow)`} />
          <ellipse cx={VB_W / 2} cy={146} rx={264} ry={25} fill="#1e1b4b" opacity="0.1" />
        </>
      )}

      {variant === "default" && (
        <>
          <ellipse cx={VB_W / 2} cy={144} rx={258} ry={22} fill="#1e1b4b" opacity="0.1" />
          <rect
            x="60"
            y="26"
            width={VB_W - 120}
            height="84"
            rx="42"
            fill={`url(#${id}-glassPlate)`}
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.4"
          />
          <rect x="60" y="26" width={VB_W - 120} height="84" rx="42" fill={`url(#${id}-glassShine)`} />
        </>
      )}

      <g filter={`url(#${id}-berryShadow)`}>
        <g transform="translate(84 132)">
          <path
            d="M0 -55 C25 -55 40 -31 40 -5 C40 26 21 49 0 61 C-21 49 -40 26 -40 -5 C-40 -31 -25 -55 0 -55 Z"
            fill={`url(#${id}-berryPink)`}
          />
          <path d="M-25 -46 L-30 -63 L-12 -53 L0 -66 L12 -53 L30 -63 L25 -46 L0 -51 Z" fill={`url(#${id}-berryLeaf)`} />
          {[[-10, -18], [6, -12], [14, 4], [-12, 10], [2, 18], [-8, 30], [11, 28]].map(([x, y], i) => (
            <ellipse key={`sl-${i}`} cx={x} cy={y} rx="2.2" ry="2.8" fill="#fff3cc" opacity="0.9" />
          ))}
          <ellipse cx="-12" cy="-18" rx="18" ry="12" fill="#fff" opacity="0.28" />
        </g>

        <g transform="translate(196 115)">
          <circle cx="0" cy="0" r="34" fill={`url(#${id}-berryBlue)`} />
          <ellipse cx="-11" cy="-12" rx="16" ry="12" fill="#fff" opacity="0.34" />
          <path d="M-14 -26 L-9 -38 L-2 -30 L0 -43 L2 -30 L9 -38 L14 -26 Q0 -30 -14 -26 Z" fill="#1e3a8a" />
        </g>

        <g transform="translate(308 121)">
          {[-22, -10, 2, 14].map((x, i) => (
            <circle key={`r1-${i}`} cx={x} cy={-17} r="9.2" fill={`url(#${id}-berryPink)`} />
          ))}
          {[-28, -16, -4, 8, 20].map((x, i) => (
            <circle key={`r2-${i}`} cx={x} cy={-3} r="9.2" fill={`url(#${id}-berryPink)`} />
          ))}
          {[-22, -10, 2, 14].map((x, i) => (
            <circle key={`r3-${i}`} cx={x} cy={11} r="9.2" fill={`url(#${id}-berryPink)`} />
          ))}
          <ellipse cx="-12" cy="-18" rx="16" ry="10" fill="#fff" opacity="0.21" />
        </g>

        <g transform="translate(420 121)">
          {[-18, -6, 6, 18].map((x, i) => (
            <circle key={`b1-${i}`} cx={x} cy={-17} r="9.2" fill={`url(#${id}-berryPurple)`} />
          ))}
          {[-24, -12, 0, 12, 24].map((x, i) => (
            <circle key={`b2-${i}`} cx={x} cy={-3} r="9.2" fill={`url(#${id}-berryPurple)`} />
          ))}
          {[-18, -6, 6, 18].map((x, i) => (
            <circle key={`b3-${i}`} cx={x} cy={11} r="9.2" fill={`url(#${id}-berryPurple)`} />
          ))}
          <ellipse cx="-10" cy="-18" rx="15" ry="10" fill="#fff" opacity="0.2" />
        </g>

        <g transform="translate(532 132)">
          <path
            d="M0 -55 C25 -55 40 -31 40 -5 C40 26 21 49 0 61 C-21 49 -40 26 -40 -5 C-40 -31 -25 -55 0 -55 Z"
            fill={`url(#${id}-berryPink)`}
          />
          <path d="M-25 -46 L-30 -63 L-12 -53 L0 -66 L12 -53 L30 -63 L25 -46 L0 -51 Z" fill={`url(#${id}-berryLeaf)`} />
          {[[-10, -18], [6, -12], [14, 4], [-12, 10], [2, 18], [-8, 30], [11, 28]].map(([x, y], i) => (
            <ellipse key={`sr-${i}`} cx={x} cy={y} rx="2.2" ry="2.8" fill="#fff3cc" opacity="0.9" />
          ))}
          <ellipse cx="-12" cy="-18" rx="18" ry="12" fill="#fff" opacity="0.28" />
        </g>
      </g>

      <text
        {...textProps}
        fill="none"
        stroke={variant === "editorial" ? "rgba(255,255,255,0.98)" : "rgba(15,23,42,0.92)"}
        strokeWidth={variant === "editorial" ? 3.9 : 4.4}
        strokeLinejoin="round"
        filter={`url(#${id}-wordShadow)`}
      >
        {WORDMARK}
      </text>
      <text
        {...textProps}
        fill={variant === "editorial" ? `url(#${id}-wordFill)` : `url(#${id}-wordFillSoft)`}
        stroke={variant === "editorial" ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.35)"}
        strokeWidth={variant === "editorial" ? 1.1 : 0.8}
      >
        {WORDMARK}
      </text>
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        className="shrink-0 leading-none"
        animate={variant === "editorial" ? { y: [0, -4, 0] } : { y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: variant === "editorial" ? 4.4 : 3.2, ease: "easeInOut" }}
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
