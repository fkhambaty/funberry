"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface FloatingEmojisProps {
  emojis: string[];
  count?: number;
}

function emojiSpec(i: number) {
  const n = (i * 53 + 17) % 100;
  return {
    x: 5 + (n % 86),
    size: 18 + (n % 16),
    duration: 12 + (n % 10),
    delay: (i % 8) * 0.8,
    drift: (n % 30) - 15,
    opacity: 0.08 + (n % 10) / 100,
  };
}

export function FloatingEmojis({ emojis, count = 8 }: FloatingEmojisProps) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length] ?? "⭐",
        ...emojiSpec(i),
      })),
    [emojis, count]
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
      aria-hidden
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: "110dvh", x: `${item.x}vw`, opacity: 0 }}
          animate={{
            y: "-10dvh",
            x: `${item.x + item.drift}vw`,
            opacity: [0, item.opacity, item.opacity, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            fontSize: item.size,
            willChange: "transform",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}
