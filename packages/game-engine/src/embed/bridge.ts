import type { GameResult } from "../types";

/**
 * Message contract between the Expo app and the website's `/embed/game/[id]` route.
 * Both sides parse every message with these functions and drop anything else.
 * The parent's bearer token never crosses this bridge; only a single-use play ticket does.
 */
export const BRIDGE_VERSION = 1;
export const NATIVE_SOURCE = "funberry-native";
export const EMBED_SOURCE = "funberry-embed";
export const MAX_BRIDGE_MESSAGE_BYTES = 8192;
export const EMBED_PATH_PREFIX = "/embed/game/";

const TICKET_PATTERN = /^[0-9a-f]{64}$/;
const GAME_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

export type EmbedErrorCode =
  | "ticket_invalid"
  | "ticket_used"
  | "locked"
  | "unknown_game"
  | "load_failed"
  | "network";

const ERROR_CODES: ReadonlySet<EmbedErrorCode> = new Set([
  "ticket_invalid",
  "ticket_used",
  "locked",
  "unknown_game",
  "load_failed",
  "network",
]);

export type NativeInitMessage = {
  v: typeof BRIDGE_VERSION;
  source: typeof NATIVE_SOURCE;
  type: "init";
  gameId: string;
  ticket: string;
};

export type SavedProgress = { stars_credited: number; total_stars: number };

export type EmbedMessage =
  | { v: typeof BRIDGE_VERSION; source: typeof EMBED_SOURCE; type: "ready"; gameId: string }
  | { v: typeof BRIDGE_VERSION; source: typeof EMBED_SOURCE; type: "loaded"; gameId: string }
  | {
      v: typeof BRIDGE_VERSION;
      source: typeof EMBED_SOURCE;
      type: "complete";
      gameId: string;
      result: GameResult;
      saved: SavedProgress | null;
    }
  | { v: typeof BRIDGE_VERSION; source: typeof EMBED_SOURCE; type: "error"; gameId: string; code: EmbedErrorCode }
  | { v: typeof BRIDGE_VERSION; source: typeof EMBED_SOURCE; type: "exit"; gameId: string };

type EmbedPayload =
  | { type: "ready" | "loaded" | "exit" }
  | { type: "complete"; result: GameResult; saved: SavedProgress | null }
  | { type: "error"; code: EmbedErrorCode };

export function isValidGameId(value: unknown): value is string {
  return typeof value === "string" && GAME_ID_PATTERN.test(value);
}

export function isValidTicket(value: unknown): value is string {
  return typeof value === "string" && TICKET_PATTERN.test(value);
}

function record(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_BRIDGE_MESSAGE_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function finite(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

export function parseGameResult(raw: unknown): GameResult | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const maxScore = finite(value.maxScore, 0, 10_000);
  const score = finite(value.score, 0, 10_000);
  const starsEarned = finite(value.starsEarned, 0, 3);
  const timeSpent = finite(value.timeSpent, 0, 86_400);
  const accuracy = finite(value.accuracy, 0, 100);
  if (maxScore === null || score === null || starsEarned === null || timeSpent === null || accuracy === null) {
    return null;
  }
  if (!Number.isInteger(starsEarned) || score > maxScore) return null;
  return { score, maxScore, starsEarned, timeSpent, accuracy };
}

function parseSaved(raw: unknown): SavedProgress | null | undefined {
  if (raw === null) return null;
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  const credited = finite(value.stars_credited, 0, 3);
  const total = finite(value.total_stars, 0, 1_000_000);
  if (credited === null || total === null) return undefined;
  return { stars_credited: credited, total_stars: total };
}

export function encodeNativeInit(gameId: string, ticket: string): string {
  const message: NativeInitMessage = { v: BRIDGE_VERSION, source: NATIVE_SOURCE, type: "init", gameId, ticket };
  return JSON.stringify(message);
}

/** Read by the embed page. Returns null for anything that is not an init for this game. */
export function parseNativeMessage(raw: unknown, expectedGameId: string): NativeInitMessage | null {
  const value = record(raw);
  if (!value || value.v !== BRIDGE_VERSION || value.source !== NATIVE_SOURCE || value.type !== "init") return null;
  if (value.gameId !== expectedGameId || !isValidTicket(value.ticket)) return null;
  return { v: BRIDGE_VERSION, source: NATIVE_SOURCE, type: "init", gameId: expectedGameId, ticket: value.ticket };
}

export function encodeEmbedMessage(gameId: string, payload: EmbedPayload): string {
  return JSON.stringify({ v: BRIDGE_VERSION, source: EMBED_SOURCE, gameId, ...payload });
}

/** Read by the app. Returns null for anything malformed or for a different game. */
export function parseEmbedMessage(raw: unknown, expectedGameId: string): EmbedMessage | null {
  const value = record(raw);
  if (!value || value.v !== BRIDGE_VERSION || value.source !== EMBED_SOURCE) return null;
  if (value.gameId !== expectedGameId) return null;
  const base = { v: BRIDGE_VERSION, source: EMBED_SOURCE, gameId: expectedGameId } as const;
  switch (value.type) {
    case "ready":
    case "loaded":
    case "exit":
      return { ...base, type: value.type };
    case "complete": {
      const result = parseGameResult(value.result);
      const saved = parseSaved(value.saved);
      if (!result || saved === undefined) return null;
      return { ...base, type: "complete", result, saved };
    }
    case "error":
      return typeof value.code === "string" && ERROR_CODES.has(value.code as EmbedErrorCode)
        ? { ...base, type: "error", code: value.code as EmbedErrorCode }
        : null;
    default:
      return null;
  }
}

const ORIGIN_PATTERN = /^https?:\/\/[a-z0-9.-]+(?::\d{1,5})?$/;

/** `https://host[:port]` with no path. React Native's URL support is partial, so this stays string-based. */
export function normalizeWebOrigin(webOrigin: string): string | null {
  const trimmed = webOrigin.trim().replace(/\/+$/, "").toLowerCase();
  return ORIGIN_PATTERN.test(trimmed) ? trimmed : null;
}

/** The only URLs the app's WebView may load: this game's embed page on the configured web origin. */
export function isAllowedEmbedUrl(url: string, webOrigin: string, gameId: string): boolean {
  const origin = normalizeWebOrigin(webOrigin);
  if (!origin || !isValidGameId(gameId)) return false;
  const page = `${origin}${EMBED_PATH_PREFIX}${gameId}`;
  if (!url.toLowerCase().startsWith(page)) return false;
  const rest = url.slice(page.length);
  return rest === "" || rest.startsWith("?") || rest.startsWith("#");
}

export function embedUrl(webOrigin: string, gameId: string): string | null {
  const origin = normalizeWebOrigin(webOrigin);
  return origin && isValidGameId(gameId) ? `${origin}${EMBED_PATH_PREFIX}${gameId}` : null;
}
