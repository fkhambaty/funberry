import { secureStore } from "./secureStore";

/**
 * Parent or child mode survives an app restart, so closing the app is not a way
 * past the parent PIN. Only a successful gate clears child mode.
 */
export type AppMode = { kind: "parent" } | { kind: "child"; childId: string };

const MODE_KEY = "funberry_mode";

export function parseMode(raw: string | null): AppMode {
  if (!raw) return { kind: "parent" };
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      "kind" in value &&
      value.kind === "child" &&
      "childId" in value &&
      typeof value.childId === "string" &&
      value.childId.length > 0
    ) {
      return { kind: "child", childId: value.childId };
    }
  } catch {
    return { kind: "parent" };
  }
  return { kind: "parent" };
}

export async function readMode(): Promise<AppMode> {
  return parseMode(await secureStore.getItem(MODE_KEY));
}

export async function writeMode(mode: AppMode): Promise<void> {
  if (mode.kind === "parent") await secureStore.removeItem(MODE_KEY);
  else await secureStore.setItem(MODE_KEY, JSON.stringify(mode));
}
