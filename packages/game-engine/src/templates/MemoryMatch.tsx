"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MemoryMatchData, GameResult } from "../types";
import { buildGameResult } from "../core/scoring";
import { StarReveal } from "../components/StarReveal";
import {
  playTap,
  playCorrect,
  playWrong,
  playFlip,
  playMatch,
  playStreak,
} from "../core/sound";
import { fireMiniBurst, fireConfetti } from "../core/confetti";

export interface MemoryMatchProps {
  data: MemoryMatchData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

interface Card {
  uid: string;
  pairId: string;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(pairs: MemoryMatchData["pairs"]): Card[] {
  const deck: Card[] = [];
  pairs.forEach((p) => {
    deck.push({
      uid: `${p.id}-a`,
      pairId: p.id,
      emoji: p.emoji,
      label: p.front,
      flipped: false,
      matched: false,
    });
    deck.push({
      uid: `${p.id}-b`,
      pairId: p.id,
      emoji: p.emoji,
      label: p.front,
      flipped: false,
      matched: false,
    });
  });
  return deck.sort(() => Math.random() - 0.5);
}

const wiggleVariants = {
  wiggle: {
    rotate: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: "easeInOut" as const },
  },
};

const breatheVariants = {
  breathe: (i: number) => ({
    scale: [1, 1.04, 1],
    transition: {
      repeat: Infinity,
      duration: 2.8 + i * 0.15,
      ease: "easeInOut" as const,
    },
  }),
};

export function MemoryMatch({
  data,
  onComplete,
  accentColor = "#379df9",
}: MemoryMatchProps) {
  const { pairs, instruction } = data;

  const [phase, setPhase] = useState<"start" | "playing" | "complete">("start");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [matchFlash, setMatchFlash] = useState<string | null>(null);
  const [mismatchIds, setMismatchIds] = useState<string[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);

  const timeStartRef = useRef(0);
  const lockRef = useRef(false);

  const handleStart = useCallback(() => {
    playTap();
    setCards(buildDeck(pairs));
    setFlippedIds([]);
    setMatchCount(0);
    setAttempts(0);
    setStreak(0);
    setMatchFlash(null);
    setMismatchIds([]);
    setResult(null);
    setPhase("playing");
    timeStartRef.current = Date.now();
    lockRef.current = false;
  }, [pairs]);

  const computeScore = useCallback(
    (finalAttempts: number) => {
      const maxAttempts = pairs.length;
      const raw = maxAttempts * 2 - (finalAttempts - maxAttempts);
      return Math.min(Math.max(0, raw), maxAttempts);
    },
    [pairs.length]
  );

  const handleCardTap = useCallback(
    (uid: string) => {
      if (lockRef.current || flippedIds.length >= 2) return;

      const card = cards.find((c) => c.uid === uid);
      if (!card || card.flipped || card.matched) return;

      playTap();
      playFlip();

      const newFlipped = [...flippedIds, uid];
      setFlippedIds(newFlipped);
      setCards((prev) =>
        prev.map((c) => (c.uid === uid ? { ...c, flipped: true } : c))
      );

      if (newFlipped.length === 2) {
        lockRef.current = true;
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        const c1 = cards.find((c) => c.uid === newFlipped[0])!;
        const c2Uid = newFlipped[1];
        const c2 = cards.find((c) => c.uid === c2Uid)!;

        if (c1.pairId === c2.pairId) {
          const newMatchCount = matchCount + 1;
          const newStreak = streak + 1;

          setTimeout(() => {
            playMatch();
            playCorrect();
            fireMiniBurst();
            if (newStreak >= 2) playStreak(newStreak);

            setStreak(newStreak);
            setMatchCount(newMatchCount);
            setMatchFlash(c1.pairId);
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === c1.pairId
                  ? { ...c, matched: true, flipped: true }
                  : c
              )
            );
            setFlippedIds([]);

            setTimeout(() => setMatchFlash(null), 700);

            if (newMatchCount === pairs.length) {
              fireConfetti();
              const elapsed = Math.round(
                (Date.now() - timeStartRef.current) / 1000
              );
              const sc = computeScore(newAttempts);
              const gameResult = buildGameResult(sc, pairs.length, elapsed);
              setResult(gameResult);
              setTimeout(() => setPhase("complete"), 800);
            }

            lockRef.current = false;
          }, 350);
        } else {
          setStreak(0);
          setTimeout(() => {
            playWrong();
            setMismatchIds([...newFlipped]);
          }, 400);

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.uid) && !c.matched
                  ? { ...c, flipped: false }
                  : c
              )
            );
            setFlippedIds([]);
            setMismatchIds([]);
            lockRef.current = false;
          }, 1200);
        }
      }
    },
    [flippedIds, cards, matchCount, attempts, streak, pairs.length, computeScore]
  );

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
          animate={{
            y: [0, -14, 0],
            rotateY: [0, 180, 360],
          }}
          transition={{
            y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" as const },
            rotateY: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
          }}
          style={{
            fontSize: 72,
            marginBottom: 12,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
            display: "inline-block",
          }}
        >
          🃏
        </motion.div>

        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            margin: "0 0 6px",
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Memory Match
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
            background: "linear-gradient(135deg, #ec4899, #f472b6)",
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 30px rgba(236,72,153,0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.span
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              borderRadius: 24,
            }}
          />
          Start Matching! 🧠
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
        onPlayAgain={handleStart}
      />
    );
  }

  /* ── PLAYING ── */
  const cols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 5;
  const progressPct =
    pairs.length > 0 ? (matchCount / pairs.length) * 100 : 0;

  return (
    <div style={{ padding: "20px 24px", maxWidth: 520, margin: "0 auto" }}>
      {/* Progress bar */}
      <div
        style={{
          height: 10,
          borderRadius: 5,
          background: "#f0f0f0",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{
            height: "100%",
            borderRadius: 5,
            background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
          }}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: "#6b7280",
          }}
        >
          Matches: {matchCount}/{pairs.length}
        </span>

        {/* Streak badge */}
        <AnimatePresence>
          {streak >= 2 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "Fredoka, sans-serif",
                color: "#f59e0b",
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                padding: "4px 12px",
                borderRadius: 12,
              }}
            >
              🔥 {streak}x
            </motion.span>
          )}
        </AnimatePresence>

        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: "#6b7280",
          }}
        >
          Tries: {attempts}
        </span>
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 10,
        }}
      >
        {cards.map((card, i) => {
          const isFaceUp = card.flipped || card.matched;
          const isMatched = card.matched;
          const isGlowing = matchFlash === card.pairId && isMatched;
          const isMismatch = mismatchIds.includes(card.uid);

          return (
            <motion.button
              key={card.uid}
              initial={{ opacity: 0, scale: 0, rotateY: 180 }}
              animate={
                isMismatch
                  ? "wiggle"
                  : !isFaceUp && !isMatched
                    ? "breathe"
                    : { opacity: 1, scale: 1, rotateY: isFaceUp ? 0 : 180 }
              }
              transition={{
                opacity: { delay: i * 0.05, duration: 0.3 },
                scale: {
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                },
                rotateY: { duration: 0.4, ease: "easeOut" as const },
              }}
              variants={isMismatch ? wiggleVariants : !isFaceUp ? breatheVariants : undefined}
              custom={i}
              whileHover={
                !isFaceUp && !isMatched && !lockRef.current
                  ? { scale: 1.06, y: -3 }
                  : {}
              }
              whileTap={
                !isFaceUp && !isMatched && !lockRef.current
                  ? { scale: 0.94 }
                  : {}
              }
              onClick={() => handleCardTap(card.uid)}
              style={{
                aspectRatio: "1",
                borderRadius: 18,
                border: `3px solid ${
                  isGlowing
                    ? "#22c55e"
                    : isMismatch
                      ? "#f43f5e"
                      : isFaceUp
                        ? accentColor
                        : "#e0e0e0"
                }`,
                background: isGlowing
                  ? "linear-gradient(135deg, #d1fae5, #bbf7d0)"
                  : isMismatch
                    ? "linear-gradient(135deg, #ffe4e6, #fecdd3)"
                    : isFaceUp
                      ? "linear-gradient(135deg, #ffffff, #f0f7ff)"
                      : "linear-gradient(135deg, #f3f0ff, #ede9fe)",
                cursor: isMatched ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isFaceUp ? 34 : 26,
                boxShadow: isGlowing
                  ? "0 0 25px rgba(34,197,94,0.35), 0 4px 12px rgba(0,0,0,0.06)"
                  : isFaceUp
                    ? `0 4px 18px ${accentColor}22`
                    : "0 4px 12px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
                transformStyle: "preserve-3d",
                perspective: "600px",
              }}
            >
              {/* Green pulse ring on match */}
              {isGlowing && (
                <motion.div
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.5, 0.2, 0],
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" as const }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    border: "3px solid #22c55e",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Card content */}
              <motion.span
                animate={
                  isGlowing
                    ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
                style={{
                  backfaceVisibility: "hidden",
                  display: "block",
                  userSelect: "none",
                }}
              >
                {isFaceUp ? card.emoji : "❓"}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
