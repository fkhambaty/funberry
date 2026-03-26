"use client";

import React from "react";
import { StarRating } from "./StarRating";

export interface GameResultScreenProps {
  stars: number;
  score: number;
  maxScore: number;
  onReplay: () => void;
  onNext: () => void;
  onBack: () => void;
}

const messages: Record<number, { text: string; emoji: string }> = {
  0: { text: "Nice try! Let's do it again!", emoji: "💪" },
  1: { text: "Good job! You got one star!", emoji: "👏" },
  2: { text: "Great work! Almost perfect!", emoji: "🎉" },
  3: { text: "AMAZING! You're a superstar!", emoji: "🌟" },
};

export function GameResultScreen({
  stars,
  score,
  maxScore,
  onReplay,
  onNext,
  onBack,
}: GameResultScreenProps) {
  const msg = messages[Math.min(stars, 3)];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="text-7xl mb-4 animate-bounce">{msg.emoji}</div>
      <h2 className="font-[Fredoka,sans-serif] text-3xl font-bold text-[#1c498c] mb-2">
        {msg.text}
      </h2>
      <p className="text-gray-500 mb-6">
        Score: {score}/{maxScore}
      </p>
      <div className="mb-8">
        <StarRating stars={stars} size="lg" />
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onReplay}
          className="w-full py-4 rounded-2xl bg-[#379df9] text-white font-bold text-lg shadow-[0_4px_0_#1969db] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Play Again
        </button>
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#18b05a] text-white font-bold text-lg shadow-[0_4px_0_#0a713b] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Next Game
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300 transition"
        >
          Back to Zone
        </button>
      </div>
    </div>
  );
}
