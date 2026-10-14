import { handleAdmin, handleCouponRedeem } from "./admin.js";
import {
  handleRazorpayAuthed,
  handleRazorpayWebhook,
  hasActivePremium,
  isDemoParent,
  paymentsConfigured,
  syncParentBilling,
} from "./payments.js";
import { gameEntitlement } from "./gameCatalog.js";
import { roleForEmail } from "./owners.js";
import { bytesToHex, hashSecret, sha256 } from "./crypto.js";
import {
  clearPinFailures,
  hashNewPin,
  isFourDigitPin,
  migratePlainPin,
  pinIsSet,
  pinLockActive,
  pinMatches,
  recordPinFailure,
  storeParentPin,
} from "./pin.js";
import { reconcileChildStars, recordGameProgress } from "./progress.js";
import { countProductEvents, loadWeeklySummary, parentProductCounts, recordProductEvent, recordProductEventOnce } from "./analytics.js";
import { DELETE_PHRASE, deleteParentAccount, deletionAllowed, exportParentAccount, passwordMatches } from "./accountData.js";

const ALLOWED_ORIGINS = new Set([
  "https://funberrykids.in",
  "https://www.funberrykids.in",
  "https://funberry-web.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const DEFAULT_AVATAR = { body: "default", hair: "short", color: "#ff9db6" };

function allowsOrigin(origin) {
  if (!origin) return "";
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app") && host.includes("funberry")) return origin;
  } catch {
    return "";
  }
  return "";
}

function json(body, status, origin) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-headers"] = "authorization, content-type";
    headers["access-control-allow-methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers.vary = "Origin";
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function nowIso() {
  return new Date().toISOString();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parentOut(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || "",
    username: row.username || null,
    pin_set: pinIsSet(row),
    subscription_tier: row.subscription_tier || "free",
    subscription_expires_at: row.subscription_expires_at || null,
    welcome_email_sent_at: row.welcome_email_sent_at || null,
    razorpay_subscription_id: row.razorpay_subscription_id || null,
    razorpay_customer_id: row.razorpay_customer_id || null,
    subscription_cancel_at_period_end: row.subscription_cancel_at_period_end ? 1 : 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function childOut(row) {
  return {
    id: row.id,
    parent_id: row.parent_id,
    name: row.name,
    age: row.age,
    avatar_config: parseJson(row.avatar_config, DEFAULT_AVATAR),
    photo_url: row.photo_url || null,
    total_stars: row.total_stars || 0,
    total_coins: row.total_coins || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function progressOut(row) {
  return {
    id: row.id,
    child_id: row.child_id,
    game_id: row.game_id,
    stars_earned: row.stars_earned || 0,
    score: row.score || 0,
    time_spent_seconds: row.time_spent_seconds || 0,
    attempts: row.attempts || 0,
    completed: Boolean(row.completed),
    completed_at: row.completed_at || null,
    created_at: row.created_at,
  };
}

function packOut(row) {
  return {
    id: row.id,
    parent_id: row.parent_id,
    title: row.title,
    subject: row.subject,
    theme: row.theme,
    status: row.status,
    source_text: row.source_text,
    generated: parseJson(row.generated, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const CODE_MINUTES = 15;
const MAX_CODE_ATTEMPTS = 5;
const RESEND_GAP_MS = 60 * 1000;

function newCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(value).padStart(6, "0");
}

function emailReady(env) {
  return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
}

function d1DailyLimitReached(error) {
  return /exceeded D1's free tier daily row (?:write|read) limit/i.test(String(error?.message || ""));
}

async function emailDomainVerified(env) {
  if (!emailReady(env)) return false;
  const domain = (String(env.MAIL_FROM).match(/@([^>\s]+)/) || [])[1]?.toLowerCase();
  const response = await fetch("https://api.resend.com/domains", {
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}` },
  }).catch(() => null);
  if (!response || !response.ok) return null;
  return ((await response.json()).data || []).some((d) => d.name === domain && d.status === "verified");
}

async function sendEmail(env, to, subject, text) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text }),
  });
  return response.ok;
}

async function issueCode(db, env, email, purpose) {
  const recent = await db
    .prepare("SELECT created_at FROM email_codes WHERE email = ? AND purpose = ?")
    .bind(email, purpose)
    .first();
  if (recent && Date.now() - Date.parse(recent.created_at) < RESEND_GAP_MS) return true;
  const code = newCode();
  const now = new Date();
  const expires = new Date(now.getTime() + CODE_MINUTES * 60 * 1000).toISOString();
  await db
    .prepare(
      `INSERT INTO email_codes (email, purpose, code_hash, expires_at, attempts, created_at)
       VALUES (?, ?, ?, ?, 0, ?)
       ON CONFLICT(email, purpose) DO UPDATE SET
         code_hash = excluded.code_hash, expires_at = excluded.expires_at,
         attempts = 0, created_at = excluded.created_at`,
    )
    .bind(email, purpose, await sha256(`${email}:${purpose}:${code}`), expires, now.toISOString())
    .run();
  const subject = purpose === "verify" ? "Your FunBerry Kids confirmation code" : "Your FunBerry Kids password reset code";
  const line = purpose === "verify" ? "Enter this code to confirm your email" : "Enter this code to choose a new password";
  return sendEmail(
    env,
    email,
    subject,
    `${line}: ${code}\n\nIt expires in ${CODE_MINUTES} minutes. If you did not ask for this, ignore this email.\n\nFunBerry Kids\nhttps://www.funberrykids.in`,
  );
}

async function checkCode(db, email, purpose, code) {
  const row = await db
    .prepare("SELECT * FROM email_codes WHERE email = ? AND purpose = ?")
    .bind(email, purpose)
    .first();
  if (!row) return false;
  if (row.attempts >= MAX_CODE_ATTEMPTS || Date.parse(row.expires_at) < Date.now()) {
    await db.prepare("DELETE FROM email_codes WHERE email = ? AND purpose = ?").bind(email, purpose).run();
    return false;
  }
  if (row.code_hash !== (await sha256(`${email}:${purpose}:${String(code).trim()}`))) {
    await db
      .prepare("UPDATE email_codes SET attempts = attempts + 1 WHERE email = ? AND purpose = ?")
      .bind(email, purpose)
      .run();
    return false;
  }
  await db.prepare("DELETE FROM email_codes WHERE email = ? AND purpose = ?").bind(email, purpose).run();
  return true;
}

async function createSession(db, userId) {
  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(tokenHash, userId, expires).run();
  return token;
}

async function parentFromRequest(request, db) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const tokenHash = await sha256(token);
  return db
    .prepare(
      `SELECT parents.* FROM sessions
       JOIN parents ON parents.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .bind(tokenHash, nowIso())
    .first();
}

async function requireParent(request, db) {
  const parent = await parentFromRequest(request, db);
  if (!parent) return null;
  return migratePlainPin(db, parent, nowIso());
}

async function ownChild(db, parentId, childId) {
  return db.prepare("SELECT * FROM children WHERE id = ? AND parent_id = ?").bind(childId, parentId).first();
}

function sessionBody(parent, token) {
  return {
    user: { id: parent.id, email: parent.email },
    session: { access_token: token, user: { id: parent.id, email: parent.email } },
    parent: parentOut(parent),
  };
}

export default {
  async fetch(request, env) {
    const origin = allowsOrigin(request.headers.get("origin"));
    if (request.method === "OPTIONS") return json({ ok: true }, 204, origin);

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;

    try {
      if (request.method === "GET" && path === "/v1/health") {
        return json(
          {
            ok: true,
            service: "funberry-api",
            email_ready: emailReady(env),
            email_domain_verified: await emailDomainVerified(env),
            payments_configured: paymentsConfigured(env),
            checkout_mode: "modal-with-hosted-fallback",
          },
          200,
          origin,
        );
      }

      if (request.method === "POST" && path === "/v1/signup") {
        const body = await readJson(request);
        const email = String(body?.email || "").trim().toLowerCase();
        const password = String(body?.password || "");
        const name = String(body?.name || "").trim();
        const pin = String(body?.pin || "").trim();
        if (!email.includes("@") || password.length < 6) {
          return json({ error: "Use a valid email and a password of at least 6 characters." }, 400, origin);
        }
        if (pin && !/^\d{4}$/.test(pin)) {
          return json({ error: "PIN must be exactly 4 digits." }, 400, origin);
        }
        if (!emailReady(env)) {
          return json({ error: "Sign-up emails are not switched on yet. Please try again later." }, 503, origin);
        }
        const existing = await db.prepare("SELECT id, email_verified_at FROM parents WHERE email = ?").bind(email).first();
        if (existing?.email_verified_at) {
          return json({ error: "An account with this email already exists. Please sign in instead." }, 409, origin);
        }
        const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
        const passwordHash = await hashSecret(password, salt);
        const now = nowIso();
        const role = roleForEmail(email);
        let pinHash = null;
        let pinSalt = null;
        if (pin) {
          const hashed = await hashNewPin(pin);
          pinHash = hashed.pin_hash;
          pinSalt = hashed.pin_salt;
        }
        if (existing) {
          await db
            .prepare(
              "UPDATE parents SET password_hash = ?, password_salt = ?, name = ?, pin = NULL, pin_hash = ?, pin_salt = ?, pin_attempts = 0, pin_locked_until = NULL, role = ?, updated_at = ? WHERE id = ?",
            )
            .bind(passwordHash, salt, name, pinHash, pinSalt, role, now, existing.id)
            .run();
        } else {
          await db
            .prepare(
              `INSERT INTO parents
               (id, email, password_hash, password_salt, name, pin, pin_hash, pin_salt, role, updated_at)
               VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
            )
            .bind(crypto.randomUUID(), email, passwordHash, salt, name, pinHash, pinSalt, role, now)
            .run();
        }
        await db.prepare("DELETE FROM email_codes WHERE email = ? AND purpose = 'verify'").bind(email).run();
        if (!(await issueCode(db, env, email, "verify"))) {
          return json({ error: "We could not send the confirmation email. Try again in a minute." }, 502, origin);
        }
        return json({ needs_verification: true, email }, 201, origin);
      }

      if (request.method === "POST" && path === "/v1/verify") {
        const body = await readJson(request);
        const email = String(body?.email || "").trim().toLowerCase();
        const parent = await db.prepare("SELECT * FROM parents WHERE email = ?").bind(email).first();
        if (!parent || !(await checkCode(db, email, "verify", body?.code || ""))) {
          return json({ error: "That code is wrong or expired. Check the latest email or resend a new code." }, 400, origin);
        }
        const now = nowIso();
        const role = roleForEmail(email);
        await db
          .prepare("UPDATE parents SET email_verified_at = ?, role = ?, updated_at = ? WHERE id = ?")
          .bind(now, role, now, parent.id)
          .run();
        parent.role = role;
        parent.email_verified_at = now;
        await migratePlainPin(db, parent, now);
        const token = await createSession(db, parent.id);
        await recordProductEventOnce(db, "verified_signup", parent.id, now);
        return json(sessionBody(parent, token), 200, origin);
      }

      if (request.method === "POST" && path === "/v1/resend-code") {
        const body = await readJson(request);
        const email = String(body?.email || "").trim().toLowerCase();
        const parent = await db.prepare("SELECT email_verified_at FROM parents WHERE email = ?").bind(email).first();
        if (parent && !parent.email_verified_at && emailReady(env)) await issueCode(db, env, email, "verify");
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/forgot-password") {
        const body = await readJson(request);
        const email = String(body?.email || "").trim().toLowerCase();
        if (!emailReady(env)) {
          return json({ error: "Password reset emails are not switched on yet. Please try again later." }, 503, origin);
        }
        const parent = await db.prepare("SELECT id FROM parents WHERE email = ?").bind(email).first();
        if (parent) await issueCode(db, env, email, "reset");
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/reset-password") {
        const body = await readJson(request);
        const email = String(body?.email || "").trim().toLowerCase();
        const password = String(body?.password || "");
        if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400, origin);
        const parent = await db.prepare("SELECT id FROM parents WHERE email = ?").bind(email).first();
        if (!parent || !(await checkCode(db, email, "reset", body?.code || ""))) {
          return json({ error: "That code is wrong or expired. Ask for a new one." }, 400, origin);
        }
        const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
        const now = nowIso();
        await db
          .prepare(
            `UPDATE parents SET password_hash = ?, password_salt = ?, email_verified_at = COALESCE(email_verified_at, ?), updated_at = ?
             WHERE id = ?`,
          )
          .bind(await hashSecret(password, salt), salt, now, now, parent.id)
          .run();
        await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(parent.id).run();
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/login") {
        const body = await readJson(request);
        const login = String(body?.email || "").trim().toLowerCase();
        const password = String(body?.password || "");
        const parent = login.includes("@")
          ? await db.prepare("SELECT * FROM parents WHERE email = ?").bind(login).first()
          : await db.prepare("SELECT * FROM parents WHERE username = ?").bind(login).first();
        if (!parent) return json({ error: "Invalid login credentials" }, 401, origin);
        const passwordHash = await hashSecret(password, parent.password_salt);
        if (passwordHash !== parent.password_hash) return json({ error: "Invalid login credentials" }, 401, origin);
        const signedInAt = nowIso();
        const role = roleForEmail(parent.email);
        await db
          .prepare("UPDATE parents SET last_sign_in_at = ?, role = ?, updated_at = ? WHERE id = ?")
          .bind(signedInAt, role, signedInAt, parent.id)
          .run();
        parent.role = role;
        parent.last_sign_in_at = signedInAt;
        if (!parent.email_verified_at) {
          if (emailReady(env)) await issueCode(db, env, parent.email, "verify");
          return json(
            { error: "Confirm your email first. We sent you a code.", needs_verification: true, email: parent.email },
            403,
            origin,
          );
        }
        await migratePlainPin(db, parent, signedInAt);
        const token = await createSession(db, parent.id);
        return json(sessionBody(parent, token), 200, origin);
      }

      if (request.method === "POST" && path === "/v1/logout") {
        const header = request.headers.get("authorization") || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : "";
        if (token) {
          const tokenHash = await sha256(token);
          await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
        }
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/payments/razorpay/webhook") {
        return handleRazorpayWebhook(request, env, db, origin);
      }

      const parent = await requireParent(request, db);
      if (!parent) return json({ error: "Not authenticated" }, 401, origin);

      const billing = await handleRazorpayAuthed(request, env, db, parent, origin, path);
      if (billing) return billing;
      const coupon = await handleCouponRedeem(request, db, parent, origin, path);
      if (coupon) return coupon;
      const adminResponse = await handleAdmin(request, db, parent, origin, path);
      if (adminResponse) return adminResponse;

      if (request.method === "GET" && path === "/v1/session") {
        return json({ user: { id: parent.id, email: parent.email }, parent: parentOut(parent) }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/parent") {
        const fresh = await syncParentBilling(env, db, parent);
        return json({ parent: parentOut(fresh) }, 200, origin);
      }

      if (request.method === "PUT" && path === "/v1/parent") {
        const body = await readJson(request);
        const name = body?.name == null ? parent.name : String(body.name).trim();
        const now = nowIso();
        if (body?.pin != null) {
          const nextPin = String(body.pin).trim();
          if (!isFourDigitPin(nextPin)) return json({ error: "PIN must be exactly 4 digits." }, 400, origin);
          if (pinIsSet(parent)) {
            if (pinLockActive(parent)) {
              return json({ error: "Too many PIN tries. Wait 15 minutes and try again." }, 429, origin);
            }
            if (!(await pinMatches(parent, body.current_pin))) {
              const failure = await recordPinFailure(db, parent, now);
              return json(
                { error: failure.locked ? "Too many PIN tries. Wait 15 minutes and try again." : "Current PIN is wrong." },
                failure.locked ? 429 : 403,
                origin,
              );
            }
          }
          await storeParentPin(db, parent.id, nextPin, now);
        }
        await db.prepare("UPDATE parents SET name = ?, updated_at = ? WHERE id = ?").bind(name, now, parent.id).run();
        const next = await db.prepare("SELECT * FROM parents WHERE id = ?").bind(parent.id).first();
        return json({ parent: parentOut(next) }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/pin/verify") {
        const body = await readJson(request);
        const now = nowIso();
        if (!pinIsSet(parent)) return json({ error: "Set a parent PIN first." }, 404, origin);
        if (pinLockActive(parent)) {
          return json({ error: "Too many PIN tries. Wait 15 minutes and try again." }, 429, origin);
        }
        if (!(await pinMatches(parent, body?.pin))) {
          const failure = await recordPinFailure(db, parent, now);
          return json(
            { error: failure.locked ? "Too many PIN tries. Wait 15 minutes and try again." : "That PIN is not right." },
            failure.locked ? 429 : 403,
            origin,
          );
        }
        await clearPinFailures(db, parent.id, now);
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/password") {
        const body = await readJson(request);
        const password = String(body?.password || "");
        if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400, origin);
        const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
        const passwordHash = await hashSecret(password, salt);
        await db
          .prepare("UPDATE parents SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?")
          .bind(passwordHash, salt, nowIso(), parent.id)
          .run();
        await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(parent.id).run();
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/children") {
        const rows = await db
          .prepare("SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC")
          .bind(parent.id)
          .all();
        const now = nowIso();
        for (const row of rows.results || []) {
          await reconcileChildStars(db, row.id, parent.id, now);
        }
        const fresh = await db
          .prepare("SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC")
          .bind(parent.id)
          .all();
        return json({ children: (fresh.results || []).map(childOut) }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/children") {
        const body = await readJson(request);
        const name = String(body?.name || "").trim();
        const age = Number(body?.age);
        const photoUrl = body?.photo_url == null ? null : String(body.photo_url);
        if (!name) return json({ error: "Please enter a name." }, 400, origin);
        if (!Number.isInteger(age) || age < 3 || age > 12) {
          return json({ error: "Age must be between 3 and 12." }, 400, origin);
        }
        const id = crypto.randomUUID();
        const now = nowIso();
        await db
          .prepare(
            `INSERT INTO children (id, parent_id, name, age, photo_url, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(id, parent.id, name, age, photoUrl, now, now)
          .run();
        const row = await db.prepare("SELECT * FROM children WHERE id = ?").bind(id).first();
        await recordProductEvent(db, "child_created", parent.id, now);
        return json({ child: childOut(row) }, 201, origin);
      }

      const childMatch = path.match(/^\/v1\/children\/([^/]+)$/);
      if (childMatch && request.method === "PUT") {
        const child = await ownChild(db, parent.id, childMatch[1]);
        if (!child) return json({ error: "Child not found" }, 404, origin);
        const body = await readJson(request);
        const name = body?.name == null ? child.name : String(body.name).trim();
        const age = body?.age == null ? child.age : Number(body.age);
        const photoUrl = body?.photo_url === undefined ? child.photo_url : body.photo_url;
        if (!name) return json({ error: "Please enter a name." }, 400, origin);
        if (!Number.isInteger(age) || age < 3 || age > 12) {
          return json({ error: "Age must be between 3 and 12." }, 400, origin);
        }
        await db
          .prepare("UPDATE children SET name = ?, age = ?, photo_url = ?, updated_at = ? WHERE id = ? AND parent_id = ?")
          .bind(name, age, photoUrl, nowIso(), child.id, parent.id)
          .run();
        const row = await db.prepare("SELECT * FROM children WHERE id = ?").bind(child.id).first();
        return json({ child: childOut(row) }, 200, origin);
      }

      if (childMatch && request.method === "DELETE") {
        const child = await ownChild(db, parent.id, childMatch[1]);
        if (!child) return json({ error: "Child not found" }, 404, origin);
        await db.prepare("DELETE FROM children WHERE id = ? AND parent_id = ?").bind(child.id, parent.id).run();
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/progress") {
        const childId = url.searchParams.get("child_id") || "";
        const child = await ownChild(db, parent.id, childId);
        if (!child) return json({ error: "Child not found" }, 404, origin);
        const rows = await db
          .prepare("SELECT * FROM progress WHERE child_id = ? ORDER BY created_at DESC")
          .bind(childId)
          .all();
        return json({ progress: (rows.results || []).map(progressOut) }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/progress") {
        const body = await readJson(request);
        const childId = String(body?.child_id || "");
        const gameId = String(body?.game_id || "");
        const child = await ownChild(db, parent.id, childId);
        if (!child) return json({ error: "Child not found" }, 404, origin);
        if (!gameId) return json({ error: "Missing game." }, 400, origin);
        const entitlement = gameEntitlement(gameId, child.total_stars, hasActivePremium(parent));
        if (entitlement.reason === "unknown") return json({ error: "Unknown game." }, 400, origin);
        if (!entitlement.allowed) return json({ error: "That game is still locked." }, 403, origin);
        const now = nowIso();
        const prior = await db
          .prepare(
            `SELECT progress.id FROM progress
             JOIN children ON children.id = progress.child_id
             WHERE children.parent_id = ? LIMIT 1`,
          )
          .bind(parent.id)
          .first();
        const saved = await recordGameProgress(db, parent.id, body, now);
        if (!prior) await recordProductEventOnce(db, "first_game", parent.id, now);
        if (saved.first_completion) await recordProductEvent(db, "game_completed", parent.id, now);
        return json(
          { progress: progressOut(saved.progress), stars_credited: saved.stars_credited, total_stars: saved.total_stars },
          200,
          origin,
        );
      }

      if (request.method === "GET" && path === "/v1/weekly-summary") {
        const childId = url.searchParams.get("child_id") || "";
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        return json(await loadWeeklySummary(db, parent.id, childId), 200, origin);
      }

      if (request.method === "GET" && path === "/v1/insights") {
        const counts = await parentProductCounts(db, parent.id);
        const rounds = await db.prepare("SELECT COUNT(*) AS n FROM play_events WHERE parent_id = ?").bind(parent.id).first();
        return json(
          {
            children_created: counts.child_created,
            first_game: counts.first_game > 0,
            games_completed: counts.game_completed,
            checkouts_started: counts.checkout_started,
            subscription_activated: counts.subscription_activated > 0,
            rounds_logged: Number(rounds?.n || 0),
          },
          200,
          origin,
        );
      }

      if (request.method === "GET" && path === "/v1/account/export") {
        return json(await exportParentAccount(db, parent), 200, origin);
      }

      if (request.method === "POST" && path === "/v1/account/delete") {
        if (isDemoParent(parent)) return json({ error: "The demo account cannot be deleted." }, 403, origin);
        const body = await readJson(request);
        if (String(body?.confirm || "") !== DELETE_PHRASE) {
          return json({ error: `Type ${DELETE_PHRASE} to confirm.` }, 400, origin);
        }
        if (!(await passwordMatches(parent, body?.password))) {
          return json({ error: "Password does not match." }, 403, origin);
        }
        const blocked = deletionAllowed(parent);
        if (blocked) return json({ error: blocked }, 409, origin);
        await deleteParentAccount(db, parent);
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/family-stats") {
        const row = await db
          .prepare(
            `SELECT COUNT(*) AS total_sessions,
                    COUNT(DISTINCT game_id) AS unique_games,
                    MAX(COALESCE(completed_at, created_at)) AS last_activity
             FROM progress
             WHERE child_id IN (SELECT id FROM children WHERE parent_id = ?)`,
          )
          .bind(parent.id)
          .first();
        return json(
          {
            totalSessions: Number(row?.total_sessions || 0),
            uniqueGamesTouched: Number(row?.unique_games || 0),
            lastActivityAt: row?.last_activity || null,
          },
          200,
          origin,
        );
      }

      if (request.method === "GET" && path === "/v1/leaderboard") {
        const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || 50));
        const rows = await db
          .prepare(
            `SELECT id, parent_id, name, photo_url, total_stars
             FROM children
             WHERE total_stars > 0
             ORDER BY total_stars DESC, id
             LIMIT ?`,
          )
          .bind(limit)
          .all();
        const entries = (rows.results || []).map((row, index) => {
          const mine = row.parent_id === parent.id;
          return {
            child_id: mine ? row.id : null,
            child_name: mine ? row.name : "Star learner",
            photo_url: mine ? row.photo_url : null,
            total_stars: row.total_stars || 0,
            rank: index + 1,
          };
        });
        return json({ entries }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/rank") {
        const childId = url.searchParams.get("child_id") || "";
        const child = await ownChild(db, parent.id, childId);
        if (!child) return json({ rank: null }, 200, origin);
        const higher = await db
          .prepare("SELECT COUNT(*) AS n FROM children WHERE total_stars > ? OR (total_stars = ? AND id < ?)")
          .bind(child.total_stars || 0, child.total_stars || 0, child.id)
          .first();
        const total = await db.prepare("SELECT COUNT(*) AS n FROM children").first();
        return json({ rank: Number(higher?.n || 0) + 1, total: Number(total?.n || 0) }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/unlocks") {
        const childId = url.searchParams.get("child_id") || "";
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        const rows = await db.prepare("SELECT * FROM unlocks WHERE child_id = ?").bind(childId).all();
        return json({ unlocks: rows.results || [] }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/unlocks") {
        const body = await readJson(request);
        const childId = String(body?.child_id || "");
        const zoneId = String(body?.zone_id || "");
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        if (!zoneId) return json({ error: "Missing zone." }, 400, origin);
        const existing = await db
          .prepare("SELECT * FROM unlocks WHERE child_id = ? AND zone_id = ?")
          .bind(childId, zoneId)
          .first();
        if (existing) return json({ unlock: existing }, 200, origin);
        const id = crypto.randomUUID();
        const unlockedAt = nowIso();
        await db
          .prepare("INSERT INTO unlocks (id, child_id, zone_id, unlocked_at) VALUES (?, ?, ?, ?)")
          .bind(id, childId, zoneId, unlockedAt)
          .run();
        return json({ unlock: { id, child_id: childId, zone_id: zoneId, unlocked_at: unlockedAt } }, 201, origin);
      }

      if (request.method === "GET" && path === "/v1/rewards") {
        const childId = url.searchParams.get("child_id") || "";
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        const rows = await db
          .prepare("SELECT * FROM rewards WHERE child_id = ? ORDER BY earned_at DESC")
          .bind(childId)
          .all();
        return json({ rewards: rows.results || [] }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/rewards") {
        const body = await readJson(request);
        const childId = String(body?.child_id || "");
        const rewardType = String(body?.reward_type || "");
        const rewardId = String(body?.reward_id || "");
        const rewardName = String(body?.reward_name || "");
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        if (!["sticker", "costume", "badge", "title"].includes(rewardType) || !rewardId) {
          return json({ error: "That reward could not be saved." }, 400, origin);
        }
        const existing = await db
          .prepare("SELECT * FROM rewards WHERE child_id = ? AND reward_type = ? AND reward_id = ?")
          .bind(childId, rewardType, rewardId)
          .first();
        if (existing) return json({ reward: existing }, 200, origin);
        const id = crypto.randomUUID();
        const earnedAt = nowIso();
        await db
          .prepare(
            "INSERT INTO rewards (id, child_id, reward_type, reward_id, reward_name, earned_at) VALUES (?, ?, ?, ?, ?, ?)",
          )
          .bind(id, childId, rewardType, rewardId, rewardName, earnedAt)
          .run();
        return json(
          { reward: { id, child_id: childId, reward_type: rewardType, reward_id: rewardId, reward_name: rewardName, earned_at: earnedAt } },
          201,
          origin,
        );
      }

      if (request.method === "GET" && path === "/v1/packs") {
        const packs = await db
          .prepare("SELECT * FROM learning_packs WHERE parent_id = ? ORDER BY created_at DESC")
          .bind(parent.id)
          .all();
        const pages = await db.prepare("SELECT pack_id FROM pack_pages WHERE parent_id = ?").bind(parent.id).all();
        const assignments = await db
          .prepare("SELECT pack_id, child_id FROM pack_assignments WHERE parent_id = ?")
          .bind(parent.id)
          .all();
        const pageCounts = new Map();
        for (const row of pages.results || []) pageCounts.set(row.pack_id, (pageCounts.get(row.pack_id) || 0) + 1);
        const assignMap = new Map();
        for (const row of assignments.results || []) {
          const list = assignMap.get(row.pack_id) || [];
          list.push(row.child_id);
          assignMap.set(row.pack_id, list);
        }
        const items = (packs.results || []).map((row) => ({
          ...packOut(row),
          pageCount: pageCounts.get(row.id) || 0,
          assignedChildIds: assignMap.get(row.id) || [],
        }));
        return json({ packs: items }, 200, origin);
      }

      if (request.method === "POST" && path === "/v1/packs") {
        const body = await readJson(request);
        const id = crypto.randomUUID();
        const now = nowIso();
        const title = String(body?.title || "Untitled pack");
        const subject = String(body?.subject || "General");
        const theme = String(body?.theme || "jungle");
        const status = body?.status === "draft" ? "draft" : "ready";
        const sourceText = String(body?.source_text || "").slice(0, 100000);
        const generated = JSON.stringify(body?.generated || {}).slice(0, 500000);
        const pages = Array.isArray(body?.pages) ? body.pages : [];
        await db
          .prepare(
            `INSERT INTO learning_packs
             (id, parent_id, title, subject, theme, status, source_text, generated, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(id, parent.id, title, subject, theme, status, sourceText, generated, now, now)
          .run();
        for (let i = 0; i < pages.length; i += 1) {
          const page = pages[i] || {};
          await db
            .prepare(
              `INSERT INTO pack_pages (id, pack_id, parent_id, ocr_text, edited_text, order_index, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              crypto.randomUUID(),
              id,
              parent.id,
              String(page.ocr_text || "").slice(0, 100000),
              String(page.edited_text || "").slice(0, 100000),
              i,
              now,
            )
            .run();
        }
        const row = await db.prepare("SELECT * FROM learning_packs WHERE id = ?").bind(id).first();
        return json({ pack: packOut(row) }, 201, origin);
      }

      const packPagesMatch = path.match(/^\/v1\/packs\/([^/]+)\/pages$/);
      if (packPagesMatch && request.method === "GET") {
        const pack = await db
          .prepare("SELECT id FROM learning_packs WHERE id = ? AND parent_id = ?")
          .bind(packPagesMatch[1], parent.id)
          .first();
        if (!pack) return json({ error: "Pack not found" }, 404, origin);
        const rows = await db
          .prepare("SELECT * FROM pack_pages WHERE pack_id = ? AND parent_id = ? ORDER BY order_index ASC")
          .bind(pack.id, parent.id)
          .all();
        return json({ pages: rows.results || [] }, 200, origin);
      }

      const packAssignMatch = path.match(/^\/v1\/packs\/([^/]+)\/assignments$/);
      if (packAssignMatch && request.method === "POST") {
        const pack = await db
          .prepare("SELECT id FROM learning_packs WHERE id = ? AND parent_id = ?")
          .bind(packAssignMatch[1], parent.id)
          .first();
        if (!pack) return json({ error: "Pack not found" }, 404, origin);
        const body = await readJson(request);
        const childIds = Array.isArray(body?.child_ids) ? body.child_ids.map(String) : [];
        await db.prepare("DELETE FROM pack_assignments WHERE pack_id = ? AND parent_id = ?").bind(pack.id, parent.id).run();
        for (const childId of childIds) {
          const child = await ownChild(db, parent.id, childId);
          if (!child) continue;
          await db
            .prepare("INSERT INTO pack_assignments (pack_id, child_id, parent_id) VALUES (?, ?, ?)")
            .bind(pack.id, childId, parent.id)
            .run();
        }
        return json({ ok: true }, 200, origin);
      }

      const packMatch = path.match(/^\/v1\/packs\/([^/]+)$/);
      if (packMatch && request.method === "PUT") {
        const pack = await db
          .prepare("SELECT * FROM learning_packs WHERE id = ? AND parent_id = ?")
          .bind(packMatch[1], parent.id)
          .first();
        if (!pack) return json({ error: "Pack not found" }, 404, origin);
        const body = await readJson(request);
        const title = body?.title == null ? pack.title : String(body.title);
        const subject = body?.subject == null ? pack.subject : String(body.subject);
        const theme = body?.theme == null ? pack.theme : String(body.theme);
        const status = body?.status == null ? pack.status : body.status === "draft" ? "draft" : "ready";
        const sourceText = body?.source_text == null ? pack.source_text : String(body.source_text).slice(0, 100000);
        const generated = body?.generated == null ? pack.generated : JSON.stringify(body.generated).slice(0, 500000);
        await db
          .prepare(
            `UPDATE learning_packs
             SET title = ?, subject = ?, theme = ?, status = ?, source_text = ?, generated = ?, updated_at = ?
             WHERE id = ? AND parent_id = ?`,
          )
          .bind(title, subject, theme, status, sourceText, generated, nowIso(), pack.id, parent.id)
          .run();
        return json({ ok: true }, 200, origin);
      }

      if (packMatch && request.method === "DELETE") {
        const packId = packMatch[1];
        await db.prepare("DELETE FROM pack_assignments WHERE pack_id = ? AND parent_id = ?").bind(packId, parent.id).run();
        await db.prepare("DELETE FROM pack_pages WHERE pack_id = ? AND parent_id = ?").bind(packId, parent.id).run();
        await db.prepare("DELETE FROM learning_packs WHERE id = ? AND parent_id = ?").bind(packId, parent.id).run();
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/assigned-packs") {
        const childId = url.searchParams.get("child_id") || "";
        const rows = await db
          .prepare(
            `SELECT learning_packs.* FROM pack_assignments
             JOIN learning_packs ON learning_packs.id = pack_assignments.pack_id
             WHERE pack_assignments.child_id = ?
               AND pack_assignments.parent_id = ?
               AND learning_packs.status = 'ready'
             ORDER BY learning_packs.created_at DESC`,
          )
          .bind(childId, parent.id)
          .all();
        return json({ packs: (rows.results || []).map(packOut) }, 200, origin);
      }

      if (request.method === "PUT" && path === "/v1/coaching-report") {
        const body = await readJson(request);
        const childId = String(body?.child_id || "");
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        const report = JSON.stringify(body?.report || {});
        const updated = nowIso();
        await db
          .prepare(
            `INSERT INTO coaching_reports (child_id, report, updated_at) VALUES (?, ?, ?)
             ON CONFLICT(child_id) DO UPDATE SET report = excluded.report, updated_at = excluded.updated_at`,
          )
          .bind(childId, report, updated)
          .run();
        return json({ ok: true }, 200, origin);
      }

      if (request.method === "GET" && path === "/v1/coaching-report") {
        const childId = url.searchParams.get("child_id") || "";
        if (!(await ownChild(db, parent.id, childId))) return json({ error: "Child not found" }, 404, origin);
        const row = await db.prepare("SELECT report, updated_at FROM coaching_reports WHERE child_id = ?").bind(childId).first();
        return json({ report: row ? parseJson(row.report, null) : null, updated_at: row?.updated_at || null }, 200, origin);
      }

      return json({ error: "Not found" }, 404, origin);
    } catch (error) {
      console.error("request failed", request.method, path, error?.name || "Error", error?.message || "unknown");
      if (d1DailyLimitReached(error)) {
        return json(
          { error: "Accounts and saved progress are temporarily unavailable because today's storage allowance has been reached. Nothing was charged. Please try again after the daily reset." },
          503,
          origin,
        );
      }
      return json({ error: "The database did not accept that request." }, 500, origin);
    }
  },
};
