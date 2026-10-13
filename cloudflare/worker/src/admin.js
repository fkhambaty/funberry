import { isOwnerEmail } from "./owners.js";
import { hasActivePremium } from "./payments.js";
import { json, nowIso, readJson } from "./http.js";
import { countProductEvents } from "./analytics.js";

const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

export function normalizeCouponCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function validateCouponCode(value) {
  const code = normalizeCouponCode(value);
  return CODE_PATTERN.test(code) ? code : "";
}

function couponOut(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    discount_percent: row.discount_percent,
    free_days: row.free_days,
    active: Boolean(row.active),
    expires_at: row.expires_at || null,
    max_redemptions: row.max_redemptions == null ? null : row.max_redemptions,
    redeemed_count: row.redeemed_count || 0,
    note: row.note || null,
    created_at: row.created_at,
  };
}

function requireAdmin(parent, origin) {
  if (!isOwnerEmail(parent?.email) && parent?.role !== "admin") {
    return json({ error: "Unauthorized" }, 403, origin);
  }
  return null;
}

async function count(db, sql, ...binds) {
  const row = await db.prepare(sql).bind(...binds).first();
  return Number(row?.n || 0);
}

export async function handleCouponRedeem(request, db, parent, origin, path) {
  if (!(request.method === "POST" && path === "/v1/coupons/redeem")) return null;
  const body = await readJson(request);
  const code = normalizeCouponCode(body?.code);
  if (!code) return json({ error: "Enter a coupon code." }, 400, origin);

  const coupon = await db.prepare("SELECT * FROM coupons WHERE code = ?").bind(code).first();
  if (!coupon || !coupon.active) return json({ error: "That coupon code is not valid." }, 404, origin);
  if (coupon.expires_at && Date.parse(coupon.expires_at) < Date.now()) {
    return json({ error: "This coupon has expired." }, 410, origin);
  }
  if (coupon.free_days <= 0) return json({ error: "This code has no free access to grant." }, 400, origin);

  const already = await db
    .prepare("SELECT id FROM coupon_redemptions WHERE coupon_id = ? AND parent_id = ?")
    .bind(coupon.id, parent.id)
    .first();
  if (already) return json({ error: "You have already used this coupon." }, 409, origin);
  if (coupon.max_redemptions != null && coupon.redeemed_count >= coupon.max_redemptions) {
    return json({ error: "This coupon has reached its limit." }, 410, origin);
  }

  const couponEnd = Date.now() + coupon.free_days * 86400000;
  const currentEnd = parent.subscription_expires_at ? Date.parse(parent.subscription_expires_at) : 0;
  const expiresAt = new Date(Math.max(Number.isFinite(currentEnd) ? currentEnd : 0, couponEnd)).toISOString();
  const tier = hasActivePremium(parent) ? parent.subscription_tier : "premium_monthly";
  const redemptionId = crypto.randomUUID();
  const now = nowIso();
  try {
    await db
      .prepare("INSERT INTO coupon_redemptions (id, coupon_id, parent_id, redeemed_at) VALUES (?, ?, ?, ?)")
      .bind(redemptionId, coupon.id, parent.id, now)
      .run();
  } catch {
    return json({ error: "You have already used this coupon." }, 409, origin);
  }

  const updated = await db
    .prepare(
      `UPDATE coupons SET redeemed_count = redeemed_count + 1
       WHERE id = ? AND (max_redemptions IS NULL OR redeemed_count < max_redemptions)`,
    )
    .bind(coupon.id)
    .run();
  if (!updated.meta || updated.meta.changes === 0) {
    await db.prepare("DELETE FROM coupon_redemptions WHERE id = ?").bind(redemptionId).run();
    return json({ error: "This coupon has reached its limit." }, 410, origin);
  }

  await db
    .prepare("UPDATE parents SET subscription_tier = ?, subscription_expires_at = ?, updated_at = ? WHERE id = ?")
    .bind(tier, expiresAt, now, parent.id)
    .run();
  return json({ ok: true, freeDays: coupon.free_days, expiresAt }, 200, origin);
}

