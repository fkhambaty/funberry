import { readFileSync } from "node:fs";
import path from "node:path";
import { zones } from "@funberry/config";
import { DELETE_PHRASE } from "../lib/account";
import { deliveryFor, findGame, playZones } from "../lib/catalog";
import { parseMode } from "../lib/mode";
import { isPaid, planSummary } from "../lib/plan";
import { redirectFor } from "../lib/routing";
import { childAgeError, codeError, emailError, passwordError, pinError } from "../lib/validation";
import type { Parent } from "@funberry/supabase";

const parent = (tier: Parent["subscription_tier"], extra: Partial<Parent> = {}): Parent =>
  ({
    id: "p",
    email: "ada@example.com",
    name: "Ada",
    username: null,
    subscription_tier: tier,
    subscription_expires_at: null,
    welcome_email_sent_at: null,
    razorpay_subscription_id: null,
    razorpay_customer_id: null,
    subscription_cancel_at_period_end: 0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...extra,
  }) as Parent;

describe("routing", () => {
  it("keeps a signed-out visitor on the welcome and auth screens", () => {
    expect(redirectFor("signedOut", { kind: "parent" }, [])).toBeNull();
    expect(redirectFor("signedOut", { kind: "parent" }, ["auth", "login"])).toBeNull();
    expect(redirectFor("signedOut", { kind: "parent" }, ["parent"])).toBe("/");
    expect(redirectFor("signedOut", { kind: "parent" }, ["play", "zones"])).toBe("/");
  });

  it("keeps child mode inside play until the gate succeeds", () => {
    const child = { kind: "child" as const, childId: "c1" };
    expect(redirectFor("signedIn", child, ["play", "zones"])).toBeNull();
    expect(redirectFor("signedIn", child, ["play", "game"])).toBeNull();
    expect(redirectFor("signedIn", child, ["parent"])).toBe("/play/zones");
    expect(redirectFor("signedIn", child, ["play", "gate"])).toBeNull();
  });

  it("does not leave a parent on a child route", () => {
    const parentMode = { kind: "parent" as const };
    expect(redirectFor("signedIn", parentMode, ["auth", "login"])).toBe("/parent");
    expect(redirectFor("signedIn", parentMode, ["play", "zones"])).toBe("/play");
    expect(redirectFor("signedIn", parentMode, ["play", "gate"])).toBe("/parent");
    expect(redirectFor("signedIn", parentMode, ["play"])).toBeNull();
    expect(redirectFor("signedIn", parentMode, ["parent", "settings"])).toBeNull();
    expect(redirectFor("loading", parentMode, ["parent"])).toBeNull();
  });
});

describe("saved mode", () => {
  it("accepts only a child id and treats anything else as parent mode", () => {
    expect(parseMode(null)).toEqual({ kind: "parent" });
    expect(parseMode("not-json")).toEqual({ kind: "parent" });
    expect(parseMode(JSON.stringify({ kind: "child" }))).toEqual({ kind: "parent" });
    expect(parseMode(JSON.stringify({ kind: "child", childId: "c1" }))).toEqual({ kind: "child", childId: "c1" });
  });
});

describe("plan copy", () => {
  const now = Date.parse("2026-10-14T00:00:00Z");

  it("treats an unexpired paid tier as paid and an ended one as free", () => {
    expect(isPaid(parent("lifetime"), now)).toBe(true);
    expect(isPaid(parent("premium_monthly", { subscription_expires_at: "2026-11-01T00:00:00Z" }), now)).toBe(true);
    expect(isPaid(parent("premium_monthly", { subscription_expires_at: "2026-09-01T00:00:00Z" }), now)).toBe(false);
    expect(isPaid(parent("free"), now)).toBe(false);
  });

  it("states that purchases are unavailable and names no price or checkout link", () => {
    for (const summary of [
      planSummary(parent("free"), now),
      planSummary(parent("premium_monthly", { subscription_expires_at: "2026-11-01T00:00:00Z" }), now),
      planSummary(parent("lifetime", { username: "dummy" }), now),
    ]) {
      const text = JSON.stringify(summary);
      expect(text).toMatch(/Purchases are unavailable in this app/);
      expect(text).not.toMatch(/₹|\$|pricing|dashboard|http/i);
    }
  });
});

describe("form rules match the worker", () => {
  it("checks email, password, pin, code and age", () => {
    expect(emailError("ada@example.com")).toBeNull();
    expect(emailError("ada")).not.toBeNull();
    expect(passwordError("secret")).toBeNull();
    expect(passwordError("short")).not.toBeNull();
    expect(pinError("1234")).toBeNull();
    expect(pinError("123")).not.toBeNull();
    expect(codeError("123456")).toBeNull();
    expect(childAgeError(2)).not.toBeNull();
    expect(childAgeError(6)).toBeNull();
  });

  it("uses the worker's delete phrase", () => {
    const worker = readFileSync(path.join(__dirname, "../../../cloudflare/worker/src/accountData.js"), "utf8");
    expect(worker).toContain(`export const DELETE_PHRASE = "${DELETE_PHRASE}"`);
  });
});

describe("catalog", () => {
  it("lists every configured world and can open a real game", () => {
    expect(playZones.map((zone) => zone.id).sort()).toEqual(zones.map((zone) => zone.id).sort());
    const game = findGame("plants-bubble-pop");
    expect(game?.type).toBe("bubble_pop");
    expect(game && deliveryFor(game.type)).toBe("web");
    const quiz = findGame("aboutme-body-quiz");
    expect(quiz && deliveryFor(quiz.type)).toBe("native");
  });
});
