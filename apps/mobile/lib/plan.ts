import { isPremium, tierLabels, type SubscriptionTier } from "@funberry/config";
import type { Parent } from "@funberry/supabase";

/** Same rule as the website and the Worker: a paid tier that has not expired. Lifetime never expires. */
export function isPaid(parent: Parent | null, now = Date.now()): boolean {
  if (!parent || !isPremium(parent.subscription_tier)) return false;
  if (parent.subscription_tier === "lifetime" || !parent.subscription_expires_at) return true;
  const expiry = Date.parse(parent.subscription_expires_at);
  return Number.isFinite(expiry) && expiry > now;
}

export function isDemoAccount(parent: Parent | null): boolean {
  return (parent?.username ?? "").trim().toLowerCase() === "dummy";
}

export type PlanSummary = {
  label: string;
  paid: boolean;
  lines: string[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Parent-facing plan text. It reports the stored state and never offers a purchase. */
export function planSummary(parent: Parent | null, now = Date.now()): PlanSummary {
  if (!parent) return { label: "Unknown", paid: false, lines: ["Your plan could not be loaded. Pull down to refresh."] };
  const tier: SubscriptionTier = parent.subscription_tier ?? "free";
  const paid = isPaid(parent, now);
  const lines: string[] = [];
  if (isDemoAccount(parent)) {
    lines.push("Demo account: lifetime access, no charge.");
  } else if (!paid && tier !== "free") {
    lines.push("This plan has ended. Free games stay open.");
  } else if (tier === "free") {
    lines.push("Free games in every world are open, and all of Computer Lab.");
  } else if (tier === "lifetime") {
    lines.push("Every game is open. This access does not renew or expire.");
  } else if (parent.subscription_expires_at) {
    const date = formatDate(parent.subscription_expires_at);
    lines.push(
      parent.subscription_cancel_at_period_end
        ? `Auto-renew is off. Premium stays open until ${date}.`
        : `Premium is open. The current period ends on ${date}.`,
    );
  }
  lines.push("Purchases are unavailable in this app.");
  return { label: paid ? tierLabels[tier] : tier === "free" ? tierLabels.free : `${tierLabels[tier]} (ended)`, paid, lines };
}
