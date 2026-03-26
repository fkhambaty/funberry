"use client";

import React, { useEffect, useState } from "react";
import { TimerProvider } from "./components/TimerProvider";
import { TimerBadge } from "./components/TimerBadge";
import { LockScreen } from "./components/LockScreen";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("@funberry/supabase")
      .then(({ getParent }) => getParent())
      .then((p) => {
        if (p?.pin) setPin(p.pin);
      })
      .catch(() => {});
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <TimerProvider pin={pin}>
      <TimerBadge />
      <LockScreen />
      {children}
    </TimerProvider>
  );
}
