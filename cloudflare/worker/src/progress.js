export const STAR_CAP = 3;

export function clampStars(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(STAR_CAP, Math.floor(n)));
}

/** Stars added to a child's total: only the gain over the saved best. */
export function starsToCredit(previousBest, earned) {
  return Math.max(0, clampStars(earned) - clampStars(previousBest));
}

export function nextBestStars(previousBest, earned) {
  return Math.max(clampStars(previousBest), clampStars(earned));
}

export function reconciledStarTotal(rows) {
  return (rows || []).reduce((sum, row) => sum + clampStars(row?.stars_earned), 0);
}

export async function reconcileChildStars(db, childId, parentId, now) {
  await db
    .prepare(
      `UPDATE children SET total_stars = (
         SELECT COALESCE(SUM(stars_earned), 0) FROM progress WHERE child_id = ?
       ), updated_at = ?
       WHERE id = ? AND parent_id = ?`,
    )
    .bind(childId, now, childId, parentId)
    .run();
  const row = await db.prepare("SELECT total_stars FROM children WHERE id = ? AND parent_id = ?").bind(childId, parentId).first();
  return Number(row?.total_stars || 0);
}

/**
 * Saves one finished round. The progress row keeps the best star count.
 * total_stars is then set from the sum of those bests, so repeats cannot inflate it.
 */
export async function recordGameProgress(db, parentId, input, now) {
  const childId = String(input?.child_id || "");
  const gameId = String(input?.game_id || "");
  const stars = clampStars(input?.stars_earned);
  const incomingScore = Number(input?.score) || 0;
  const timeSpent = Math.max(0, Number(input?.time_spent_seconds) || 0);
  const existing = await db.prepare("SELECT * FROM progress WHERE child_id = ? AND game_id = ?").bind(childId, gameId).first();
  const previousBest = existing?.stars_earned || 0;
  const credited = starsToCredit(previousBest, stars);
  const best = nextBestStars(previousBest, stars);
  const score = !existing || best > clampStars(previousBest) ? incomingScore : existing.score || 0;

  let row;
  if (existing) {
    await db
      .prepare(
        `UPDATE progress
         SET stars_earned = ?, score = ?, time_spent_seconds = ?, attempts = ?, completed = ?, completed_at = ?
         WHERE id = ?`,
      )
      .bind(best, score, timeSpent, (existing.attempts || 0) + 1, best > 0 ? 1 : 0, best > 0 ? now : null, existing.id)
      .run();
    row = await db.prepare("SELECT * FROM progress WHERE id = ?").bind(existing.id).first();
  } else {
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO progress
         (id, child_id, game_id, stars_earned, score, time_spent_seconds, attempts, completed, completed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      )
      .bind(id, childId, gameId, stars, score, timeSpent, stars > 0 ? 1 : 0, stars > 0 ? now : null, now)
      .run();
    row = await db.prepare("SELECT * FROM progress WHERE id = ?").bind(id).first();
  }

  await db
    .prepare(
      `INSERT INTO play_events
       (id, parent_id, child_id, game_id, stars_earned, stars_credited, score, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), parentId, childId, gameId, stars, credited, incomingScore, now)
    .run();

  const total = await reconcileChildStars(db, childId, parentId, now);
  return {
    progress: row,
    stars_credited: credited,
    total_stars: total,
    previous_best: clampStars(previousBest),
    first_completion: clampStars(previousBest) === 0 && stars > 0,
  };
}
