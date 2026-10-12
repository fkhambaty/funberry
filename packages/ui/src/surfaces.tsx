"use client";

import React from "react";

/** Centered auth meadow. Presentation only — forms keep their own handlers. */
export function AuthStage({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "leaf";
}) {
  return <main className={tone === "leaf" ? "fb-auth fb-auth-leaf" : "fb-auth"}>{children}</main>;
}

export function Notice({
  tone,
  children,
}: {
  tone: "ok" | "bad";
  children: React.ReactNode;
}) {
  return (
    <div className={tone === "ok" ? "fb-notice fb-notice-ok" : "fb-notice fb-notice-bad"} role={tone === "bad" ? "alert" : "status"}>
      {children}
    </div>
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, className = "", id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <label className="fb-label" htmlFor={fieldId}>
        {label}
      </label>
      {hint ? <span className="fb-hint">{hint}</span> : null}
      <input id={fieldId} className={`fb-field ${className}`.trim()} {...props} />
    </div>
  );
}
