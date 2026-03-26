"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface FloatingEmojisProps {
  emojis: string[];
  count?: number;
}

export function FloatingEmojis({ emojis, count = 8 }: FloatingEmojisProps) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        x: 5 + Math.random() * 90,
        size: 18 + Math.random() * 16,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 30,
        opacity: 0.08 + Math.random() * 0.1,
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
          initial={{ y: "110vh", x: `${item.x}vw`, opacity: 0 }}
          animate={{
            y: "-10vh",
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
