import { useState, useCallback, useRef, useEffect } from "react";
import type { GameState, GameResult } from "../types";
import { buildGameResult } from "./scoring";

interface UseGameStateOptions {
  totalQuestions: number;
  maxScorePerQuestion?: number;
  timeLimit?: number | null;
  onComplete?: (result: GameResult) => void;
}

export function useGameState({
  totalQuestions,
  maxScorePerQuestion = 1,
  timeLimit = null,
  onComplete,
}: UseGameStateOptions) {
  const maxScore = totalQuestions * maxScorePerQuestion;

  const [state, setState] = useState<GameState>({
    status: "idle",
    score: 0,
    maxScore,
    starsEarned: 0,
    timeElapsed: 0,
    timeLimit,
    currentQuestion: 0,
    totalQuestions,
    answers: {},
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    timerRef.current = setInterval(() => {
      setState((prev) => {
        const newTime = prev.timeElapsed + 1;
        if (prev.timeLimit && newTime >= prev.timeLimit) {
          clearInterval(timerRef.current!);
          const result = buildGameResult(prev.score, prev.maxScore, newTime);
          onComplete?.(result);
          return { ...prev, timeElapsed: newTime, status: "completed", starsEarned: result.starsEarned };
        }
        return { ...prev, timeElapsed: newTime };
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, status: "playing", timeElapsed: 0, score: 0, currentQuestion: 0, answers: {} }));
    startTimer();
  }, []);

  const answerQuestion = useCallback(
    (questionId: string, correct: boolean) => {
      setState((prev) => {
        if (prev.status !== "playing") return prev;

        const newScore = prev.score + (correct ? maxScorePerQuestion : 0);
        const newAnswers = { ...prev.answers, [questionId]: correct };
        const newQuestionIdx = prev.currentQuestion + 1;
        const isLast = newQuestionIdx >= prev.totalQuestions;

        if (isLast) {
          stopTimer();
          const result = buildGameResult(newScore, prev.maxScore, prev.timeElapsed);
          onComplete?.(result);
          return {
            ...prev,
            score: newScore,
            answers: newAnswers,
            currentQuestion: newQuestionIdx,
            status: "completed",
            starsEarned: result.starsEarned,
          };
        }

        return {
          ...prev,
          score: newScore,
          answers: newAnswers,
          currentQuestion: newQuestionIdx,
        };
      });
    },
    [maxScorePerQuestion, onComplete]
  );

  const completeGame = useCallback(
    (finalScore: number) => {
      stopTimer();
      const result = buildGameResult(finalScore, maxScore, state.timeElapsed);
      setState((prev) => ({
        ...prev,
        score: finalScore,
        status: "completed",
        starsEarned: result.starsEarned,
      }));
      onComplete?.(result);
    },
    [maxScore, state.timeElapsed, onComplete]
  );

  const reset = useCallback(() => {
    stopTimer();
    setState({
      status: "idle",
      score: 0,
      maxScore,
      starsEarned: 0,
      timeElapsed: 0,
      timeLimit,
      currentQuestion: 0,
      totalQuestions,
      answers: {},
    });
  }, [maxScore, timeLimit, totalQuestions]);

  return {
    state,
    start,
    answerQuestion,
    completeGame,
    reset,
    isPlaying: state.status === "playing",
    isCompleted: state.status === "completed",
  };
}
