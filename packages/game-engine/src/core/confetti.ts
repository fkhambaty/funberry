"use client";

import confetti from "canvas-confetti";

const BRAND_COLORS = ["#ff2d6a", "#18b05a", "#379df9", "#ffbe20", "#ec4899", "#8b5cf6"];
const GOLD = ["#fbbf24", "#f59e0b", "#d97706", "#fde68a"];
const RAINBOW = ["#ff0000", "#ff7700", "#ffff00", "#00cc00", "#0000ff", "#8b00ff", "#ff00aa"];
const GLITTER = ["#ffd700", "#ff69b4", "#00ffff", "#ff6347", "#7fffd4", "#dda0dd", "#98fb98", "#fff44f", "#ff85a1"];

/** Standard celebration burst — on correct answer */
export function fireConfetti() {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 55,
    spread: 75,
    origin: { y: 0.65 },
    colors: BRAND_COLORS,
    ticks: 140,
    gravity: 1.1,
    scalar: 1.0,
    disableForReducedMotion: true,
  });
}

/** Gold star-shaped confetti explosion — on game completion */
export function fireStarExplosion() {
  if (typeof window === "undefined") return;
  const starShape = confetti.shapeFromText({ text: "⭐", scalar: 2 });
  const heartShape = confetti.shapeFromText({ text: "💖", scalar: 2 });

  confetti({
    particleCount: 30,
    spread: 120,
    origin: { y: 0.45 },
    shapes: [starShape, heartShape],
    scalar: 2.5,
    ticks: 200,
    gravity: 0.7,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.5 },
    colors: GOLD,
    ticks: 200,
    gravity: 0.75,
    scalar: 1.1,
    disableForReducedMotion: true,
  });
}

/** Multi-burst fireworks — on 3-star completion (more intense) */
export function fireFireworks() {
  if (typeof window === "undefined") return;

  const duration = 3500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.55 },
      colors: BRAND_COLORS,
      ticks: 180,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.55 },
      colors: BRAND_COLORS,
      ticks: 180,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 5,
      angle: 90,
      spread: 80,
      origin: { x: 0.5, y: 0.2 },
      colors: RAINBOW,
      ticks: 200,
      gravity: 0.6,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/**
 * 🌈✨ EPIC GLITTER STORM — full-screen 4-second celebration
 * Designed to be the most exciting thing a child has ever seen.
 * Used for perfect scores and special achievements.
 */
export function fireGlitterStorm() {
  if (typeof window === "undefined") return;

  const duration = 4500;
  const end = Date.now() + duration;

  const starShape = confetti.shapeFromText({ text: "⭐", scalar: 1.5 });
  const heartShape = confetti.shapeFromText({ text: "💖", scalar: 1.5 });
  const diamondShape = confetti.shapeFromText({ text: "💎", scalar: 1.5 });
  const balloonShape = confetti.shapeFromText({ text: "🎈", scalar: 1.5 });

  // Initial huge burst from center
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { x: 0.5, y: 0.4 },
    colors: GLITTER,
    ticks: 300,
    gravity: 0.5,
    scalar: 0.9,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 40,
    spread: 160,
    origin: { x: 0.5, y: 0.35 },
    shapes: [starShape, heartShape, diamondShape, balloonShape],
    scalar: 2.5,
    ticks: 350,
    gravity: 0.4,
    disableForReducedMotion: true,
  });

  const frame = () => {
    // Sides burst
    confetti({
      particleCount: 10,
      angle: 65,
      spread: 80,
      origin: { x: 0, y: Math.random() * 0.7 },
      colors: GLITTER,
      ticks: 250,
      scalar: 0.85,
      gravity: 0.6,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 10,
      angle: 115,
      spread: 80,
      origin: { x: 1, y: Math.random() * 0.7 },
      colors: GLITTER,
      ticks: 250,
      scalar: 0.85,
      gravity: 0.6,
      disableForReducedMotion: true,
    });
    // Emoji shapes from top
    confetti({
      particleCount: 5,
      spread: 130,
      origin: { x: Math.random(), y: 0 },
      shapes: [starShape, heartShape],
      scalar: 2.2,
      ticks: 300,
      gravity: 0.5,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/** 🌈 Rainbow arc across the screen */
export function fireRainbow() {
  if (typeof window === "undefined") return;

  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 90,
        spread: 20,
        origin: { x: 0.1 + i * 0.13, y: 0.5 },
        colors: [RAINBOW[i]],
        ticks: 220,
        gravity: 0.7,
        startVelocity: 35,
        disableForReducedMotion: true,
      });
    }, i * 80);
  }
}

/** Zone-themed emoji rain */
export function fireEmojiBurst(emojis: string[]) {
  if (typeof window === "undefined" || !emojis.length) return;
  const shapes = emojis.map((e) => confetti.shapeFromText({ text: e, scalar: 2 }));

  confetti({
    particleCount: 30,
    spread: 180,
    origin: { y: 0.25 },
    shapes,
    scalar: 2.8,
    ticks: 220,
    gravity: 0.55,
    disableForReducedMotion: true,
  });
}

/** Small sparkle burst at a specific screen position */
export function fireSparkleAt(x: number, y: number) {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 20,
    spread: 50,
    startVelocity: 18,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: GOLD,
    ticks: 80,
    gravity: 1.4,
    scalar: 0.65,
    disableForReducedMotion: true,
  });
}

/** Mini burst for correct answers (lighter than full confetti) */
export function fireMiniBurst() {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 25,
    spread: 50,
    origin: { y: 0.62 },
    colors: ["#22c55e", "#86efac", "#fbbf24", "#a78bfa"],
    ticks: 80,
    gravity: 1.4,
    scalar: 0.75,
    disableForReducedMotion: true,
  });
}

/** Bubble pop burst at position — for BubblePop game */
export function fireBubbleBurst(x: number, y: number, color: string) {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 18,
    spread: 360,
    startVelocity: 12,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: [color, "#ffffff", "#ffd700"],
    ticks: 70,
    gravity: 1.6,
    scalar: 0.55,
    disableForReducedMotion: true,
  });
}

// Re-export old types for backward compat
export interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

export function generateConfetti(count = 30): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 40 + 10),
    color: BRAND_COLORS[i % BRAND_COLORS.length],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 0.5,
  }));
}
