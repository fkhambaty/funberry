"use client";

import { useId } from "react";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 780;
const VB_H = 230;
const WORDMARK = "FunBerryKids";

const heights: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 66,
  xl: 88,
  hero: 164,
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
    y: 88,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "'Baloo 2', 'Fredoka', 'Nunito', system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 86 : 78,
    letterSpacing: "0.008em",
    style: { paintOrder: "stroke fill" as const },
  };

  const svg = (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className=""
      role="img"
      aria-label={WORDMARK}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}-surface`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="52%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#fdf4ff" />
        </linearGradient>
        <linearGradient id={`${id}-word`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5a9f" />
          <stop offset="25%" stopColor="#d946ef" />
          <stop offset="56%" stopColor="#7c3aed" />
          <stop offset="80%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${id}-tag`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id={`${id}-softGlow`} x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#0f172a" floodOpacity="0.23" />
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#312e81" floodOpacity="0.12" />
        </filter>
      </defs>

      {variant !== "editorial" ? (
        <rect x="8" y="12" width={VB_W - 16} height={VB_H - 24} rx="48" fill="white" fillOpacity="0.9" />
      ) : null}
      <rect x="22" y="22" width={VB_W - 44} height={138} rx="69" fill={`url(#${id}-surface)`} />

      <text {...textProps} fill="none" stroke="rgba(255,255,255,0.98)" strokeWidth="6.4" filter={`url(#${id}-softGlow)`}>
        {WORDMARK}
      </text>
      <text {...textProps} dx="0" dy="7" fill="rgba(30,41,59,0.34)" stroke="none">
        {WORDMARK}
      </text>
      <text {...textProps} fill={`url(#${id}-word)`} stroke="rgba(30,41,59,0.24)" strokeWidth="1.5">
        {WORDMARK}
      </text>

      {/* Play + learning identity without mascots */}
      <g transform="translate(214 185)">
        <rect x="0" y="-21" width="352" height="34" rx="17" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.96)" />
        <text x="176" y="-1" textAnchor="middle" style={{ fontFamily: "'Baloo 2', 'Fredoka', 'Nunito', sans-serif", fontWeight: 700, fontSize: 19, fill: "url(#" + `${id}-tag` + ")" }}>
          PLAY HARD. LEARN SMART.
        </text>
      </g>

      <g transform="translate(250 218)">
        <rect x="0" y="-18" width="86" height="26" rx="13" fill="#ede9fe" />
        <text x="43" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#5b21b6" }}>🎮 Play</text>
      </g>
      <g transform="translate(350 218)">
        <rect x="0" y="-18" width="90" height="26" rx="13" fill="#e0f2fe" />
        <text x="45" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#075985" }}>📘 Learn</text>
      </g>
      <g transform="translate(454 218)">
        <rect x="0" y="-18" width="98" height="26" rx="13" fill="#fef3c7" />
        <text x="49" y="-1" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif", fill: "#92400e" }}>🏆 Progress</text>
      </g>
    </svg>
  );

  return (
    <span className={`inline-flex shrink-0 leading-none ${className}`} style={{ height: h, width: w }}>
      {svg}
    </span>
  );
}
