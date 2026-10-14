import { bytesToHex, sha256 } from "./crypto.js";
import { gameEntitlement } from "./gameCatalog.js";
import { json, nowIso, readJson } from "./http.js";
import { hasActivePremium } from "./payments.js";
import { recordGameProgress } from "./progress.js";
import { recordProductEvent, recordProductEventOnce } from "./analytics.js";

/**
 * Play tickets let the app's WebView run one web-only game without holding the
 * parent's bearer token. A ticket is bound to one parent, child and game, lasts
 * TICKET_MINUTES, and saves at most one round.
 */
export const TICKET_MINUTES = 30;
export const MAX_OPEN_TICKETS = 20;
const TICKET_PATTERN = /^[0-9a-f]{64}$/;

/** Entitlement check plus progress write, shared by POST /v1/progress and ticket completion. */
export async function saveEntitledRound(db, parent, child, input, now) {
  const gameId = String(input?.game_id || "");
  if (!gameId) return { status: 400, body: { error: "Missing game." } };
  const entitlement = gameEntitlement(gameId, child.total_stars, hasActivePremium(parent));
  if (entitlement.reason === "unknown") return { status: 400, body: { error: "Unknown game.", code: "unknown_game" } };
  if (!entitlement.allowed) return { status: 403, body: { error: "That game is still locked.", code: "locked" } };
  const prior = await db
    .prepare(
      `SELECT progress.id FROM progress
       JOIN children ON children.id = progress.child_id
       WHERE children.parent_id = ? LIMIT 1`,
    )
    .bind(parent.id)
    .first();
  const saved = await recordGameProgress(db, parent.id, { ...input, child_id: child.id, game_id: gameId }, now);
  if (!prior) await recordProductEventOnce(db, "first_game", parent.id, now);
  if (saved.first_completion) await recordProductEvent(db, "game_completed", parent.id, now);
  return { status: 200, saved };
}

async function ownChild(db, parentId, childId) {
  return db.prepare("SELECT * FROM children WHERE id = ? AND parent_id = ?").bind(childId, parentId).first();
}

/** POST /v1/play-tickets, signed in. Checks the child and the game before any ticket exists. */
export async function issuePlayTicket(request, db, parent, origin) {
  const body = await readJson(request);
  const child = await ownChild(db, parent.id, String(body?.child_id || ""));
  if (!child) return json({ error: "Child not found" }, 404, origin);
  const gameId = String(body?.game_id || "");
  const entitlement = gameEntitlement(gameId, child.total_stars, hasActivePremium(parent));
  if (entitlement.reason === "unknown") return json({ error: "Unknown game.", code: "unknown_game" }, 400, origin);
  if (!entitlement.allowed) return json({ error: "That game is still locked.", code: "locked" }, 403, origin);

  const now = nowIso();
  await db
    .prepare("DELETE FROM play_tickets WHERE parent_id = ? AND (expires_at <= ? OR used_at IS NOT NULL)")
    .bind(parent.id, now)
    .run();
  const open = await db.prepare("SELECT COUNT(*) AS n FROM play_tickets WHERE parent_id = ?").bind(parent.id).first();
  if (Number(open?.n || 0) >= MAX_OPEN_TICKETS) {
    return json({ error: "Too many games are open. Close one and try again." }, 429, origin);
  }
  const ticket = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + TICKET_MINUTES * 60 * 1000).toISOString();
  await db
    .prepare(
      `INSERT INTO play_tickets (token_hash, parent_id, child_id, game_id, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(await sha256(ticket), parent.id, child.id, gameId, expiresAt, now)
    .run();
  return json({ ticket, game_id: gameId, expires_at: expiresAt }, 201, origin);
}

async function liveTicket(db, body, now) {
  const ticket = String(body?.ticket || "");
  const gameId = String(body?.game_id || "");
  if (!TICKET_PATTERN.test(ticket)) return { error: "ticket_invalid" };
  const hash = await sha256(ticket);
  const row = await db.prepare("SELECT * FROM play_tickets WHERE token_hash = ?").bind(hash).first();
  if (!row || row.game_id !== gameId || row.expires_at <= now) return { error: "ticket_invalid" };
  if (row.used_at) return { error: "ticket_used" };
  return { row, hash };
}

function ticketError(code, origin) {
  return code === "ticket_used"
    ? json({ error: "This round was already saved.", code }, 409, origin)
    : json({ error: "This game link has expired. Go back and open the game again.", code }, 401, origin);
}

/** Ticket routes that run without a bearer token. Returns null for any other path. */
export async function handlePlayTicketPublic(request, db, origin, path) {
  if (request.method !== "POST") return null;
  if (path !== "/v1/play-tickets/check" && path !== "/v1/play-tickets/complete") return null;
  const body = await readJson(request);
  const now = nowIso();
  const live = await liveTicket(db, body, now);
  if (live.error) return ticketError(live.error, origin);

  if (path === "/v1/play-tickets/check") {
    return json({ ok: true, game_id: live.row.game_id, expires_at: live.row.expires_at }, 200, origin);
  }

  const claimed = await db
    .prepare("UPDATE play_tickets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
    .bind(now, live.hash, now)
    .run();
  if (Number(claimed?.meta?.changes ?? 0) !== 1) return ticketError("ticket_used", origin);

  const parent = await db.prepare("SELECT * FROM parents WHERE id = ?").bind(live.row.parent_id).first();
  const child = parent ? await ownChild(db, parent.id, live.row.child_id) : null;
  if (!parent || !child) return json({ error: "Child not found" }, 404, origin);
  const result = await saveEntitledRound(
    db,
    parent,
    child,
    {
      game_id: live.row.game_id,
      stars_earned: body?.stars_earned,
      score: body?.score,
      time_spent_seconds: body?.time_spent_seconds,
    },
    now,
  );
  if (!result.saved) return json(result.body, result.status, origin);
  return json({ stars_credited: result.saved.stars_credited, total_stars: result.saved.total_stars }, 200, origin);
}
