"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InteractiveStoryData, GameResult, StoryPage } from "../types";
import { buildGameResult } from "../core/scoring";
import { playTap, playCorrect, playWrong, playPageTurn } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

/* ── Typewriter Text ── */

function TypewriterText({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const id = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current > text.length) {
        clearInterval(id);
        return;
      }
      setDisplayed(text.slice(0, indexRef.current));
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          style={{ display: "inline-block", width: 2, height: "1em", verticalAlign: "text-bottom", backgroundColor: "#c084fc", marginLeft: 2, borderRadius: 1 }}
        />
      )}
    </span>
  );
}

/* ── Props ── */

export interface InteractiveStoryProps {
  data: InteractiveStoryData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
}

/* ── Component ── */

export function InteractiveStory({
  data,
  onComplete,
  accentColor = "#ec4899",
}: InteractiveStoryProps) {
  const { instruction, pages } = data;

  const pageById = useMemo(
    () => Object.fromEntries(pages.map((p) => [p.id, p])),
    [pages],
  );

  const choicePageCount = useMemo(
    () => pages.filter((p) => (p.choices?.length ?? 0) > 0).length,
    [pages],
  );
  const maxScore = Math.max(choicePageCount, 1);

  const [phase, setPhase] = useState<"start" | "playing" | "done">("start");
  const [currentPageId, setCurrentPageId] = useState(pages[0]?.id ?? "");
  const [score, setScore] = useState(0);
  const [wrongHint, setWrongHint] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [pageKey, setPageKey] = useState(0);

  const currentPage: StoryPage | undefined = pageById[currentPageId];
  const currentIndex = pages.findIndex((p) => p.id === currentPageId);

  /* ── Actions ── */

  const finishStory = useCallback(
    (finalScore: number) => {
      const elapsed = Math.max(0, Math.round((Date.now() - timeStart) / 1000));
      const effectiveScore =
        choicePageCount === 0 ? maxScore : Math.min(finalScore, maxScore);
      const r = buildGameResult(effectiveScore, maxScore, elapsed);
      setResult(r);
      setPhase("done");
      onComplete(r);
    },
    [choicePageCount, maxScore, onComplete, timeStart],
  );

  const goToPage = useCallback(
    (nextId: string, explicitScore?: number) => {
      const s = explicitScore ?? score;
      if (!pageById[nextId]) {
        finishStory(s);
        return;
      }
      playPageTurn();
      setCurrentPageId(nextId);
      setPageKey((k) => k + 1);
    },
    [pageById, score, finishStory],
  );

  const handleStart = useCallback(() => {
    if (!pages.length) return;
    playTap();
    setScore(0);
    setWrongHint(false);
    setCurrentPageId(pages[0].id);
    setPhase("playing");
    setTimeStart(Date.now());
    setResult(null);
    setPageKey(0);
  }, [pages]);

  const handleContinueLinear = useCallback(() => {
    const next = pages[currentIndex + 1];
    if (next) {
      playPageTurn();
      setCurrentPageId(next.id);
      setPageKey((k) => k + 1);
    } else {
      finishStory(score);
    }
  }, [pages, currentIndex, finishStory, score]);

  const handleChoice = useCallback(
    (choice: NonNullable<StoryPage["choices"]>[number]) => {
      if (!currentPage?.choices?.length) return;
      playTap();
      if (choice.correct) {
        setWrongHint(false);
        playCorrect();
        fireMiniBurst();
        const nextScore = score + 1;
        setScore(nextScore);
        setTimeout(() => {
          playPageTurn();
          goToPage(choice.nextPageId, nextScore);
        }, 400);
      } else {
        playWrong();
        setWrongHint(true);
        setTimeout(() => setWrongHint(false), 900);
      }
    },
    [currentPage, goToPage, score],
  );

  const handlePlayAgain = useCallback(() => {
    playTap();
    setPhase("start");
    setResult(null);
    setWrongHint(false);
    setCurrentPageId(pages[0]?.id ?? "");
    setPageKey(0);
  }, [pages]);

  /* ── Derived styles ── */

  const accentShadow = `0 8px 28px ${accentColor}55`;
  const accentShadowLight = `0 6px 20px ${accentColor}33`;

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
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" as const }}
          style={{ fontSize: 64, marginBottom: 12, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
        >
          📖
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 18 }}
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#1c498c",
            fontFamily: "Fredoka, sans-serif",
            margin: 0,
          }}
        >
          Story Time
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            color: "#6b7280",
            fontSize: 16,
            fontFamily: "Nunito, sans-serif",
            maxWidth: 320,
            lineHeight: 1.5,
            margin: "4px 0 20px",
          }}
        >
          {instruction}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.06, boxShadow: accentShadow }}
          whileTap={{ scale: 0.94 }}
          onClick={handleStart}
          disabled={!pages.length}
          style={{
            backgroundColor: accentColor,
            color: "white",
            border: "none",
            padding: "18px 52px",
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Fredoka, sans-serif",
            cursor: pages.length ? "pointer" : "not-allowed",
            opacity: pages.length ? 1 : 0.5,
            boxShadow: accentShadowLight,
          }}
        >
          Start Story!
        </motion.button>
      </motion.div>
    );
  }

  /* ── DONE SCREEN ── */

  if (phase === "done" && result) {
    return (
      <StarReveal
        starsEarned={result.starsEarned}
        score={result.score}
        maxScore={result.maxScore}
        accentColor={accentColor}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  /* ── EMPTY GUARD ── */

  if (!currentPage) {
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <p style={{ color: "#6b7280", fontFamily: "Nunito, sans-serif" }}>
          This story has no pages.
        </p>
      </div>
    );
  }

  /* ── PLAYING SCREEN ── */

  const hasChoices = (currentPage.choices?.length ?? 0) > 0;
  const isLastPage = currentIndex + 1 >= pages.length;

  return (
    <div style={{ padding: "20px 24px", maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          padding: "0 4px",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#94a3b8",
            fontFamily: "Nunito, sans-serif",
            letterSpacing: 0.4,
          }}
        >
          Page {currentIndex + 1}/{pages.length}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#10b981",
            fontFamily: "Nunito, sans-serif",
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            padding: "4px 12px",
            borderRadius: 12,
          }}
        >
          ✓ {score}/{maxScore}
        </span>
      </motion.div>

      {/* Story Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-${pageKey}`}
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -60, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          style={{
            padding: 32,
            borderRadius: 24,
            background: "linear-gradient(160deg, #fdf2f8 0%, #eff6ff 50%, #f0fdf4 100%)",
            border: "2px solid #fbcfe8",
            boxShadow: "0 8px 32px rgba(236, 72, 153, 0.10), 0 2px 8px rgba(0,0,0,0.04)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative corner sparkles */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 16,
              opacity: 0.3,
            }}
          >
            ✨
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 16,
              fontSize: 14,
              opacity: 0.25,
            }}
          >
            ✨
          </div>

          {/* Emoji */}
          <motion.div
            key={`emoji-${pageKey}`}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 12,
              delay: 0.1,
            }}
            style={{
              fontSize: 72,
              lineHeight: 1,
              margin: "0 0 20px",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.08))",
            }}
          >
            {currentPage.emoji}
          </motion.div>

          {/* Story Text (typewriter) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#1e3a5f",
              lineHeight: 1.6,
              fontFamily: "Nunito, sans-serif",
              minHeight: 60,
              margin: "0 0 4px",
            }}
          >
            <TypewriterText text={currentPage.text} speed={30} />
          </motion.div>

          {/* Choices / Navigation */}
          {hasChoices ? (
            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {currentPage.choices!.map((ch, i) => (
                <motion.button
                  key={ch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + i * 0.12,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                    boxShadow: `0 8px 24px ${accentColor}30`,
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChoice(ch)}
                  style={{
                    padding: "16px 22px",
                    borderRadius: 20,
                    border: "2px solid #f3e8ff",
                    backgroundColor: "#ffffff",
                    color: "#1c498c",
                    fontSize: 18,
                    fontWeight: 700,
                    fontFamily: "Nunito, sans-serif",
                    cursor: "pointer",
                    boxShadow: `0 4px 16px ${accentColor}18`,
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)",
                  }}
                >
                  {ch.label}
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                type: "spring",
                stiffness: 280,
                damping: 18,
              }}
              whileHover={{ scale: 1.05, boxShadow: accentShadow }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                playTap();
                handleContinueLinear();
              }}
              style={{
                marginTop: 28,
                padding: "16px 40px",
                borderRadius: 22,
                border: "none",
                backgroundColor: isLastPage ? "#8b5cf6" : accentColor,
                color: "white",
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Fredoka, sans-serif",
                cursor: "pointer",
                boxShadow: isLastPage
                  ? "0 6px 22px rgba(139, 92, 246, 0.35)"
                  : accentShadowLight,
              }}
            >
              {isLastPage ? "The End 🌟" : "Next page →"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Wrong-choice hint */}
      <AnimatePresence>
        {wrongHint && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 18,
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              border: "2px solid #fde68a",
              textAlign: "center",
              boxShadow: "0 4px 14px rgba(251, 191, 36, 0.15)",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                color: "#b45309",
                margin: 0,
                fontSize: 16,
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              Hmm, try the other answer! 💭
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
