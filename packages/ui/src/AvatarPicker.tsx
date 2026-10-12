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
          className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-6xl shadow-kid"
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
              className={`fb-avatar-option flex items-center justify-center rounded-2xl text-3xl transition-all ${
                selected.body === emoji
                  ? "scale-110 border-2 border-sky-500 bg-sky-100"
                  : "border-2 border-transparent bg-sky-50 hover:bg-sky-100"
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
              className={`h-12 w-12 rounded-full border-4 transition-all ${
                selected.color === color
                  ? "scale-110 border-ink-700"
                  : "border-white hover:scale-105"
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
