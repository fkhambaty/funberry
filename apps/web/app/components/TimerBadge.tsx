"use client";

import { motion } from "framer-motion";
import { useTimer } from "./TimerProvider";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TimerBadge() {
  const { timer } = useTimer();

  if (!timer.isActive || timer.isLocked || timer.isPaused) return null;

  const pct = timer.totalSeconds > 0 ? (timer.remainingSeconds / timer.totalSeconds) * 100 : 0;
  const isWarning = timer.remainingSeconds <= 120;
  const isCritical = timer.remainingSeconds <= 60;
  const ringR = 11;
  const circumference = 2 * Math.PI * ringR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isCritical ? [1, 1.06, 1] : 1,
      }}
      transition={
        isCritical
          ? { scale: { repeat: Infinity, duration: 0.9, ease: "easeInOut" } }
          : { duration: 0.3 }
      }
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px 5px 6px",
        borderRadius: 30,
        pointerEvents: "none",
        userSelect: "none",
        backgroundColor: isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#f0fdf4",
        border: `2px solid ${isCritical ? "#fca5a5" : isWarning ? "#fcd34d" : "#86efac"}`,
        boxShadow: isCritical
          ? "0 2px 12px rgba(239,68,68,0.3)"
          : isWarning
          ? "0 2px 10px rgba(245,158,11,0.2)"
          : "0 2px 8px rgba(34,197,94,0.15)",
      }}
    >
      <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="14" cy="14" r={ringR}
            fill="none"
            stroke={isCritical ? "#fecaca" : isWarning ? "#fde68a" : "#bbf7d0"}
            strokeWidth="3"
          />
          <circle
            cx="14" cy="14" r={ringR}
            fill="none"
            stroke={isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e"}
            strokeWidth="3"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10,
        }}>
          {isCritical ? "🔥" : isWarning ? "⏳" : "⏱️"}
        </span>
      </div>

      <span style={{
        fontSize: 14,
        fontWeight: 800,
        fontFamily: "Fredoka, sans-serif",
        fontVariantNumeric: "tabular-nums",
        color: isCritical ? "#dc2626" : isWarning ? "#b45309" : "#16a34a",
        lineHeight: 1,
      }}>
        {formatTime(timer.remainingSeconds)}
      </span>
    </motion.div>
  );
}
