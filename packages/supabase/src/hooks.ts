import { supabase } from "./client";
import {
  buildParentCoachingReport,
  FALLBACK_COACHING_AXES,
  FALLBACK_CONTRIBUTIONS,
  type CoachingContributionRow,
  type CoachingCoreCapabilityRow,
  type CoachingSkillAxisRow,
  type ParentCoachingReport,
  type ProgressRowLike,
  type SkillAxisCapabilityMapRow,
} from "./coachingReport";
import type { Child, Database, Parent, Progress, Unlock, Reward } from "./types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string, pin?: string) {
  const siteUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://funberrykids-web.vercel.app";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/dashboard` },
  });
  if (error) throw error;
  if (data.user) {
    await supabase.from("parents").insert({
      id: data.user.id,
      email,
      name,
      ...(pin ? { pin } : {}),
    } as never);
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Parent ────────────────────────────────────────────────────────────────────

export async function getParent(): Promise<Parent | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("parents")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as Parent;
}

export async function updateParentPin(pin: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("parents")
    .update({ pin } as never)
    .eq("id", user.id);
  if (error) throw error;
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  const parent = await getParent();
  if (!parent || !parent.pin) return false;
  return parent.pin === pin;
}

export async function updateParentPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ── Children ──────────────────────────────────────────────────────────────────

export async function getChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Child[];
}

/**
 * Add a child. photoUrl is a base64 data URL (e.g. "data:image/jpeg;base64,...")
 * or a cartoon-face emoji string. Stored in `photo_url` column.
 */
export async function addChild(
  name: string,
  age: number,
  photoUrl?: string | null
): Promise<Child> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: user.id,
      name,
      age,
      ...(photoUrl != null ? { photo_url: photoUrl } : {}),
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Child;
}

export async function updateChild(
  childId: string,
  name: string,
  age: number,
  photoUrl?: string | null
): Promise<Child> {
  const { data, error } = await supabase
    .from("children")
    .update({
      name,
      age,
      ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}),
    } as never)
    .eq("id", childId)
    .select()
    .single();
  if (error) throw error;
  return data as Child;
}

export async function updateChildPhoto(childId: string, photoUrl: string) {
  const { error } = await supabase
    .from("children")
    .update({ photo_url: photoUrl } as never)
    .eq("id", childId);
  if (error) throw error;
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getChildProgress(childId: string) {
  const { data, error } = await supabase
    .from("progress")
    .select("*, games(*)")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Progress & { games: Record<string, unknown> })[];
}

/** Aggregate play telemetry across all children on the account (Grown-up Headquarter dashboard). */
export async function getFamilyPlayStats(): Promise<{
  totalSessions: number;
  uniqueGamesTouched: number;
  lastActivityAt: string | null;
}> {
  const kids = await getChildren();
  let totalSessions = 0;
  const gameIds = new Set<string>();
  let lastActivityAt: string | null = null;
  for (const k of kids) {
    const rows = await getChildProgress(k.id);
    totalSessions += rows.length;
    for (const r of rows) {
      gameIds.add(r.game_id);
      const ts = r.completed_at || r.created_at;
      if (ts && (!lastActivityAt || ts > lastActivityAt)) lastActivityAt = ts;
    }
  }
  return {
    totalSessions,
    uniqueGamesTouched: gameIds.size,
    lastActivityAt,
  };
}

/**
 * Returns a map of { gameId → bestStarsEarned } for a child.
 * Used to initialize the completedGames state in the play UI.
 */
export async function getChildBestProgress(childId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("progress")
    .select("game_id, stars_earned")
    .eq("child_id", childId);

  if (error || !data) return {};

  return (data as { game_id: string; stars_earned: number }[]).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.game_id] = Math.max(acc[row.game_id] ?? 0, row.stars_earned ?? 0);
      return acc;
    },
    {}
  );
}

