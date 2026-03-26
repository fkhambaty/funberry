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
        relative w-full p-5 rounded-[1.25rem] border-2 transition-all duration-200 text-left
        ${unlocked ? colorBg[zone.colorKey] : "bg-gray-100 border-gray-200"}
        ${unlocked ? "hover:scale-[1.03] hover:shadow-lg cursor-pointer" : "opacity-60 cursor-not-allowed"}
      `}
    >
      {!unlocked && (
        <div className="absolute top-3 right-3 text-xl">🔒</div>
      )}
      <div className="text-3xl mb-2">{zone.emoji}</div>
      <h3 className="font-[Fredoka,sans-serif] font-bold text-lg text-gray-800">
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
