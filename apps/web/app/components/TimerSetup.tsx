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
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm hover:bg-red-100 transition"
      >
        <span>⏹</span> Stop Timer
      </button>
    );
  }

  if (!showSetup) {
    return (
      <button
        onClick={() => setShowSetup(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-kid bg-sunshine-100 border-2 border-sunshine-300 text-sunshine-800 font-bold hover:bg-sunshine-200 transition"
      >
        <span className="text-xl">⏱️</span>
        Set Play Timer
      </button>
    );
  }

  return (
    <div className="bg-sunshine-50 border-2 border-sunshine-200 rounded-kid p-5 space-y-4">
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
            className="flex-1 flex flex-col items-center gap-1 p-4 rounded-kid bg-white border-2 border-sunshine-300 hover:border-sunshine-500 hover:shadow-md transition"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="font-bold text-sunshine-800">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
