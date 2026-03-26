"use client";

/**
 * ⭐ STAR CATCHER
 * Items fall from the sky. Move your character LEFT / RIGHT using
 * big on-screen arrow buttons (like a joystick). Catch the correct items!
 * Educational: kids learn to categorize while enjoying physical movement.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StarCatcherData, CatchItem, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { playCollect, playMiss, playTap, playJump } from "../core/sound";
import { fireMiniBurst, fireSparkleAt } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

export interface StarCatcherProps {
  data: StarCatcherData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

interface FallingItem extends CatchItem {
  uid: string;
  x: number;
  speed: number;
  y: number;
  active: boolean;
  caught: boolean;
  missed: boolean;
}

const ARENA_WIDTH = 100; // percentage
const CHAR_WIDTH = 14; // %
const ITEM_SIZE = 52;
const MOVE_STEP = 12;

function spawnItem(items: CatchItem[], index: number): FallingItem {
  const item = items[index % items.length];
  return {
    ...item,
    uid: `${item.id}-${Date.now()}-${index}`,
    x: 5 + Math.random() * 80,
    speed: 4 + Math.random() * 4,
    y: -10,
    active: true,
    caught: false,
    missed: false,
  };
}

export function StarCatcher({ data, onComplete, accentColor = "#379df9" }: StarCatcherProps) {
  const { instruction, question, character, targetCategory, items, lives: initLives } = data;

  const [charX, setCharX] = useState(45); // % from left
  const [lives, setLives] = useState(initLives);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [charBounce, setCharBounce] = useState(false);
  const [score, setScore] = useState(0);

  const itemCounterRef = useRef(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  const targetItems = items.filter((i) => i.isTarget);
  const totalTargets = targetItems.length * 2; // catch each target twice

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: totalTargets,
    onComplete,
  });

  const spawnNext = useCallback(() => {
    if (!isPlaying) return;
    const newItem = spawnItem(items, itemCounterRef.current++);
    setFallingItems((prev) => [...prev.slice(-12), newItem]); // keep last 12
    const delay = 1500 + Math.random() * 1500;
    spawnTimerRef.current = setTimeout(spawnNext, delay);
  }, [isPlaying, items]);

  const handleStart = useCallback(() => {
    playTap();
    setCharX(45);
    setLives(initLives);
    setFallingItems([]);
    setScore(0);
    setFeedback(null);
    itemCounterRef.current = 0;
    start();
  }, [initLives, start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    setCharX(45);
    setLives(initLives);
    setFallingItems([]);
    setScore(0);
    setFeedback(null);
    itemCounterRef.current = 0;
    reset();
  }, [initLives, reset]);

  // Start spawning when playing
  useEffect(() => {
    if (isPlaying) {
      spawnTimerRef.current = setTimeout(spawnNext, 600);
    }
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [isPlaying, spawnNext]);

  // Movement loop
  useEffect(() => {
    if (!isPlaying) return;
    moveLoopRef.current = setInterval(() => {
      setCharX((x) => {
        if (isMovingLeft) return Math.max(1, x - MOVE_STEP * 0.5);
        if (isMovingRight) return Math.min(ARENA_WIDTH - CHAR_WIDTH - 1, x + MOVE_STEP * 0.5);
        return x;
      });
    }, 60);
    return () => {
      if (moveLoopRef.current) clearInterval(moveLoopRef.current);
    };
  }, [isPlaying, isMovingLeft, isMovingRight]);

  // Game physics loop — move items down + collision detection
  useEffect(() => {
    if (!isPlaying) return;
    gameLoopRef.current = setInterval(() => {
      setFallingItems((prev) =>
        prev.map((item) => {
          if (!item.active || item.caught || item.missed) return item;

          const newY = item.y + item.speed * 0.5;

          // Check catch zone (bottom of arena ≈ 80-90%)
          if (newY >= 78) {
            // Check if character is under this item
            const itemCenterX = item.x;
            const charCenter = charX + CHAR_WIDTH / 2;
            const dist = Math.abs(itemCenterX - charCenter);

            if (dist < CHAR_WIDTH + 4) {
              // CAUGHT!
              const isCorrTarget = item.isTarget;
              if (isCorrTarget) {
                playCollect();
                setScore((s) => s + 15);
                setCharBounce(true);
                setTimeout(() => setCharBounce(false), 600);
                setFeedback({ text: `✅ ${item.label}!`, good: true });
                answerQuestion(item.uid, true);
                if (arenaRef.current) {
                  const rect = arenaRef.current.getBoundingClientRect();
                  fireSparkleAt(rect.left + (itemCenterX / 100) * rect.width, rect.top + (80 / 100) * rect.height);
                  fireMiniBurst();
                }
              } else {
                playMiss();
                setFeedback({ text: `❌ Not ${targetCategory}!`, good: false });
                setLives((l) => Math.max(0, l - 1));
                answerQuestion(item.uid, false);
              }
              setTimeout(() => setFeedback(null), 1200);
              return { ...item, y: newY, caught: true, active: false };
            } else {
              // MISSED target
              if (item.isTarget) {
                setLives((l) => Math.max(0, l - 1));
                playMiss();
                setFeedback({ text: `Missed a ${item.label}!`, good: false });
                setTimeout(() => setFeedback(null), 1200);
                answerQuestion(item.uid, false);
              }
              return { ...item, y: newY, missed: true, active: false };
            }
          }

          // Off-screen at bottom
          if (newY > 110) return { ...item, active: false };

          return { ...item, y: newY };
        })
      );
    }, 80);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, charX, targetCategory, answerQuestion]);

  // Game over on 0 lives
  useEffect(() => {
    if (isPlaying && lives <= 0) {
      // Force complete
      for (let i = state.currentQuestion; i < totalTargets; i++) {
        answerQuestion(`force-end-${i}`, false);
      }
    }
  }, [lives, isPlaying, state.currentQuestion, totalTargets, answerQuestion]);

  /* ── Start Screen ── */
  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ fontSize: 80, marginBottom: 12 }}
        >
          {character}
        </motion.div>

        {/* Falling preview items */}
        <div style={{ position: "relative", height: 70, width: 280, marginBottom: 16 }}>
          {items.slice(0, 5).map((item, i) => (
            <motion.div
              key={item.id}
              animate={{ y: [-10, 60, 70], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5, ease: "easeIn" }}
              style={{ position: "absolute", left: `${10 + i * 20}%`, top: 0, fontSize: 30 }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        <motion.h2
          style={{ fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", marginBottom: 8 }}
        >
          ⭐ Star Catcher!
        </motion.h2>

        <div style={{
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          borderRadius: 20,
          padding: "14px 24px",
          marginBottom: 10,
          maxWidth: 340,
          border: "2px solid #fcd34d",
        }}>
          <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#92400e", margin: "0 0 4px" }}>
            {question}
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
            {instruction}
          </p>
        </div>

        <p style={{ color: "#6b7280", marginBottom: 6, fontSize: 14, fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
          ❤️ {initLives} lives &nbsp;|&nbsp; Use ◀ ▶ buttons to move!
        </p>

        <motion.button
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "white",
            border: "none",
            padding: "18px 56px",
            borderRadius: 28,
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(245,158,11,0.45)",
            marginTop: 8,
          }}
        >
          ⭐ START CATCHING!
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
  return (
    <div style={{ padding: "0 12px 20px" }}>
      {/* HUD */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        background: "rgba(255,255,255,0.7)",
        borderRadius: 16,
        marginBottom: 8,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", fontSize: 15 }}>
          {question}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#f59e0b" }}>⭐ {score}</span>
          <span style={{ fontSize: 14 }}>
            {Array.from({ length: initLives }, (_, i) => (
              <motion.span
                key={i}
                animate={i >= lives ? { scale: [1, 0], opacity: [1, 0] } : {}}
                style={{ fontSize: 18 }}
              >
                {i < lives ? "❤️" : "🖤"}
              </motion.span>
            ))}
          </span>
        </div>
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        style={{
          position: "relative",
          height: 380,
          background: "linear-gradient(180deg, rgba(219,234,254,0.4) 0%, rgba(254,252,232,0.4) 100%)",
          borderRadius: 24,
          border: "2px solid rgba(255,255,255,0.6)",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {/* Falling items */}
        {fallingItems.map((item) => {
          if (!item.active || item.caught || item.missed) return null;
          return (
            <motion.div
              key={item.uid}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translateX(-50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <div
                  style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    borderRadius: "50%",
                    background: item.isTarget
                      ? "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(255,215,0,0.6))"
                      : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8), rgba(200,200,220,0.5))",
                    border: item.isTarget ? "3px solid #fbbf24" : "2px solid #d1d5db",
                    boxShadow: item.isTarget
                      ? "0 4px 16px rgba(251,191,36,0.5)"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#374151" }}>
                    {item.label}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Character */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "6%",
            left: `${charX}%`,
            width: `${CHAR_WIDTH}%`,
            textAlign: "center",
            transition: "left 0.08s linear",
          }}
          animate={charBounce ? { y: [0, -22, 0] } : { y: [0, -4, 0] }}
          transition={charBounce ? { duration: 0.5 } : { repeat: Infinity, duration: 1.8 }}
        >
          <div style={{ fontSize: 44, lineHeight: 1 }}>{character}</div>
          {/* Catch basket below character */}
          <div style={{
            width: "110%",
            height: 14,
            background: "linear-gradient(135deg, #fbbf24, #f97316)",
            borderRadius: "0 0 30px 30px",
            marginTop: -2,
            boxShadow: "0 4px 10px rgba(249,115,22,0.4)",
          }} />
        </motion.div>

        {/* Ground line */}
        <div style={{
          position: "absolute",
          bottom: "4%",
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)",
        }} />
      </div>

      {/* Feedback popup */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              textAlign: "center",
              padding: "10px 20px",
              borderRadius: 20,
              marginBottom: 8,
              background: feedback.good
                ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                : "linear-gradient(135deg, #fff1f2, #fecdd3)",
              border: `2px solid ${feedback.good ? "#a7f3d0" : "#fecdd3"}`,
              fontWeight: 900,
              fontSize: 16,
              fontFamily: "Fredoka, sans-serif",
              color: feedback.good ? "#065f46" : "#9f1239",
            }}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* D-PAD Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingTop: 8 }}>
        {/* LEFT button */}
        <motion.button
          onPointerDown={() => { setIsMovingLeft(true); playJump(); }}
          onPointerUp={() => setIsMovingLeft(false)}
          onPointerLeave={() => setIsMovingLeft(false)}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            border: "none",
            background: isMovingLeft
              ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
              : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white",
            fontSize: 40,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: isMovingLeft
              ? "0 2px 8px rgba(37,99,235,0.5), inset 0 3px 0 rgba(0,0,0,0.2)"
              : "0 8px 20px rgba(59,130,246,0.5), inset 0 -3px 0 rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          ◀
        </motion.button>

        {/* Center info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ fontSize: 28 }}>{character}</span>
          <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#6b7280" }}>
            MOVE
          </span>
        </div>

        {/* RIGHT button */}
        <motion.button
          onPointerDown={() => { setIsMovingRight(true); playJump(); }}
          onPointerUp={() => setIsMovingRight(false)}
          onPointerLeave={() => setIsMovingRight(false)}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            border: "none",
            background: isMovingRight
              ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
              : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            color: "white",
            fontSize: 40,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: isMovingRight
              ? "0 2px 8px rgba(124,58,237,0.5), inset 0 3px 0 rgba(0,0,0,0.2)"
              : "0 8px 20px rgba(139,92,246,0.5), inset 0 -3px 0 rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          ▶
        </motion.button>
      </div>
    </div>
  );
}
