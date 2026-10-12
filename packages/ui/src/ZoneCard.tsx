"use client";

import React from "react";
import type { ZoneConfig } from "@funberry/config";

export interface ZoneCardProps {
  zone: ZoneConfig;
  unlocked: boolean;
  starsEarned?: number;
  totalStars?: number;
  onClick?: () => void;
}

const colorBg: Record<string, string> = {
  berry: "bg-[#fff0f3] border-[#ffc6d6]",
  leaf: "bg-[#edfcf2] border-[#aceec2]",
  sky: "bg-[#eff8ff] border-[#bee4ff]",
  sunshine: "bg-[#fffbeb] border-[#ffe588]",
};

export function ZoneCard({
  zone,
  unlocked,
  starsEarned = 0,
  totalStars = 12,
  onClick,
}: ZoneCardProps) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      disabled={!unlocked}
      className={`
        kid-glass-panel relative w-full min-h-tap-kid p-5 text-left
        ${unlocked ? colorBg[zone.colorKey] : "bg-slate-100 border-slate-200"}
        ${unlocked ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}
      `}
    >
      {!unlocked && (
        <div className="absolute top-3 right-3 text-xl">🔒</div>
      )}
      <div className="text-3xl mb-2">{zone.emoji}</div>
      <h3 className="font-display font-bold text-lg text-ink-700">
        {zone.name}
      </h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
        {zone.description}
      </p>
      {unlocked && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-bold text-gray-600">
            {starsEarned}/{totalStars}
          </span>
        </div>
      )}
      {!unlocked && zone.starsToUnlock > 0 && (
        <p className="mt-2 text-xs font-semibold text-gray-400">
          Need {zone.starsToUnlock} ⭐ to unlock
        </p>
      )}
    </button>
  );
}
