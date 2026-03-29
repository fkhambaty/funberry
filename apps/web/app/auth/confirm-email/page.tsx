"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase, trySendWelcomeEmailAfterAuth } from "@funberry/supabase";

function hashHasAccessToken(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.location.hash.replace(/^#/, "");
  return new URLSearchParams(raw).has("access_token");
}

export default function ConfirmEmailPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    let subscription: { unsubscribe: () => void } | null = null;

    const finalize = async (session: Session | null) => {
      if (cancelled) return;
      try {
        if (session) {
          await trySendWelcomeEmailAfterAuth();
          await supabase.auth.signOut();
        }
      } finally {
        if (!cancelled) router.replace("/login?verified=1");
      }
    };

    let hashFlowDone = false;
    const completeHashFlow = async (session: Session | null) => {
      if (hashFlowDone || cancelled) return;
      hashFlowDone = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      subscription?.unsubscribe();
      subscription = null;
      await finalize(session);
    };

    void (async () => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const code = new URLSearchParams(search).get("code");

      if (code && typeof window !== "undefined") {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (cancelled) return;
        if (error) {
          router.replace("/login");
          return;
        }
        await finalize(data.session);
        return;
      }

      if (!hashHasAccessToken()) {
        router.replace("/login");
        return;
      }

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION") void completeHashFlow(session);
      });
      subscription = sub;

      timeoutId = window.setTimeout(() => {
        void (async () => {
          const { data } = await supabase.auth.getSession();
          await completeHashFlow(data.session);
        })();
      }, 4000);
    })();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-fuchsia-50/40 p-6">
      <p className="text-center text-lg font-semibold text-sky-900">Verifying your email…</p>
    </main>
  );
}
