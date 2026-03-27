"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpotDifferenceData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { playTap, playSparkle, playWrong } from "../core/sound";
import { fireSparkleAt } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

export interface SpotDifferenceProps {
  data: SpotDifferenceData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
}

function parseSceneCells(image: string): string[] {
  return image.trim().split(/\s+/).filter(Boolean);
}

function SceneGrid({
  cells,
  borderColor,
  label,
}: {
  cells: string[];
  borderColor: string;
  label: string;
}) {
  const cols = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(cells.length))));
  return (
    <div>
      <p
        style={{
          textAlign: "center",
          fontWeight: 800,
          color: "#1c498c",
          marginBottom: 8,
          fontSize: 14,
          fontFamily: "Fredoka, sans-serif",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 6,
          padding: 12,
          background: "linear-gradient(145deg, #ffffff, #f9fafb)",
          borderRadius: 20,
          border: `3px solid ${borderColor}`,
          minHeight: 160,
          alignContent: "start",
          boxShadow: `0 4px 16px ${borderColor}22`,
        }}
      >
        {cells.map((cell, i) => (
          <motion.div
            key={`${cell}-${i}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
            style={{
              fontSize: 26,
              textAlign: "center",
              padding: 6,
              borderRadius: 12,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {cell}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const CIRCLE_HUE_COLORS = [
  "#f43f5e", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899",
  "#10b981", "#6366f1", "#ef4444", "#14b8a6", "#a855f7",
];

export function SpotDifference({
  data,
  onComplete,
  accentColor = "#379df9",
  onNextGame,
}: SpotDifferenceProps) {
  const { instruction, imageA, imageB, differences } = data;
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const foundRef = useRef<Set<string>>(new Set());
  const [hintWrong, setHintWrong] = useState(false);
  const [panelBEl, setPanelBEl] = useState<HTMLDivElement | null>(null);
  const [lastFoundId, setLastFoundId] = useState<string | null>(null);

  const cellsA = useMemo(() => parseSceneCells(imageA), [imageA]);
  const cellsB = useMemo(() => parseSceneCells(imageB), [imageB]);

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } =
    useGameState({
      totalQuestions: Math.max(differences.length, 1),
      onComplete,
    });

  const handleStart = useCallback(() => {
    playTap();
    foundRef.current = new Set();
    setFoundIds(new Set());
    setHintWrong(false);
    setLastFoundId(null);
    start();
  }, [start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    foundRef.current = new Set();
    setFoundIds(new Set());
    setHintWrong(false);
    setLastFoundId(null);
    reset();
  }, [reset]);

  const handlePanelBPointer = useCallback(
    (e: React.MouseEvent) => {
      if (!panelBEl || !isPlaying) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      const rect = panelBEl.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * 100;
      const py = ((clientY - rect.top) / rect.height) * 100;

      for (const d of differences) {
        if (foundRef.current.has(d.id)) continue;
        const dx = px - d.x;
        const dy = py - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= d.radius) {
          playSparkle();
          fireSparkleAt(clientX, clientY);
          foundRef.current.add(d.id);
          setFoundIds(new Set(foundRef.current));
          setHintWrong(false);
          setLastFoundId(d.id);
          answerQuestion(d.id, true);
          return;
        }
      }

      playWrong();
      setHintWrong(true);
      window.setTimeout(() => setHintWrong(false), 1200);
    },
    [panelBEl, isPlaying, differences, answerQuestion]
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
          background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)",
          borderRadius: 28,
          margin: 16,
        }}
      >
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 8, -8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" as const }}
          style={{ fontSize: 72, marginBottom: 20 }}
        >
          🔎
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
          Spot the Difference
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: 32,
            fontSize: 16,
            maxWidth: 360,
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
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 21,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(139, 92, 246, 0.4)",
          }}
        >
          Start Game!
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
  const progressPct =
    differences.length > 0 ? (foundIds.size / differences.length) * 100 : 0;

  return (
    <div style={{ padding: 20, maxWidth: 740, margin: "0 auto" }}>
      {/* Progress header */}
      <div style={{ marginBottom: 18 }}>
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
            Found {foundIds.size}/{differences.length}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#6b7280",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            ⭐ {state.score}
          </span>
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
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              height: 8,
              background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#4b5563",
          marginBottom: 16,
          fontWeight: 700,
          fontSize: 15,
          fontFamily: "Nunito, sans-serif",
        }}
      >
        Tap the circles on Picture B where something is different!
      </p>

      {/* Two panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Picture A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <SceneGrid cells={cellsA} borderColor="#e5e7eb" label="Picture A" />
        </motion.div>

        {/* Picture B with interactive circles */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1,
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontWeight: 800,
              color: "#7c3aed",
              marginBottom: 8,
              fontSize: 14,
              fontFamily: "Fredoka, sans-serif",
              letterSpacing: 0.5,
            }}
          >
            Picture B
          </p>
          <div
            ref={setPanelBEl}
            onClick={handlePanelBPointer}
            style={{
              position: "relative",
              cursor: "pointer",
              borderRadius: 20,
              touchAction: "manipulation",
            }}
          >
            {/* Grid inside B */}
            <SceneGridInner cells={cellsB} borderColor="#c4b5fd" />

            {/* Difference circles */}
            {differences.map((d, i) => {
              const found = foundIds.has(d.id);
              const color =
                CIRCLE_HUE_COLORS[i % CIRCLE_HUE_COLORS.length];
              const justFound = lastFoundId === d.id;

              return (
                <motion.div
                  key={d.id}
                  title={d.label}
                  initial={false}
                  animate={
                    found
                      ? {
                          scale: justFound ? [1, 1.3, 1] : 1,
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.2)",
                        }
                      : {
                          scale: [1, 1.08, 1],
                          borderColor: [
                            color,
                            color + "88",
                            color,
                          ],
                        }
                  }
                  transition={
                    found
                      ? { duration: 0.4 }
                      : {
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeInOut" as const,
                        }
                  }
                  style={{
                    position: "absolute",
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: `${d.radius * 2}%`,
                    height: `${d.radius * 2}%`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    border: found
                      ? "4px solid #10b981"
                      : `4px dashed ${color}`,
                    backgroundColor: found
                      ? "rgba(16, 185, 129, 0.2)"
                      : `${color}18`,
                    pointerEvents: "none",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AnimatePresence>
                    {found && (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 12,
                        }}
                        style={{
                          fontSize: 18,
                          color: "#10b981",
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Found label pop */}
      <AnimatePresence>
        {lastFoundId && foundIds.has(lastFoundId) && (
          <motion.div
            key={lastFoundId}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              textAlign: "center",
              border: "2px solid #a7f3d0",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#065f46",
                fontFamily: "Fredoka, sans-serif",
                margin: 0,
              }}
            >
              Found it! ✨{" "}
              {differences.find((d) => d.id === lastFoundId)?.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong hint */}
      <AnimatePresence>
        {hintWrong && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: [0, -6, 6, -4, 4, 0],
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              opacity: { duration: 0.2 },
              y: { duration: 0.25, ease: "easeOut" },
              scale: { duration: 0.25, ease: "easeOut" },
              x: { duration: 0.5, ease: "easeInOut" },
            }}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 20,
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              textAlign: "center",
              border: "2px solid #fed7aa",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#c2410c",
                fontFamily: "Fredoka, sans-serif",
                margin: 0,
              }}
            >
              Keep looking! 👀
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
              Tap inside a colorful circle on Picture B
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneGridInner({
  cells,
  borderColor,
}: {
  cells: string[];
  borderColor: string;
}) {
  const cols = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(cells.length))));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 6,
        padding: 12,
        background: "linear-gradient(145deg, #ffffff, #f9fafb)",
        borderRadius: 20,
        border: `3px solid ${borderColor}`,
        minHeight: 160,
        alignContent: "start",
        boxShadow: `0 4px 16px ${borderColor}22`,
      }}
    >
      {cells.map((cell, i) => (
        <motion.div
          key={`${cell}-${i}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: i * 0.03,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            fontSize: 26,
            textAlign: "center",
            padding: 6,
            borderRadius: 12,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {cell}
        </motion.div>
      ))}
    </div>
  );
}