async function incrementChildStars(childId: string, delta: number): Promise<void> {
  if (delta <= 0) return;
  const { error: rpcError } = await supabase.rpc("increment_stars" as never, {
    p_child_id: childId,
    p_stars: delta,
  } as never);
  if (!rpcError) return;
  const { data: row, error: selErr } = await supabase
    .from("children")
    .select("total_stars")
    .eq("id", childId)
    .single();
  if (selErr || row == null) return;
  const cur = (row as { total_stars: number | null }).total_stars ?? 0;
  await supabase.from("children").update({ total_stars: cur + delta } as never).eq("id", childId);
}

/**
 * Save (or update) game progress for a child.
 * Uses upsert logic: keeps the best stars_earned, increments attempt count.
 * Only increments total_stars in `children` by the net improvement (new personal best on that game).
 */
export async function saveProgress(
  childId: string,
  gameId: string,
  starsEarned: number,
  score: number,
  timeSpent: number
): Promise<Progress> {
  type ProgressRow = { id: string; stars_earned: number; attempts: number };

  // Check if there's already a progress record for this child + game
  const { data: existingRaw } = await supabase
    .from("progress")
    .select("id, stars_earned, attempts")
    .eq("child_id", childId)
    .eq("game_id", gameId)
    .order("stars_earned", { ascending: false })
    .limit(1)
    .maybeSingle();

  const existing = existingRaw as ProgressRow | null;

  if (existing) {
    const prevStars = existing.stars_earned ?? 0;
    const newBestStars = Math.max(prevStars, starsEarned);
    const starDelta = Math.max(0, starsEarned - prevStars);

    const { data, error } = await supabase
      .from("progress")
      .update({
        stars_earned: newBestStars,
        score,
        time_spent_seconds: timeSpent,
        attempts: (existing.attempts ?? 0) + 1,
        completed: newBestStars > 0,
        completed_at: newBestStars > 0 ? new Date().toISOString() : null,
      } as never)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    if (starDelta > 0) {
      await incrementChildStars(childId, starDelta);
    } else if (starsEarned > 0) {
      // Same best as before — still award 1 ⭐ so the header counter moves and play feels rewarded.
      await incrementChildStars(childId, 1);
    }

    return data as Progress;
  }

  // First time playing this game
  const { data, error } = await supabase
    .from("progress")
    .insert({
      child_id: childId,
      game_id: gameId,
      stars_earned: starsEarned,
      score,
      time_spent_seconds: timeSpent,
      attempts: 1,
      completed: starsEarned > 0,
      completed_at: starsEarned > 0 ? new Date().toISOString() : null,
    } as never)
    .select()
    .single();

  if (error) throw error;

  if (starsEarned > 0) {
    await incrementChildStars(childId, starsEarned);
  }

  return data as Progress;
}

// ── Unlocks ───────────────────────────────────────────────────────────────────

export async function getChildUnlocks(childId: string) {
  const { data, error } = await supabase
    .from("unlocks")
    .select("*")
    .eq("child_id", childId);
  if (error) throw error;
  return data as Unlock[];
}

