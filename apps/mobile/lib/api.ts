import { accountRequest } from "@funberry/supabase";

export function statusOf(error: unknown): number {
  return error && typeof error === "object" && "status" in error ? Number((error as { status?: number }).status) || 0 : 0;
}

export function messageOf(error: unknown, fallback = "Something went wrong. Try again."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export type PinCheck = "ok" | "wrong" | "locked" | "no_pin" | "network";

/** The Worker compares against the stored hash and counts failures; the app never sees the PIN. */
export async function checkParentPin(pin: string): Promise<PinCheck> {
  try {
    await accountRequest("/v1/pin/verify", { method: "POST", body: { pin } });
    return "ok";
  } catch (error) {
    switch (statusOf(error)) {
      case 403:
        return "wrong";
      case 429:
        return "locked";
      case 404:
        return "no_pin";
      default:
        return "network";
    }
  }
}

export type TicketResult =
  | { ok: true; ticket: string }
  | { ok: false; reason: "locked" | "unknown" | "busy" | "signed_out" | "network" };

/** Asks the Worker for a single-use ticket for one web-delivered game. */
export async function requestPlayTicket(childId: string, gameId: string): Promise<TicketResult> {
  try {
    const data = await accountRequest<{ ticket: string }>("/v1/play-tickets", {
      method: "POST",
      body: { child_id: childId, game_id: gameId },
    });
    return { ok: true, ticket: data.ticket };
  } catch (error) {
    switch (statusOf(error)) {
      case 403:
        return { ok: false, reason: "locked" };
      case 400:
      case 404:
        return { ok: false, reason: "unknown" };
      case 429:
        return { ok: false, reason: "busy" };
      case 401:
        return { ok: false, reason: "signed_out" };
      default:
        return { ok: false, reason: "network" };
    }
  }
}
