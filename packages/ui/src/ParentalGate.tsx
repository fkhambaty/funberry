"use client";

import React, { useState, useMemo } from "react";

export interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParentalGate({ onSuccess, onCancel }: ParentalGateProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const { a, b, correctAnswer } = useMemo(() => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 20) + 10;
    return { a, b, correctAnswer: a + b };
  }, []);

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
      <p className="text-lg font-bold text-gray-700">
        Parents Only
      </p>
      <p className="text-sm text-gray-500">
        Solve this to continue. This keeps kids safe!
      </p>
      <p className="text-3xl font-bold text-[#1c498c] font-[Fredoka,sans-serif]">
        {a} + {b} = ?
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="number"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(false);
          }}
          className={`w-32 text-center text-2xl font-bold p-3 rounded-2xl border-2 outline-none transition ${
            error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 focus:border-[#379df9]"
          }`}
          autoFocus
          placeholder="?"
        />
        {error && (
          <p className="text-sm text-red-500 font-semibold">
            That&apos;s not right. Try again!
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-2xl bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-2xl bg-[#379df9] text-white font-bold text-sm hover:bg-[#2180ee] transition"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
