import { zones, freeZoneIds } from "@funberry/config";
import type { ZoneConfig } from "@funberry/config";

export interface UnlockStatus {
  zoneId: string;
  unlocked: boolean;
  reason: "free" | "stars" | "premium" | "locked";
}

/**
 * Determine which zones a child can access based on their star count and subscription.
 */
export function getZoneUnlockStatuses(
  totalStars: number,
  isPremium: boolean
): UnlockStatus[] {
  return zones.map((zone) => {
    if (zone.isFree) {
      return { zoneId: zone.id, unlocked: true, reason: "free" as const };
    }
    if (isPremium) {
      return { zoneId: zone.id, unlocked: true, reason: "premium" as const };
    }
    if (totalStars >= zone.starsToUnlock) {
      return { zoneId: zone.id, unlocked: true, reason: "stars" as const };
    }
    return { zoneId: zone.id, unlocked: false, reason: "locked" as const };
  });
}

/**
 * Check if a specific zone is unlocked.
 */
export function isZoneUnlocked(
  zoneId: string,
  totalStars: number,
  isPremium: boolean
): boolean {
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) return false;
  if (zone.isFree || isPremium) return true;
  return totalStars >= zone.starsToUnlock;
}

/**
 * Get the next locked zone the player should aim for.
 */
export function getNextLockedZone(
  totalStars: number,
  isPremium: boolean
): ZoneConfig | null {
  if (isPremium) return null;
  return zones.find(
    (z) => !z.isFree && totalStars < z.starsToUnlock
  ) ?? null;
}

/**
 * Sticker rewards earned at star milestones.
 */
export const starMilestones = [
  { stars: 5, reward: "sticker", rewardId: "explorer", name: "Explorer Sticker" },
  { stars: 15, reward: "sticker", rewardId: "curious", name: "Curious Mind Sticker" },
  { stars: 30, reward: "badge", rewardId: "learner", name: "Super Learner Badge" },
  { stars: 50, reward: "costume", rewardId: "crown", name: "Golden Crown" },
  { stars: 75, reward: "badge", rewardId: "champion", name: "Champion Badge" },
  { stars: 100, reward: "costume", rewardId: "cape", name: "Hero Cape" },
  { stars: 150, reward: "title", rewardId: "master", name: "Master Explorer" },
];

export function getEarnedMilestones(totalStars: number) {
  return starMilestones.filter((m) => totalStars >= m.stars);
}

export function getNextMilestone(totalStars: number) {
  return starMilestones.find((m) => totalStars < m.stars) ?? null;
}
