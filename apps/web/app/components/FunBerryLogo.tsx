"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const VB_W = 640;
const VB_H = 210;
const WORDMARK = "FunBerryKids";

const heights: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 66,
  xl: 88,
  hero: 158,
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
    y: 78,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontFamily: "Fredoka, system-ui, sans-serif",
    fontWeight: "800" as const,
    fontSize: variant === "editorial" ? 71 : 64,
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
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#dbeafe" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-pink`} cx="33%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#ffd5e8" />
          <stop offset="45%" stopColor="#ff4f9c" />
          <stop offset="100%" stopColor="#ba0f54" />
        </radialGradient>
        <radialGradient id={`${id}-blue`} cx="32%" cy="24%" r="72%">
          <stop offset="0%" stopColor="#d7edff" />
          <stop offset="45%" stopColor="#2f84ff" />
          <stop offset="100%" stopColor="#1e42bc" />
        </radialGradient>
        <radialGradient id={`${id}-purple`} cx="32%" cy="24%" r="72%">
          <stop offset="0%" stopColor="#eedcff" />
          <stop offset="45%" stopColor="#8f41ff" />
          <stop offset="100%" stopColor="#531db0" />
        </radialGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#61ecb2" />
          <stop offset="100%" stopColor="#149558" />
        </linearGradient>

        <linearGradient id={`${id}-word`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff3f84" />
          <stop offset="27%" stopColor="#ef2ac7" />
          <stop offset="54%" stopColor="#8750ff" />
          <stop offset="80%" stopColor="#2f7dff" />
          <stop offset="100%" stopColor="#00b8ff" />
        </linearGradient>

        <filter id={`${id}-wordGlow`} x="-24%" y="-24%" width="148%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#334155" floodOpacity="0.15" />
        </filter>
      </defs>

      {variant === "editorial" && <ellipse cx={VB_W / 2} cy={106} rx={300} ry={84} fill={`url(#${id}-bg)`} />}

      {/* Wordmark with chunky 3d feel */}
      <text {...textProps} fill="none" stroke="rgba(255,255,255,0.98)" strokeWidth="5.2" filter={`url(#${id}-wordGlow)`}>
        {WORDMARK}
      </text>
      <text {...textProps} dx="0" dy="6" fill="rgba(14,30,75,0.42)" stroke="none" opacity="0.45">
        {WORDMARK}
      </text>
      <text {...textProps} fill={`url(#${id}-word)`} stroke="rgba(18,33,68,0.22)" strokeWidth="1.2">
        {WORDMARK}
      </text>

      {/* Cartoon berries row (no giant background shadows) */}
      <g transform="translate(0 110)">
        {/* Strawberry left */}
        <g transform="translate(92 44)">
          <path d="M0 -47 C23 -47 39 -29 39 -3 C39 26 21 52 0 66 C-21 52 -39 26 -39 -3 C-39 -29 -23 -47 0 -47 Z" fill={`url(#${id}-pink)`} stroke="#9b124a" strokeWidth="2" />
          <path d="M-24 -39 L-28 -55 L-11 -45 L0 -60 L11 -45 L28 -55 L24 -39 L0 -43 Z" fill={`url(#${id}-leaf)`} stroke="#166534" strokeWidth="1.4" />
          {[[-10,-15],[6,-11],[13,2],[-11,8],[2,16],[-8,29],[10,26]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="2.1" ry="2.8" fill="#fff3c6" />)}
          <circle cx="-8" cy="8" r="2.9" fill="#0f172a" />
          <circle cx="7" cy="8" r="2.9" fill="#0f172a" />
          <path d="M-7 19 Q0 26 7 19" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" fill="none" />
          <ellipse cx="-14" cy="0" rx="10" ry="7" fill="#fff" opacity="0.25" />
        </g>

        {/* Blueberry */}
        <g transform="translate(206 36)">
          <circle cx="0" cy="0" r="34" fill={`url(#${id}-blue)`} stroke="#1e3a8a" strokeWidth="2" />
          <path d="M-14 -26 L-8 -40 L-2 -31 L0 -44 L2 -31 L8 -40 L14 -26 Q0 -29 -14 -26 Z" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1.2" />
          <circle cx="-8" cy="4" r="2.8" fill="#0f172a" />
          <circle cx="7" cy="4" r="2.8" fill="#0f172a" />
          <path d="M-7 15 Q0 21 7 15" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" fill="none" />
          <ellipse cx="-11" cy="-13" rx="15" ry="11" fill="#fff" opacity="0.3" />
        </g>

        {/* Raspberry */}
        <g transform="translate(322 43)">
          {[-24,-12,0,12].map((x,i)=><circle key={`a${i}`} cx={x} cy={-18} r="9" fill={`url(#${id}-pink)`} stroke="#9b124a" strokeWidth="1.2" />)}
          {[-30,-18,-6,6,18].map((x,i)=><circle key={`b${i}`} cx={x} cy={-4} r="9" fill={`url(#${id}-pink)`} stroke="#9b124a" strokeWidth="1.2" />)}
          {[-24,-12,0,12].map((x,i)=><circle key={`c${i}`} cx={x} cy={10} r="9" fill={`url(#${id}-pink)`} stroke="#9b124a" strokeWidth="1.2" />)}
          <path d="M-8 1 Q0 9 8 1" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="-7" cy="-8" r="2.6" fill="#0f172a" />
          <circle cx="7" cy="-8" r="2.6" fill="#0f172a" />
        </g>

        {/* Blackberry */}
        <g transform="translate(438 43)">
          {[-20,-8,4,16].map((x,i)=><circle key={`d${i}`} cx={x} cy={-18} r="9" fill={`url(#${id}-purple)`} stroke="#4c1d95" strokeWidth="1.2" />)}
          {[-26,-14,-2,10,22].map((x,i)=><circle key={`e${i}`} cx={x} cy={-4} r="9" fill={`url(#${id}-purple)`} stroke="#4c1d95" strokeWidth="1.2" />)}
          {[-20,-8,4,16].map((x,i)=><circle key={`f${i}`} cx={x} cy={10} r="9" fill={`url(#${id}-purple)`} stroke="#4c1d95" strokeWidth="1.2" />)}
          <path d="M-8 1 Q0 9 8 1" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="-7" cy="-8" r="2.6" fill="#0f172a" />
          <circle cx="7" cy="-8" r="2.6" fill="#0f172a" />
        </g>

        {/* Strawberry right */}
        <g transform="translate(550 44)">
          <path d="M0 -47 C23 -47 39 -29 39 -3 C39 26 21 52 0 66 C-21 52 -39 26 -39 -3 C-39 -29 -23 -47 0 -47 Z" fill={`url(#${id}-pink)`} stroke="#9b124a" strokeWidth="2" />
          <path d="M-24 -39 L-28 -55 L-11 -45 L0 -60 L11 -45 L28 -55 L24 -39 L0 -43 Z" fill={`url(#${id}-leaf)`} stroke="#166534" strokeWidth="1.4" />
          {[[-10,-15],[6,-11],[13,2],[-11,8],[2,16],[-8,29],[10,26]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="2.1" ry="2.8" fill="#fff3c6" />)}
          <circle cx="-8" cy="8" r="2.9" fill="#0f172a" />
          <circle cx="7" cy="8" r="2.9" fill="#0f172a" />
          <path d="M-7 19 Q0 26 7 19" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" fill="none" />
          <ellipse cx="-14" cy="0" rx="10" ry="7" fill="#fff" opacity="0.25" />
        </g>
      </g>
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        className="shrink-0 leading-none"
        animate={{ y: [0, -2.5, 0] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
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
