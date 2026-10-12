import { json, nowIso, readJson } from "./http.js";

export const PLAN_RULES = {
  weekly: { totalCount: 52, tier: "premium_weekly", envKey: "RAZORPAY_PLAN_WEEKLY" },
  monthly: { totalCount: 12, tier: "premium_monthly", envKey: "RAZORPAY_PLAN_MONTHLY" },
};

const REUSE_MS = 15 * 60 * 1000;
const LIVE_STATUSES = new Set(["active", "authenticated"]);
const TERMINAL_STATUSES = new Set(["cancelled", "halted", "completed", "expired"]);
const PAID_TIERS = new Set(["premium_weekly", "premium_monthly", "premium_yearly", "lifetime"]);

export function isDemoParent(parent) {
  return String(parent?.username || "").trim().toLowerCase() === "dummy";
}

export function hasActivePremium(parent) {
  const tier = parent?.subscription_tier || "free";
  if (!PAID_TIERS.has(tier)) return false;
  if (tier === "lifetime") return true;
  if (!parent.subscription_expires_at) return true;
  const expiry = Date.parse(parent.subscription_expires_at);
  return Number.isFinite(expiry) && expiry > Date.now();
}

export function isTerminalSubscriptionStatus(status) {
  return TERMINAL_STATUSES.has(String(status || "").toLowerCase());
}

export function isWebsiteMismatchMessage(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return /website|domain|mismatch|not registered|unregistered|not whitelisted|whitelist/i.test(text);
}

