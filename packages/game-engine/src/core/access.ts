import { getZoneById } from "@funberry/config";
import type { CurriculumSection, GameConfig } from "../types";

/** Free slice for standard worlds. Curriculum worlds open their whole first folder instead. */
export const FREE_GAME_FRACTION = 0.3;

/** Computer Lab is fully free on every surface. */
export const ALWAYS_FREE_ZONE_IDS: ReadonlySet<string> = new Set(["computers"]);

export function freeGameIds(games: GameConfig[], sections: CurriculumSection[]): Set<string> {
  if (sections.length > 0) return new Set(sections[0].entries.map((entry) => entry.game.id));
  return new Set(
    games.slice(0, Math.max(1, Math.ceil(games.length * FREE_GAME_FRACTION))).map((game) => game.id),
  );
}

export type GameAccessReason = "open" | "premium" | "stars" | "unknown";

export type GameAccess = {
  allowed: boolean;
  /** Why a locked game is locked: a paid plan is needed, or the world needs more stars. */
  reason: GameAccessReason;
  starsNeeded: number;
};

/**
 * What a child may play. This combines the website's free slice with the
 * Worker's star threshold, so a game shown as open can always save its stars.
 */
export function gameAccess(input: {
  zoneId: string;
  gameId: string;
  games: GameConfig[];
  sections: CurriculumSection[];
  paid: boolean;
  totalStars: number;
}): GameAccess {
  const zone = getZoneById(input.zoneId);
  if (!zone || !input.games.some((game) => game.id === input.gameId)) {
    return { allowed: false, reason: "unknown", starsNeeded: 0 };
  }
  if (input.paid || ALWAYS_FREE_ZONE_IDS.has(zone.id)) {
    return { allowed: true, reason: "open", starsNeeded: 0 };
  }
  if (!freeGameIds(input.games, input.sections).has(input.gameId)) {
    return { allowed: false, reason: "premium", starsNeeded: 0 };
  }
  const threshold = zone.isFree ? 0 : zone.starsToUnlock;
  if (input.totalStars < threshold) {
    return { allowed: false, reason: "stars", starsNeeded: threshold - input.totalStars };
  }
  return { allowed: true, reason: "open", starsNeeded: 0 };
}
