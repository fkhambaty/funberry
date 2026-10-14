"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GameShell, getZoneTheme, loadGameTemplate } from "@funberry/game-engine";
import type { GameConfig, GameResult, GameTemplateComponent } from "@funberry/game-engine";
import { allEvsGames } from "@funberry/game-engine/src/games/evs";
import {
  encodeEmbedMessage,
  isValidGameId,
  parseNativeMessage,
  type EmbedErrorCode,
  type SavedProgress,
} from "@funberry/game-engine/src/embed/bridge";
import { FUNBERRY_API } from "@funberry/supabase";

type NativeBridge = { postMessage: (message: string) => void };

declare global {
  interface Window {
    ReactNativeWebView?: NativeBridge;
  }
}

type Phase = "waiting" | "outside-app" | "checking" | "playing" | "saving" | "done" | "error";

const ERROR_COPY: Record<EmbedErrorCode, string> = {
  ticket_invalid: "This game needs to be opened again from the app.",
  ticket_used: "This round is already saved.",
  locked: "Ask a grown-up to open this game.",
  unknown_game: "We could not find this game.",
  load_failed: "This game could not load.",
  network: "We could not reach FunBerry. Check the internet and try again.",
};

function findGame(gameId: string): GameConfig | null {
  if (!isValidGameId(gameId)) return null;
  for (const games of Object.values(allEvsGames)) {
    const match = games.find((game) => game.id === gameId);
    if (match) return match;
  }
  return null;
}

async function ticketCall(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${FUNBERRY_API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await response.json().catch(() => null);
  const code =
    data && typeof data === "object" && "code" in data && typeof data.code === "string" ? data.code : null;
  return { ok: response.ok, status: response.status, data, code };
}

function errorCodeFrom(code: string | null): EmbedErrorCode {
  return code === "ticket_used" || code === "locked" || code === "unknown_game" ? code : "ticket_invalid";
}

export function EmbedGame({ gameId }: { gameId: string }) {
  const game = useMemo(() => findGame(gameId), [gameId]);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [errorCode, setErrorCode] = useState<EmbedErrorCode | null>(null);
  const [Template, setTemplate] = useState<GameTemplateComponent | null>(null);
  const ticketRef = useRef<string | null>(null);
  const reportedRef = useRef(false);

  const post = useCallback(
    (payload: Parameters<typeof encodeEmbedMessage>[1]) => {
      window.ReactNativeWebView?.postMessage(encodeEmbedMessage(gameId, payload));
    },
    [gameId],
  );

  const fail = useCallback(
    (code: EmbedErrorCode) => {
      setErrorCode(code);
      setPhase("error");
      post({ type: "error", code });
    },
    [post],
  );

  const start = useCallback(
    async (ticket: string) => {
      if (!game || ticketRef.current) return;
      ticketRef.current = ticket;
      setPhase("checking");
      try {
        const check = await ticketCall("/v1/play-tickets/check", { ticket, game_id: game.id });
        if (!check.ok) return fail(errorCodeFrom(check.code));
        const Comp = await loadGameTemplate(game.type).catch(() => null);
        if (!Comp) return fail("load_failed");
        setTemplate(() => Comp);
        setPhase("playing");
        post({ type: "loaded" });
      } catch {
        ticketRef.current = null;
        fail("network");
      }
    },
    [fail, game, post],
  );

  useEffect(() => {
    if (!game) {
      setPhase("error");
      setErrorCode("unknown_game");
      return;
    }
    if (!window.ReactNativeWebView) {
      setPhase("outside-app");
      return;
    }
    const onMessage = (event: Event) => {
      const data = (event as MessageEvent).data;
      const init = parseNativeMessage(data, game.id);
      if (init) void start(init.ticket);
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    post({ type: "ready" });
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
    };
  }, [game, post, start]);

  const onComplete = useCallback(
    async (result: GameResult) => {
      const ticket = ticketRef.current;
      if (!game || !ticket || reportedRef.current) return;
      reportedRef.current = true;
      setPhase("saving");
      let saved: SavedProgress | null = null;
      try {
        const done = await ticketCall("/v1/play-tickets/complete", {
          ticket,
          game_id: game.id,
          stars_earned: result.starsEarned,
          score: result.score,
          time_spent_seconds: result.timeSpent,
        });
        const data = done.data as Partial<SavedProgress> | null;
        if (done.ok && typeof data?.stars_credited === "number" && typeof data.total_stars === "number") {
          saved = { stars_credited: data.stars_credited, total_stars: data.total_stars };
        }
      } catch {
        saved = null;
      }
      setPhase("done");
      post({ type: "complete", result, saved });
    },
    [game, post],
  );

  if (phase === "outside-app") {
    return (
      <main className="fb-kid-world flex min-h-dvh items-center justify-center p-6">
        <div className="glass-card max-w-md rounded-3xl p-8 text-center">
          <p className="font-display text-xl font-black text-slate-800">This page opens inside the FunBerry Kids app.</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">On the website, children play from the play screen.</p>
          <Link href="/play" className="fb-cta mt-6 inline-flex min-h-tap items-center justify-center rounded-2xl px-6">
            Go to play
          </Link>
        </div>
      </main>
    );
  }

  if (!game || phase === "error") {
    return (
      <main className="fb-kid-world flex min-h-dvh items-center justify-center p-6">
        <div className="glass-card max-w-md rounded-3xl p-8 text-center" role="alert">
          <p className="font-display text-xl font-black text-slate-800">
            {ERROR_COPY[errorCode ?? "unknown_game"]}
          </p>
        </div>
      </main>
    );
  }

  if (!Template || phase === "waiting" || phase === "checking") {
    return (
      <main className="fb-kid-world flex min-h-dvh flex-col items-center justify-center p-6" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-berry-500" />
        <p className="mt-4 font-display text-base font-bold text-slate-600">Getting the game ready…</p>
      </main>
    );
  }

  const theme = getZoneTheme(game.zoneId);
  return (
    <GameShell theme={theme} title={game.title} subtitle={game.description} onClose={() => post({ type: "exit" })}>
      <Template
        data={game.data}
        accentColor={theme.accentColor}
        onComplete={(result) => void onComplete(result)}
        onNextGame={() => post({ type: "exit" })}
      />
    </GameShell>
  );
}
