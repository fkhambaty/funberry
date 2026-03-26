"use client";

import React from "react";

export interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<string, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function StarRating({
  stars,
  maxStars = 3,
  size = "md",
}: StarRatingProps) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${stars} of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`${sizeMap[size]} transition-transform duration-300 ${
            i < stars ? "scale-110" : "grayscale opacity-30"
          }`}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
