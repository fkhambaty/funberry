import {
  accountForgotPassword,
  accountRequest,
  accountResendCode,
  accountResetPassword,
  accountSignIn,
  accountSignOut,
  accountSignUp,
  accountUser,
  accountVerify,
} from "./account";
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
import type { Child, LearningPack, PackPage, Parent, Progress, Reward, Unlock } from "./types";

export type SignUpOptions = {
  /** Unused. Confirmation is a 6-digit emailed code, not a link. */
  emailRedirectTo?: string;
};

export async function signUp(
  email: string,
  password: string,
  name: string,
  pin?: string,
  _options?: SignUpOptions,
) {
  return accountSignUp(email, password, name, pin);
}

export async function resendSignupConfirmation(email: string, _redirectTo?: string) {
  await accountResendCode(email);
}

export async function requestPasswordReset(email: string) {
  await accountForgotPassword(email);
}

export async function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  await accountResetPassword(email, code.trim(), newPassword);
}

export async function trySendWelcomeEmailAfterAuth(_client?: unknown): Promise<void> {
  // Welcome email is not connected on the new account service.
}

export async function verifyEmailOtp(email: string, token: string) {
  return accountVerify(email, token.trim());
}

export async function signIn(email: string, password: string) {
  const data = await accountSignIn(email, password);
  void trySendWelcomeEmailAfterAuth();
  return data;
}

export async function signOut() {
  await accountSignOut();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("funberrykids_timer");
      const keysToClear: string[] = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("funberrykids_timer_")) keysToClear.push(key);
      }
      for (const key of keysToClear) sessionStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup errors in restricted browser contexts.
    }
  }
}

export async function getCurrentUser() {
  return accountUser();
}

export async function getParent(): Promise<Parent | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const data = await accountRequest<{ parent: Parent }>("/v1/parent");
    return data.parent;
  } catch {
    return null;
  }
}

export async function createRazorpaySubscription(plan: "weekly" | "monthly") {
  return accountRequest<{ subscription_id: string; key_id: string; short_url?: string | null }>(
    "/v1/payments/razorpay/subscription",
    { method: "POST", body: { plan } },
  );
}

export async function confirmRazorpaySubscription(body: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}) {
  return accountRequest<{ ok: boolean }>("/v1/payments/razorpay/confirm", { method: "POST", body });
}

export async function cancelRazorpaySubscription() {
  return accountRequest<{ ok: boolean; subscription_expires_at?: string | null }>("/v1/payments/razorpay/cancel", {
    method: "POST",
    body: {},
  });
}

export async function redeemCouponCode(code: string) {
  return accountRequest<{ ok: boolean; freeDays: number; expiresAt: string }>("/v1/coupons/redeem", {
    method: "POST",
    body: { code },
  });
}

export async function updateParentPin(pin: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest("/v1/parent", { method: "PUT", body: { pin } });
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  const parent = await getParent();
  if (!parent || !parent.pin) return false;
  return parent.pin === pin;
}

export async function updateParentPassword(newPassword: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest("/v1/password", { method: "POST", body: { password: newPassword } });
}

export async function getChildren(): Promise<Child[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const data = await accountRequest<{ children: Child[] }>("/v1/children");
  return data.children;
}

export async function addChild(name: string, age: number, photoUrl?: string | null): Promise<Child> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const data = await accountRequest<{ child: Child }>("/v1/children", {
    method: "POST",
    body: { name, age, photo_url: photoUrl ?? null },
  });
  return data.child;
}

export async function updateChild(
  childId: string,
  name: string,
  age: number,
  photoUrl?: string | null,
): Promise<Child> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const data = await accountRequest<{ child: Child }>(`/v1/children/${childId}`, {
    method: "PUT",
    body: { name, age, ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}) },
  });
  return data.child;
}

export async function updateChildPhoto(childId: string, photoUrl: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest(`/v1/children/${childId}`, { method: "PUT", body: { photo_url: photoUrl } });
}

export async function getChildProgress(childId: string) {
  const data = await accountRequest<{ progress: Progress[] }>(`/v1/progress?child_id=${encodeURIComponent(childId)}`);
  return data.progress;
}

export async function getFamilyPlayStats(): Promise<{
  totalSessions: number;
  uniqueGamesTouched: number;
  lastActivityAt: string | null;
}> {
  return accountRequest("/v1/family-stats");
}

