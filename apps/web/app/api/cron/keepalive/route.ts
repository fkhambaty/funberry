import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Tables that are readable by the anon role (see migration 001: zones_public_read,
 * games_public_read). Reading them goes through PostgREST into Postgres, which is the
 * "user database activity" Supabase looks at when deciding to pause a Free project.
 * Hitting /auth/v1/health or the Supabase dashboard does NOT count.
 */
const PUBLIC_TABLES = ["zones", "games"] as const;

/**
 * GET /api/cron/keepalive — scheduled by Vercel (see apps/web/vercel.json "crons").
 *
 * Supabase pauses Free-plan projects after 7 days of low database activity. When traffic
 * is quiet this route keeps a trickle of real queries flowing so the project stays up.
 * It only reads public tables with the public anon key, so it exposes nothing new.
 *
 * If CRON_SECRET is set in Vercel, the request must carry `Authorization: Bearer <secret>`
 * (Vercel adds this header automatically to cron invocations).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set." },
      { status: 503 },
    );
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const startedAt = Date.now();
  const results: Record<string, { ok: boolean; rows?: number; error?: string }> = {};

  for (const table of PUBLIC_TABLES) {
    const { data, error } = await supabase.from(table).select("id").limit(3);
    results[table] = error ? { ok: false, error: error.message } : { ok: true, rows: data?.length ?? 0 };
  }

  const allOk = Object.values(results).every((r) => r.ok);
  return NextResponse.json(
    { ok: allOk, project: new URL(url).hostname, durationMs: Date.now() - startedAt, results },
    { status: allOk ? 200 : 502 },
  );
}
