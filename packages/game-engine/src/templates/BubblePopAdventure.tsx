"use client";

/**
 * 🫧 BUBBLE POP ADVENTURE
 * Animated bubbles float up from the bottom. Kids tap the correct ones.
 * Character celebrates on correct pops. Educational content inside each bubble.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BubblePopData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { playBubblePop, playWrong, playVictory, playTap } from "../core/sound";
import { fireBubbleBurst, fireMiniBurst } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

export interface BubblePopProps {
  data: BubblePopData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

interface LiveBubble {
  uid: string;
  item: BubblePopData["bubbles"][number];
  x: number;
  size: number;
  speed: number;
  wobble: number;
  startDelay: number;
  popped: boolean;
  wrong: boolean;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function spawnBubbles(items: BubblePopData["bubbles"]): LiveBubble[] {
  return items.map((item, i) => ({
    uid: `${item.id}-${Date.now()}-${i}`,
    item,
    x: randomBetween(5, 85),
    size: randomBetween(70, 100),
    speed: randomBetween(6, 12),
    wobble: randomBetween(8, 20),
    startDelay: randomBetween(0, items.length * 0.5),
    popped: false,
    wrong: false,
  }));
}

export function BubblePopAdventure({ data, onComplete, accentColor = "#379df9" }: BubblePopProps) {
  const { instruction, question, character, targetHint, bubbles } = data;
  const [liveBubbles, setLiveBubbles] = useState<LiveBubble[]>([]);
  const [popEffects, setPopEffects] = useState<{ uid: string; x: number; y: number; correct: boolean }[]>([]);
  const [charMood, setCharMood] = useState<"idle" | "happy" | "sad">("idle");
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetCount = bubbles.filter((b) => b.isTarget).length;

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: targetCount,
    onComplete,
  });

  const handleStart = useCallback(() => {
    playTap();
    setLiveBubbles(spawnBubbles(bubbles));
    setScore(0);
    setCharMood("idle");
    start();
  }, [bubbles, start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    setLiveBubbles(spawnBubbles(bubbles));
    setScore(0);
    setCharMood("idle");
    setPopEffects([]);
    reset();
  }, [bubbles, reset]);

  // Re-spawn popped bubbles after a while so they cycle
  useEffect(() => {
    if (!isPlaying) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    liveBubbles.forEach((b, i) => {
      if (b.popped && !b.item.isTarget) {
        timers.push(
          setTimeout(() => {
            setLiveBubbles((prev) =>
              prev.map((lb) =>
                lb.uid === b.uid
                  ? { ...lb, popped: false, wrong: false, uid: `${lb.item.id}-respawn-${Date.now()}-${i}` }
                  : lb
              )
            );
          }, 4000)
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [liveBubbles, isPlaying]);

  const handleBubbleTap = useCallback(
    (uid: string, isTarget: boolean, e: React.MouseEvent | React.TouchEvent) => {
      if (!isPlaying) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      setLiveBubbles((prev) =>
        prev.map((lb) =>
          lb.uid === uid ? { ...lb, popped: true, wrong: !isTarget } : lb
        )
      );

      const effectUid = `effect-${Date.now()}`;
      setPopEffects((prev) => [...prev, { uid: effectUid, x: cx, y: cy, correct: isTarget }]);
      setTimeout(() => setPopEffects((prev) => prev.filter((p) => p.uid !== effectUid)), 800);

      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);

      if (isTarget) {
        playBubblePop();
        fireBubbleBurst(cx, cy, "#ffd700");
        fireMiniBurst();
        setCharMood("happy");
        setScore((s) => s + 10);
        answerQuestion(uid, true);
      } else {
        playWrong();
        setCharMood("sad");
        answerQuestion(uid, false);
      }

      moodTimerRef.current = setTimeout(() => setCharMood("idle"), 1200);
    },
    [isPlaying, answerQuestion]
  );

  /* ── Start Screen ── */
  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Animated character */}
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ fontSize: 80, marginBottom: 8 }}
        >
          {character}
        </motion.div>

        {/* Floating preview bubbles */}
        <div style={{ position: "relative", height: 80, width: "100%", marginBottom: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, -60, -90], opacity: [0, 1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: i * 0.6, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: `${15 + i * 17}%`,
                bottom: 0,
                fontSize: 32,
              }}
            >
              🫧
            </motion.div>
          ))}
        </div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          style={{
            fontSize: 28,
            fontWeight: 900,
            fontFamily: "Fredoka, sans-serif",
            color: "#1c498c",
            marginBottom: 8,
          }}
        >
          Bubble Pop Adventure! 🫧
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
            borderRadius: 20,
            padding: "14px 24px",
            marginBottom: 10,
            maxWidth: 340,
            border: "2px solid #bfdbfe",
          }}
        >
          <p style={{
            fontSize: 20,
            fontWeight: 900,
            fontFamily: "Fredoka, sans-serif",
            color: "#1e40af",
            margin: "0 0 4px",
          }}>
            {question}
          </p>
          <p style={{
            fontSize: 14,
            color: "#6b7280",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 700,
            margin: 0,
          }}>
            Hint: {targetHint}
          </p>
        </motion.div>

        <motion.p
          style={{ color: "#6b7280", marginBottom: 28, fontSize: 15, fontFamily: "Nunito, sans-serif", fontWeight: 600 }}
        >
          {instruction}
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #379df9, #2180ee)",
            color: "white",
            border: "none",
            padding: "18px 56px",
            borderRadius: 28,
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(55,157,249,0.45)",
          }}
        >
          🫧 POP IT!
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
        characterEmoji={character}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  /* ── Playing Screen ── */
  const poppedTargets = liveBubbles.filter((b) => b.item.isTarget && b.popped).length;
  const progress = targetCount > 0 ? (poppedTargets / targetCount) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "70vh",
        overflow: "hidden",
        padding: "0 16px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "12px 16px 8px" }}>
        <motion.p
          style={{
            fontSize: 18,
            fontWeight: 900,
            fontFamily: "Fredoka, sans-serif",
            color: "#1c498c",
            margin: "0 0 6px",
          }}
        >
          {question}
        </motion.p>
        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
          Hint: {targetHint}
        </p>
        {/* Progress bar */}
        <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden", marginTop: 8, maxWidth: 300, margin: "8px auto 0" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: 10, background: "linear-gradient(90deg, #379df9, #8b5cf6)", borderRadius: 5 }}
          />
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: "4px 0 0" }}>
          Popped {poppedTargets}/{targetCount} • ⭐ {score}
        </p>
      </div>

      {/* Bubble arena */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        {liveBubbles.map((bubble) => {
          if (bubble.popped) return null;
          return (
            <motion.button
              key={bubble.uid}
              initial={{ y: "100%", x: `${bubble.x}%`, opacity: 0 }}
              animate={{
                y: [500, 300, 100, -100, -300],
                x: [
                  `${bubble.x}%`,
                  `${bubble.x + bubble.wobble}%`,
                  `${bubble.x - bubble.wobble}%`,
                  `${bubble.x + bubble.wobble * 0.5}%`,
                  `${bubble.x}%`,
                ],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: bubble.speed,
                delay: bubble.startDelay,
                repeat: Infinity,
                ease: "linear",
              }}
              onClick={(e) => handleBubbleTap(bubble.uid, bubble.item.isTarget, e)}
              onTouchStart={(e) => handleBubbleTap(bubble.uid, bubble.item.isTarget, e)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              style={{
                position: "absolute",
                width: bubble.size,
                height: bubble.size,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), ${bubble.item.color}88)`,
                boxShadow: `0 4px 20px ${bubble.item.color}55, inset 0 -4px 12px rgba(0,0,0,0.05), inset 0 4px 12px rgba(255,255,255,0.7)`,
                backdropFilter: "blur(2px)",
                padding: 0,
                transform: "translateX(-50%)",
                touchAction: "manipulation",
              }}
            >
              <span style={{ fontSize: bubble.size * 0.4, lineHeight: 1 }}>{bubble.item.emoji}</span>
              <span style={{
                fontSize: bubble.size * 0.15,
                fontWeight: 800,
                fontFamily: "Fredoka, sans-serif",
                color: "#1c498c",
                marginTop: 2,
              }}>
                {bubble.item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Pop effects */}
        <AnimatePresence>
          {popEffects.map((effect) => (
            <motion.div
              key={effect.uid}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.8, 0], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: "fixed",
                left: effect.x - 30,
                top: effect.y - 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: effect.correct
                  ? "radial-gradient(circle, rgba(255,215,0,0.8), transparent)"
                  : "radial-gradient(circle, rgba(255,100,100,0.6), transparent)",
                pointerEvents: "none",
                zIndex: 50,
              }}
            >
              <span style={{ fontSize: 28, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                {effect.correct ? "✨" : "💨"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Character at bottom */}
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <motion.div
          animate={
            charMood === "happy"
              ? { y: [0, -20, 0], scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }
              : charMood === "sad"
              ? { x: [0, -8, 8, -6, 6, 0], scale: [1, 0.9, 1] }
              : { y: [0, -6, 0] }
          }
          transition={
            charMood === "idle"
              ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
              : { duration: 0.6 }
          }
          style={{ fontSize: 56, display: "inline-block" }}
        >
          {character}
        </motion.div>
        <p style={{
          fontSize: 14,
          fontWeight: 800,
          fontFamily: "Fredoka, sans-serif",
          color: charMood === "happy" ? "#10b981" : charMood === "sad" ? "#ef4444" : "#6b7280",
          margin: "4px 0 0",
          transition: "color 0.3s",
        }}>
          {charMood === "happy" ? "🎉 Great pop!" : charMood === "sad" ? "😅 Keep trying!" : "Tap the right bubbles!"}
        </p>
      </div>
    </div>
  );
}
