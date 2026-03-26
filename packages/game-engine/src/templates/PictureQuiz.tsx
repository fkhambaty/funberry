"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PictureQuizData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { StarReveal } from "../components/StarReveal";
import { playTap, playCorrect, playWrong, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";

export interface PictureQuizProps {
  data: PictureQuizData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

export function PictureQuiz({ data, onComplete, accentColor = "#379df9" }: PictureQuizProps) {
  const { questions } = data;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } =
    useGameState({ totalQuestions: questions.length, onComplete });

  const currentQ = questions[state.currentQuestion];

  const handleSelect = useCallback(
    (optionId: string) => {
      if (showFeedback || !isPlaying) return;
      playTap();
      setSelectedId(optionId);
      const correct = optionId === currentQ.correctId;
      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        playCorrect();
        fireMiniBurst();
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 2) playStreak(newStreak);
      } else {
        playWrong();
        setStreak(0);
      }

      setTimeout(() => {
        answerQuestion(currentQ.id, correct);
        setSelectedId(null);
        setShowFeedback(false);
        setQuestionKey(k => k + 1);
      }, 1400);
    },
    [showFeedback, isPlaying, currentQ, answerQuestion, streak]
  );

  if (!isPlaying && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ textAlign: "center", padding: 40 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: 64, marginBottom: 20 }}
        >
          ❓
        </motion.div>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: "#1c498c", marginBottom: 10,
          fontFamily: "Fredoka, sans-serif",
        }}>
          Picture Quiz
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 28, fontSize: 16, maxWidth: 320, margin: "0 auto 28px" }}>
          {data.instruction}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playTap(); start(); }}
          style={{
            backgroundColor: accentColor,
            color: "white",
            border: "none",
            padding: "18px 48px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: `0 8px 25px ${accentColor}44`,
          }}
        >
          Start Quiz!
        </motion.button>
      </motion.div>
    );
  }

  if (isCompleted) {
    return (
      <StarReveal
        starsEarned={state.starsEarned}
        score={state.score}
        maxScore={state.maxScore}
        accentColor={accentColor}
        onPlayAgain={() => { playTap(); reset(); setStreak(0); setQuestionKey(0); }}
      />
    );
  }

  return (
    <div style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}>
      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${questionKey}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h3 style={{
            fontSize: 22, fontWeight: 800, color: "#1c498c", textAlign: "center",
            marginBottom: 24, fontFamily: "Fredoka, sans-serif", lineHeight: 1.4,
          }}>
            {currentQ.question}
          </h3>

          {/* Options grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {currentQ.options.map((opt, i) => {
              let bg = "white";
              let border = "#e5e7eb";
              let shadow = "0 4px 15px rgba(0,0,0,0.06)";
              let textColor = "#374151";

              if (showFeedback && opt.id === currentQ.correctId) {
                bg = "linear-gradient(135deg, #d1fae5, #a7f3d0)";
                border = "#10b981";
                shadow = "0 4px 20px rgba(16,185,129,0.3)";
                textColor = "#065f46";
              } else if (showFeedback && opt.id === selectedId && !isCorrect) {
                bg = "linear-gradient(135deg, #ffe4e6, #fecdd3)";
                border = "#f43f5e";
                shadow = "0 4px 20px rgba(244,63,94,0.3)";
                textColor = "#9f1239";
              } else if (opt.id === selectedId) {
                bg = `linear-gradient(135deg, ${accentColor}15, ${accentColor}25)`;
                border = accentColor;
                shadow = `0 4px 20px ${accentColor}33`;
              }

              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={!showFeedback ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!showFeedback ? { scale: 0.97 } : {}}
                  onClick={() => handleSelect(opt.id)}
                  className={showFeedback && opt.id === selectedId && !isCorrect ? "animate-wiggle" : ""}
                  style={{
                    background: bg,
                    border: `3px solid ${border}`,
                    borderRadius: 20,
                    padding: "20px 16px",
                    cursor: showFeedback ? "default" : "pointer",
                    textAlign: "center",
                    boxShadow: shadow,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.span
                    style={{ fontSize: 44, display: "block", marginBottom: 8 }}
                    animate={showFeedback && opt.id === currentQ.correctId ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {opt.emoji}
                  </motion.span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: textColor, fontFamily: "Nunito, sans-serif" }}>
                    {opt.label}
                  </span>
                  {showFeedback && opt.id === currentQ.correctId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  marginTop: 20,
                  padding: "16px 20px",
                  borderRadius: 20,
                  background: isCorrect
                    ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    : "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                  textAlign: "center",
                  border: `2px solid ${isCorrect ? "#a7f3d0" : "#fecdd3"}`,
                }}
              >
                <p style={{
                  fontWeight: 800, fontSize: 17,
                  color: isCorrect ? "#065f46" : "#9f1239",
                  fontFamily: "Fredoka, sans-serif",
                  margin: 0,
                }}>
                  {isCorrect ? "Correct! 🎉" : "Not quite! 🤔"}
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, marginBottom: 0 }}>
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
