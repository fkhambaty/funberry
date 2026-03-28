"use client";

import React, { useState, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WordPictureLinkData, GameResult, WordPicturePair } from "../types";
import { useGameState } from "../core/useGameState";
import { StarReveal } from "../components/StarReveal";
import { playTap, playCorrect, playWrong, playMatch, playSparkle, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";

export interface WordPictureLinkProps {
  data: WordPictureLinkData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
}

function shufflePairs(list: WordPicturePair[]): WordPicturePair[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const wiggle = {
  x: [0, -6, 6, -5, 5, -3, 3, 0],
  transition: { duration: 0.45, ease: "easeInOut" as const },
};

interface ConnectorLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function SvgConnector({ line, delay }: { line: ConnectorLine; delay: number }) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  return (
    <motion.line
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      stroke="#10b981"
      strokeWidth={4}
      strokeLinecap="round"
      strokeDasharray={length}
      initial={{ strokeDashoffset: length, opacity: 0 }}
      animate={{ strokeDashoffset: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" as const }}
    />
  );
}

export function WordPictureLink({ data, onComplete, accentColor = "#379df9", onNextGame }: WordPictureLinkProps) {
  const { instruction, pairs, matchHint } = data;
  const [orderRight, setOrderRight] = useState<WordPicturePair[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongFlashId, setWrongFlashId] = useState<string | null>(null);
  const [recentMatchId, setRecentMatchId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const picBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<ConnectorLine[]>([]);

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: pairs.length,
    onComplete,
  });

  const matchOrder = useRef<string[]>([]);

  const handleStart = useCallback(() => {
    playTap();
    setOrderRight(shufflePairs(pairs));
    setSelectedWordId(null);
    setMatchedIds([]);
    setWrongFlashId(null);
    setRecentMatchId(null);
    setLines([]);
    setStreak(0);
    matchOrder.current = [];
    start();
  }, [pairs, start]);

  const recomputeLines = useCallback(() => {
    const wrap = containerRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const next: ConnectorLine[] = [];
    for (const id of matchedIds) {
      const w = wordBtnRefs.current[id];
      const p = picBtnRefs.current[id];
      if (!w || !p) continue;
      const wr = w.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      next.push({
        id,
        x1: wr.right - rect.left,
        y1: wr.top + wr.height / 2 - rect.top,
        x2: pr.left - rect.left,
        y2: pr.top + pr.height / 2 - rect.top,
      });
    }
    setLines(next);
  }, [matchedIds]);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines, matchedIds, orderRight, selectedWordId, isPlaying]);

  useLayoutEffect(() => {
    if (!isPlaying) return;
    const ro = new ResizeObserver(() => recomputeLines());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isPlaying, recomputeLines]);

  const handleWordTap = useCallback(
    (pairId: string) => {
      if (!isPlaying || matchedIds.includes(pairId)) return;
      playTap();
      setSelectedWordId((prev) => (prev === pairId ? null : pairId));
      setWrongFlashId(null);
    },
    [isPlaying, matchedIds],
  );

  const handlePicTap = useCallback(
    (pairId: string) => {
      if (!isPlaying || matchedIds.includes(pairId) || !selectedWordId) return;
      playTap();

      if (selectedWordId === pairId) {
        playMatch();
        setTimeout(() => playSparkle(), 150);
        fireMiniBurst();
        const nextMatched = [...matchedIds, pairId];
        matchOrder.current.push(pairId);
        setMatchedIds(nextMatched);
        setRecentMatchId(pairId);
        setTimeout(() => setRecentMatchId(null), 800);
        setSelectedWordId(null);

        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 2) playStreak(newStreak);

        answerQuestion(pairId, true);
      } else {
        playWrong();
        setWrongFlashId(pairId);
        setStreak(0);
        setTimeout(() => setWrongFlashId(null), 700);
        setSelectedWordId(null);
      }
    },
    [isPlaying, matchedIds, selectedWordId, answerQuestion, streak],
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
          animate={{ y: [0, -14, 0], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" as const }}
          style={{ fontSize: 72, marginBottom: 20, filter: "drop-shadow(0 6px 12px rgba(16,185,129,0.3))" }}
        >
          🔗
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
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Word & Picture Match
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
          whileHover={{ scale: 1.06, boxShadow: "0 10px 30px rgba(16,185,129,0.35)" }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #10b981, #34d399)",
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(16,185,129,0.3)",
          }}
        >
          Start Matching!
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
          setMatchedIds([]);
          setLines([]);
          matchOrder.current = [];
        }}
        onNextGame={onNextGame}
      />
    );
  }

  /* ── Playing Screen ── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}
    >
      {/* Progress Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46", fontFamily: "Nunito, sans-serif" }}>
            🔗 {matchedIds.length}/{pairs.length} matched
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46", fontFamily: "Nunito, sans-serif" }}>
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
            backgroundColor: "#d1fae5",
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(matchedIds.length / pairs.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: 10,
              background: "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)",
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
        {matchHint ?? "Tap a word, then tap the matching picture!"}
      </motion.p>

      {/* Main game area */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          minHeight: 200,
        }}
      >
        {/* SVG connectors */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
          aria-hidden
        >
          {lines.map((ln) => {
            const idx = matchOrder.current.indexOf(ln.id);
            return (
              <SvgConnector key={ln.id} line={ln} delay={idx >= 0 ? 0 : 0.1} />
            );
          })}
        </svg>

        {/* Words Column */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: "0 0 6px",
              fontWeight: 800,
              color: "#1c498c",
              textAlign: "center",
              fontFamily: "Fredoka, sans-serif",
              fontSize: 17,
            }}
          >
            📝 Words
          </motion.p>
          {pairs.map((p, i) => {
            const done = matchedIds.includes(p.id);
            const sel = selectedWordId === p.id;
            const justMatched = recentMatchId === p.id;

            return (
              <motion.button
                key={p.id}
                ref={(el) => { wordBtnRefs.current[p.id] = el; }}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: justMatched ? [1, 1.08, 1] : 1,
                }}
                transition={{
                  opacity: { delay: i * 0.06, duration: 0.25 },
                  x: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
                  scale: justMatched ? { duration: 0.4, ease: "easeInOut" } : { delay: i * 0.06, duration: 0.3 },
                }}
                whileHover={!done ? { scale: 1.03, y: -2 } : {}}
                whileTap={!done ? { scale: 0.96 } : {}}
                onClick={() => handleWordTap(p.id)}
                disabled={done}
                style={{
                  padding: "16px 14px",
                  borderRadius: 20,
                  border: `3px solid ${
                    done
                      ? "#10b981"
                      : sel
                        ? accentColor
                        : "#e5e7eb"
                  }`,
                  background: done
                    ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    : sel
                      ? `linear-gradient(135deg, ${accentColor}12, ${accentColor}22)`
                      : "white",
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  color: done ? "#065f46" : sel ? "#1c498c" : "#374151",
                  cursor: done ? "default" : "pointer",
                  textAlign: "center",
                  boxShadow: done
                    ? "0 4px 16px rgba(16,185,129,0.2)"
                    : sel
                      ? `0 6px 20px ${accentColor}33, 0 2px 8px rgba(0,0,0,0.06)`
                      : "0 3px 12px rgba(0,0,0,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ marginRight: 6 }}
                  >
                    ✅
                  </motion.span>
                )}
                {done ? p.word : (p.wordDisplay ?? p.word)}
              </motion.button>
            );
          })}
        </div>

        {/* Pictures Column */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: "0 0 6px",
              fontWeight: 800,
              color: "#1c498c",
              textAlign: "center",
              fontFamily: "Fredoka, sans-serif",
              fontSize: 17,
            }}
          >
            🖼️ Pictures
          </motion.p>
          {orderRight.map((p, i) => {
            const done = matchedIds.includes(p.id);
            const isWrongFlash = wrongFlashId === p.id;
            const justMatched = recentMatchId === p.id;

            return (
              <motion.button
                key={p.id}
                ref={(el) => { picBtnRefs.current[p.id] = el; }}
                initial={{ opacity: 0, x: 30 }}
                animate={
                  isWrongFlash
                    ? { opacity: 1, x: wiggle.x }
                    : {
                        opacity: 1,
                        x: 0,
                        scale: justMatched ? [1, 1.12, 1] : 1,
                      }
                }
                transition={
                  isWrongFlash
                    ? wiggle.transition
                    : {
                        opacity: { delay: i * 0.06, duration: 0.25 },
                        x: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
                        scale: justMatched ? { duration: 0.4, ease: "easeInOut" } : { delay: i * 0.06, duration: 0.3 },
                      }
                }
                whileHover={!done ? { scale: 1.06 } : {}}
                whileTap={!done ? { scale: 0.94 } : {}}
                onClick={() => handlePicTap(p.id)}
                disabled={done}
                style={{
                  padding: "14px 12px",
                  borderRadius: 20,
                  border: `3px solid ${
                    done
                      ? "#10b981"
                      : isWrongFlash
                        ? "#f43f5e"
                        : "#e5e7eb"
                  }`,
                  background: done
                    ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    : isWrongFlash
                      ? "linear-gradient(135deg, #fff1f2, #ffe4e6)"
                      : "white",
                  fontSize: 40,
                  cursor: done ? "default" : "pointer",
                  textAlign: "center",
                  boxShadow: done
                    ? "0 4px 16px rgba(16,185,129,0.2)"
                    : isWrongFlash
                      ? "0 4px 20px rgba(244,63,94,0.25)"
                      : "0 3px 12px rgba(0,0,0,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {p.emoji}
                {done && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banners */}
      <AnimatePresence>
        {wrongFlashId && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 20,
              background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
              textAlign: "center",
              border: "2px solid #fecdd3",
              boxShadow: "0 4px 16px rgba(244,63,94,0.12)",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                color: "#9f1239",
                margin: 0,
                fontFamily: "Fredoka, sans-serif",
                fontSize: 17,
              }}
            >
              Not a match — try again! 🤔
            </p>
          </motion.div>
        )}

        {recentMatchId && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 20,
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              textAlign: "center",
              border: "2px solid #a7f3d0",
              boxShadow: "0 4px 16px rgba(16,185,129,0.15)",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                color: "#065f46",
                margin: 0,
                fontFamily: "Fredoka, sans-serif",
                fontSize: 17,
              }}
            >
              Perfect match! 🎉✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
