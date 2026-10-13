"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TimerProvider } from "./components/TimerProvider";
import { TimerBadge } from "./components/TimerBadge";
import { LockScreen } from "./components/LockScreen";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [pinSet, setPinSet] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    import("@funberry/supabase")
      .then(async ({ getParent, getCurrentUser, supabase }) => {
        const user = await getCurrentUser();
        if (!mounted) return;
        setAuthUserId(user?.id ?? null);
        if (user) {
          const p = await getParent();
          if (mounted) setPinSet(Boolean(p?.pin_set ?? p?.pin));
        } else {
          setPinSet(false);
        }

        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const nextUserId = session?.user?.id ?? null;
          if (!mounted) return;
          setAuthUserId(nextUserId);
          if (!nextUserId) {
            setPinSet(false);
            return;
          }
          const p = await getParent();
          if (mounted) setPinSet(Boolean(p?.pin_set ?? p?.pin));
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (!mounted) return;
        setAuthUserId(null);
        setPinSet(false);
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const isParentSurface = pathname?.startsWith("/dashboard");
  // The kid play surface (/play) has its own themed Home control, so the global
  // floating Home button is hidden there to avoid a confusing duplicate button.
  const hideFloatingHome =
    pathname === "/" ||
    pathname?.startsWith("/play") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/admin");
  const homeHref = isParentSurface ? "/dashboard" : "/play";

  return (
    <TimerProvider
      key={`timer-${authUserId ?? "guest"}`}
      pinSet={pinSet}
      storageKey={`funberrykids_timer_${authUserId ?? "guest"}`}
      enabled={Boolean(authUserId)}
    >
      <TimerBadge />
      <LockScreen />
      {!hideFloatingHome ? (
        <Link
          href={homeHref}
          aria-label={isParentSurface ? "Go to parent home" : "Go to play home"}
          className="fb-float-home"
        >
          <span aria-hidden>🏠</span>
          Home
        </Link>
      ) : null}
      {children}
    </TimerProvider>
  );
}
