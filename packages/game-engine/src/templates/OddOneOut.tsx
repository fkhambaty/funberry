"use client";

/**
 * 🔍 ODD ONE OUT
 * Show a grid of items. One doesn't belong. Kid taps the odd one.
 * Multiple rounds. Clean, reliable, impossible to break.
 */

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OddOneOutData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { StarReveal } from "../components/StarReveal";
import { playCorrect, playWrong, playTap, playStreak } from "../core/sound";
import { fireMiniBurst, fireSparkleAt } from "../core/confetti";

export interface OddOneOutProps {
  data: OddOneOutData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function OddOneOut({ data, onComplete, accentColor = "#379df9", onNextGame }: OddOneOutProps) {
  const { instruction, rounds } = data;

  const [shuffledRounds] = useState(() => shuffleArray(rounds));

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: rounds.length,
    onComplete,
  });

  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentRound = shuffledRounds[roundIdx];
  const shuffledItems = useMemo(
    () => (currentRound ? shuffleArray(currentRound.items) : []),
    [currentRound]
  );

  const handleStart = useCallback(() => {
    playTap();
    setRoundIdx(0);
    setSelected(null);
    setShowResult(false);
    setStreak(0);
    start();
  }, [start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    setRoundIdx(0);
    setSelected(null);
    setShowResult(false);
    setStreak(0);
    reset();
  }, [reset]);

  const handleItemTap = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      if (!isPlaying || selected) return;
      playTap();
      setSelected(itemId);

      const isCorrect = itemId === currentRound.oddId;

      if (isCorrect) {
        playCorrect();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        fireSparkleAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        fireMiniBurst();
        setStreak((s) => s + 1);
        if (streak >= 2) playStreak();
      } else {
        playWrong();
        setStreak(0);
      }

      setShowResult(true);
      answerQuestion(currentRound.id, isCorrect);

      setTimeout(() => {
        setSelected(null);
        setShowResult(false);
        setRoundIdx((i) => i + 1);
      }, 1800);
    },
    [isPlaying, selected, currentRound, answerQuestion, streak]
  );

  /* ── Start Screen ── */
  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center", padding: "40px 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ fontSize: 72, marginBottom: 12 }}
        >
          🔍
        </motion.div>

        <h2 style={{
          fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
          color: "#1c498c", marginBottom: 8,
        }}>
          Odd One Out!
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            borderRadius: 20, padding: "14px 24px", marginBottom: 20,
            maxWidth: 340, border: "2px solid #fbbf24",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "#78350f", margin: 0 }}>
            {instruction}
          </p>
        </motion.div>

        <p style={{
          color: "#6b7280", marginBottom: 28, fontSize: 15,
          fontFamily: "Nunito, sans-serif", fontWeight: 600,
        }}>
          Find the one that doesn&apos;t belong! 👆
        </p>

        <motion.button
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            color: "white", border: "none", padding: "18px 56px", borderRadius: 28,
            fontSize: 22, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            cursor: "pointer", boxShadow: `0 8px 28px ${accentColor}55`,
          }}
        >
          🔍 Let&apos;s Go!
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
        onPlayAgain={handlePlayAgain}
        onNextGame={onNextGame}
      />
    );
  }

  /* ── Playing Screen ── */
  if (!currentRound) return null;

  const progress = rounds.length > 0 ? ((roundIdx) / rounds.length) * 100 : 0;

  return (
    <div style={{ padding: "16px 20px", maxWidth: 500, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: "0 0 4px" }}>
          Round {roundIdx + 1} of {rounds.length}
        </p>
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", maxWidth: 280, margin: "0 auto" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: 8, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentRound.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center", marginBottom: 20,
          background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
          borderRadius: 20, padding: "16px 20px", border: "2px solid #bfdbfe",
        }}
      >
        <p style={{
          fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
          color: "#1e40af", margin: "0 0 4px",
        }}>
          Which one doesn&apos;t belong?
        </p>
        <p style={{ fontSize: 14, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
          They&apos;re all {currentRound.category} — except one! 🤔
        </p>
      </motion.div>

      {/* Grid of items */}
      <div style={{
        display: "grid",
        gridTemplateColumns: shuffledItems.length <= 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: 12, marginBottom: 16,
      }}>
        <AnimatePresence mode="wait">
          {shuffledItems.map((item, i) => {
            const isOdd = item.id === currentRound.oddId;
            const isSelected = selected === item.id;
            const isRevealed = showResult;
            const isCorrectPick = isSelected && isOdd;
            const isWrongPick = isSelected && !isOdd;
            const isHighlightedOdd = isRevealed && isOdd && !isSelected;

            let borderColor = "#e5e7eb";
            let bg = "white";
            if (isCorrectPick) { borderColor = "#10b981"; bg = "#ecfdf5"; }
            else if (isWrongPick) { borderColor = "#ef4444"; bg = "#fef2f2"; }
            else if (isHighlightedOdd) { borderColor = "#f59e0b"; bg = "#fffbeb"; }

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1, scale: 1,
                  ...(isWrongPick ? { x: [0, -6, 6, -4, 0] } : {}),
                }}
                transition={{
                  opacity: { delay: i * 0.06, duration: 0.25 },
                  scale: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
                  x: { duration: 0.4, ease: "easeOut" },
                }}
                whileHover={!selected ? { scale: 1.06, y: -4 } : {}}
                whileTap={!selected ? { scale: 0.94 } : {}}
                onClick={(e) => handleItemTap(item.id, e)}
                disabled={!!selected}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  padding: "20px 12px", borderRadius: 20,
                  border: `3px solid ${borderColor}`,
                  background: bg,
                  cursor: selected ? "default" : "pointer",
                  boxShadow: isCorrectPick
                    ? "0 4px 16px rgba(16,185,129,0.3)"
                    : isWrongPick
                      ? "0 4px 16px rgba(239,68,68,0.2)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                }}
              >
                <span style={{ fontSize: 40 }}>{item.emoji}</span>
                <span style={{
                  fontSize: 13, fontWeight: 800, fontFamily: "Fredoka, sans-serif",
                  color: "#374151",
                }}>
                  {item.label}
                </span>
                {isCorrectPick && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: 20 }}
                  >
                    ✅
                  </motion.span>
                )}
                {isWrongPick && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: 20 }}
                  >
                    ❌
                  </motion.span>
                )}
                {isHighlightedOdd && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b" }}
                  >
                    ← This one!
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Explanation (shown after selection) */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: "center", padding: "12px 16px", borderRadius: 16,
              background: selected === currentRound.oddId
                ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                : "linear-gradient(135deg, #fef2f2, #fecaca)",
              border: `2px solid ${selected === currentRound.oddId ? "#a7f3d0" : "#fca5a5"}`,
            }}
          >
            <p style={{
              fontSize: 14, fontWeight: 800, fontFamily: "Fredoka, sans-serif",
              color: selected === currentRound.oddId ? "#065f46" : "#991b1b",
              margin: "0 0 4px",
            }}>
              {selected === currentRound.oddId ? "🎉 Correct!" : "😅 Not quite!"}
            </p>
            <p style={{ fontSize: 13, color: "#4b5563", fontFamily: "Nunito, sans-serif", fontWeight: 600, margin: 0 }}>
              {currentRound.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak indicator */}
      {streak >= 2 && !showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", marginTop: 8 }}
        >
          <span style={{
            fontSize: 14, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            color: "#f59e0b",
            background: "#fffbeb", padding: "4px 12px", borderRadius: 12,
            border: "2px solid #fcd34d",
          }}>
            🔥 {streak} streak!
          </span>
        </motion.div>
      )}
    </div>
  );
}
