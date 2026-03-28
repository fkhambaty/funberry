"use client";

import { useState } from "react";
import { useTimer } from "./TimerProvider";

const PRESETS = [
  { minutes: 15, label: "15 min", emoji: "⏱️" },
  { minutes: 20, label: "20 min", emoji: "⏲️" },
  { minutes: 30, label: "30 min", emoji: "🕐" },
];

export function TimerSetup({ onStart }: { onStart?: () => void }) {
  const { timer, startTimer, stopTimer, parentPin } = useTimer();
  const [showSetup, setShowSetup] = useState(false);

  if (!parentPin) {
    return (
      <div className="text-sm text-gray-400 italic">
        Set a PIN in your profile to enable the play timer.
      </div>
    );
  }

  if (timer.isActive && !timer.isLocked) {
    return (
      <button
        onClick={stopTimer}
        className="kid-glass-btn kid-glass-danger flex items-center gap-2 rounded-2xl px-4 py-2 text-sm"
      >
        <span>⏹</span> Stop Timer
      </button>
    );
  }

  if (!showSetup) {
    return (
      <button
        onClick={() => setShowSetup(true)}
        className="kid-glass-btn kid-glass-sunshine flex items-center gap-2 rounded-kid px-4 py-3"
      >
        <span className="text-xl">⏱️</span>
        Set Play Timer
      </button>
    );
  }

  return (
    <div className="glass-card space-y-4 rounded-kid border-sunshine-200/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sunshine-900">
          Set Timer for Your Child
        </h3>
        <button
          onClick={() => setShowSetup(false)}
          className="text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-gray-500">
        The screen will lock when time is up. Only you can unlock with your PIN.
      </p>
      <div className="flex gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.minutes}
            onClick={() => {
              startTimer(p.minutes);
              setShowSetup(false);
              onStart?.();
            }}
            className="kid-glass-btn kid-glass-sunshine flex flex-1 flex-col items-center gap-1 rounded-kid p-4 !text-sunshine-900"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="font-bold text-sunshine-800">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
