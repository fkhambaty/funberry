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

  if (!timer.isActive || timer.isLocked) return null;

  const pct = timer.totalSeconds > 0 ? (timer.remainingSeconds / timer.totalSeconds) * 100 : 0;
  const isWarning = timer.remainingSeconds <= 60;
  const isCritical = timer.remainingSeconds <= 30;
  const circumference = 2 * Math.PI * 12;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={
        isCritical
          ? { opacity: 1, scale: [1, 1.08, 1], y: 0 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      transition={
        isCritical
          ? { repeat: Infinity, duration: 0.6 }
          : { duration: 0.3 }
      }
      className="fixed top-3 right-3 z-50 flex items-center gap-2.5 px-3 py-2 rounded-full shadow-lg"
      style={{
        backgroundColor: isCritical ? "#fee2e2" : isWarning ? "#fff7ed" : "#f0fdf4",
        border: `2px solid ${isCritical ? "#fca5a5" : isWarning ? "#fed7aa" : "#bbf7d0"}`,
        boxShadow: isCritical
          ? "0 0 20px rgba(239,68,68,0.35)"
          : isWarning
          ? "0 0 12px rgba(249,115,22,0.25)"
          : "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      {/* Circular progress ring */}
      <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="14" cy="14" r="12"
            fill="none"
            stroke={isCritical ? "#fecaca" : isWarning ? "#fed7aa" : "#bbf7d0"}
            strokeWidth="3"
          />
          <circle
            cx="14" cy="14" r="12"
            fill="none"
            stroke={isCritical ? "#ef4444" : isWarning ? "#f97316" : "#22c55e"}
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
          {isCritical ? "🔥" : isWarning ? "⚠️" : "⏱"}
        </span>
      </div>

      <span
        className="text-sm font-bold font-mono"
        style={{
          color: isCritical ? "#dc2626" : isWarning ? "#c2410c" : "#16a34a",
          minWidth: 36,
        }}
      >
        {formatTime(timer.remainingSeconds)}
      </span>
    </motion.div>
  );
}