export async function getChildBestProgress(childId: string): Promise<Record<string, number>> {
  try {
    const rows = await getChildProgress(childId);
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.game_id] = Math.max(acc[row.game_id] ?? 0, row.stars_earned ?? 0);
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export async function saveProgress(
  childId: string,
  gameId: string,
  starsEarned: number,
  score: number,
  timeSpent: number,
): Promise<Progress> {
  const data = await accountRequest<{ progress: Progress }>("/v1/progress", {
    method: "POST",
    body: {
      child_id: childId,
      game_id: gameId,
      stars_earned: starsEarned,
      score,
      time_spent_seconds: timeSpent,
    },
  });
  return data.progress;
}

export async function getChildUnlocks(childId: string) {
  const data = await accountRequest<{ unlocks: Unlock[] }>(`/v1/unlocks?child_id=${encodeURIComponent(childId)}`);
  return data.unlocks;
}

export async function unlockZone(childId: string, zoneId: string) {
  const data = await accountRequest<{ unlock: Unlock }>("/v1/unlocks", {
    method: "POST",
    body: { child_id: childId, zone_id: zoneId },
  });
  return data.unlock;
}

export async function getChildRewards(childId: string) {
  const data = await accountRequest<{ rewards: Reward[] }>(`/v1/rewards?child_id=${encodeURIComponent(childId)}`);
  return data.rewards;
}

export async function awardReward(
  childId: string,
  rewardType: "sticker" | "costume" | "badge" | "title",
  rewardId: string,
  rewardName: string,
) {
  const data = await accountRequest<{ reward: Reward }>("/v1/rewards", {
    method: "POST",
    body: { child_id: childId, reward_type: rewardType, reward_id: rewardId, reward_name: rewardName },
  });
  return data.reward;
}

export interface PackPageInput {
  ocrText: string;
  editedText: string;
  imageDataUrl?: string | null;
}

export interface CreateLearningPackInput {
  title: string;
  subject?: string;
  theme?: string;
  sourceText: string;
  generated: Record<string, unknown>;
  pages: PackPageInput[];
  status?: "draft" | "ready";
}

export interface LearningPackWithMeta extends LearningPack {
  pageCount: number;
  assignedChildIds: string[];
}

export async function createLearningPack(input: CreateLearningPackInput): Promise<LearningPack> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const data = await accountRequest<{ pack: LearningPack }>("/v1/packs", {
    method: "POST",
    body: {
      title: input.title,
      subject: input.subject,
      theme: input.theme,
      status: input.status,
      source_text: input.sourceText,
      generated: input.generated,
      pages: input.pages.map((page) => ({
        ocr_text: page.ocrText,
        edited_text: page.editedText,
      })),
    },
  });
  return data.pack;
}

export async function updateLearningPack(
  packId: string,
  updates: Partial<Pick<LearningPack, "title" | "subject" | "theme" | "status" | "source_text" | "generated">>,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest(`/v1/packs/${packId}`, { method: "PUT", body: updates });
}

export async function deleteLearningPack(packId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest(`/v1/packs/${packId}`, { method: "DELETE" });
}

export async function getLearningPacks(): Promise<LearningPackWithMeta[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const data = await accountRequest<{ packs: LearningPackWithMeta[] }>("/v1/packs");
  return data.packs;
}

export async function getLearningPackPages(packId: string): Promise<PackPage[]> {
  const data = await accountRequest<{ pages: PackPage[] }>(`/v1/packs/${packId}/pages`);
  return data.pages;
}

export async function setPackAssignments(packId: string, childIds: string[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await accountRequest(`/v1/packs/${packId}/assignments`, { method: "POST", body: { child_ids: childIds } });
}

export async function getAssignedPacksForChild(childId: string): Promise<LearningPack[]> {
  try {
    const data = await accountRequest<{ packs: LearningPack[] }>(
      `/v1/assigned-packs?child_id=${encodeURIComponent(childId)}`,
    );
    return data.packs;
  } catch {
    return [];
  }
}

export interface LeaderboardEntry {
  child_id: string | null;
  child_name: string;
  photo_url: string | null;
  total_stars: number;
  rank: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  try {
    const data = await accountRequest<{ entries: LeaderboardEntry[] }>(`/v1/leaderboard?limit=${limit}`);
    return data.entries;
  } catch {
    return [];
  }
}

export async function getChildRank(childId: string): Promise<{ rank: number; total: number } | null> {
  try {
    const data = await accountRequest<{ rank: number | null; total?: number }>(
      `/v1/rank?child_id=${encodeURIComponent(childId)}`,
    );
    if (data.rank == null || data.total == null) return null;
    return { rank: data.rank, total: data.total };
  } catch {
    return null;
  }
}

export async function getZones() {
  return [];
}

export async function getGamesByZone(_zoneId: string) {
  return [];
}

export async function fetchCoachingReference(): Promise<{
  axes: CoachingSkillAxisRow[];
  contributions: CoachingContributionRow[];
  coreCapabilities: CoachingCoreCapabilityRow[];
  axisCapabilityMap: SkillAxisCapabilityMapRow[];
}> {
  return { axes: [], contributions: [], coreCapabilities: [], axisCapabilityMap: [] };
}

export async function refreshParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  const kids = await getChildren();
  const child = kids.find((item) => item.id === childId);
  if (!child) throw new Error("Child not found");
  const progress = await getChildProgress(childId);
  const report = buildParentCoachingReport(
    child,
    progress as ProgressRowLike[],
    FALLBACK_COACHING_AXES,
    FALLBACK_CONTRIBUTIONS,
    [],
    [],
  );
  await accountRequest("/v1/coaching-report", { method: "PUT", body: { child_id: childId, report } });
  return report;
}

function isCompleteCoachingReport(value: unknown): value is ParentCoachingReport {
  if (typeof value !== "object" || value === null) return false;
  const report = value as Record<string, unknown>;
  return (
    Array.isArray(report.coreCapabilityInsights) &&
    Array.isArray(report.learningBehaviors) &&
    typeof report.decisionFramework === "object" &&
    report.decisionFramework !== null
  );
}

export async function getParentCoachingReport(childId: string): Promise<ParentCoachingReport> {
  try {
    const data = await accountRequest<{ report: unknown }>(
      `/v1/coaching-report?child_id=${encodeURIComponent(childId)}`,
    );
    if (isCompleteCoachingReport(data.report)) return data.report;
  } catch {
    // A missing saved report is rebuilt from this child's play history.
  }
  return refreshParentCoachingReport(childId);
}
