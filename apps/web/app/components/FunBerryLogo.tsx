"use client";

import { useId } from "react";
import { BerryHeroMark } from "@funberry/brand";

export { BerryHeroMark };

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

/** Wide horizontal lockup: superhero berry mascot + wordmark. */
const VB_W = 960;
const VB_H = 300;

const heights: Record<LogoSize, number> = {
  xs: 30,
  sm: 40,
  md: 52,
  lg: 72,
  xl: 96,
  hero: 176,
};

export function FunBerryLogo({
  size = "md",
  className = "",
  animate = false,
  variant = "default",
  responsive = false,
}: {
  size?: LogoSize;
  className?: string;
  animate?: boolean;
  priority?: boolean;
  variant?: "default" | "editorial";
  /** When true, the SVG fills its container width (control size via className). */
  responsive?: boolean;
}) {
  const h = heights[size];
  const w = Math.round((h * VB_W) / VB_H);
  const idp = useId().replace(/:/g, "");

  const wordProps = {
    fontFamily: "'Baloo 2', 'Fredoka', 'Nunito', system-ui, sans-serif",
    fontWeight: 800 as const,
    letterSpacing: "0.005em",
  };

  return (
    <span
      className={`inline-flex shrink-0 leading-none ${className}`}
      style={responsive ? undefined : { height: h, width: w }}
    >
      <svg
        width={responsive ? "100%" : w}
        height={responsive ? undefined : h}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="FunBerryKids"
        style={{ display: "block", width: responsive ? "100%" : undefined, height: responsive ? "auto" : undefined }}
      >
        <defs>
          <linearGradient id={`${idp}-word`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5a9f" />
            <stop offset="30%" stopColor="#d946ef" />
            <stop offset="58%" stopColor="#7c3aed" />
            <stop offset="82%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id={`${idp}-tag`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {variant !== "editorial" ? (
          <rect x="6" y="10" width={VB_W - 12} height={VB_H - 20} rx="56" fill="white" fillOpacity="0.9" />
        ) : null}

        {/* Mascot */}
        <g
          transform="translate(28 30)"
          className={animate ? "animate-float" : undefined}
          style={{ transformOrigin: "128px 150px" }}
        >
          <BerryHeroMark idp={idp} />
        </g>

        {/* Wordmark */}
        <text
          x="286"
          y="150"
          dominantBaseline="middle"
          {...wordProps}
          fontSize="98"
          fill="none"
          stroke="rgba(255,255,255,0.96)"
          strokeWidth="10"
          style={{ paintOrder: "stroke fill" }}
        >
          FunBerry
        </text>
        <text
          x="286"
          y="150"
          dominantBaseline="middle"
          {...wordProps}
          fontSize="98"
          fill={`url(#${idp}-word)`}
          stroke="rgba(30,41,59,0.22)"
          strokeWidth="1.5"
          style={{ paintOrder: "stroke fill" }}
        >
          FunBerry
        </text>
        <text
          x="290"
          y="228"
          dominantBaseline="middle"
          {...wordProps}
          fontSize="52"
          fill="#334155"
          stroke="rgba(255,255,255,0.96)"
          strokeWidth="6"
          style={{ paintOrder: "stroke fill" }}
        >
          Kids
        </text>

        {/* Tagline pill */}
        <g transform="translate(470 196)">
          <rect x="0" y="0" width="410" height="46" rx="23" fill="rgba(255,255,255,0.94)" stroke="rgba(148,163,184,0.35)" />
          <text
            x="205"
            y="30"
            textAnchor="middle"
            style={{
              fontFamily: "'Baloo 2', 'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: 24,
              fill: `url(#${idp}-tag)`,
            }}
          >
            PLAY HARD · LEARN SMART
          </text>
        </g>
      </svg>
    </span>
  );
}
