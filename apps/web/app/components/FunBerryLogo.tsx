"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 360;
const VB_H = 66;

const heights: Record<LogoSize, number> = {
  xs: 24,
  sm: 28,
  md: 34,
  lg: 42,
  xl: 50,
  hero: 78,
};

type BerrySpec = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  g: string;
  shine: string;
};

const WORDMARK = "FunBerryKids";

/**
 * `default` — glass berry cluster + high-contrast wordmark (readable everywhere).
 * `editorial` — same berries, gradient wordmark without the white pill or heavy ink stroke (hero / marketing).
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

  const berries: BerrySpec[] = [
    { cx: 48, cy: 54, rx: 36, ry: 28, g: `${id}-b1`, shine: `${id}-s1` },
    { cx: 108, cy: 56, rx: 32, ry: 25, g: `${id}-b2`, shine: `${id}-s2` },
    { cx: 178, cy: 52, rx: 34, ry: 27, g: `${id}-b3`, shine: `${id}-s3` },
    { cx: 248, cy: 55, rx: 30, ry: 24, g: `${id}-b4`, shine: `${id}-s4` },
    { cx: 308, cy: 53, rx: 32, ry: 25, g: `${id}-b5`, shine: `${id}-s5` },
  ];

  const textProps = {
    x: 180,
    y: 39,
    textAnchor: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "700" as const,
    fontSize: 22,
    letterSpacing: "0.04em",
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
        <radialGradient id={`${id}-b1`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffb8d9" />
          <stop offset="45%" stopColor="#ff4d8d" />
          <stop offset="100%" stopColor="#c2185c" />
        </radialGradient>
        <radialGradient id={`${id}-b2`} cx="32%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </radialGradient>
        <radialGradient id={`${id}-b3`} cx="30%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="48%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <radialGradient id={`${id}-b4`} cx="34%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <radialGradient id={`${id}-b5`} cx="32%" cy="28%" r="76%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="48%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>

        <radialGradient id={`${id}-s1`} cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-s2`} cx="36%" cy="30%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-s3`} cx="35%" cy="28%" r="54%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-s4`} cx="38%" cy="32%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-s5`} cx="36%" cy="30%" r="53%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Letter fill: porcelain + tiny depth — not blue-on-blue */}
        <linearGradient id={`${id}-letter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <filter id={`${id}-berryShadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
          <feOffset dx="0" dy="2.5" in="b" result="o" />
          <feComponentTransfer in="o" result="s">
            <feFuncA type="linear" slope="0.28" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-wordShadow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.45" />
        </filter>

        <linearGradient id={`${id}-plateShine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0.12" />
        </linearGradient>

        <linearGradient id={`${id}-editorialText`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="38%" stopColor="#9333ea" />
          <stop offset="72%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <ellipse cx="180" cy="60" rx="158" ry="9" fill="#0f172a" opacity="0.07" />

      {berries.map((b, i) => (
        <g key={i} filter={`url(#${id}-berryShadow)`}>
          <ellipse cx={b.cx + 1.2} cy={b.cy + 2} rx={b.rx * 0.92} ry={b.ry * 0.88} fill="#1e1b4b" opacity="0.1" />
          <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={`url(#${b.g})`} />
          <ellipse
            cx={b.cx - b.rx * 0.12}
            cy={b.cy - b.ry * 0.18}
            rx={b.rx * 0.55}
            ry={b.ry * 0.5}
            fill={`url(#${b.shine})`}
          />
          <ellipse
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill="none"
            stroke={variant === "editorial" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)"}
            strokeWidth={variant === "editorial" ? 0.9 : 1.25}
          />
          <path
            d={`M ${b.cx - b.rx * 0.35} ${b.cy - b.ry * 0.55} Q ${b.cx} ${b.cy - b.ry * 0.95} ${b.cx + b.rx * 0.35} ${b.cy - b.ry * 0.55}`}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      ))}

      {variant === "default" && (
        <>
          <rect
            x="22"
            y="17"
            width="316"
            height="36"
            rx="18"
            fill="rgba(255,255,255,0.94)"
            stroke="rgba(15,23,42,0.14)"
            strokeWidth="1.25"
          />
          <rect
            x="22"
            y="17"
            width="316"
            height="36"
            rx="18"
            fill={`url(#${id}-plateShine)`}
            opacity="0.5"
          />
          <text
            {...textProps}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {WORDMARK}
          </text>
          <text
            {...textProps}
            fill={`url(#${id}-letter)`}
            stroke="#1e293b"
            strokeWidth="0.85"
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
          stroke="rgba(15,23,42,0.06)"
          strokeWidth="0.6"
          style={{ paintOrder: "stroke fill" }}
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
