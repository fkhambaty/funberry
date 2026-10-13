"use client";

import React, { useEffect, useState } from "react";

export interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParentalGate({ onSuccess, onCancel }: ParentalGateProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);
  const [puzzle, setPuzzle] = useState<{ a: number; b: number } | null>(null);

  useEffect(() => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 20) + 10;
    setPuzzle({ a, b });
  }, []);

  if (!puzzle) {
    return (
      <p className="p-4 text-center font-display text-lg font-bold text-ink-700">
        Parents Only
      </p>
    );
  }

  const correctAnswer = puzzle.a + puzzle.b;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(answer, 10) === correctAnswer) {
      onSuccess();
    } else {
      setError(true);
      setAnswer("");
    }
  }

  return (
    <div className="text-center space-y-4 p-4">
      <p className="font-display text-lg font-bold text-ink-700">
        Parents Only
      </p>
      <p className="text-sm font-semibold text-ink-500">
        Solve this to continue. This keeps kids safe!
      </p>
      <p className="font-display text-3xl font-bold text-sky-900">
        {puzzle.a} + {puzzle.b} = ?
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="number"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(false);
          }}
          className={`fb-field w-32 text-center text-2xl font-bold ${
            error ? "border-red-400 bg-red-50" : ""
          }`}
          autoFocus
          placeholder="?"
          inputMode="numeric"
        />
        {error && (
          <p className="text-sm font-semibold text-red-600" role="alert">
            That&apos;s not right. Try again!
          </p>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="kid-glass-btn kid-glass-muted rounded-kid px-6 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" className="kid-glass-btn kid-glass-sky rounded-kid px-6 py-2 text-sm">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
