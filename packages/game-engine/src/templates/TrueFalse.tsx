"use client";

/**
 * ✅❌ TRUE OR FALSE
 * Show a statement with an emoji. Kid taps True or False.
 * Fast-paced, quiz-style, different feel from PictureQuiz.
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TrueFalseData, GameResult } from "../types";
import { useGameState } from "../core/useGameState";
import { StarReveal } from "../components/StarReveal";
import { playCorrect, playWrong, playTap, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";

export interface TrueFalseProps {
  data: TrueFalseData;
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

export function TrueFalse({ data, onComplete, accentColor = "#379df9", onNextGame }: TrueFalseProps) {
  const { instruction, questions } = data;

  const [shuffledQs] = useState(() => shuffleArray(questions));

  const { state, start, answerQuestion, reset, isPlaying, isCompleted } = useGameState({
    totalQuestions: questions.length,
    onComplete,
  });

  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentQ = shuffledQs[qIdx];

  const handleStart = useCallback(() => {
    playTap();
    setQIdx(0);
    setAnswered(null);
    setCorrect(false);
    setStreak(0);
    start();
  }, [start]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    setQIdx(0);
    setAnswered(null);
    setCorrect(false);
    setStreak(0);
    reset();
  }, [reset]);

  const handleAnswer = useCallback(
    (userSaysTrue: boolean) => {
      if (!isPlaying || answered !== null) return;
      playTap();

      const isCorrect = userSaysTrue === currentQ.isTrue;
      setAnswered(userSaysTrue);
      setCorrect(isCorrect);

      if (isCorrect) {
        playCorrect();
        fireMiniBurst();
        setStreak((s) => s + 1);
        if (streak >= 2) playStreak();
      } else {
        playWrong();
        setStreak(0);
      }

      answerQuestion(currentQ.id, isCorrect);

      setTimeout(() => {
        setAnswered(null);
        setCorrect(false);
        setQIdx((i) => i + 1);
      }, 2000);
    },
    [isPlaying, answered, currentQ, answerQuestion, streak]
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
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ fontSize: 72, marginBottom: 12 }}
        >
          🤔
        </motion.div>

        <h2 style={{
          fontSize: 28, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
          color: "#1c498c", marginBottom: 8,
        }}>
          True or False?
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
            borderRadius: 20, padding: "14px 24px", marginBottom: 20,
            maxWidth: 340, border: "2px solid #bfdbfe",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "#1e40af", margin: 0 }}>
            {instruction}
          </p>
        </motion.div>

        <p style={{
          color: "#6b7280", marginBottom: 28, fontSize: 15,
          fontFamily: "Nunito, sans-serif", fontWeight: 600,
        }}>
          Read the statement and decide — is it true? 🧐
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
          🧠 Let&apos;s Go!
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
  if (!currentQ) return null;

  const progress = questions.length > 0 ? (qIdx / questions.length) * 100 : 0;

  return (
    <div style={{ padding: "16px 20px", maxWidth: 460, margin: "0 auto" }}>
      {/* Progress */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 700, margin: "0 0 4px" }}>
          Question {qIdx + 1} of {questions.length}
        </p>
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", maxWidth: 280, margin: "0 auto" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: 8, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, borderRadius: 4 }}
          />
        </div>
        {streak >= 2 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              display: "inline-block", marginTop: 6,
              fontSize: 13, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
              color: "#f59e0b", background: "#fffbeb", padding: "2px 10px",
              borderRadius: 10, border: "2px solid #fcd34d",
            }}
          >
            🔥 {streak} streak!
          </motion.span>
        )}
      </div>

      {/* Statement card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
          style={{
            background: "white", borderRadius: 24, padding: "28px 24px",
            textAlign: "center", marginBottom: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            border: answered !== null
              ? `3px solid ${correct ? "#10b981" : "#ef4444"}`
              : "3px solid #e5e7eb",
            transition: "border-color 0.3s",
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ fontSize: 56, marginBottom: 12 }}
          >
            {currentQ.emoji}
          </motion.div>

          <p style={{
            fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
            color: "#1c498c", lineHeight: 1.4, margin: "0 0 8px",
          }}>
            &ldquo;{currentQ.statement}&rdquo;
          </p>

          {/* Explanation after answering */}
          <AnimatePresence>
            {answered !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 14,
                  background: correct ? "#ecfdf5" : "#fef2f2",
                  border: `2px solid ${correct ? "#a7f3d0" : "#fca5a5"}`,
                }}>
                  <p style={{
                    fontSize: 15, fontWeight: 800, fontFamily: "Fredoka, sans-serif",
                    color: correct ? "#065f46" : "#991b1b", margin: "0 0 4px",
                  }}>
                    {correct ? "🎉 Correct!" : "😅 Oops!"}
                    {" "}The answer is {currentQ.isTrue ? "TRUE ✅" : "FALSE ❌"}
                  </p>
                  <p style={{ fontSize: 13, color: "#4b5563", fontFamily: "Nunito, sans-serif", fontWeight: 600, margin: 0 }}>
                    {currentQ.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* True / False buttons */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <motion.button
          whileHover={answered === null ? { scale: 1.06, y: -4 } : {}}
          whileTap={answered === null ? { scale: 0.94 } : {}}
          onClick={() => handleAnswer(true)}
          disabled={answered !== null}
          style={{
            flex: 1, maxWidth: 180, padding: "20px 16px", borderRadius: 22,
            border: answered === true
              ? `3px solid ${correct ? "#10b981" : "#ef4444"}`
              : "3px solid #a7f3d0",
            background: answered === true
              ? (correct ? "#ecfdf5" : "#fef2f2")
              : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            cursor: answered !== null ? "default" : "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            boxShadow: "0 4px 14px rgba(16,185,129,0.2)",
            opacity: answered !== null && answered !== true ? 0.5 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <span style={{ fontSize: 36 }}>✅</span>
          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#065f46" }}>
            TRUE
          </span>
        </motion.button>

        <motion.button
          whileHover={answered === null ? { scale: 1.06, y: -4 } : {}}
          whileTap={answered === null ? { scale: 0.94 } : {}}
          onClick={() => handleAnswer(false)}
          disabled={answered !== null}
          style={{
            flex: 1, maxWidth: 180, padding: "20px 16px", borderRadius: 22,
            border: answered === false
              ? `3px solid ${correct ? "#10b981" : "#ef4444"}`
              : "3px solid #fca5a5",
            background: answered === false
              ? (correct ? "#ecfdf5" : "#fef2f2")
              : "linear-gradient(135deg, #fef2f2, #fecaca)",
            cursor: answered !== null ? "default" : "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            boxShadow: "0 4px 14px rgba(239,68,68,0.15)",
            opacity: answered !== null && answered !== false ? 0.5 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <span style={{ fontSize: 36 }}>❌</span>
          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#991b1b" }}>
            FALSE
          </span>
        </motion.button>
      </div>
    </div>
  );
}
