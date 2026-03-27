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
  onNextGame?: () => void;
}

const BUCKET_COLORS = [
  { bg: "#fff0f5", border: "#ff6b9d", text: "#9f1239", glow: "rgba(255,107,157,0.35)" },
  { bg: "#f0fdf4", border: "#22c55e", text: "#166534", glow: "rgba(34,197,94,0.35)" },
  { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", glow: "rgba(59,130,246,0.35)" },
  { bg: "#fefce8", border: "#eab308", text: "#854d0e", glow: "rgba(234,179,8,0.35)" },
  { bg: "#faf5ff", border: "#a855f7", text: "#6b21a8", glow: "rgba(168,85,247,0.35)" },
  { bg: "#fff7ed", border: "#f97316", text: "#9a3412", glow: "rgba(249,115,22,0.35)" },
];

export function DragSort({ data, onComplete, accentColor = "#379df9", onNextGame }: DragSortProps) {
  const { categories, items, instruction } = data;

  const [phase, setPhase] = useState<"start" | "playing" | "complete">("start");
  const [unsorted, setUnsorted] = useState(() => [...items].sort(() => Math.random() - 0.5));
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

  const handleItemTap = useCallback((itemId: string) => {
    if (processingRef.current) return;
    playTap();
    setSelected((prev) => (prev === itemId ? null : itemId));
  }, []);

  const handleBucketTap = useCallback((categoryId: string) => {
    if (!selected || processingRef.current) return;
    processingRef.current = true;
    playTap();

    const item = items.find((i) => i.id === selected);
    if (!item) { processingRef.current = false; return; }

    const correct = item.category === categoryId;

    if (correct) {
      playDrop();
      setTimeout(() => { playCorrect(); fireMiniBurst(); }, 100);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 2) playStreak(newStreak);

      setCorrectFlash(categoryId);
      setTimeout(() => setCorrectFlash(null), 700);

      const newScore = score + 1;
      setScore(newScore);
      setUnsorted((prev) => prev.filter((i) => i.id !== item.id));
      setBuckets((prev) => ({
        ...prev,
        [categoryId]: [...prev[categoryId], item.id],
      }));
      setSelected(null);

      if (unsorted.length - 1 <= 0) {
        fireConfetti();
        const elapsed = Math.round((Date.now() - timeStartRef.current) / 1000);
        const gameResult = buildGameResult(newScore, items.length, elapsed);
        setResult(gameResult);
        setTimeout(() => { setPhase("complete"); onComplete(gameResult); }, 600);
      }
      processingRef.current = false;
    } else {
      playWrong();
      setStreak(0);
      setWrongShake(categoryId);
      setTimeout(() => { setWrongShake(null); setSelected(null); processingRef.current = false; }, 550);
    }
  }, [selected, items, unsorted.length, score, streak, onComplete]);

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

  const selectedItem = selected ? items.find((i) => i.id === selected) : null;

  /* ── START SCREEN ── */
  if (phase === "start") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ textAlign: "center", padding: "30px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ fontSize: 72, marginBottom: 12 }}
        >
          🎯
        </motion.div>
        <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: "0 0 6px" }}>
          Sort &amp; Match!
        </h2>
        <p style={{ color: "#6b7280", fontSize: 16, fontFamily: "Nunito, sans-serif", fontWeight: 600, maxWidth: 340, lineHeight: 1.5, margin: "0 0 12px" }}>
          {instruction}
        </p>

        {/* Preview categories */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map((cat, ci) => {
            const c = BUCKET_COLORS[ci % BUCKET_COLORS.length]!;
            return (
              <motion.div
                key={cat.id}
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: ci * 0.3 }}
                style={{
                  background: c.bg, border: `3px solid ${c.border}`,
                  borderRadius: 16, padding: "8px 16px",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: c.text }}>{cat.label}</span>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #18b05a)`,
            color: "white", border: "none", padding: "18px 52px",
            borderRadius: 24, fontSize: 20, fontWeight: 800,
            fontFamily: "Fredoka, sans-serif", cursor: "pointer",
            boxShadow: `0 8px 30px ${accentColor}55`,
          }}
        >
          Let&apos;s Sort! 🚀
        </motion.button>
      </motion.div>
    );
  }

  /* ── COMPLETION SCREEN ── */
  if (phase === "complete" && result) {
    return <StarReveal starsEarned={result.starsEarned} score={result.score} maxScore={result.maxScore} accentColor={accentColor} onPlayAgain={handleReset} onNextGame={onNextGame} />;
  }

  /* ── PLAYING ── */
  const progressPct = items.length > 0 ? ((items.length - unsorted.length) / items.length) * 100 : 0;

  return (
    <div style={{ padding: "12px 16px", maxWidth: 680, margin: "0 auto" }}>
      {/* TOP BAR: progress + score + streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#e5e7eb", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${accentColor}, #22c55e)` }}
          />
        </div>
        <span style={{ fontSize: 15, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", minWidth: 50, textAlign: "right" }}>
          {score}/{items.length}
        </span>
      </div>

      {/* STREAK */}
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              textAlign: "center", marginBottom: 8,
              fontSize: 16, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#f59e0b",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: 14, padding: "4px 12px",
              display: "inline-block", margin: "0 auto 8px", width: "fit-content",
            }}
          >
            🔥 {streak} in a row!
          </motion.div>
        )}
      </AnimatePresence>

      {/* CURRENT ITEM — the item the child needs to sort */}
      <div style={{
        background: "linear-gradient(135deg, #fefce8, #fef3c7)",
        border: "3px solid #fcd34d",
        borderRadius: 24, padding: "16px 20px", marginBottom: 14,
        minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(252,211,77,0.3)",
      }}>
        {unsorted.length === 0 ? (
          <motion.p
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontSize: 22, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#22c55e", margin: 0 }}
          >
            ✅ All sorted!
          </motion.p>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "#92400e", margin: "0 0 6px" }}>
              {selected ? "Now tap the right group below! 👇" : "Tap an item to pick it up! 👆"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              <AnimatePresence mode="popLayout">
                {unsorted.map((item, i) => {
                  const isSelected = item.id === selected;
                  return (
                    <motion.button
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: isSelected ? 1.15 : 1,
                        y: isSelected ? -8 : 0,
                      }}
                      exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                      whileHover={!isSelected ? { scale: 1.08 } : {}}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleItemTap(item.id)}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, #fff, #fefce8)"
                          : "linear-gradient(135deg, #fff, #fef9c3)",
                        border: isSelected ? `4px solid ${accentColor}` : "3px solid #fde68a",
                        borderRadius: 18,
                        padding: "10px 14px",
                        cursor: "pointer",
                        textAlign: "center",
                        minWidth: 78,
                        touchAction: "manipulation",
                        boxShadow: isSelected
                          ? `0 8px 24px ${accentColor}44, 0 0 0 4px ${accentColor}22`
                          : "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      <motion.span
                        animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : { y: [0, -3, 0] }}
                        transition={isSelected ? { repeat: Infinity, duration: 0.8 } : { repeat: Infinity, duration: 2 + i * 0.2 }}
                        style={{ fontSize: 32, display: "block", marginBottom: 2 }}
                      >
                        {item.emoji}
                      </motion.span>
                      <span style={{
                        fontSize: 12, fontWeight: 800, display: "block",
                        fontFamily: "Fredoka, sans-serif",
                        color: isSelected ? accentColor : "#78716c",
                      }}>
                        {item.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          style={{
                            position: "absolute", inset: -2, borderRadius: 20,
                            border: `3px solid ${accentColor}`,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* SELECTED ITEM INDICATOR — big floating display */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            style={{
              textAlign: "center", marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{
                background: "white", borderRadius: 20, padding: "8px 20px",
                boxShadow: `0 8px 24px ${accentColor}33`,
                border: `3px solid ${accentColor}`,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ fontSize: 28 }}
              >
                {selectedItem.emoji}
              </motion.span>
              <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: accentColor }}>
                {selectedItem.label}
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ fontSize: 20 }}
              >
                👇
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATEGORY BUCKETS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`,
        gap: 10,
      }}>
        {categories.map((cat, ci) => {
          const c = BUCKET_COLORS[ci % BUCKET_COLORS.length]!;
          const isFlashing = correctFlash === cat.id;
          const isShaking = wrongShake === cat.id;
          const bucketItems = buckets[cat.id] ?? [];

          return (
            <motion.button
              key={cat.id}
              animate={
                isShaking
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : isFlashing
                    ? { scale: [1, 1.04, 1] }
                    : {}
              }
              transition={isShaking ? { duration: 0.5 } : isFlashing ? { duration: 0.4 } : {}}
              whileHover={!isShaking && selected ? { scale: 1.04, y: -4 } : {}}
              whileTap={!isShaking && selected ? { scale: 0.96 } : {}}
              onClick={() => handleBucketTap(cat.id)}
              style={{
                background: isFlashing
                  ? "linear-gradient(135deg, #bbf7d0, #86efac)"
                  : selected
                    ? `linear-gradient(145deg, ${c.bg}, white)`
                    : `linear-gradient(145deg, ${c.bg}, #fafafa)`,
                border: isFlashing
                  ? "4px solid #22c55e"
                  : selected
                    ? `4px solid ${c.border}`
                    : `3px solid ${c.border}55`,
                borderRadius: 22,
                padding: "14px 10px",
                minHeight: 140,
                cursor: selected ? "pointer" : "default",
                touchAction: "manipulation",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: isFlashing
                  ? "0 0 30px rgba(34,197,94,0.4)"
                  : selected
                    ? `0 6px 24px ${c.glow}, inset 0 0 0 2px ${c.border}22`
                    : `0 2px 10px rgba(0,0,0,0.05)`,
                opacity: selected ? 1 : 0.7,
                transition: "opacity 0.3s, border 0.3s",
              }}
            >
              {/* Pulsing ring when item is selected */}
              {selected && !isFlashing && !isShaking && (
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{
                    position: "absolute", inset: -3, borderRadius: 25,
                    border: `3px solid ${c.border}`,
                    pointerEvents: "none",
                  }}
                />
              )}

              <motion.span
                animate={selected ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 32, display: "block", marginBottom: 4 }}
              >
                {cat.emoji}
              </motion.span>
              <p style={{
                fontSize: 14, fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                color: c.text, margin: "0 0 6px",
              }}>
                {cat.label}
              </p>

              {/* Sorted items inside bucket */}
              <div style={{
                display: "flex", gap: 3, justifyContent: "center",
                flexWrap: "wrap", minHeight: 24,
              }}>
                {bucketItems.length > 0
                  ? bucketItems.map((id) => {
                      const sortedItem = items.find((it) => it.id === id);
                      return sortedItem ? (
                        <motion.span
                          key={id}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 12 }}
                          style={{ fontSize: 20 }}
                        >
                          {sortedItem.emoji}
                        </motion.span>
                      ) : null;
                    })
                  : (
                    <motion.span
                      animate={selected ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
                      transition={selected ? { repeat: Infinity, duration: 1.2 } : {}}
                      style={{
                        fontSize: 11, fontWeight: 700,
                        fontFamily: "Nunito, sans-serif",
                        color: c.border, padding: "2px 8px",
                        borderRadius: 8, background: `${c.border}15`,
                      }}
                    >
                      {selected ? "Tap here!" : "Empty"}
                    </motion.span>
                  )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
