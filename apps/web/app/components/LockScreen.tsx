"use client";

import { useState } from "react";
import { useTimer } from "./TimerProvider";
import { brand } from "@funberry/config";

export function LockScreen() {
  const { timer, unlock } = useTimer();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!timer.isLocked) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = unlock(pin);
    if (!ok) {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        const ok = unlock(next);
        if (!ok) {
          setError(true);
          setShake(true);
          setPin("");
          setTimeout(() => setShake(false), 500);
        }
      }, 150);
    }
  }

  function handleBackspace() {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-sky-900 to-sky-800">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Time&apos;s Up!
        </h1>
        <p className="text-sky-200 mb-8">
          Ask a parent to enter the PIN to continue using {brand.name}
        </p>

        <form onSubmit={handleSubmit}>
          <div
            className={`flex justify-center gap-4 mb-6 ${shake ? "animate-shake" : ""}`}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: pin[i] ? "white" : "rgba(255,255,255,0.15)",
                  color: "#1c498c",
                  border: error ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.3)",
                }}
              >
                {pin[i] ? "●" : ""}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-300 text-sm font-bold mb-4">
              Wrong PIN. Try again.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map(
              (key) =>
                key === "" ? (
                  <div key="empty" />
                ) : key === "←" ? (
                  <button
                    key="back"
                    type="button"
                    onClick={handleBackspace}
                    className="w-16 h-16 rounded-2xl text-xl font-bold text-white bg-white/10 hover:bg-white/20 transition mx-auto flex items-center justify-center"
                  >
                    ←
                  </button>
                ) : (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDigit(key)}
                    className="w-16 h-16 rounded-2xl text-2xl font-bold text-white bg-white/15 hover:bg-white/25 transition mx-auto flex items-center justify-center"
                  >
                    {key}
                  </button>
                )
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
