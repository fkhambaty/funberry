"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DragSortData, GameResult } from "../types";
import { buildGameResult } from "../core/scoring";
import { StarReveal } from "../components/StarReveal";
import {
  playTap,
  playCorrect,
  playWrong,
  playDrop,
  playStreak,
} from "../core/sound";
import { fireMiniBurst, fireConfetti } from "../core/confetti";

export interface DragSortProps {
  data: DragSortData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

const BUCKET_COLORS = ["#ff6b9d", "#18b05a", "#379df9", "#ffbe20", "#8b5cf6", "#f97316"];

const wiggleVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5, ease: "easeInOut" as const },
  },
};

const floatVariants = {
  float: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      repeat: Infinity,
      duration: 2.4 + i * 0.3,
      ease: "easeInOut" as const,
    },
  }),
};

export function DragSort({
  data,
  onComplete,
  accentColor = "#379df9",
}: DragSortProps) {
  const { categories, items, instruction } = data;

  const [phase, setPhase] = useState<"start" | "playing" | "complete">("start");
  const [unsorted, setUnsorted] = useState(() =>
    [...items].sort(() => Math.random() - 0.5)
  );
  const [buckets, setBuckets] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [correctFlash, setCorrectFlash] = useState<string | null>(null);
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);

  const timeStartRef = useRef(0);
  const processingRef = useRef(false);

  const handleStart = useCallback(() => {
    playTap();
    setPhase("playing");
    timeStartRef.current = Date.now();
  }, []);

  const handleItemTap = useCallback(
    (itemId: string) => {
      if (processingRef.current) return;
      playTap();
      setSelected((prev) => (prev === itemId ? null : itemId));
    },
    []
  );

  const handleBucketTap = useCallback(
    (categoryId: string) => {
      if (!selected || processingRef.current) return;
      processingRef.current = true;
      playTap();

      const item = items.find((i) => i.id === selected);
      if (!item) {
        processingRef.current = false;
        return;
      }

      const correct = item.category === categoryId;

      if (correct) {
        playDrop();
        setTimeout(() => {
          playCorrect();
          fireMiniBurst();
        }, 100);

        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 2) playStreak(newStreak);

        setCorrectFlash(categoryId);
        setTimeout(() => setCorrectFlash(null), 600);

        const newScore = score + 1;
        setScore(newScore);
        setUnsorted((prev) => prev.filter((i) => i.id !== item.id));
        setBuckets((prev) => ({
          ...prev,
          [categoryId]: [...prev[categoryId], item.id],
        }));
        setSelected(null);

        const remaining = unsorted.length - 1;
        if (remaining <= 0) {
          fireConfetti();
          const elapsed = Math.round(
            (Date.now() - timeStartRef.current) / 1000
          );
          const gameResult = buildGameResult(newScore, items.length, elapsed);
          setResult(gameResult);
          setTimeout(() => setPhase("complete"), 600);
        }

        processingRef.current = false;
      } else {
        playWrong();
        setStreak(0);
        setWrongShake(categoryId);
        setTimeout(() => {
          setWrongShake(null);
          setSelected(null);
          processingRef.current = false;
        }, 550);
      }
    },
    [selected, items, unsorted.length, score, streak]
  );

  const handleReset = useCallback(() => {
    playTap();
    setUnsorted([...items].sort(() => Math.random() - 0.5));
    setBuckets(Object.fromEntries(categories.map((c) => [c.id, []])));
    setSelected(null);
    setCorrectFlash(null);
    setWrongShake(null);
    setScore(0);
    setStreak(0);
    setResult(null);
    setPhase("playing");
    timeStartRef.current = Date.now();
  }, [items, categories]);

  /* ── START SCREEN ── */
  if (phase === "start") {
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
          gap: 8,
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" as const }}
          style={{ fontSize: 72, marginBottom: 12, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))" }}
        >
          🎯
        </motion.div>

        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            color: "#1c498c",
            margin: "0 0 6px",
            background: "linear-gradient(135deg, #1c498c, #379df9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Sort &amp; Match
        </h2>

        <p
          style={{
            color: "#6b7280",
            fontSize: 16,
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600,
            maxWidth: 320,
            lineHeight: 1.5,
            margin: "0 0 28px",
          }}
        >
          {instruction}
        </p>

        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #18b05a)`,
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: `0 8px 30px ${accentColor}55`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.span
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              borderRadius: 24,
            }}
          />
          Let&apos;s Sort! 🚀
        </motion.button>
      </motion.div>
    );
  }

  /* ── COMPLETION SCREEN ── */
  if (phase === "complete" && result) {
    return (
      <StarReveal
        starsEarned={result.starsEarned}
        score={result.score}
        maxScore={result.maxScore}
        accentColor={accentColor}
        onPlayAgain={handleReset}
      />
    );
  }

  /* ── PLAYING ── */
  const progressPct =
    items.length > 0
      ? ((items.length - unsorted.length) / items.length) * 100
      : 0;

  return (
    <div style={{ padding: "20px 24px", maxWidth: 620, margin: "0 auto" }}>
      {/* Progress bar */}
      <div
        style={{
          height: 10,
          borderRadius: 5,
          background: "#f0f0f0",
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{
            height: "100%",
            borderRadius: 5,
            background: `linear-gradient(90deg, ${accentColor}, #18b05a)`,
          }}
        />
      </div>

      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "Nunito, sans-serif",
          color: "#6b7280",
          marginBottom: 20,
        }}
      >
        {selected ? "Now tap the right bucket! 👇" : "Tap an item to pick it up! ☝️"}
      </motion.p>

      {/* Streak indicator */}
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              textAlign: "center",
              marginBottom: 14,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "Fredoka, sans-serif",
              color: "#f59e0b",
            }}
          >
            🔥 {streak} in a row!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          marginBottom: 28,
          minHeight: 80,
        }}
      >
        <AnimatePresence mode="popLayout">
          {unsorted.map((item, i) => {
            const isSelected = item.id === selected;

            return (
              <motion.button
                key={item.id}
                layout
                custom={i}
                variants={floatVariants}
                animate="float"
                initial={{ opacity: 0, scale: 0, y: 30 }}
                exit={{ opacity: 0, scale: 0, y: -20, transition: { duration: 0.3 } }}
                whileHover={!isSelected ? { scale: 1.05, y: -4 } : {}}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleItemTap(item.id)}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${accentColor}18, ${accentColor}30)`
                    : "linear-gradient(135deg, #ffffff, #f8fafc)",
                  border: `3px solid ${isSelected ? accentColor : "#e5e7eb"}`,
                  borderRadius: 20,
                  padding: "14px 20px",
                  cursor: "pointer",
                  textAlign: "center",
                  minWidth: 100,
                  boxShadow: isSelected
                    ? `0 10px 30px ${accentColor}33, 0 4px 10px rgba(0,0,0,0.08)`
                    : "0 4px 15px rgba(0,0,0,0.06)",
                  transform: isSelected ? "translateY(-4px)" : undefined,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="item-glow"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 17,
                      background: `radial-gradient(circle at center, ${accentColor}15, transparent 70%)`,
                    }}
                  />
                )}
                <motion.span
                  animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                  transition={isSelected ? { repeat: Infinity, duration: 1 } : {}}
                  style={{ fontSize: 36, display: "block", marginBottom: 4 }}
                >
                  {item.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isSelected ? accentColor : "#374151",
                    fontFamily: "Nunito, sans-serif",
                    display: "block",
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Category buckets */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`,
          gap: 14,
        }}
      >
        {categories.map((cat, ci) => {
          const bucketColor = BUCKET_COLORS[ci % BUCKET_COLORS.length];
          const isFlashing = correctFlash === cat.id;
          const isShaking = wrongShake === cat.id;
          const itemCount = buckets[cat.id]?.length ?? 0;

          return (
            <motion.button
              key={cat.id}
              variants={isShaking ? wiggleVariants : undefined}
              animate={isShaking ? "shake" : {}}
              whileHover={!isShaking ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isShaking ? { scale: 0.97 } : {}}
              onClick={() => handleBucketTap(cat.id)}
              style={{
                background: isFlashing
                  ? "linear-gradient(135deg, #d1fae5, #bbf7d0)"
                  : `linear-gradient(135deg, ${bucketColor}08, ${bucketColor}15)`,
                border: `3px dashed ${isFlashing ? "#22c55e" : selected ? bucketColor : "#d1d5db"}`,
                borderRadius: 22,
                padding: "18px 12px",
                minHeight: 130,
                cursor: "pointer",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: isFlashing
                  ? "0 0 30px rgba(34,197,94,0.3)"
                  : selected
                    ? `0 0 20px ${bucketColor}22, 0 4px 15px rgba(0,0,0,0.06)`
                    : "0 4px 15px rgba(0,0,0,0.04)",
              }}
            >
              {/* Pulsing ring when item is selected */}
              {selected && !isFlashing && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: 24,
                    border: `3px solid ${bucketColor}`,
                    pointerEvents: "none",
                  }}
                />
              )}

              <motion.span
                animate={selected ? { scale: [1, 1.1, 1] } : {}}
                transition={selected ? { repeat: Infinity, duration: 1.5 } : {}}
                style={{ fontSize: 34, display: "block", marginBottom: 6 }}
              >
                {cat.emoji}
              </motion.span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: "Fredoka, sans-serif",
                  color: "#374151",
                  margin: "0 0 4px",
                }}
              >
                {cat.label}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 6,
                }}
              >
                {itemCount > 0
                  ? buckets[cat.id].map((id) => {
                      const sortedItem = items.find((it) => it.id === id);
                      return sortedItem ? (
                        <motion.span
                          key={id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 12 }}
                          style={{ fontSize: 18 }}
                        >
                          {sortedItem.emoji}
                        </motion.span>
                      ) : null;
                    })
                  : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "Nunito, sans-serif",
                        color: "#9ca3af",
                      }}
                    >
                      Drop here
                    </span>
                  )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Score display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "Nunito, sans-serif",
          color: "#9ca3af",
        }}
      >
        {score}/{items.length} sorted
      </motion.div>
    </div>
  );
}
