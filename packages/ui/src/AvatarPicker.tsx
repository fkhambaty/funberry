"use client";

import React, { useState } from "react";

export interface AvatarPickerProps {
  onSelect: (config: AvatarSelection) => void;
  initialConfig?: AvatarSelection;
}

export interface AvatarSelection {
  body: string;
  hair: string;
  color: string;
}

const bodyOptions = ["🧒", "👦", "👧", "🧒🏽", "👦🏽", "👧🏽", "🧒🏿", "👦🏿", "👧🏿"];
const colorOptions = [
  "#ff9db6",
  "#91d4ff",
  "#75e09e",
  "#ffd14a",
  "#ffc6d6",
  "#bee4ff",
  "#ffe588",
  "#d1d5db",
];

export function AvatarPicker({ onSelect, initialConfig }: AvatarPickerProps) {
  const [selected, setSelected] = useState<AvatarSelection>(
    initialConfig ?? { body: "🧒", hair: "short", color: "#ff9db6" }
  );

  function update(partial: Partial<AvatarSelection>) {
    const next = { ...selected, ...partial };
    setSelected(next);
    onSelect(next);
  }

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-6xl border-4"
          style={{ borderColor: selected.color, backgroundColor: selected.color + "22" }}
        >
          {selected.body}
        </div>
      </div>

      {/* Body selection */}
      <div>
        <p className="text-sm font-bold text-gray-600 mb-2 text-center">
          Pick your look
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {bodyOptions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => update({ body: emoji })}
              className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                selected.body === emoji
                  ? "bg-[#daf0ff] border-2 border-[#379df9] scale-110"
                  : "bg-gray-100 border-2 border-transparent hover:bg-gray-200"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color selection */}
      <div>
        <p className="text-sm font-bold text-gray-600 mb-2 text-center">
          Pick your favorite color
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => update({ color })}
              className={`w-10 h-10 rounded-full border-3 transition-all ${
                selected.color === color
                  ? "scale-125 border-gray-800"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
