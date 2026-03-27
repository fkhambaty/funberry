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
    particleCount: 30,
    spread: 60,
    origin: { y: 0.65 },
    colors: BRAND_COLORS,
    ticks: 100,
    gravity: 1.3,
    scalar: 0.85,
    disableForReducedMotion: true,
  });
}

/** Gold star-shaped confetti explosion — on game completion */
export function fireStarExplosion() {
  if (typeof window === "undefined") return;
  const starShape = confetti.shapeFromText({ text: "⭐", scalar: 1.5 });

  confetti({
    particleCount: 12,
    spread: 80,
    origin: { y: 0.45 },
    shapes: [starShape],
    scalar: 2,
    ticks: 120,
    gravity: 0.9,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 30,
    spread: 70,
    origin: { y: 0.5 },
    colors: GOLD,
    ticks: 120,
    gravity: 1,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

/** Brief side-burst fireworks — on 3-star completion */
export function fireFireworks() {
  if (typeof window === "undefined") return;

  const duration = 1200;
  const end = Date.now() + duration;
  let frameCount = 0;

  const frame = () => {
    frameCount++;
    if (frameCount % 4 !== 0) { if (Date.now() < end) requestAnimationFrame(frame); return; }
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.55 },
      colors: BRAND_COLORS,
      ticks: 100,
      gravity: 1.2,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.55 },
      colors: BRAND_COLORS,
      ticks: 100,
      gravity: 1.2,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/** Brief glitter accent — for perfect scores */
export function fireGlitterStorm() {
  if (typeof window === "undefined") return;

  const starShape = confetti.shapeFromText({ text: "⭐", scalar: 1.2 });

  confetti({
    particleCount: 40,
    spread: 120,
    origin: { x: 0.5, y: 0.4 },
    colors: GLITTER,
    ticks: 140,
    gravity: 0.8,
    scalar: 0.8,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 10,
    spread: 100,
    origin: { x: 0.5, y: 0.35 },
    shapes: [starShape],
    scalar: 2,
    ticks: 140,
    gravity: 0.7,
    disableForReducedMotion: true,
  });
}

/** Subtle rainbow arc */
export function fireRainbow() {
  if (typeof window === "undefined") return;

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 8,
        angle: 90,
        spread: 15,
        origin: { x: 0.15 + i * 0.175, y: 0.5 },
        colors: [RAINBOW[i]],
        ticks: 100,
        gravity: 1,
        startVelocity: 25,
        disableForReducedMotion: true,
      });
    }, i * 60);
  }
}

/** Zone-themed emoji rain */
export function fireEmojiBurst(emojis: string[]) {
  if (typeof window === "undefined" || !emojis.length) return;
  const shapes = emojis.map((e) => confetti.shapeFromText({ text: e, scalar: 1.5 }));

  confetti({
    particleCount: 12,
    spread: 120,
    origin: { y: 0.3 },
    shapes,
    scalar: 2,
    ticks: 120,
    gravity: 0.8,
    disableForReducedMotion: true,
  });
}

/** Small sparkle burst at a specific screen position */
export function fireSparkleAt(x: number, y: number) {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 10,
    spread: 40,
    startVelocity: 14,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: GOLD,
    ticks: 60,
    gravity: 1.6,
    scalar: 0.55,
    disableForReducedMotion: true,
  });
}

/** Mini burst for correct answers (lighter than full confetti) */
export function fireMiniBurst() {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 12,
    spread: 40,
    origin: { y: 0.62 },
    colors: ["#22c55e", "#86efac", "#fbbf24", "#a78bfa"],
    ticks: 60,
    gravity: 1.6,
    scalar: 0.6,
    disableForReducedMotion: true,
  });
}

/** Bubble pop burst at position — for BubblePop game */
export function fireBubbleBurst(x: number, y: number, color: string) {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 8,
    spread: 360,
    startVelocity: 10,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: [color, "#ffffff", "#ffd700"],
    ticks: 50,
    gravity: 1.8,
    scalar: 0.45,
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
