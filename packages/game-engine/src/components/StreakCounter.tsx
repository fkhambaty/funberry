"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakCounterProps {
  count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
  if (count < 2) return null;

  const intensity = Math.min(count, 8);
  const hue = 120 - intensity * 10;
  const bgColor = count >= 5
    ? `hsl(${hue}, 90%, 50%)`
    : count >= 3
      ? "#f59e0b"
      : "#22c55e";

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={count}
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 15 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 14px",
          borderRadius: 20,
          backgroundColor: bgColor,
          color: "white",
          fontWeight: 800,
          fontFamily: "Fredoka, sans-serif",
          fontSize: 16 + Math.min(count, 6),
          boxShadow: `0 4px 15px ${bgColor}66`,
        }}
      >
        <span>{count}x</span>
        {count >= 5 && (
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >
            🔥
          </motion.span>
        )}
        {count >= 3 && count < 5 && <span>⚡</span>}
      </motion.div>
    </AnimatePresence>
  );
}
