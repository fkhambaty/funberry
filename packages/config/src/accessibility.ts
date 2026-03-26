/**
 * Accessibility constants and utilities for kid-friendly apps.
 * Following WCAG 2.1 AA standards + kid-specific UX guidelines.
 */

export const a11y = {
  /** Minimum tap target size for children (larger than standard 48dp) */
  minTapTarget: 64,

  /** Minimum font size for body text (children need larger text) */
  minFontSize: 16,

  /** Minimum contrast ratio for text (WCAG AA = 4.5:1) */
  minContrastRatio: 4.5,

  /** Maximum game session duration in minutes before rest reminder */
  maxSessionMinutes: 30,

  /** Animation duration should be reasonable */
  maxAnimationDuration: 500,

  /** Parental gate math problem range */
  parentalGateMin: 10,
  parentalGateMax: 40,
} as const;

/**
 * Screen reader labels for common game actions.
 */
export const srLabels = {
  startGame: "Start the game",
  playAgain: "Play the game again",
  nextGame: "Go to the next game",
  backToZone: "Go back to the zone",
  correct: "Correct answer!",
  incorrect: "Not quite right, try again",
  starEarned: (n: number) => `You earned ${n} star${n === 1 ? "" : "s"}`,
  zoneUnlocked: (name: string) => `${name} zone is now unlocked!`,
  zoneLocked: (name: string, stars: number) =>
    `${name} zone is locked. You need ${stars} stars to unlock it.`,
} as const;
