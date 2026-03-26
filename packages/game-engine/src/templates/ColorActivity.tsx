"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ColorActivityData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { StarReveal } from "../components/StarReveal";
import { playTap, playCorrect, playWrong, playPaint, playSparkle, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";

export interface ColorActivityProps {
  data: ColorActivityData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

function normalizeColor(c: string): string {
  return c.trim().toLowerCase();
}

const wiggle = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.5, ease: "easeInOut" as const },
};

const sparkles = ["✨", "⭐", "💫", "🌟"];

function SparkleOverlay({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: 20,
      }}
    >
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.3, 0],
            x: `${20 + Math.random() * 60}%`,
            y: `${10 + Math.random() * 80}%`,
          }}
          transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" as const }}
          style={{ position: "absolute", fontSize: 20, filter: `drop-shadow(0 0 4px ${color})` }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

export function ColorActivity({ data, onComplete, accentColor = "#379df9" }: ColorActivityProps) {
  const { instruction, palette, regions } = data;
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState<"palette" | "answer" | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [sparkleId, setSparkleId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const regionById = useMemo(
    () => Object.fromEntries(regions.map((r) => [r.id, r])),
    [regions],
  );

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: regions.length,
    onComplete,
  });

  const paintedCount = Object.keys(filled).length;

  const handleStart = useCallback(() => {
    playTap();
    setSelectedColor(null);
    setFilled({});
    setShowFeedback(false);
    setFeedbackKind(null);
    setShakeId(null);
    setSparkleId(null);
    setStreak(0);
    setHintVisible(false);
    start();
  }, [start]);

  const handleColorSelect = useCallback(
    (c: string) => {
      if (showFeedback) return;
      playTap();
      setSelectedColor(c);
      setHintVisible(false);
    },
    [showFeedback],
  );

  const handleRegionTap = useCallback(
    (regionId: string) => {
      if (showFeedback || !isPlaying) return;
      playTap();

      const region = regionById[regionId];
      if (!region || filled[regionId]) return;

      if (!selectedColor) {
        setHintVisible(true);
        setFeedbackKind("palette");
        setShowFeedback(true);
        window.setTimeout(() => {
          setShowFeedback(false);
          setFeedbackKind(null);
        }, 1200);
        return;
      }

      const correct = normalizeColor(selectedColor) === normalizeColor(region.correctColor);
      setLastCorrect(correct);
      setFeedbackKind("answer");

      if (correct) {
        playPaint();
        setTimeout(() => playSparkle(), 200);
        fireMiniBurst();
        setFilled((prev) => ({ ...prev, [regionId]: selectedColor }));
        setSparkleId(regionId);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 2) playStreak(newStreak);
        setTimeout(() => setSparkleId(null), 800);
      } else {
        playWrong();
        setShakeId(regionId);
        setStreak(0);
        setTimeout(() => setShakeId(null), 500);
      }

      setShowFeedback(true);

      window.setTimeout(() => {
        if (correct) {
          answerQuestion(regionId, true);
        } else {
          answerQuestion(regionId, false);
        }
        setShowFeedback(false);
        setFeedbackKind(null);
        setSelectedColor(null);
      }, 1300);
    },
    [showFeedback, isPlaying, regionById, filled, selectedColor, answerQuestion, streak],
  );

  /* ── Start Screen ── */
  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          textAlign: "center",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" as const }}
          style={{ fontSize: 72, marginBottom: 20, filter: "drop-shadow(0 6px 12px rgba(249,115,22,0.3))" }}
        >
          🎨
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            color: "#1c498c",
            marginBottom: 10,
            background: "linear-gradient(135deg, #f97316, #fb923c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Color Fun
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            color: "#6b7280",
            marginBottom: 32,
            fontSize: 17,
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600,
            maxWidth: 340,
            lineHeight: 1.5,
          }}
        >
          {instruction}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.06, boxShadow: "0 10px 30px rgba(249,115,22,0.35)" }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #f97316, #fb923c)",
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(249,115,22,0.3)",
          }}
        >
          Start Coloring!
        </motion.button>
      </motion.div>
    );
  }

  /* ── Completion Screen ── */
  if (isCompleted) {
    return (
      <StarReveal
        starsEarned={state.starsEarned}
        score={state.score}
        maxScore={state.maxScore}
        accentColor={accentColor}
        onPlayAgain={() => {
          playTap();
          reset();
          setStreak(0);
          setFilled({});
        }}
      />
    );
  }

  /* ── Playing Screen ── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px 24px", maxWidth: 560, margin: "0 auto" }}
    >
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#9a3412", fontFamily: "Nunito, sans-serif" }}>
            🎨 {paintedCount}/{regions.length} painted
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#9a3412", fontFamily: "Nunito, sans-serif" }}>
            ⭐ {state.score}
            {streak >= 2 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontWeight: 800,
                }}
              >
                {streak}x
              </motion.span>
            )}
          </span>
        </div>
        <div
          style={{
            height: 10,
            backgroundColor: "#fed7aa",
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(paintedCount / regions.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: 10,
              background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)",
              borderRadius: 5,
            }}
          />
        </div>
      </div>

      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          color: "#4b5563",
          marginBottom: 20,
          fontWeight: 700,
          fontFamily: "Nunito, sans-serif",
          fontSize: 16,
        }}
      >
        Pick a color below, then tap a part to paint it!
      </motion.p>

      {/* Regions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {regions.map((region, i) => {
          const paint = filled[region.id];
          const isShaking = shakeId === region.id;
          const isSparkling = sparkleId === region.id;
          const isDone = !!paint;

          return (
            <motion.button
              key={region.id}
              initial={{ opacity: 0, x: -30 }}
              animate={
                isShaking
                  ? { opacity: 1, x: wiggle.x }
                  : { opacity: 1, x: 0 }
              }
              transition={
                isShaking
                  ? wiggle.transition
                  : { delay: i * 0.06, type: "spring", stiffness: 300, damping: 22 }
              }
              whileHover={!isDone && !showFeedback ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isDone && !showFeedback ? { scale: 0.97 } : {}}
              onClick={() => handleRegionTap(region.id)}
              disabled={isDone || showFeedback}
              style={{
                position: "relative",
                minHeight: 76,
                borderRadius: 20,
                border: `3px solid ${isDone ? paint : selectedColor && !isDone ? selectedColor + "88" : "#e5e7eb"}`,
                cursor: isDone || showFeedback ? "default" : "pointer",
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                color: isDone ? "#ffffff" : "#1c498c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                overflow: "hidden",
                boxShadow: isDone
                  ? `0 4px 16px ${paint}44, inset 0 2px 8px rgba(255,255,255,0.3)`
                  : "0 4px 15px rgba(0,0,0,0.06)",
                padding: 0,
                textShadow: isDone ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                background: "white",
              }}
            >
              {/* Color fill overlay with animated transition */}
              <motion.div
                initial={false}
                animate={{
                  scaleX: isDone ? 1 : 0,
                  backgroundColor: paint || "transparent",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "left center",
                  borderRadius: 17,
                  zIndex: 0,
                }}
              />

              <span style={{ position: "relative", zIndex: 1 }}>
                {isDone && <span style={{ marginRight: 8 }}>✅</span>}
                {region.label}
              </span>

              {isSparkling && <SparkleOverlay color={paint || "#fbbf24"} />}
            </motion.button>
          );
        })}
      </div>

      {/* Color Palette Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        style={{
          padding: "20px 20px 24px",
          borderRadius: 24,
          background: "linear-gradient(145deg, #fff7ed, #fffbeb)",
          border: "2px solid #fed7aa",
          boxShadow: "0 8px 30px rgba(249,115,22,0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontWeight: 800,
            color: "#9a3412",
            textAlign: "center",
            fontFamily: "Fredoka, sans-serif",
            fontSize: 18,
          }}
        >
          🎨 Color Palette
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {palette.map((c, i) => {
            const picked = selectedColor === c;
            return (
              <motion.button
                key={c}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 400, damping: 15 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorSelect(c)}
                disabled={showFeedback}
                aria-label={`Select color ${c}`}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: c,
                  border: picked ? "4px solid #1c498c" : "3px solid white",
                  boxShadow: picked
                    ? `0 0 0 3px ${c}, 0 0 20px ${c}66, 0 4px 12px rgba(0,0,0,0.15)`
                    : `0 3px 10px rgba(0,0,0,0.12)`,
                  cursor: showFeedback ? "default" : "pointer",
                  padding: 0,
                  transform: picked ? "scale(1.15)" : undefined,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative",
                }}
              >
                {picked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: "50%",
                      border: `2px solid ${c}`,
                      opacity: 0.5,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {showFeedback && feedbackKind === "palette" && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 20,
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              textAlign: "center",
              border: "2px solid #fde68a",
              boxShadow: "0 4px 16px rgba(251,191,36,0.15)",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                color: "#92400e",
                margin: 0,
                fontFamily: "Fredoka, sans-serif",
                fontSize: 17,
              }}
            >
              Choose a color first! 🌈
            </p>
          </motion.div>
        )}

        {showFeedback && feedbackKind === "answer" && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 20,
              background: lastCorrect
                ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                : "linear-gradient(135deg, #fff1f2, #ffe4e6)",
              textAlign: "center",
              border: `2px solid ${lastCorrect ? "#a7f3d0" : "#fecdd3"}`,
              boxShadow: lastCorrect
                ? "0 4px 16px rgba(16,185,129,0.15)"
                : "0 4px 16px rgba(244,63,94,0.15)",
            }}
          >
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: lastCorrect ? "#065f46" : "#9f1239",
                fontFamily: "Fredoka, sans-serif",
                margin: 0,
              }}
            >
              {lastCorrect ? "Perfect color! 🎨✨" : "Oops, not that one! 🤔"}
            </motion.p>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginTop: 6,
                marginBottom: 0,
                fontFamily: "Nunito, sans-serif",
                fontWeight: 600,
              }}
            >
              {lastCorrect ? "Beautiful painting coming together!" : "Try another color next time!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
