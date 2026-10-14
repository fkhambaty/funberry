import type { AppMode } from "./mode";
import type { SessionStatus } from "./session";

/** Child routes that need an active child. Everything else under /play is the picker or the gate. */
const CHILD_ONLY = new Set(["zones", "zone", "game", "rewards"]);

/**
 * Where the app must be for this session and mode, or null when the current
 * route is allowed. Signed-out users stay on welcome/auth, child mode stays in
 * /play until the parent gate succeeds, and parent mode never sits on a child route.
 */
export function redirectFor(status: SessionStatus, mode: AppMode, segments: readonly string[]): string | null {
  if (status === "loading") return null;
  const section = segments[0] ?? "";
  const page = segments[1] ?? "";

  if (status === "signedOut") {
    return section === "" || section === "auth" ? null : "/";
  }

  if (mode.kind === "child") {
    return section === "play" ? null : "/play/zones";
  }

  if (section === "" || section === "auth") return "/parent";
  if (section === "play" && page === "gate") return "/parent";
  if (section === "play" && CHILD_ONLY.has(page)) return "/play";
  return null;
}