export function timingSafeEqualString(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  const length = Math.max(a.length, b.length, 1);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function signaturesMatch(secret, message, provided) {
  if (!secret || provided == null || provided === "") return false;
  const expected = await hmacSha256Hex(secret, message);
  return timingSafeEqualString(expected, String(provided).trim().toLowerCase());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notesOf(entity) {
  const notes = entity?.notes;
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return {};
  return notes;
}

export function unixToIso(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString();
}

function fallbackExpiry(plan) {
  const days = plan === "weekly" ? 7 : 30;
  return new Date(Date.now() + days * 86400000).toISOString();
}

function planFromId(env, planId) {
  if (planId && planId === env.RAZORPAY_PLAN_WEEKLY) return "weekly";
  if (planId && planId === env.RAZORPAY_PLAN_MONTHLY) return "monthly";
  return null;
}

function tierForPlan(plan) {
  return PLAN_RULES[plan]?.tier || null;
}

function paymentsConfigured(env) {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PLAN_WEEKLY && env.RAZORPAY_PLAN_MONTHLY);
}

async function razorpayRequest(env, path, options = {}) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return { ok: false, status: 503, data: null };
  try {
    const response = await fetch(`https://api.razorpay.com${path}`, {
      method: options.method || "GET",
      headers: {
        authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
        "content-type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}

async function reloadParent(db, id) {
  return db.prepare("SELECT * FROM parents WHERE id = ?").bind(id).first();
}

async function rememberSubscription(db, row) {
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO razorpay_subscriptions
       (subscription_id, user_id, plan, status, short_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(subscription_id) DO UPDATE SET
         status = excluded.status,
         short_url = COALESCE(excluded.short_url, razorpay_subscriptions.short_url),
         updated_at = excluded.updated_at`,
    )
    .bind(row.subscriptionId, row.userId, row.plan, row.status, row.shortUrl || null, row.createdAt || now, now)
    .run();
}

async function grantPremium(db, userId, fields) {
  const now = nowIso();
  await db
    .prepare(
      `UPDATE parents SET
         subscription_tier = ?,
         subscription_expires_at = ?,
         razorpay_subscription_id = ?,
         razorpay_customer_id = COALESCE(?, razorpay_customer_id),
         subscription_cancel_at_period_end = 0,
         updated_at = ?
       WHERE id = ?`,
    )
    .bind(fields.tier, fields.expiresAt, fields.subscriptionId, fields.customerId || null, now, userId)
    .run();
  await rememberSubscription(db, {
    subscriptionId: fields.subscriptionId,
    userId,
    plan: fields.plan,
    status: fields.status || "active",
    shortUrl: fields.shortUrl || null,
  });
}

async function downgradeIfThisSubscription(db, userId, subscriptionId, status) {
  const now = nowIso();
  await db
    .prepare(
      `UPDATE parents SET
         subscription_tier = 'free',
         subscription_expires_at = NULL,
         razorpay_subscription_id = NULL,
         subscription_cancel_at_period_end = 0,
         updated_at = ?
       WHERE id = ? AND (razorpay_subscription_id IS NULL OR razorpay_subscription_id = ?)`,
    )
    .bind(now, userId, subscriptionId)
    .run();
  await db
    .prepare("UPDATE razorpay_subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?")
    .bind(status || "cancelled", now, subscriptionId)
    .run();
}

async function keepUntilPeriodEnd(db, userId, subscriptionId, status, currentEnd) {
  const now = nowIso();
  await db
    .prepare(
      `UPDATE parents SET
         subscription_cancel_at_period_end = 1,
         subscription_expires_at = COALESCE(?, subscription_expires_at),
         updated_at = ?
       WHERE id = ? AND (razorpay_subscription_id IS NULL OR razorpay_subscription_id = ?)`,
    )
    .bind(currentEnd, now, userId, subscriptionId)
    .run();
  await db
    .prepare("UPDATE razorpay_subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?")
    .bind(status, now, subscriptionId)
    .run();
}

function ownedByParent(parent, remote, localUserId) {
  const notes = notesOf(remote);
  if (notes.product && notes.product !== "funberry") return false;
  if (notes.user_id && notes.user_id !== parent.id) return false;
  if (notes.user_id === parent.id) return true;
  return Boolean(localUserId) && localUserId === parent.id;
}

async function applyRemoteState(db, userId, remote, planHint) {
  const status = String(remote.status || "").toLowerCase();
  const plan = planFromId({ RAZORPAY_PLAN_WEEKLY: remote._weekly, RAZORPAY_PLAN_MONTHLY: remote._monthly }, remote.plan_id) || planHint;
  const tier = tierForPlan(plan);
  const currentEnd = unixToIso(remote.current_end);
  const subscriptionId = remote.id;
  if (LIVE_STATUSES.has(status) && tier) {
    const expiresAt = currentEnd && Date.parse(currentEnd) > Date.now() ? currentEnd : currentEnd ? null : fallbackExpiry(plan);
    if (!expiresAt) return "unchanged";
    await grantPremium(db, userId, {
      tier,
      expiresAt,
      subscriptionId,
      customerId: remote.customer_id,
      plan,
      status,
      shortUrl: remote.short_url,
    });
    return "granted";
  }
  if (TERMINAL_STATUSES.has(status)) {
    if (!currentEnd || Date.parse(currentEnd) > Date.now()) {
      await keepUntilPeriodEnd(db, userId, subscriptionId, status, currentEnd);
      return "until_end";
    }
    await downgradeIfThisSubscription(db, userId, subscriptionId, status);
    return "downgraded";
  }
  return "unchanged";
}

async function fetchSubscription(env, subscriptionId) {
  const remote = await razorpayRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (!remote.ok || !remote.data?.id) return null;
  return { ...remote.data, _weekly: env.RAZORPAY_PLAN_WEEKLY, _monthly: env.RAZORPAY_PLAN_MONTHLY };
}

export async function syncParentBilling(env, db, parent) {
  if (!parent || isDemoParent(parent) || !paymentsConfigured(env)) return parent;
  try {
    let current = parent;
    const pending = await db
      .prepare(
        `SELECT * FROM razorpay_subscriptions
         WHERE user_id = ? AND status IN ('created', 'authenticated')
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(parent.id)
      .first();
    if (pending && Date.now() - Date.parse(pending.created_at) < 7 * 86400000) {
      const checkedAt = Date.parse(pending.updated_at || pending.created_at);
      if (!Number.isFinite(checkedAt) || Date.now() - checkedAt > 20000) {
        await db
          .prepare("UPDATE razorpay_subscriptions SET updated_at = ? WHERE subscription_id = ?")
          .bind(nowIso(), pending.subscription_id)
          .run();
        const remote = await fetchSubscription(env, pending.subscription_id);
        if (remote && ownedByParent(current, remote, pending.user_id)) {
          await applyRemoteState(db, current.id, remote, pending.plan);
          current = (await reloadParent(db, current.id)) || current;
        }
      }
    }

    const subId = current.razorpay_subscription_id;
    const expiry = current.subscription_expires_at ? Date.parse(current.subscription_expires_at) : NaN;
    if (subId && current.subscription_tier !== "lifetime" && Number.isFinite(expiry) && expiry <= Date.now()) {
      const remote = await fetchSubscription(env, subId);
      const local = await db
        .prepare("SELECT plan, user_id FROM razorpay_subscriptions WHERE subscription_id = ?")
        .bind(subId)
        .first();
      if (remote && ownedByParent(current, remote, local?.user_id || current.id)) {
        await applyRemoteState(db, current.id, remote, local?.plan || null);
        current = (await reloadParent(db, current.id)) || current;
      }
    }
    return current;
  } catch {
    return parent;
  }
}

async function reusableSubscription(env, db, parent, plan) {
  const cutoff = new Date(Date.now() - REUSE_MS).toISOString();
  const row = await db
    .prepare(
      `SELECT * FROM razorpay_subscriptions
       WHERE user_id = ? AND plan = ? AND status = 'created' AND created_at >= ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(parent.id, plan, cutoff)
    .first();
  if (!row) return null;
  const remote = await fetchSubscription(env, row.subscription_id);
  if (remote && String(remote.status) === "created" && ownedByParent(parent, remote, parent.id)) {
    return { subscription_id: row.subscription_id, short_url: remote.short_url || row.short_url || null };
  }
  if (remote) {
    await db
      .prepare("UPDATE razorpay_subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?")
      .bind(String(remote.status || "closed"), nowIso(), row.subscription_id)
      .run();
  }
  return null;
}

export async function handleRazorpayWebhook(request, env, db, origin) {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook not configured" }, 503, origin);
  const raw = await request.text();
  const provided = request.headers.get("x-razorpay-signature");
  if (!(await signaturesMatch(secret, raw, provided))) return json({ error: "Invalid signature" }, 400, origin);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  const eventId = request.headers.get("x-razorpay-event-id") || (await hmacSha256Hex(secret, raw));
  const seen = await db.prepare("SELECT event_id FROM razorpay_webhook_events WHERE event_id = ?").bind(eventId).first();
  if (seen) return json({ received: true, duplicate: true }, 200, origin);

  const event = String(parsed?.event || "");
  const entity = parsed?.payload?.subscription?.entity;
  const handled = new Set([
    "subscription.activated",
    "subscription.charged",
    "subscription.cancelled",
    "subscription.halted",
    "subscription.completed",
  ]);
  if (!handled.has(event) || !entity?.id) {
    await db
      .prepare("INSERT OR IGNORE INTO razorpay_webhook_events (event_id, event_name, received_at) VALUES (?, ?, ?)")
      .bind(eventId, event || "ignored", nowIso())
      .run();
    return json({ received: true, ignored: true }, 200, origin);
  }

  const notes = notesOf(entity);
  const localPreview = await db
    .prepare("SELECT user_id FROM razorpay_subscriptions WHERE subscription_id = ?")
    .bind(entity.id)
    .first();
  if (notes.product !== "funberry" && !localPreview) {
    await db
      .prepare("INSERT OR IGNORE INTO razorpay_webhook_events (event_id, event_name, received_at) VALUES (?, ?, ?)")
      .bind(eventId, event, nowIso())
      .run();
    return json({ received: true, ignored: true }, 200, origin);
  }

  let userId = typeof notes.user_id === "string" ? notes.user_id : "";
  const local = await db
    .prepare("SELECT user_id, plan FROM razorpay_subscriptions WHERE subscription_id = ?")
    .bind(entity.id)
    .first();
  if (!userId && local) userId = local.user_id;
  if (!userId) {
    const parent = await db.prepare("SELECT id FROM parents WHERE razorpay_subscription_id = ?").bind(entity.id).first();
    userId = parent?.id || "";
  }
  if (!userId) return json({ received: true, ignored: true }, 200, origin);

  const parent = await db.prepare("SELECT id FROM parents WHERE id = ?").bind(userId).first();
  if (!parent) return json({ received: true, ignored: true }, 200, origin);

  const remote = { ...entity, _weekly: env.RAZORPAY_PLAN_WEEKLY, _monthly: env.RAZORPAY_PLAN_MONTHLY };
  if (event === "subscription.activated" || event === "subscription.charged") {
    const plan = planFromId(env, entity.plan_id) || local?.plan;
    const tier = tierForPlan(plan);
    if (!tier) return json({ received: true, ignored: true }, 200, origin);
    const expiresAt = unixToIso(entity.current_end) || fallbackExpiry(plan);
    await grantPremium(db, userId, {
      tier,
      expiresAt,
      subscriptionId: entity.id,
      customerId: entity.customer_id,
      plan,
      status: String(entity.status || "active"),
      shortUrl: entity.short_url,
    });
  } else {
    await applyRemoteState(db, userId, remote, local?.plan || planFromId(env, entity.plan_id));
  }

  await db
    .prepare("INSERT OR IGNORE INTO razorpay_webhook_events (event_id, event_name, received_at) VALUES (?, ?, ?)")
    .bind(eventId, event, nowIso())
    .run();
  return json({ received: true }, 200, origin);
}

export async function handleRazorpayAuthed(request, env, db, parent, origin, path) {
  const createPath = path === "/v1/payments/razorpay/subscription" && request.method === "POST";
  const confirmPath = path === "/v1/payments/razorpay/confirm" && request.method === "POST";
  const cancelPath = path === "/v1/payments/razorpay/cancel" && request.method === "POST";
  if (!createPath && !confirmPath && !cancelPath) return null;

  if (isDemoParent(parent)) return json({ error: "Demo account: no charge" }, 403, origin);
  if (!paymentsConfigured(env)) return json({ error: "Checkout is not available right now." }, 503, origin);

  if (createPath) {
    const body = await readJson(request);
    const plan = body?.plan === "weekly" || body?.plan === "monthly" ? body.plan : "";
    if (!plan) return json({ error: 'Invalid plan. Use "weekly" or "monthly".' }, 400, origin);
    const fresh = await syncParentBilling(env, db, parent);
    if (hasActivePremium(fresh)) return json({ error: "You already have Premium." }, 409, origin);
    const reused = await reusableSubscription(env, db, fresh, plan);
    if (reused) {
      return json({ subscription_id: reused.subscription_id, key_id: env.RAZORPAY_KEY_ID, short_url: reused.short_url }, 200, origin);
    }
    const rule = PLAN_RULES[plan];
    const created = await razorpayRequest(env, "/v1/subscriptions", {
      method: "POST",
      body: {
        plan_id: env[rule.envKey],
        total_count: rule.totalCount,
        customer_notify: 1,
        notes: { product: "funberry", user_id: fresh.id },
      },
    });
    const subscriptionId = created.data?.id;
    if (!created.ok || !subscriptionId) return json({ error: "Checkout is not available right now." }, 502, origin);
    const now = nowIso();
    await rememberSubscription(db, {
      subscriptionId,
      userId: fresh.id,
      plan,
      status: String(created.data.status || "created"),
      shortUrl: created.data.short_url || null,
      createdAt: now,
    });
    return json(
      { subscription_id: subscriptionId, key_id: env.RAZORPAY_KEY_ID, short_url: created.data.short_url || null },
      200,
      origin,
    );
  }

  if (confirmPath) {
    const body = await readJson(request);
    const paymentId = String(body?.razorpay_payment_id || body?.payment_id || "");
    const subscriptionId = String(body?.razorpay_subscription_id || body?.subscription_id || "");
    const signature = String(body?.razorpay_signature || body?.signature || "");
    if (!paymentId || !subscriptionId || !signature) return json({ error: "Invalid signature" }, 400, origin);
    const message = `${paymentId}|${subscriptionId}`;
    if (!(await signaturesMatch(env.RAZORPAY_KEY_SECRET, message, signature))) {
      return json({ error: "Invalid signature" }, 400, origin);
    }
    let remote = await fetchSubscription(env, subscriptionId);
    for (let attempt = 0; attempt < 2 && remote && !LIVE_STATUSES.has(String(remote.status)); attempt += 1) {
      await sleep(1000);
      remote = await fetchSubscription(env, subscriptionId);
    }
    if (!remote) return json({ error: "Checkout is not available right now." }, 502, origin);
    const local = await db
      .prepare("SELECT user_id, plan FROM razorpay_subscriptions WHERE subscription_id = ?")
      .bind(subscriptionId)
      .first();
    if (!ownedByParent(parent, remote, local?.user_id)) {
      return json({ error: "That subscription does not belong to this account." }, 403, origin);
    }
    const plan = planFromId(env, remote.plan_id) || local?.plan;
    if (!tierForPlan(plan)) return json({ error: "That subscription does not belong to this account." }, 403, origin);
    if (!LIVE_STATUSES.has(String(remote.status))) {
      return json({ error: "Payment is not active yet." }, 409, origin);
    }
    const result = await applyRemoteState(db, parent.id, remote, plan);
    const next = await reloadParent(db, parent.id);
    if (result !== "granted" && !hasActivePremium(next)) {
      return json({ error: "Payment is not active yet." }, 409, origin);
    }
    return json({ ok: true, parent: publicParent(next) }, 200, origin);
  }

  const subscriptionId = parent.razorpay_subscription_id;
  if (!subscriptionId) return json({ error: "No subscription to cancel." }, 400, origin);
  const cancelled = await razorpayRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    body: { cancel_at_cycle_end: 1 },
  });
  let remote = cancelled.ok ? { ...cancelled.data, _weekly: env.RAZORPAY_PLAN_WEEKLY, _monthly: env.RAZORPAY_PLAN_MONTHLY } : null;
  if (!remote) remote = await fetchSubscription(env, subscriptionId);
  if (!remote) return json({ error: "Could not cancel auto-renew. Try again." }, 502, origin);
  const local = await db
    .prepare("SELECT user_id, plan FROM razorpay_subscriptions WHERE subscription_id = ?")
    .bind(subscriptionId)
    .first();
  if (!ownedByParent(parent, remote, local?.user_id || parent.id)) {
    return json({ error: "That subscription does not belong to this account." }, 403, origin);
  }
  await applyRemoteState(db, parent.id, { ...remote, status: remote.status === "active" || remote.status === "authenticated" ? "cancelled" : remote.status }, local?.plan);
  if (!isTerminalSubscriptionStatus(remote.status) && !cancelled.ok) {
    await keepUntilPeriodEnd(db, parent.id, subscriptionId, "cancelled", unixToIso(remote.current_end));
  }
  const next = await reloadParent(db, parent.id);
  return json(
    { ok: true, cancel_at_cycle_end: true, subscription_expires_at: next?.subscription_expires_at || null },
    200,
    origin,
  );
}

function publicParent(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || "",
    username: row.username || null,
    subscription_tier: row.subscription_tier || "free",
    subscription_expires_at: row.subscription_expires_at || null,
    razorpay_subscription_id: row.razorpay_subscription_id || null,
    subscription_cancel_at_period_end: row.subscription_cancel_at_period_end ? 1 : 0,
  };
}
