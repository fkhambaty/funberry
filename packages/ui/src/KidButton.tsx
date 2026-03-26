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
}

const variantStyles: Record<string, string> = {
  berry:
    "bg-[#ff2d6a] hover:bg-[#f20d55] text-white shadow-[0_4px_0_#cc0445]",
  leaf:
    "bg-[#18b05a] hover:bg-[#0c8e47] text-white shadow-[0_4px_0_#0a713b]",
  sky:
    "bg-[#379df9] hover:bg-[#2180ee] text-white shadow-[0_4px_0_#1969db]",
  sunshine:
    "bg-[#ffbe20] hover:bg-[#f99b07] text-[#7a340d] shadow-[0_4px_0_#dd7402]",
  outline:
    "bg-white hover:bg-gray-50 text-[#1c498c] border-3 border-[#bee4ff] shadow-[0_4px_0_#bee4ff]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-5 py-2 text-sm rounded-2xl",
  md: "px-7 py-3 text-base rounded-2xl",
  lg: "px-9 py-4 text-lg rounded-[1.25rem]",
};

export function KidButton({
  children,
  onClick,
  variant = "berry",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
}: KidButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-bold font-[Nunito,sans-serif] transition-all duration-150 select-none
        active:translate-y-[2px] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
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
