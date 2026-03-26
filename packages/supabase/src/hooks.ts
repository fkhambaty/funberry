import { supabase } from "./client";
import type { Child, Parent, Progress, Unlock, Reward } from "./types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string, pin?: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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

/**
 * Save (or update) game progress for a child.
 * Uses upsert logic: keeps the best stars_earned, increments attempt count.
 * Only increments total_stars in `children` by the net improvement.
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

  const rpc = (supabase as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
  }).rpc;

  if (existing) {
    const prevStars = existing.stars_earned ?? 0;
    const newBestStars = Math.max(prevStars, starsEarned);
    const starDelta = Math.max(0, starsEarned - prevStars); // only credit improvement

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
      await rpc.call(supabase, "increment_stars", {
        p_child_id: childId,
        p_stars: starDelta,
      });
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
    await rpc.call(supabase, "increment_stars", {
      p_child_id: childId,
      p_stars: starsEarned,
    });
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