export async function unlockZone(childId: string, zoneId: string) {
  const { data, error } = await supabase
    .from("unlocks")
    .upsert({ child_id: childId, zone_id: zoneId } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Unlock;
}

// ── Rewards ───────────────────────────────────────────────────────────────────

export async function getChildRewards(childId: string) {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("child_id", childId)
    .order("earned_at", { ascending: false });
  if (error) throw error;
  return data as Reward[];
}

export async function awardReward(
  childId: string,
  rewardType: "sticker" | "costume" | "badge" | "title",
  rewardId: string,
  rewardName: string
) {
  const { data, error } = await supabase
    .from("rewards")
    .upsert({
      child_id: childId,
      reward_type: rewardType,
      reward_id: rewardId,
      reward_name: rewardName,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as Reward;
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  child_id: string;
  child_name: string;
  photo_url: string | null;
  total_stars: number;
  rank: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("children")
    .select("id, name, photo_url, total_stars")
    .gt("total_stars", 0)
    .order("total_stars", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as { id: string; name: string; photo_url: string | null; total_stars: number }[]).map(
    (row, i) => ({
      child_id: row.id,
      child_name: row.name,
      photo_url: row.photo_url,
      total_stars: row.total_stars,
      rank: i + 1,
    })
  );
}

export async function getChildRank(childId: string): Promise<{ rank: number; total: number } | null> {
  const board = await getLeaderboard(200);
  const total = board.length;
  const entry = board.find((e) => e.child_id === childId);
  if (!entry) return null;
  return { rank: entry.rank, total };
}

// ── Zone / Game data (DB-backed) ──────────────────────────────────────────────

export async function getZones() {
  const { data, error } = await supabase
    .from("zones")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getGamesByZone(zoneId: string) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("zone_id", zoneId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

// ── Parent coaching reports (syllabus + skill analysis from play data) ───────

export async function fetchCoachingReference(): Promise<{
  axes: CoachingSkillAxisRow[];
  contributions: CoachingContributionRow[];
  coreCapabilities: CoachingCoreCapabilityRow[];
  axisCapabilityMap: SkillAxisCapabilityMapRow[];
}> {
  const [axesRes, contribRes, capRes, mapRes] = await Promise.all([
    supabase.from("coaching_skill_axes").select("*").order("sort_order"),
    supabase.from("game_type_skill_contribution").select("*"),
    supabase.from("coaching_core_capabilities").select("*").order("sort_order"),
    supabase.from("skill_axis_capability_map").select("*"),
  ]);
  return {
    axes: axesRes.error ? [] : ((axesRes.data as CoachingSkillAxisRow[]) ?? []),
    contributions: contribRes.error ? [] : ((contribRes.data as CoachingContributionRow[]) ?? []),
    coreCapabilities: capRes.error ? [] : ((capRes.data as CoachingCoreCapabilityRow[]) ?? []),
    axisCapabilityMap: mapRes.error ? [] : ((mapRes.data as SkillAxisCapabilityMapRow[]) ?? []),
  };
}

export async function refreshParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  const kids = await getChildren();
  const child = kids.find((c) => c.id === childId);
  if (!child) throw new Error("Child not found");

  const progress = await getChildProgress(childId);
  let { axes, contributions, coreCapabilities, axisCapabilityMap } = await fetchCoachingReference();
  if (!axes.length) axes = FALLBACK_COACHING_AXES;
  if (!contributions.length) contributions = FALLBACK_CONTRIBUTIONS;

  const report = buildParentCoachingReport(
    child,
    progress as ProgressRowLike[],
    axes,
    contributions,
    coreCapabilities,
    axisCapabilityMap,
  );

  await supabase.from("parent_coaching_reports").upsert(
    {
      child_id: childId,
      updated_at: new Date().toISOString(),
      report: report as unknown as Record<string, unknown>,
    } as never,
    { onConflict: "child_id" },
  );

  return report;
}

function isCompleteCoachingReport(r: unknown): r is ParentCoachingReport {
  if (typeof r !== "object" || r === null) return false;
  const o = r as Record<string, unknown>;
  return (
    Array.isArray(o.coreCapabilityInsights) &&
    Array.isArray(o.learningBehaviors) &&
    typeof o.decisionFramework === "object" &&
    o.decisionFramework !== null
  );
}

export async function getParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  const { data, error } = await supabase
    .from("parent_coaching_reports")
    .select("report, updated_at")
    .eq("child_id", childId)
    .maybeSingle();

  const row = data as Database["public"]["Tables"]["parent_coaching_reports"]["Row"] | null;
  if (!error && row?.report && isCompleteCoachingReport(row.report)) {
    return row.report as unknown as ParentCoachingReport;
  }
  return refreshParentCoachingReport(childId);
}
