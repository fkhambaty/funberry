import { hashSecret } from "./crypto.js";
import { timingSafeEqualString } from "./payments.js";
import { pinIsSet } from "./pin.js";

export const DELETE_PHRASE = "DELETE MY ACCOUNT";

const SECRET_FIELDS = new Set([
  "password_hash",
  "password_salt",
  "pin",
  "pin_hash",
  "pin_salt",
  "pin_attempts",
  "pin_locked_until",
]);

export function publicAccountRow(row) {
  if (!row) return null;
  const copy = {};
  for (const [key, value] of Object.entries(row)) {
    if (SECRET_FIELDS.has(key)) continue;
    copy[key] = value;
  }
  copy.pin_set = pinIsSet(row);
  return copy;
}

export function deletionAllowed(parent) {
  const tier = parent?.subscription_tier || "free";
  const autoRenewOn = Boolean(parent?.razorpay_subscription_id) && !parent?.subscription_cancel_at_period_end;
  if (autoRenewOn && tier !== "free" && tier !== "lifetime") {
    return "Turn off auto-renew in the parent dashboard before deleting this account. Deleting an account does not refund a charge.";
  }
  return "";
}

export async function passwordMatches(parent, password) {
  if (!parent?.password_salt || !parent?.password_hash || !password) return false;
  const hashed = await hashSecret(String(password), parent.password_salt);
  return timingSafeEqualString(hashed, parent.password_hash);
}

export async function exportParentAccount(db, parent) {
  const parentId = parent.id;
  const children = await db.prepare("SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC").bind(parentId).all();
  const childIds = (children.results || []).map((row) => row.id);
  const progress = childIds.length
    ? await db
        .prepare(
          `SELECT * FROM progress WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?) ORDER BY created_at ASC`,
        )
        .bind(parentId)
        .all()
    : { results: [] };
  const playEvents = await db
    .prepare("SELECT * FROM play_events WHERE parent_id = ? ORDER BY played_at ASC")
    .bind(parentId)
    .all();
  const unlocks = await db
    .prepare("SELECT * FROM unlocks WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .all();
  const rewards = await db
    .prepare("SELECT * FROM rewards WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .all();
  const packs = await db.prepare("SELECT * FROM learning_packs WHERE parent_id = ?").bind(parentId).all();
  const pages = await db.prepare("SELECT * FROM pack_pages WHERE parent_id = ?").bind(parentId).all();
  const assignments = await db.prepare("SELECT * FROM pack_assignments WHERE parent_id = ?").bind(parentId).all();
  const reports = await db
    .prepare("SELECT * FROM coaching_reports WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .all();
  const events = await db
    .prepare("SELECT event_name, occurred_at FROM product_events WHERE parent_id = ? ORDER BY occurred_at ASC")
    .bind(parentId)
    .all();
  return {
    exported_at: new Date().toISOString(),
    parent: publicAccountRow(parent),
    children: children.results || [],
    progress: progress.results || [],
    play_events: playEvents.results || [],
    unlocks: unlocks.results || [],
    rewards: rewards.results || [],
    learning_packs: packs.results || [],
    pack_pages: pages.results || [],
    pack_assignments: assignments.results || [],
    coaching_reports: reports.results || [],
    product_events: events.results || [],
  };
}

export async function deleteParentAccount(db, parent) {
  const parentId = parent.id;
  const email = parent.email;
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(parentId).run();
  await db
    .prepare("DELETE FROM progress WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .run();
  await db
    .prepare("DELETE FROM unlocks WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .run();
  await db
    .prepare("DELETE FROM rewards WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .run();
  await db
    .prepare("DELETE FROM coaching_reports WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)")
    .bind(parentId)
    .run();
  await db.prepare("DELETE FROM play_events WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM play_tickets WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM product_events WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM pack_assignments WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM pack_pages WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM learning_packs WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM coupon_redemptions WHERE parent_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM razorpay_subscriptions WHERE user_id = ?").bind(parentId).run();
  await db.prepare("DELETE FROM children WHERE parent_id = ?").bind(parentId).run();
  if (email) await db.prepare("DELETE FROM email_codes WHERE email = ?").bind(email).run();
  await db.prepare("DELETE FROM parents WHERE id = ?").bind(parentId).run();
}
