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
  berry: "bg-[#fff0f3] border-[#ffc6d6]",
  leaf: "bg-[#edfcf2] border-[#aceec2]",
  sky: "bg-[#eff8ff] border-[#bee4ff]",
  sunshine: "bg-[#fffbeb] border-[#ffe588]",
  white: "bg-white border-gray-200",
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
        rounded-[1.25rem] border-2 transition-all duration-200
        ${bgColors[colorKey]}
        ${paddings[padding]}
        ${hoverable || onClick ? "hover:scale-[1.03] hover:shadow-lg cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
