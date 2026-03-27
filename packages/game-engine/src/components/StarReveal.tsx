"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playStar, playVictory, playComplete } from "../core/sound";
import { fireStarExplosion, fireFireworks, fireGlitterStorm } from "../core/confetti";
import { getEncouragementMessage } from "../core/scoring";
import { useRankInfo } from "../core/RankContext";

interface StarRevealProps {
  starsEarned: number;
  score: number;
  maxScore: number;
  accentColor?: string;
  characterEmoji?: string;
  onPlayAgain: () => void;
  onNextGame?: () => void;
  rankInfo?: { rank: number; total: number } | null;
}

const GLITTER_COLORS = [
  "#ffd700", "#ff69b4", "#00e5ff", "#76ff03", "#ff6d00",
  "#d500f9", "#00e676", "#ffea00", "#ff4081",
];

const CELEBRATION_WORDS = ["AMAZING!", "FANTASTIC!", "SUPER STAR!", "WOW!", "YOU ROCK!"];
const PARTIAL_WORDS = ["GREAT JOB!", "KEEP GOING!", "WELL DONE!", "NICE TRY!"];

function GlitterParticle({ color, delay, x }: { color: string; delay: number; x: number }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: "110vh", opacity: [1, 0.8, 0], rotate: 360, scale: [1, 0.6] }}
      transition={{ duration: 2 + Math.random() * 1.5, delay, ease: "linear" }}
      style={{
        position: "fixed",
        top: 0,
        width: 6 + Math.random() * 5,
        height: 6 + Math.random() * 5,
        borderRadius: Math.random() > 0.5 ? "50%" : 2,
        backgroundColor: color,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

export function StarReveal({
  starsEarned,
  score,
  maxScore,
  accentColor = "#379df9",
  characterEmoji = "🦊",
  onPlayAgain,
  onNextGame,
  rankInfo: rankInfoProp,
}: StarRevealProps) {
  const contextRank = useRankInfo();
  const rankInfo = rankInfoProp ?? contextRank;
  const [phase, setPhase] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const isPerfect = starsEarned >= 3;
  const isGood = starsEarned >= 2;

  const celebWords = isPerfect ? CELEBRATION_WORDS : PARTIAL_WORDS;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (isPerfect) {
      playVictory();
    } else {
      playComplete();
    }

    // Stars one by one
    for (let i = 0; i < starsEarned; i++) {
      timers.push(setTimeout(() => playStar(i), 500 + i * 380));
    }

    // Single confetti burst after stars
    timers.push(
      setTimeout(() => {
        fireStarExplosion();
        if (isPerfect) {
          setTimeout(() => fireGlitterStorm(), 400);
        } else if (isGood) {
          setTimeout(() => fireFireworks(), 300);
        }
      }, 500 + starsEarned * 380 + 200)
    );

    // Phase transitions
    timers.push(setTimeout(() => setPhase(1), 300));
    timers.push(setTimeout(() => setPhase(2), 600 + starsEarned * 380));

    // Cycle celebration words (brief)
    const wordInterval = setInterval(() => {
      setWordIdx((i) => (i + 1) % celebWords.length);
    }, 1400);
    timers.push(setTimeout(() => clearInterval(wordInterval), 3500));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(wordInterval);
    };
  }, [starsEarned, isPerfect, isGood, celebWords.length]);

  const glitterCount = isPerfect ? 12 : isGood ? 6 : 0;

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "60vh" }}>
      {/* Glitter rain overlay */}
      {phase >= 2 && Array.from({ length: glitterCount }, (_, i) => (
        <GlitterParticle
          key={i}
          color={GLITTER_COLORS[i % GLITTER_COLORS.length]}
          delay={i * 0.1}
          x={Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400)}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{
          textAlign: "center",
          padding: "32px 24px",
          maxWidth: 460,
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Character celebration */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={phase >= 1 ? {
            scale: [0, 1.3, 1],
            rotate: [0, -15, 0],
            y: [0, -20, 0],
          } : { scale: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.1,
          }}
          style={{ fontSize: 80, marginBottom: 8, display: "inline-block" }}
        >
          {isPerfect ? "🎉" : isGood ? "🌟" : "👏"}
        </motion.div>

        {/* Character */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ delay: 0.3, y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }}
          style={{ fontSize: 48, marginBottom: 12 }}
        >
          {characterEmoji}
        </motion.div>

        {/* Cycling celebration words */}
        <div style={{ height: 52, overflow: "hidden", marginBottom: 8 }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={wordIdx}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{
                fontSize: 30,
                fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                margin: 0,
                background: isPerfect
                  ? "linear-gradient(135deg, #ff6b9d, #a855f7, #379df9)"
                  : isGood
                  ? "linear-gradient(135deg, #f59e0b, #10b981)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {celebWords[wordIdx]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Score */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            color: "#6b7280",
            marginBottom: 20,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
          }}
        >
          Score: {score}/{maxScore}
        </motion.p>

        {/* Stars */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={
                s <= starsEarned
                  ? {
                      scale: [0, 1.3, 1],
                      rotate: [0, -10, 0],
                    }
                  : { scale: 0.7, rotate: 0 }
              }
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.5 + s * 0.38,
              }}
              style={{
                fontSize: 56,
                filter: s <= starsEarned ? undefined : "grayscale(1) opacity(0.2)",
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Encouragement message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          style={{
            fontSize: 17,
            color: "#4b5563",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          {getEncouragementMessage(starsEarned)}
        </motion.p>

        {/* Rank badge — competitive nudge */}
        {rankInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, ease: "easeOut", duration: 0.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              border: "2px solid #a5b4fc",
              padding: "10px 20px",
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 24 }}>🏆</span>
            <div style={{ textAlign: "left" }}>
              <p style={{
                fontSize: 14, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
                color: "#4338ca", margin: 0,
              }}>
                You&apos;re #{rankInfo.rank} of {rankInfo.total} players!
              </p>
              <p style={{
                fontSize: 11, fontWeight: 700, color: "#6366f1",
                fontFamily: "Nunito, sans-serif", margin: 0,
              }}>
                {rankInfo.rank <= 3
                  ? "You're on the podium! Keep it up!"
                  : `${rankInfo.rank - 1} more star${rankInfo.rank - 1 !== 1 ? "s" : ""} to climb! Play more to rise!`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, ease: "easeOut", duration: 0.5 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.07, y: -4 }}
            whileTap={{ scale: 0.94 }}
            onClick={onPlayAgain}
            style={{
              background: isPerfect
                ? "linear-gradient(135deg, #ff6b9d, #a855f7)"
                : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              color: "white",
              border: "none",
              padding: "18px 48px",
              borderRadius: 28,
              fontSize: 20,
              fontWeight: 900,
              fontFamily: "Fredoka, sans-serif",
              cursor: "pointer",
              boxShadow: isPerfect
                ? "0 8px 28px rgba(168,85,247,0.5)"
                : `0 8px 28px ${accentColor}55`,
              letterSpacing: 0.5,
            }}
          >
            🔄 Play Again!
          </motion.button>

          {onNextGame && (
            <motion.button
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={onNextGame}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                padding: "14px 40px",
                borderRadius: 28,
                fontSize: 18,
                fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                cursor: "pointer",
                boxShadow: "0 6px 22px rgba(16,185,129,0.45)",
                letterSpacing: 0.5,
              }}
            >
              ➡️ Next Game!
            </motion.button>
          )}
        </motion.div>

        {/* Perfect score badge */}
        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, ease: "easeOut", duration: 0.4 }}
            style={{
              marginTop: 20,
              display: "inline-block",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "white",
              padding: "8px 20px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 900,
              fontFamily: "Fredoka, sans-serif",
              boxShadow: "0 4px 16px rgba(245,158,11,0.5)",
            }}
          >
            🏆 PERFECT SCORE! 🏆
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
