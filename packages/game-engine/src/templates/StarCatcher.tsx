"use client";

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
  onNextGame?: () => void;
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

const CHAR_W = 15;
const CATCH_RADIUS = 12;
const FALL_SPEED_MIN = 1.8;
const FALL_SPEED_MAX = 3.4;
const MOVE_SPEED = 1.4;

function spawnItem(items: CatchItem[], idx: number): FallingItem {
  const item = items[idx % items.length];
  return {
    ...item,
    uid: `${item.id}-${Date.now()}-${idx}`,
    x: 8 + Math.random() * 76,
    speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
    y: -8,
    active: true,
    caught: false,
    missed: false,
  };
}

export function StarCatcher({ data, onComplete, accentColor = "#379df9", onNextGame }: StarCatcherProps) {
  const { instruction, question, character, targetCategory, items, lives: initLives } = data;

  const charXRef = useRef(43);
  const [charXDisplay, setCharXDisplay] = useState(43);
  const [lives, setLives] = useState(initLives);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean; id: number } | null>(null);
  const [catchFlash, setCatchFlash] = useState(false);

  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const fallingRef = useRef<FallingItem[]>([]);
  const [displayItems, setDisplayItems] = useState<FallingItem[]>([]);
  const spawnIdxRef = useRef(0);
  const spawnCooldownRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const livesRef = useRef(initLives);
  const feedbackIdRef = useRef(0);

  const targetItems = items.filter((i) => i.isTarget);
  const totalTargets = targetItems.length * 2;

  const { state, start, answerQuestion, completeGame, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: totalTargets,
    onComplete,
  });

  const scoreRef = useRef(0);
  scoreRef.current = score;
  /** Correct target catches — same scale as useGameState maxScore (not HUD point total). */
  const targetCatchesRef = useRef(0);

  const showFeedback = useCallback((text: string, good: boolean) => {
    const id = ++feedbackIdRef.current;
    setFeedback({ text, good, id });
    setTimeout(() => {
      setFeedback((f) => (f && f.id === id ? null : f));
    }, 1000);
  }, []);

  const handleStart = useCallback(() => {
    playTap();
    charXRef.current = 43;
    setCharXDisplay(43);
    setLives(initLives);
    livesRef.current = initLives;
    setScore(0);
    scoreRef.current = 0;
    targetCatchesRef.current = 0;
    setFeedback(null);
    fallingRef.current = [];
    setDisplayItems([]);
    spawnIdxRef.current = 0;
    spawnCooldownRef.current = 0;
    start();
  }, [initLives, start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    charXRef.current = 43;
    setCharXDisplay(43);
    setLives(initLives);
    livesRef.current = initLives;
    setScore(0);
    scoreRef.current = 0;
    targetCatchesRef.current = 0;
    setFeedback(null);
    fallingRef.current = [];
    setDisplayItems([]);
    spawnIdxRef.current = 0;
    spawnCooldownRef.current = 0;
    reset();
  }, [initLives, reset]);

  // Keyboard
  useEffect(() => {
    if (!isPlaying) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keysRef.current = { left: false, right: false };
    };
  }, [isPlaying]);

  // Main game loop — single requestAnimationFrame for everything
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = 0;
    let alive = true;

    const loop = (time: number) => {
      if (!alive) return;
      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      // Movement
      const keys = keysRef.current;
      if (keys.left) {
        charXRef.current = Math.max(0, charXRef.current - MOVE_SPEED * (dt / 16));
      }
      if (keys.right) {
        charXRef.current = Math.min(100 - CHAR_W, charXRef.current + MOVE_SPEED * (dt / 16));
      }
      setCharXDisplay(charXRef.current);

      // Spawning
      spawnCooldownRef.current -= dt;
      if (spawnCooldownRef.current <= 0) {
        fallingRef.current.push(spawnItem(items, spawnIdxRef.current++));
        spawnCooldownRef.current = 1200 + Math.random() * 1200;
      }

      // Physics + collision
      const charCenter = charXRef.current + CHAR_W / 2;
      let changed = false;
      const next: FallingItem[] = [];

      for (const item of fallingRef.current) {
        if (!item.active) { next.push(item); continue; }

        const newY = item.y + item.speed * (dt / 16);

        if (newY >= 80 && !item.caught && !item.missed) {
          const dist = Math.abs(item.x - charCenter);
            if (dist < CATCH_RADIUS) {
            changed = true;
            if (item.isTarget) {
              playCollect();
              setScore((s) => s + 15);
              setCatchFlash(true);
              setTimeout(() => setCatchFlash(false), 300);
              showFeedback(`${item.emoji} ${item.label}!`, true);
              targetCatchesRef.current += 1;
              answerQuestion(item.uid, true);
              if (arenaRef.current) {
                const rect = arenaRef.current.getBoundingClientRect();
                fireSparkleAt(rect.left + (item.x / 100) * rect.width, rect.top + rect.height * 0.78);
                fireMiniBurst();
              }
            } else {
              playMiss();
              showFeedback(`Not ${targetCategory}!`, false);
              setScore((s) => Math.max(0, s - 5));
              livesRef.current = Math.max(0, livesRef.current - 1);
              setLives(livesRef.current);
            }
            next.push({ ...item, y: newY, caught: true, active: false });
            continue;
          }
        }

        if (newY >= 95 && !item.caught && !item.missed) {
          changed = true;
          if (item.isTarget) {
            playMiss();
            showFeedback(`Missed ${item.label}!`, false);
            livesRef.current = Math.max(0, livesRef.current - 1);
            setLives(livesRef.current);
          }
          next.push({ ...item, y: newY, missed: true, active: false });
          continue;
        }

        if (newY > 110) { changed = true; continue; }

        if (Math.abs(newY - item.y) > 0.01) changed = true;
        next.push({ ...item, y: newY });
      }

      if (changed || next.length !== fallingRef.current.length) {
        fallingRef.current = next;
        setDisplayItems([...next.filter((i) => i.y < 105)]);
      }

      if (livesRef.current <= 0) {
        alive = false;
        completeGame(targetCatchesRef.current);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, items, targetCategory, answerQuestion, completeGame, showFeedback]);

  /* ── Start Screen ── */
  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ fontSize: 80, marginBottom: 12 }}
        >
          {character}
        </motion.div>

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

        <motion.h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", marginBottom: 8 }}>
          Star Catcher!
        </motion.h2>

        <div style={{
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          borderRadius: 20, padding: "14px 24px", marginBottom: 10, maxWidth: 340, border: "2px solid #fcd34d",
        }}>
          <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#92400e", margin: "0 0 4px" }}>
            {question}
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
            {instruction}
          </p>
        </div>

        <p style={{ color: "#6b7280", marginBottom: 6, fontSize: 14, fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
          {initLives} lives &bull; Use arrow keys or buttons to move!
        </p>

        <motion.button
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "white", border: "none", padding: "18px 56px", borderRadius: 28,
            fontSize: 22, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            cursor: "pointer", boxShadow: "0 8px 28px rgba(245,158,11,0.45)", marginTop: 8,
          }}
        >
          START CATCHING!
        </motion.button>
      </motion.div>
    );
  }

  /* ── Completion ── */
  if (isCompleted) {
    return (
      <StarReveal
        starsEarned={state.starsEarned}
        score={state.score}
        maxScore={state.maxScore}
        accentColor={accentColor}
        characterEmoji={character}
        onPlayAgain={handlePlayAgain}
        onNextGame={onNextGame}
      />
    );
  }

  /* ── Playing ── */
  return (
    <div style={{ padding: "0 8px 12px", position: "relative" }}>
      {/* HUD */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 14px", background: "rgba(255,255,255,0.75)", borderRadius: 16,
        marginBottom: 6, backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", fontSize: 14, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {question}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#f59e0b" }}>
            {score}
          </span>
          <span style={{ fontSize: 14, letterSpacing: -2 }}>
            {Array.from({ length: initLives }, (_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Feedback — FIXED overlay at top of arena */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 56,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              padding: "8px 22px",
              borderRadius: 16,
              background: feedback.good
                ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                : "linear-gradient(135deg, #fff1f2, #fecdd3)",
              border: `2px solid ${feedback.good ? "#86efac" : "#fecdd3"}`,
              fontWeight: 900,
              fontSize: 15,
              fontFamily: "Fredoka, sans-serif",
              color: feedback.good ? "#065f46" : "#9f1239",
              boxShadow: feedback.good
                ? "0 4px 16px rgba(34,197,94,0.3)"
                : "0 4px 16px rgba(239,68,68,0.2)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {feedback.good ? "✅" : "❌"} {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arena */}
      <div
        ref={arenaRef}
        style={{
          position: "relative",
          height: 420,
          background: "linear-gradient(180deg, rgba(219,234,254,0.3) 0%, rgba(254,252,232,0.3) 60%, rgba(254,243,199,0.4) 100%)",
          borderRadius: 24,
          border: "2px solid rgba(255,255,255,0.5)",
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        {/* Falling items */}
        {displayItems.map((item) => {
          if (!item.active) return null;
          return (
            <div
              key={item.uid}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translateX(-50%)",
                willChange: "transform, top",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: item.isTarget
                    ? "radial-gradient(circle at 35% 35%, #fffbeb, rgba(251,191,36,0.5))"
                    : "radial-gradient(circle at 35% 35%, #f9fafb, rgba(209,213,219,0.4))",
                  border: item.isTarget ? "3px solid #fbbf24" : "2px solid #d1d5db",
                  boxShadow: item.isTarget
                    ? "0 4px 14px rgba(251,191,36,0.45)"
                    : "0 2px 6px rgba(0,0,0,0.06)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#374151", lineHeight: 1 }}>
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Character */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: `${charXDisplay}%`,
            width: `${CHAR_W}%`,
            willChange: "left",
            textAlign: "center",
          }}
        >
          <div style={{
            fontSize: 42, lineHeight: 1,
            filter: catchFlash ? "drop-shadow(0 0 12px rgba(251,191,36,0.8))" : "none",
            transition: "filter 0.15s",
          }}>
            {character}
          </div>
          <div style={{
            width: "110%", height: 10, marginLeft: "-5%",
            background: catchFlash
              ? "linear-gradient(135deg, #fde047, #fbbf24)"
              : "linear-gradient(135deg, #fbbf24, #f97316)",
            borderRadius: "0 0 20px 20px",
            marginTop: -2,
            boxShadow: catchFlash
              ? "0 2px 16px rgba(253,224,71,0.7)"
              : "0 3px 8px rgba(249,115,22,0.35)",
            transition: "background 0.15s, box-shadow 0.15s",
          }} />
        </div>

        {/* Ground */}
        <div style={{
          position: "absolute", bottom: "3%", left: "5%", right: "5%",
          height: 2, background: "rgba(0,0,0,0.06)", borderRadius: 1,
        }} />
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 20, padding: "4px 0 0",
      }}>
        <ControlButton
          direction="left"
          active={keysRef.current.left}
          onDown={() => { keysRef.current.left = true; playJump(); }}
          onUp={() => { keysRef.current.left = false; }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, minWidth: 50 }}>
          <span style={{ fontSize: 26 }}>{character}</span>
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#9ca3af" }}>
            MOVE
          </span>
        </div>

        <ControlButton
          direction="right"
          active={keysRef.current.right}
          onDown={() => { keysRef.current.right = true; playJump(); }}
          onUp={() => { keysRef.current.right = false; }}
        />
      </div>
    </div>
  );
}

