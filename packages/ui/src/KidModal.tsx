"use client";

import React, { useEffect } from "react";

export interface KidModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function KidModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: KidModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          fb-modal relative w-full ${sizeClasses[size]}
          p-6 animate-pop-in
        `}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <h2 className="text-center font-display text-2xl font-bold text-sky-900 mb-4">
            {title}
          </h2>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-xl font-bold text-sky-900 transition hover:bg-sky-100"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
