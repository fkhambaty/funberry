export const PRODUCT_EVENTS = [
  "verified_signup",
  "child_created",
  "first_game",
  "game_completed",
  "checkout_started",
  "subscription_activated",
];

const EVENT_SET = new Set(PRODUCT_EVENTS);

export function weekWindow(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - 6 * 86400000);
  return {
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
    start_iso: start.toISOString(),
    end_exclusive_iso: new Date(end.getTime() + 86400000).toISOString(),
  };
}

export function summarizeWeek(rows, window) {
  const plays = rows || [];
  const games = new Set(plays.map((row) => row.game_id).filter(Boolean));
  const stars = plays.reduce((sum, row) => sum + Math.max(0, Number(row.stars_credited) || 0), 0);
  return {
    period_start: window.period_start,
    period_end: window.period_end,
    rounds: plays.length,
    distinct_games: games.size,
    stars_credited: stars,
  };
}

export async function recordProductEvent(db, name, parentId, occurredAt) {
  if (!EVENT_SET.has(name) || !parentId) return;
  await db
    .prepare("INSERT INTO product_events (id, event_name, parent_id, occurred_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), name, parentId, occurredAt)
    .run();
}

export async function recordProductEventOnce(db, name, parentId, occurredAt) {
  const existing = await db
    .prepare("SELECT id FROM product_events WHERE event_name = ? AND parent_id = ? LIMIT 1")
    .bind(name, parentId)
    .first();
  if (existing) return false;
  await recordProductEvent(db, name, parentId, occurredAt);
  return true;
}

export async function countProductEvents(db) {
  const counts = {};
  for (const name of PRODUCT_EVENTS) counts[name] = 0;
  const rows = await db
    .prepare("SELECT event_name, COUNT(*) AS n FROM product_events GROUP BY event_name")
    .all();
  for (const row of rows.results || []) {
    if (EVENT_SET.has(row.event_name)) counts[row.event_name] = Number(row.n || 0);
  }
  return {
    verifiedSignups: counts.verified_signup,
    childrenCreated: counts.child_created,
    firstGames: counts.first_game,
    gamesCompleted: counts.game_completed,
    checkoutsStarted: counts.checkout_started,
    subscriptionsActivated: counts.subscription_activated,
  };
}

export async function parentProductCounts(db, parentId) {
  const rows = await db
    .prepare("SELECT event_name, COUNT(*) AS n FROM product_events WHERE parent_id = ? GROUP BY event_name")
    .bind(parentId)
    .all();
  const counts = {};
  for (const name of PRODUCT_EVENTS) counts[name] = 0;
  for (const row of rows.results || []) counts[row.event_name] = Number(row.n || 0);
  return counts;
}

export async function loadWeeklySummary(db, parentId, childId, now = new Date()) {
  const window = weekWindow(now);
  const rows = await db
    .prepare(
      `SELECT game_id, stars_credited, played_at FROM play_events
       WHERE parent_id = ? AND child_id = ? AND played_at >= ? AND played_at < ?
       ORDER BY played_at ASC`,
    )
    .bind(parentId, childId, window.start_iso, window.end_exclusive_iso)
    .all();
  const latest = await db
    .prepare(
      `SELECT game_id, played_at FROM play_events
       WHERE parent_id = ? AND child_id = ?
       ORDER BY played_at DESC LIMIT 1`,
    )
    .bind(parentId, childId)
    .first();
  const legacy = latest
    ? null
    : await db
        .prepare(
          `SELECT game_id, COALESCE(completed_at, created_at) AS played_at
           FROM progress WHERE child_id = ?
           ORDER BY played_at DESC LIMIT 1`,
        )
        .bind(childId)
        .first();
  const continueRow = latest || legacy;
  return {
    ...summarizeWeek(rows.results || [], window),
    generated_at: now.toISOString(),
    continue_game_id: continueRow?.game_id || null,
    continue_played_at: continueRow?.played_at || null,
    streak: null,
    note: "Stars in this summary are only the improvement over a previous best. FunBerry does not track a streak.",
  };
}