export async function handleAdmin(request, db, parent, origin, path) {
  if (!path.startsWith("/v1/admin/")) return null;
  const denied = requireAdmin(parent, origin);
  if (denied) return denied;

  if (request.method === "GET" && path === "/v1/admin/stats") {
    const [totalUsers, premiumUsers, totalChildren, activeCoupons, totalRedemptions, totalGamesPlayed, totalPacks, starsRow, recent] =
      await Promise.all([
        count(db, "SELECT COUNT(*) AS n FROM parents"),
        count(db, "SELECT COUNT(*) AS n FROM parents WHERE subscription_tier != 'free'"),
        count(db, "SELECT COUNT(*) AS n FROM children"),
        count(db, "SELECT COUNT(*) AS n FROM coupons WHERE active = 1"),
        count(db, "SELECT COUNT(*) AS n FROM coupon_redemptions"),
        count(db, "SELECT COUNT(*) AS n FROM progress"),
        count(db, "SELECT COUNT(*) AS n FROM learning_packs"),
        db.prepare("SELECT COALESCE(SUM(total_stars), 0) AS n FROM children").first(),
        db.prepare("SELECT email, name, subscription_tier, created_at FROM parents ORDER BY created_at DESC LIMIT 10").all(),
      ]);
    return json(
      {
        totalUsers,
        premiumUsers,
        totalChildren,
        totalStars: Number(starsRow?.n || 0),
        totalGamesPlayed,
        totalPacks,
        activeCoupons,
        totalRedemptions,
        recentUsers: recent.results || [],
        funnel: await countProductEvents(db),
      },
      200,
      origin,
    );
  }

  if (request.method === "GET" && path === "/v1/admin/users") {
    const parents = await db
      .prepare(
        `SELECT id, email, name, subscription_tier, subscription_expires_at, created_at, email_verified_at, last_sign_in_at
         FROM parents ORDER BY created_at DESC LIMIT 1000`,
      )
      .all();
    const kids = await db
      .prepare("SELECT parent_id, COUNT(*) AS children, COALESCE(SUM(total_stars), 0) AS stars FROM children GROUP BY parent_id")
      .all();
    const agg = new Map();
    for (const row of kids.results || []) agg.set(row.parent_id, { children: Number(row.children || 0), stars: Number(row.stars || 0) });
    const users = (parents.results || []).map((row) => {
      const extra = agg.get(row.id) || { children: 0, stars: 0 };
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        tier: row.subscription_tier,
        expiresAt: row.subscription_expires_at,
        createdAt: row.created_at,
        children: extra.children,
        stars: extra.stars,
        lastSignInAt: row.last_sign_in_at || null,
        emailConfirmed: Boolean(row.email_verified_at),
      };
    });
    return json({ users }, 200, origin);
  }

  if (request.method === "PATCH" && path === "/v1/admin/users") {
    const body = await readJson(request);
    if (!body?.userId || (body.action !== "grant" && body.action !== "revoke")) {
      return json({ error: "Provide userId and action ('grant' | 'revoke')." }, 400, origin);
    }
    const now = nowIso();
    if (body.action === "grant") {
      const days = Math.max(1, Math.floor(Number(body.days) || 7));
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
      await db
        .prepare(
          "UPDATE parents SET subscription_tier = 'premium_monthly', subscription_expires_at = ?, updated_at = ? WHERE id = ?",
        )
        .bind(expiresAt, now, String(body.userId))
        .run();
    } else {
      await db
        .prepare(
          `UPDATE parents SET subscription_tier = 'free', subscription_expires_at = NULL,
           subscription_cancel_at_period_end = 0, updated_at = ? WHERE id = ?`,
        )
        .bind(now, String(body.userId))
        .run();
    }
    return json({ ok: true }, 200, origin);
  }

  if (request.method === "GET" && path === "/v1/admin/children") {
    const rows = await db
      .prepare(
        `SELECT children.id, children.name, children.age, children.total_stars, children.created_at, parents.email AS parent_email
         FROM children JOIN parents ON parents.id = children.parent_id
         ORDER BY children.created_at DESC LIMIT 1000`,
      )
      .all();
    return json({ children: rows.results || [] }, 200, origin);
  }

  if (request.method === "GET" && path === "/v1/admin/subscriptions") {
    const rows = await db
      .prepare(
        `SELECT razorpay_subscriptions.subscription_id, razorpay_subscriptions.plan, razorpay_subscriptions.status,
                razorpay_subscriptions.created_at, razorpay_subscriptions.short_url, parents.email, parents.subscription_tier,
                parents.subscription_expires_at
         FROM razorpay_subscriptions JOIN parents ON parents.id = razorpay_subscriptions.user_id
         ORDER BY razorpay_subscriptions.created_at DESC LIMIT 500`,
      )
      .all();
    return json({ subscriptions: rows.results || [] }, 200, origin);
  }

  if (request.method === "GET" && path === "/v1/admin/revenue") {
    const now = nowIso();
    const weekly = await count(
      db,
      `SELECT COUNT(*) AS n FROM parents
       WHERE subscription_tier = 'premium_weekly' AND razorpay_subscription_id IS NOT NULL
         AND (subscription_expires_at IS NULL OR subscription_expires_at > ?)`,
      now,
    );
    const monthly = await count(
      db,
      `SELECT COUNT(*) AS n FROM parents
       WHERE subscription_tier = 'premium_monthly' AND razorpay_subscription_id IS NOT NULL
         AND (subscription_expires_at IS NULL OR subscription_expires_at > ?)`,
      now,
    );
    const couponPremiumAccounts = await count(
      db,
      `SELECT COUNT(*) AS n FROM parents
       WHERE subscription_tier != 'free' AND razorpay_subscription_id IS NULL
         AND (subscription_expires_at IS NULL OR subscription_expires_at > ?)`,
      now,
    );
    return json(
      {
        currency: "INR",
        weekly: { accounts: weekly, priceInr: 99, listedInr: weekly * 99 },
        monthly: { accounts: monthly, priceInr: 349, listedInr: monthly * 349 },
        listedRecurringInr: weekly * 99 + monthly * 349,
        couponPremiumAccounts,
        note: "Listed value of FunBerry plans that have a Razorpay subscription id. This is not a settlement report. The FKTech Razorpay account is shared with other products; those charges are not included.",
      },
      200,
      origin,
    );
  }

  if (request.method === "GET" && path === "/v1/admin/coupons") {
    const rows = await db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all();
    return json({ coupons: (rows.results || []).map(couponOut) }, 200, origin);
  }

  if (request.method === "POST" && path === "/v1/admin/coupons") {
    const body = await readJson(request);
    const code = validateCouponCode(body?.code);
    if (!code) return json({ error: "Code must be 3–32 letters, numbers, - or _." }, 400, origin);
    const freeDays = Math.max(0, Math.floor(Number(body?.free_days ?? 7)));
    const discount = Math.min(100, Math.max(0, Math.floor(Number(body?.discount_percent ?? 100))));
    const maxRedemptions =
      body?.max_redemptions == null || body?.max_redemptions === "" || Number.isNaN(Number(body.max_redemptions))
        ? null
        : Math.max(1, Math.floor(Number(body.max_redemptions)));
    let expiresAt = null;
    if (body?.expires_at) {
      const parsed = Date.parse(body.expires_at);
      expiresAt = Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
      if (body.expires_at.length === 10) expiresAt = `${body.expires_at}T23:59:59.999Z`;
    }
    const id = crypto.randomUUID();
    try {
      await db
        .prepare(
          `INSERT INTO coupons
           (id, code, discount_percent, free_days, active, expires_at, max_redemptions, redeemed_count, note, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        )
        .bind(id, code, discount, freeDays, body?.active === false ? 0 : 1, expiresAt, maxRedemptions, body?.note || null, nowIso())
        .run();
    } catch {
      return json({ error: "That code already exists." }, 400, origin);
    }
    const row = await db.prepare("SELECT * FROM coupons WHERE id = ?").bind(id).first();
    return json({ coupon: couponOut(row) }, 201, origin);
  }

  if (request.method === "PATCH" && path === "/v1/admin/coupons") {
    const body = await readJson(request);
    if (!body?.id) return json({ error: "Missing coupon id." }, 400, origin);
    const current = await db.prepare("SELECT * FROM coupons WHERE id = ?").bind(String(body.id)).first();
    if (!current) return json({ error: "Coupon not found." }, 404, origin);
    const active = typeof body.active === "boolean" ? (body.active ? 1 : 0) : current.active;
    const freeDays = body.free_days == null ? current.free_days : Math.max(0, Math.floor(Number(body.free_days)));
    const discount =
      body.discount_percent == null ? current.discount_percent : Math.min(100, Math.max(0, Math.floor(Number(body.discount_percent))));
    let expiresAt = current.expires_at;
    if (body.expires_at !== undefined) {
      if (!body.expires_at) expiresAt = null;
      else if (String(body.expires_at).length === 10) expiresAt = `${body.expires_at}T23:59:59.999Z`;
      else expiresAt = new Date(body.expires_at).toISOString();
    }
    let maxRedemptions = current.max_redemptions;
    if (body.max_redemptions !== undefined) {
      maxRedemptions =
        body.max_redemptions == null || body.max_redemptions === ""
          ? null
          : Math.max(1, Math.floor(Number(body.max_redemptions)));
    }
    const note = body.note !== undefined ? body.note || null : current.note;
    await db
      .prepare(
        `UPDATE coupons SET active = ?, free_days = ?, discount_percent = ?, expires_at = ?, max_redemptions = ?, note = ?
         WHERE id = ?`,
      )
      .bind(active, freeDays, discount, expiresAt, maxRedemptions, note, current.id)
      .run();
    const row = await db.prepare("SELECT * FROM coupons WHERE id = ?").bind(current.id).first();
    return json({ coupon: couponOut(row) }, 200, origin);
  }

  if (request.method === "DELETE" && path === "/v1/admin/coupons") {
    const body = await readJson(request);
    if (!body?.id) return json({ error: "Missing coupon id." }, 400, origin);
    await db.prepare("DELETE FROM coupon_redemptions WHERE coupon_id = ?").bind(String(body.id)).run();
    await db.prepare("DELETE FROM coupons WHERE id = ?").bind(String(body.id)).run();
    return json({ ok: true }, 200, origin);
  }

  return json({ error: "Not found" }, 404, origin);
}
