"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ZoneTheme } from "../core/themes";
import { FloatingEmojis } from "./FloatingEmojis";
import { StreakCounter } from "./StreakCounter";
import { isMuted, toggleMute } from "../core/sound";

interface GameShellProps {
  theme: ZoneTheme;
  title: string;
  subtitle?: string;
  progress?: number;
  score?: number;
  streak?: number;
  onClose: () => void;
  onNextGame?: () => void;
  timerSeconds?: number;
  timerTotal?: number;
  children: React.ReactNode;
}

function formatTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function GameShell({
  theme,
  title,
  subtitle,
  progress = 0,
  score,
  streak = 0,
  onClose,
  onNextGame,
  timerSeconds,
  timerTotal,
  children,
}: GameShellProps) {
  const [muted, setMuted] = React.useState(isMuted());
  const isTimerWarning = timerSeconds !== undefined && timerSeconds <= 60;
  const timerPct =
    timerTotal && timerTotal > 0 && timerSeconds !== undefined
      ? (timerSeconds / timerTotal) * 100
      : 0;
  const circumference = 2 * Math.PI * 10;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundImage: theme.pattern,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
      <FloatingEmojis emojis={theme.emojis} count={6} />

      {/* ── Sticky Header ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.82)",
          borderBottom: "2px solid rgba(255,255,255,0.6)",
          boxShadow: "0 3px 18px rgba(0,0,0,0.09)",
        }}
      >
        {/* 🏠 BIG KID-FRIENDLY HOME BUTTON */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 14px",
            borderRadius: 16,
            border: "3px solid rgba(255,255,255,0.8)",
            background: "linear-gradient(135deg, #ff6b9d, #e0456d)",
            cursor: "pointer",
            gap: 1,
            boxShadow:
              "0 6px 20px rgba(224,69,109,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
            minWidth: 66,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>🏠</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "white",
              fontFamily: "Fredoka, sans-serif",
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}
          >
            HOME
          </span>
        </motion.button>

        {/* Game title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "#1c498c",
              fontFamily: "Fredoka, sans-serif",
              margin: 0,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {subtitle.replace(/_/g, " ")}
            </p>
          )}
        </div>

        {/* Right controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* ⏱ Prominent in-game timer */}
          {timerSeconds !== undefined && (
            <motion.div
              animate={
                isTimerWarning
                  ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 18px rgba(239,68,68,0.5)", "0 0 0px rgba(239,68,68,0)"] }
                  : {}
              }
              transition={
                isTimerWarning ? { repeat: Infinity, duration: 0.75 } : {}
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 18,
                background: isTimerWarning
                  ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                  : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                border: `2px solid ${isTimerWarning ? "#fca5a5" : "#86efac"}`,
              }}
            >
              {/* Circular progress ring */}
              <div style={{ position: "relative", width: 26, height: 26 }}>
                <svg
                  width="26"
                  height="26"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    fill="none"
                    stroke={isTimerWarning ? "#fecaca" : "#bbf7d0"}
                    strokeWidth="3"
                  />
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    fill="none"
                    stroke={isTimerWarning ? "#ef4444" : "#22c55e"}
                    strokeWidth="3"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${circumference * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                  }}
                >
                  {isTimerWarning ? "⚠️" : "⏱"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  fontFamily: "Fredoka, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                  color: isTimerWarning ? "#dc2626" : "#16a34a",
                  minWidth: 42,
                }}
              >
                {formatTimer(timerSeconds)}
              </span>
            </motion.div>
          )}

          {streak > 0 && <StreakCounter count={streak} />}

          {score !== undefined && (
            <motion.div
              key={score}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 16,
                backgroundColor: theme.accentLight,
                fontWeight: 700,
                fontSize: 14,
                color: theme.accentColor,
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              ⭐ {score}
            </motion.div>
          )}

          {/* 🔊 Mute button */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              toggleMute();
              setMuted(!muted);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              background: muted ? "#fee2e2" : "#f0fdf4",
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? "🔇" : "🔊"}
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div style={{ position: "relative", zIndex: 10, padding: "0 16px" }}>
          <div
            style={{
              height: 8,
              backgroundColor: "rgba(0,0,0,0.07)",
              borderRadius: 4,
              overflow: "hidden",
              marginTop: 6,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
                boxShadow: `0 0 12px ${theme.accentColor}55`,
              }}
            />
          </div>
        </div>
      )}

      {/* Game Content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          padding: "16px 0",
          paddingBottom: onNextGame ? 88 : 20,
        }}
      >
        {children}
      </div>

      {/* 🔀 Floating SWITCH GAME button */}
      {onNextGame && (
        <motion.button
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.92 }}
          onClick={onNextGame}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 18 }}
          style={{
            position: "fixed",
            bottom: 24,
            right: 20,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: 20,
            border: "3px solid rgba(255,255,255,0.7)",
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            cursor: "pointer",
            gap: 2,
            boxShadow:
              "0 8px 28px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <span style={{ fontSize: 22 }}>🔀</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "white",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            SWITCH
          </span>
        </motion.button>
      )}
    </div>
  );
}
