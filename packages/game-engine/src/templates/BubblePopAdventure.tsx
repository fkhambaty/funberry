"use client";

/**
 * 🫧 BUBBLE POP ADVENTURE
 * Animated bubbles float up. Kids tap the correct ones within a time limit.
 *
 * SCORING ALGORITHM
 * ─────────────────
 * • +10 points per correct pop
 * • −5  points per wrong pop
 * • Time limit = max(20, targetCount × 5) seconds
 * • Time bonus = remaining seconds × 1 point
 * • Max score = (targetCount × 10) + timeLimit
 * • Stars via standard thresholds: ≥90% → 3⭐, ≥60% → 2⭐, ≥30% → 1⭐
 *
 * A kid who pops everything right but also pops 4 wrong items loses 20 pts,
 * which drops them from 3⭐ to 2⭐. This creates real incentive to be selective.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BubblePopData, GameResult } from "../types";
import { buildGameResult } from "../core/scoring";
import { playBubblePop, playWrong, playVictory, playTap } from "../core/sound";
import { fireBubbleBurst, fireMiniBurst } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

export interface BubblePopProps {
  data: BubblePopData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
}

interface LiveBubble {
  uid: string;
  item: BubblePopData["bubbles"][number];
  x: number;
  size: number;
  speed: number;
  startDelay: number;
  popped: boolean;
  wrong: boolean;
}

const PTS_CORRECT = 10;
const PTS_WRONG = -5;
const SECS_PER_TARGET = 5;
const MIN_TIME = 20;

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
    startDelay: randomBetween(0, items.length * 0.5),
    popped: false,
    wrong: false,
  }));
}

type Phase = "idle" | "playing" | "completed";

export function BubblePopAdventure({ data, onComplete, accentColor = "#379df9", onNextGame }: BubblePopProps) {
  const { instruction, question, character, targetHint, bubbles } = data;

  const targetCount = bubbles.filter((b) => b.isTarget).length;
  const timeLimit = Math.max(MIN_TIME, targetCount * SECS_PER_TARGET);
  const maxScore = targetCount * PTS_CORRECT + timeLimit;

  const [phase, setPhase] = useState<Phase>("idle");
  const [liveBubbles, setLiveBubbles] = useState<LiveBubble[]>([]);
  const [popEffects, setPopEffects] = useState<{ uid: string; x: number; y: number; correct: boolean }[]>([]);
  const [charMood, setCharMood] = useState<"idle" | "happy" | "sad">("idle");
  const [scoreFloats, setScoreFloats] = useState<{ uid: string; x: number; y: number; value: number }[]>([]);

  const [rawScore, setRawScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);

  const [finalResult, setFinalResult] = useState<GameResult | null>(null);

  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const correctCountRef = useRef(0);
  const rawScoreRef = useRef(0);
  const secondsLeftRef = useRef(timeLimit);

  correctCountRef.current = correctCount;
  rawScoreRef.current = rawScore;
  secondsLeftRef.current = secondsLeft;

  const finishGame = useCallback(
    (endScore: number, elapsed: number) => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      const clampedScore = Math.max(0, endScore);
      const result = buildGameResult(clampedScore, maxScore, elapsed);
      setFinalResult(result);
      setPhase("completed");
      onCompleteRef.current(result);
    },
    [maxScore]
  );

  useEffect(() => {
    if (phase !== "playing") return;

    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          const timeBonus = 0;
          const endScore = rawScoreRef.current + timeBonus;
          const elapsed = timeLimit;
          finishGame(endScore, elapsed);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [phase, timeLimit, finishGame]);

  useEffect(() => {
    if (phase !== "playing") return;
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
          }, 3500)
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [liveBubbles, phase]);

  function handleStart() {
    playTap();
    setLiveBubbles(spawnBubbles(bubbles));
    setRawScore(0);
    setWrongCount(0);
    setCorrectCount(0);
    setSecondsLeft(timeLimit);
    setCharMood("idle");
    setPopEffects([]);
    setScoreFloats([]);
    setFinalResult(null);
    setPhase("playing");
  }

  function handlePlayAgain() {
    playTap();
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setLiveBubbles(spawnBubbles(bubbles));
    setRawScore(0);
    setWrongCount(0);
    setCorrectCount(0);
    setSecondsLeft(timeLimit);
    setCharMood("idle");
    setPopEffects([]);
    setScoreFloats([]);
    setFinalResult(null);
    setPhase("playing");
  }

  const handleBubbleTap = useCallback(
    (uid: string, isTarget: boolean, e: React.MouseEvent | React.TouchEvent) => {
      if (phase !== "playing") return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      setLiveBubbles((prev) =>
        prev.map((lb) =>
          lb.uid === uid ? { ...lb, popped: true, wrong: !isTarget } : lb
        )
      );

      const effectUid = `effect-${Date.now()}-${uid}`;
      setPopEffects((prev) => [...prev, { uid: effectUid, x: cx, y: cy, correct: isTarget }]);
      setTimeout(() => setPopEffects((prev) => prev.filter((p) => p.uid !== effectUid)), 800);

      const floatUid = `float-${Date.now()}-${uid}`;
      const pts = isTarget ? PTS_CORRECT : PTS_WRONG;
      setScoreFloats((prev) => [...prev, { uid: floatUid, x: cx, y: cy, value: pts }]);
      setTimeout(() => setScoreFloats((prev) => prev.filter((f) => f.uid !== floatUid)), 1200);

      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);

      if (isTarget) {
        playBubblePop();
        fireBubbleBurst(cx, cy, "#ffd700");
        fireMiniBurst();
        setCharMood("happy");
        setRawScore((s) => s + PTS_CORRECT);
        const newCorrect = correctCountRef.current + 1;
        setCorrectCount(newCorrect);

        if (newCorrect >= targetCount) {
          const timeBonus = secondsLeftRef.current;
          const endScore = rawScoreRef.current + PTS_CORRECT + timeBonus;
          const elapsed = timeLimit - secondsLeftRef.current;
          setTimeout(() => finishGame(endScore, elapsed), 400);
          return;
        }
      } else {
        playWrong();
        setCharMood("sad");
        setRawScore((s) => s + PTS_WRONG);
        setWrongCount((w) => w + 1);
      }

      moodTimerRef.current = setTimeout(() => setCharMood("idle"), 1200);
    },
    [phase, targetCount, timeLimit, finishGame]
  );

  /* ── Start Screen ── */
  if (phase === "idle") {
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
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ fontSize: 80, marginBottom: 8 }}
        >
          {character}
        </motion.div>

        <div style={{ position: "relative", height: 80, width: "100%", marginBottom: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -90], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: i * 0.6, ease: "easeOut" }}
              style={{ position: "absolute", left: `${15 + i * 17}%`, bottom: 0, fontSize: 32 }}
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
            fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            color: "#1c498c", marginBottom: 8,
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
            borderRadius: 20, padding: "14px 24px", marginBottom: 10,
            maxWidth: 340, border: "2px solid #bfdbfe",
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1e40af", margin: "0 0 4px" }}>
            {question}
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
            Hint: {targetHint}
          </p>
        </motion.div>

        {/* Rules callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            borderRadius: 16, padding: "10px 18px", marginBottom: 14,
            maxWidth: 340, border: "2px solid #fbbf24",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#92400e", margin: "0 0 4px" }}>
            🎯 Rules
          </p>
          <p style={{ fontSize: 12, color: "#78350f", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
            ✅ Pop the <strong>right</strong> bubbles → +{PTS_CORRECT} pts{"\n"}
            ❌ Wrong pops → {PTS_WRONG} pts{"\n"}
            ⏱️ You have <strong>{timeLimit} seconds</strong> — faster = more bonus!
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
            color: "white", border: "none", padding: "18px 56px", borderRadius: 28,
            fontSize: 22, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            cursor: "pointer", boxShadow: "0 8px 28px rgba(55,157,249,0.45)",
          }}
        >
          🫧 POP IT!
        </motion.button>
      </motion.div>
    );
  }

  /* ── Completion Screen ── */
  if (phase === "completed" && finalResult) {
    return (
      <StarReveal
        starsEarned={finalResult.starsEarned}
        score={finalResult.score}
        maxScore={finalResult.maxScore}
        accentColor={accentColor}
        characterEmoji={character}
        onPlayAgain={handlePlayAgain}
        onNextGame={onNextGame}
      />
    );
  }

  /* ── Playing Screen ── */
  const poppedTargets = correctCount;
  const targetProgress = targetCount > 0 ? (poppedTargets / targetCount) * 100 : 0;
  const timePct = timeLimit > 0 ? (secondsLeft / timeLimit) * 100 : 100;
  const isUrgent = secondsLeft <= 10;
  const isCritical = secondsLeft <= 5;
  const displayScore = Math.max(0, rawScore);

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "70vh", overflow: "hidden", padding: "0 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "12px 16px 4px" }}>
        <motion.p
          style={{ fontSize: 18, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: "0 0 4px" }}
        >
          {question}
        </motion.p>
        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: 0 }}>
          Hint: {targetHint}
        </p>

        {/* Timer bar */}
        <div style={{
          height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden",
          marginTop: 8, maxWidth: 300, margin: "8px auto 0",
          border: isCritical ? "2px solid #ef4444" : isUrgent ? "2px solid #f59e0b" : "none",
        }}>
          <motion.div
            animate={{ width: `${timePct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              height: 10, borderRadius: 5,
              background: isCritical
                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                : isUrgent
                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                  : "linear-gradient(90deg, #10b981, #059669)",
            }}
          />
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", gap: 16,
          marginTop: 6, flexWrap: "wrap",
        }}>
          {/* Timer */}
          <motion.span
            animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
            transition={isCritical ? { repeat: Infinity, duration: 0.5 } : {}}
            style={{
              fontSize: 14, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
              color: isCritical ? "#ef4444" : isUrgent ? "#f59e0b" : "#10b981",
            }}
          >
            ⏱️ {secondsLeft}s
          </motion.span>

          {/* Progress */}
          <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
            ✅ {poppedTargets}/{targetCount}
          </span>

          {/* Score */}
          <span style={{ fontSize: 13, fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#f59e0b" }}>
            ⭐ {displayScore}
          </span>

          {/* Wrong pops */}
          {wrongCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ fontSize: 13, fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#ef4444" }}
            >
              ❌ {wrongCount}
            </motion.span>
          )}
        </div>

        {/* Target progress bar */}
        <div style={{
          height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden",
          marginTop: 6, maxWidth: 300, margin: "6px auto 0",
        }}>
          <motion.div
            animate={{ width: `${targetProgress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: 6, background: "linear-gradient(90deg, #379df9, #8b5cf6)", borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Bubble arena */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        {liveBubbles.map((bubble) => {
          if (bubble.popped) return null;
          return (
            <motion.button
              key={bubble.uid}
              initial={{ bottom: -120, opacity: 0 }}
              animate={{
                bottom: [-(bubble.size), 100, 250, 400, 550],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: bubble.speed,
                delay: bubble.startDelay,
                repeat: Infinity,
                ease: "linear",
              }}
              onClick={(e) => handleBubbleTap(bubble.uid, bubble.item.isTarget, e)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              style={{
                position: "absolute",
                left: `${bubble.x}%`,
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
                marginLeft: -(bubble.size / 2),
                touchAction: "manipulation",
              }}
            >
              <span style={{ fontSize: bubble.size * 0.4, lineHeight: 1 }}>{bubble.item.emoji}</span>
              <span style={{
                fontSize: bubble.size * 0.15, fontWeight: 800,
                fontFamily: "Fredoka, sans-serif", color: "#1c498c", marginTop: 2,
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
                left: effect.x - 30, top: effect.y - 30,
                width: 60, height: 60, borderRadius: "50%",
                background: effect.correct
                  ? "radial-gradient(circle, rgba(255,215,0,0.8), transparent)"
                  : "radial-gradient(circle, rgba(255,100,100,0.6), transparent)",
                pointerEvents: "none", zIndex: 50,
              }}
            >
              <span style={{ fontSize: 28, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                {effect.correct ? "✨" : "💨"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating score numbers */}
        <AnimatePresence>
          {scoreFloats.map((sf) => (
            <motion.div
              key={sf.uid}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -60, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                position: "fixed",
                left: sf.x - 20, top: sf.y - 30,
                pointerEvents: "none", zIndex: 55,
                fontSize: 22, fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                color: sf.value > 0 ? "#10b981" : "#ef4444",
                textShadow: sf.value > 0
                  ? "0 2px 6px rgba(16,185,129,0.5)"
                  : "0 2px 6px rgba(239,68,68,0.5)",
              }}
            >
              {sf.value > 0 ? `+${sf.value}` : sf.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Character at bottom */}
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <motion.div
          animate={
            charMood === "happy"
              ? { y: [0, -20, 0], scale: [1, 1.3, 1] }
              : charMood === "sad"
                ? { x: [0, -8, 8, -4, 0], scale: [1, 0.9, 1] }
                : { y: [0, -6, 0] }
          }
          transition={
            charMood === "idle"
              ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
              : { duration: 0.5, ease: "easeInOut" }
          }
          style={{ fontSize: 56, display: "inline-block" }}
        >
          {character}
        </motion.div>
        <p style={{
          fontSize: 14, fontWeight: 800, fontFamily: "Fredoka, sans-serif",
          color: charMood === "happy" ? "#10b981" : charMood === "sad" ? "#ef4444" : "#6b7280",
          margin: "4px 0 0", transition: "color 0.3s",
        }}>
          {charMood === "happy" ? "🎉 Great pop!" : charMood === "sad" ? "😅 Oops! That's wrong!" : "Tap the right bubbles!"}
        </p>
      </div>
    </div>
  );
}
