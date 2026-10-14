import { getZoneById, zones, type ZoneConfig } from "@funberry/config";
import { gameAccess, type GameAccess } from "@funberry/game-engine/src/core/access";
import {
  allEvsGames,
  getCurriculumSectionsForZone,
  getGamesForZone,
} from "@funberry/game-engine/src/games/evs";
import type { GameConfig, GameType } from "@funberry/game-engine/src/types";

export type { GameConfig, GameType, ZoneConfig, GameAccess };

/** Same ordering as the website: featured worlds first, then curriculum order. */
export const playZones: ZoneConfig[] = [...zones].sort(
  (first, second) => Number(Boolean(second.featured)) - Number(Boolean(first.featured)) || first.order - second.order,
);

export type Delivery = "native" | "web";

/**
 * Tap-based templates run natively. Motion, Pixi and SVG-painting templates run
 * on the website's embed route inside the hardened WebView.
 */
export function deliveryFor(type: GameType): Delivery {
  switch (type) {
    case "picture_quiz":
    case "true_false":
    case "odd_one_out":
    case "memory_match":
    case "sequence_builder":
    case "drag_sort":
    case "word_picture_link":
    case "interactive_story":
      return "native";
    case "color_activity":
    case "spot_difference":
    case "bubble_pop":
    case "star_catcher":
    case "pixi_lab":
      return "web";
    default: {
      const exhaustive: never = type;
      throw new Error(`Unhandled game type: ${String(exhaustive)}`);
    }
  }
}

export const GAME_LABELS: Record<GameType, { icon: string; label: string }> = {
  picture_quiz: { icon: "❓", label: "Picture Quiz" },
  drag_sort: { icon: "🎯", label: "Sort It" },
  memory_match: { icon: "🃏", label: "Memory Match" },
  sequence_builder: { icon: "📋", label: "Order It" },
  spot_difference: { icon: "🔍", label: "Spot Difference" },
  odd_one_out: { icon: "🔎", label: "Odd One Out" },
  true_false: { icon: "🤔", label: "True or False" },
  color_activity: { icon: "🎨", label: "Color Fun" },
  word_picture_link: { icon: "🔗", label: "Word Match" },
  interactive_story: { icon: "📖", label: "Story Time" },
  bubble_pop: { icon: "🫧", label: "Bubble Adventure" },
  star_catcher: { icon: "⭐", label: "Star Adventure" },
  pixi_lab: { icon: "🧪", label: "Science Lab" },
};

export function zoneGames(zoneId: string): GameConfig[] {
  return getGamesForZone(zoneId);
}

export function findGame(gameId: string): GameConfig | null {
  for (const games of Object.values(allEvsGames)) {
    const match = games.find((game) => game.id === gameId);
    if (match) return match;
  }
  return null;
}

export function findZone(zoneId: string): ZoneConfig | null {
  return getZoneById(zoneId) ?? null;
}

export function accessFor(game: GameConfig, paid: boolean, totalStars: number): GameAccess {
  return gameAccess({
    zoneId: game.zoneId,
    gameId: game.id,
    games: getGamesForZone(game.zoneId),
    sections: getCurriculumSectionsForZone(game.zoneId),
    paid,
    totalStars,
  });
}

export function zoneProgress(zoneId: string, best: Record<string, number>) {
  const games = getGamesForZone(zoneId);
  const earned = games.reduce((sum, game) => sum + Math.min(game.maxStars, best[game.id] ?? 0), 0);
  const possible = games.reduce((sum, game) => sum + game.maxStars, 0);
  return { earned, possible, games: games.length };
}
