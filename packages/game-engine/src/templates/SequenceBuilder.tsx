"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SequenceBuilderData, GameResult } from "../types";
import { buildGameResult } from "../core/scoring";
import { playTap, playCorrect, playWrong, playDrop, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

export interface SequenceBuilderProps {
  data: SequenceBuilderData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

const SHAKE_VARIANTS = {
  idle: { x: 0 },
  shake: {
    x: [0, -12, 12, -10, 10, -6, 6, 0],
    transition: { duration: 0.5 },
  },
};

export function SequenceBuilder({
  data,
  onComplete,
  accentColor = "#379df9",
}: SequenceBuilderProps) {
  const { steps, instruction } = data;

  const [started, setStarted] = useState(false);
  const [shuffled, setShuffled] = useState<typeof steps>([]);
  const [placed, setPlaced] = useState<typeof steps>([]);
  const [gameOver, setGameOver] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [lastWrongId, setLastWrongId] = useState<string | null>(null);

  const resultRef = useRef<GameResult | null>(null);

  const handleStart = useCallback(() => {
    playTap();
    setShuffled([...steps].sort(() => Math.random() - 0.5));
    setPlaced([]);
    setGameOver(false);
    setStarted(true);
    setTimeStart(Date.now());
    setStreakCount(0);
    setLastWrongId(null);
  }, [steps]);

  const handleTap = useCallback(
    (step: (typeof steps)[0]) => {
      if (gameOver || isShaking) return;
      playTap();

      const expectedOrder = placed.length + 1;
      const correct = step.order === expectedOrder;

      if (correct) {
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        playCorrect();
        fireMiniBurst();
        if (newStreak >= 2) playStreak(newStreak);

        const newPlaced = [...placed, step];
        setPlaced(newPlaced);
        setShuffled((prev) => prev.filter((s) => s.id !== step.id));
        setLastWrongId(null);

        if (newPlaced.length === steps.length) {
          const elapsed = Math.round((Date.now() - timeStart) / 1000);
          const result = buildGameResult(steps.length, steps.length, elapsed);
          resultRef.current = result;
          setGameOver(true);
        }
      } else {
        playWrong();
        setLastWrongId(step.id);
        setStreakCount(0);
        setIsShaking(true);
        setShakeKey((k) => k + 1);

        setTimeout(() => {
          setShuffled(
            [...placed, ...shuffled].sort(() => Math.random() - 0.5)
          );
          setPlaced([]);
          setIsShaking(false);
          setLastWrongId(null);
        }, 600);
      }
    },
    [placed, shuffled, steps, gameOver, timeStart, isShaking, streakCount]
  );

  /* ── Start Screen ── */
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          textAlign: "center",
          padding: 40,
          background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
          borderRadius: 28,
          margin: 16,
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" as const }}
          style={{ fontSize: 72, marginBottom: 20 }}
        >
          📋
        </motion.div>

        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#1c498c",
            marginBottom: 10,
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          Put It In Order
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: 32,
            fontSize: 16,
            maxWidth: 340,
            margin: "0 auto 32px",
            fontFamily: "Nunito, sans-serif",
            lineHeight: 1.5,
          }}
        >
          {instruction}
        </p>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #ffbe20, #ffab00)",
            color: "#7a340d",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 21,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(255, 190, 32, 0.4)",
          }}
        >
          Let&apos;s Go!
        </motion.button>
      </motion.div>
    );
  }

  /* ── Completion Screen ── */
  if (gameOver && resultRef.current) {
    return (
      <StarReveal
        starsEarned={resultRef.current.starsEarned}
        score={resultRef.current.score}
        maxScore={resultRef.current.maxScore}
        accentColor={accentColor}
        onPlayAgain={handleStart}
      />
    );
  }

  const progress = steps.length > 0 ? (placed.length / steps.length) * 100 : 0;

  /* ── Playing Screen ── */
  return (
    <div style={{ padding: 24, maxWidth: 540, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#6b7280",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            Step {placed.length}/{steps.length}
          </span>
          {streakCount >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#f59e0b",
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              🔥 {streakCount} streak!
            </motion.span>
          )}
        </div>
        <div
          style={{
            height: 8,
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              height: 8,
              background: `linear-gradient(90deg, ${accentColor}, #22c55e)`,
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: 15,
          color: "#4b5563",
          marginBottom: 20,
          fontWeight: 600,
          fontFamily: "Nunito, sans-serif",
        }}
      >
        Tap the steps in the correct order!
      </p>

      {/* ── YOUR ORDER area ── */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#9ca3af",
            marginBottom: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          Your Order
        </p>

        <motion.div
          key={shakeKey}
          variants={SHAKE_VARIANTS}
          animate={isShaking ? "shake" : "idle"}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <AnimatePresence mode="popLayout">
            {placed.map((step, i) => (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                  border: "2px solid #a7f3d0",
                  borderRadius: 20,
                  padding: "14px 18px",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.15)",
                }}
              >
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 12,
                    delay: 0.1,
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    color: "white",
                    fontWeight: 800,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Fredoka, sans-serif",
                    boxShadow: `0 3px 10px ${accentColor}44`,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </motion.span>
                <span style={{ fontSize: 28 }}>{step.emoji}</span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#065f46",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  {step.label}
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    marginLeft: "auto",
                    fontSize: 18,
                    color: "#10b981",
                  }}
                >
                  ✓
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>

          {placed.length < steps.length && (
            <motion.div
              layout
              animate={{
                borderColor: [
                  "#d1d5db",
                  accentColor + "66",
                  "#d1d5db",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut" as const,
              }}
              style={{
                border: "3px dashed #d1d5db",
                borderRadius: 20,
                padding: "16px 18px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "Nunito, sans-serif",
                background:
                  "linear-gradient(135deg, #f9fafb, #f3f4f6)",
              }}
            >
              Tap step #{placed.length + 1} below ↓
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Available Steps Pool ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="popLayout">
          {shuffled.map((step, i) => {
            const isWrong = lastWrongId === step.id;
            return (
              <motion.button
                key={step.id}
                layout
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: isWrong ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0.4, y: -40 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 22,
                  delay: i * 0.04,
                }}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTap(step)}
                style={{
                  background: isWrong
                    ? "linear-gradient(135deg, #ffe4e6, #fecdd3)"
                    : "linear-gradient(135deg, #ffffff, #f9fafb)",
                  border: isWrong
                    ? "3px solid #f43f5e"
                    : "3px solid #e5e7eb",
                  borderRadius: 20,
                  padding: "14px 22px",
                  cursor: "pointer",
                  textAlign: "center",
                  minWidth: 110,
                  boxShadow: isWrong
                    ? "0 4px 16px rgba(244, 63, 94, 0.25)"
                    : "0 4px 16px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  style={{ fontSize: 34, display: "block", marginBottom: 4 }}
                  animate={
                    isWrong
                      ? { rotate: [0, -10, 10, -5, 5, 0] }
                      : { rotate: 0 }
                  }
                  transition={{ duration: 0.4 }}
                >
                  {step.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isWrong ? "#9f1239" : "#374151",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  {step.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Wrong feedback toast */}
      <AnimatePresence>
        {isShaking && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 20,
              padding: "14px 20px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #fff1f2, #ffe4e6)",
              textAlign: "center",
              border: "2px solid #fecdd3",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#9f1239",
                fontFamily: "Fredoka, sans-serif",
                margin: 0,
              }}
            >
              Oops! Wrong order! 🔀
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 6,
                marginBottom: 0,
                fontFamily: "Nunito, sans-serif",
              }}
            >
              Items shuffled — try again!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
