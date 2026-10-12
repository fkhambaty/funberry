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
    <div className="fb-result flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-7xl animate-bounce">{msg.emoji}</div>
      <h2 className="font-display mb-2 text-3xl font-bold text-sky-900">
        {msg.text}
      </h2>
      <p className="mb-6 font-semibold text-ink-500">
        Score: {score}/{maxScore}
      </p>
      <div className="mb-8">
        <StarRating stars={stars} size="lg" />
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button onClick={onReplay} className="kid-glass-btn kid-glass-sky w-full rounded-kid py-4 text-lg">
          Play Again
        </button>
        <button onClick={onNext} className="kid-glass-btn kid-glass-leaf w-full rounded-kid py-4 text-lg">
          Next Game
        </button>
        <button onClick={onBack} className="kid-glass-btn kid-glass-muted w-full rounded-kid py-3 text-sm">
          Back to Zone
        </button>
      </div>
    </div>
  );
}