function ControlButton({ direction, active, onDown, onUp }: {
  direction: "left" | "right";
  active: boolean;
  onDown: () => void;
  onUp: () => void;
}) {
  const isLeft = direction === "left";
  const bg = isLeft
    ? active ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "linear-gradient(135deg, #3b82f6, #2563eb)"
    : active ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)";
  const shadow = isLeft
    ? active ? "0 2px 6px rgba(37,99,235,0.5), inset 0 2px 0 rgba(0,0,0,0.15)" : "0 6px 18px rgba(59,130,246,0.45), inset 0 -2px 0 rgba(0,0,0,0.15)"
    : active ? "0 2px 6px rgba(124,58,237,0.5), inset 0 2px 0 rgba(0,0,0,0.15)" : "0 6px 18px rgba(139,92,246,0.45), inset 0 -2px 0 rgba(0,0,0,0.15)";

  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onDown(); }}
      onTouchEnd={onUp}
      onTouchCancel={onUp}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      style={{
        width: 84, height: 84, borderRadius: 22, border: "none",
        background: bg, color: "white", fontSize: 36, fontWeight: 900,
        cursor: "pointer",
        boxShadow: shadow,
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none", touchAction: "manipulation",
        WebkitUserSelect: "none",
        transform: active ? "scale(0.92) translateY(2px)" : "scale(1) translateY(0)",
        transition: "transform 0.08s, box-shadow 0.08s, background 0.08s",
      }}
    >
      {isLeft ? "◀" : "▶"}
    </button>
  );
}
