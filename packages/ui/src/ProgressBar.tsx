"use client";

import React from "react";

export interface ProgressBarProps {
  value: number;
  max: number;
  colorKey?: "berry" | "leaf" | "sky" | "sunshine";
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
}

const barColors: Record<string, string> = {
  berry: "bg-[#ff2d6a]",
  leaf: "bg-[#18b05a]",
  sky: "bg-[#379df9]",
  sunshine: "bg-[#ffbe20]",
};

const trackColors: Record<string, string> = {
  berry: "bg-[#ffe0e8]",
  leaf: "bg-[#d4f7de]",
  sky: "bg-[#daf0ff]",
  sunshine: "bg-[#fff3c6]",
};

const heights: Record<string, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-5",
};

export function ProgressBar({
  value,
  max,
  colorKey = "sky",
  showLabel = false,
  height = "md",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      <div
        className={`w-full rounded-full overflow-hidden ${trackColors[colorKey]} ${heights[height]}`}
      >
        <div
          className={`${heights[height]} rounded-full transition-all duration-500 ease-out ${barColors[colorKey]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-500 text-center font-semibold">
          {value}/{max}
        </p>
      )}
    </div>
  );
}
