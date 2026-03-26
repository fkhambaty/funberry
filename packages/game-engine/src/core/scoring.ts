import type { GameResult } from "../types";

/**
 * Calculate star rating based on accuracy percentage.
 * 3 stars: >= 90%
 * 2 stars: >= 60%
 * 1 star:  >= 30%
 * 0 stars: < 30%
 */
export function calculateStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  if (pct >= 30) return 1;
  return 0;
}

export function buildGameResult(
  score: number,
  maxScore: number,
  timeSpent: number
): GameResult {
  const starsEarned = calculateStars(score, maxScore);
  const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, starsEarned, timeSpent, accuracy };
}

export function getEncouragementMessage(stars: number): string {
  switch (stars) {
    case 3:
      return "AMAZING! You're a superstar! 🌟";
    case 2:
      return "Great work! Almost perfect! 🎉";
    case 1:
      return "Good job! Keep trying! 👏";
    default:
      return "Nice try! Let's do it again! 💪";
  }
}
