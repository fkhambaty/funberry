"use client";

import React from "react";

export interface KidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "berry" | "leaf" | "sky" | "sunshine" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<string, string> = {
  berry: "kid-glass-btn kid-glass-berry",
  leaf: "kid-glass-btn kid-glass-leaf",
  sky: "kid-glass-btn kid-glass-sky",
  sunshine: "kid-glass-btn kid-glass-sunshine",
  outline: "kid-glass-btn",
};

const sizeStyles: Record<string, string> = {
  sm: "px-5 py-2 text-sm min-h-tap",
  md: "px-7 py-3 text-base min-h-tap",
  lg: "px-9 py-4 text-lg min-h-tap-kid",
};

export function KidButton({
  children,
  onClick,
  variant = "berry",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
}: KidButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        select-none disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
