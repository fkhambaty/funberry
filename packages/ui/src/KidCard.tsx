"use client";

import React from "react";

export interface KidCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  colorKey?: "berry" | "leaf" | "sky" | "sunshine" | "white";
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
  className?: string;
}

const bgColors: Record<string, string> = {
  berry: "bg-berry-50 border-berry-200",
  leaf: "bg-leaf-50 border-leaf-200",
  sky: "bg-sky-50 border-sky-200",
  sunshine: "bg-sunshine-50 border-sunshine-200",
  white: "bg-paper border-white",
};

const paddings: Record<string, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function KidCard({
  children,
  onClick,
  colorKey = "white",
  padding = "md",
  hoverable = false,
  className = "",
}: KidCardProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`
        kid-glass-panel text-left
        ${bgColors[colorKey]}
        ${paddings[padding]}
        ${hoverable || onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
